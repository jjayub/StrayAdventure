import { useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useSocket } from './stores/useSocket'
import { useGame } from './stores/useGame'

/**
 * Player Props Interface - กำหนด props ที่ Player component รับได้
 */
interface PlayerProps {
  /** จุดเกิดของตัวละคร [x, y, z] - รับจาก Map Config */
  spawnPoint?: [number, number, number]
}

/**
 * Player Component
 * ควบคุมตัวละครหลักของเกม:
 * - W/S เดินหน้า/ถอยหลัง ตามทิศที่ตัวละครหันหน้า
 * - A/D หมุนตัวละคร
 * - Space กระโดด
 * - กล้องตามหลังตัวละคร (หลบสิ่งกีดขวาง)
 * - Scroll Zoom เข้า/ออก
 * @param props.spawnPoint - ตำแหน่งเริ่มต้นของตัวละคร จาก Map Config
 */
export function Player({ spawnPoint = [0, 1, 0] }: PlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const canJump = useRef(true)
  const lastSyncTime = useRef(0)
  const [, getKeys] = useKeyboardControls()
  const { camera, gl, scene: threeScene } = useThree()

  // Character rotation (the direction character is facing)
  const characterRotation = useRef(0) // radians

  // Camera settings
  const cameraDistance = useRef(6) // ระยะห่างจากตัวละคร
  const smoothCameraPosition = useRef(new THREE.Vector3(0, 5, 10))
  const smoothCameraTarget = useRef(new THREE.Vector3())

  // Camera orbit offset (for mouse look-around)
  const cameraOrbitOffsetX = useRef(0) // มุมหมุนกล้องซ้าย/ขวา (horizontal)
  const cameraOrbitOffsetY = useRef(0) // มุมหมุนกล้องขึ้น/ลง (vertical)
  const defaultCameraHeight = 2.5 // ความสูงกล้อง default
  const isDragging = useRef(false)
  const lastMouseX = useRef(0)
  const lastMouseY = useRef(0)

  // Raycaster for camera collision, ground detection, and step-up
  const cameraRaycaster = useRef(new THREE.Raycaster())
  const groundRaycaster = useRef(new THREE.Raycaster())
  const stepRaycaster = useRef(new THREE.Raycaster())

  // Socket connection
  const sendPosition = useSocket((state) => state.sendPosition)

  // Character settings from game store (ค่าปรับแต่งจาก Settings Panel)
  const characterSettings = useGame((state) => state.characterSettings)

  // Load Model & Animations
  const { scene, animations } = useGLTF('./models/Fox.glb')
  const { actions } = useAnimations(animations, scene)

  // Animation State
  const [currentAction, setCurrentAction] = useState('Survey')

  // Setup mouse controls for camera zoom and orbit
  useEffect(() => {
    const canvas = gl.domElement

    // Zoom with scroll wheel
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      cameraDistance.current += e.deltaY * 0.01
      // Clamp zoom distance (min 3, max 15)
      cameraDistance.current = Math.max(3, Math.min(15, cameraDistance.current))
    }

    // Mouse drag to orbit camera (both horizontal and vertical)
    const handleMouseDown = (e: MouseEvent) => {
      // Left click or right click to start dragging
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true
        lastMouseX.current = e.clientX
        lastMouseY.current = e.clientY
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastMouseX.current
        const deltaY = e.clientY - lastMouseY.current

        // ความเร็วหมุนกล้อง (ไม่เร็วเกินไป)
        const sensitivityX = 0.003
        const sensitivityY = 0.002

        // Horizontal orbit (ซ้าย/ขวา)
        cameraOrbitOffsetX.current -= deltaX * sensitivityX
        cameraOrbitOffsetX.current = Math.max(-Math.PI, Math.min(Math.PI, cameraOrbitOffsetX.current))

        // Vertical orbit (ขึ้น/ลง) - จำกัดมุมไม่ให้กล้องไปอยู่ใต้พื้นหรือเหนือศีรษะมากเกินไป
        cameraOrbitOffsetY.current += deltaY * sensitivityY
        cameraOrbitOffsetY.current = Math.max(-0.8, Math.min(1.2, cameraOrbitOffsetY.current)) // -0.8 = มองจากบน, 1.2 = มองจากล่าง

        lastMouseX.current = e.clientX
        lastMouseY.current = e.clientY
      }
    }

    // Prevent context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('contextmenu', handleContextMenu)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [gl])

  useEffect(() => {
    // Set initial action
    actions[currentAction]?.reset().fadeIn(0.5).play()
    return () => {
      actions[currentAction]?.fadeOut(0.5)
    }
  }, [currentAction, actions])

  useFrame((_, delta) => {
    if (!body.current) return

    const { forward, backward, left, right, jump } = getKeys()

    // Get current state
    const bodyPosition = body.current.translation()
    const velocity = body.current.linvel()

    // 1. Rotate character with A/D keys (ปรับตาม rotationSpeed จาก Settings)
    const baseRotationSpeed = 1.5
    const rotationSpeed = baseRotationSpeed * characterSettings.rotationSpeed * delta
    if (left) {
      characterRotation.current += rotationSpeed
    }
    if (right) {
      characterRotation.current -= rotationSpeed
    }

    // 2. Movement based on character facing direction (ปรับตาม moveSpeed จาก Settings)
    // เพิ่ม impulse strength ชดเชย damping ที่สูงขึ้น
    const impulse = { x: 0, y: 0, z: 0 }
    const baseImpulseStrength = 0.25
    const impulseStrength = baseImpulseStrength * characterSettings.moveSpeed * delta * 60

    // Forward/backward direction based on character rotation
    const forwardX = -Math.sin(characterRotation.current)
    const forwardZ = -Math.cos(characterRotation.current)

    if (forward) {
      impulse.x += forwardX * impulseStrength
      impulse.z += forwardZ * impulseStrength
    }

    // เมื่อกด S - หมุนตัวละคร 180° และเดินไปข้างหน้า (เข้าหากล้อง)
    if (backward && !forward) {
      // หมุนตัวละครกลับหลัง (ค่อยๆ หมุน)
      const turnSpeed = 5 * delta
      let targetRotation = characterRotation.current + Math.PI

      // Normalize target rotation
      while (targetRotation > Math.PI) targetRotation -= Math.PI * 2
      while (targetRotation < -Math.PI) targetRotation += Math.PI * 2

      // คำนวณ rotation difference
      let rotDiff = targetRotation - characterRotation.current
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2

      // หมุนไปทางที่ใกล้กว่า
      if (Math.abs(rotDiff) > 0.1) {
        characterRotation.current += Math.sign(rotDiff) * turnSpeed
      }

      // เดินไปข้างหน้า (ตามทิศที่หันหน้าปัจจุบัน)
      const currentForwardX = -Math.sin(characterRotation.current)
      const currentForwardZ = -Math.cos(characterRotation.current)
      impulse.x += currentForwardX * impulseStrength * 0.8
      impulse.z += currentForwardZ * impulseStrength * 0.8
    }

    body.current.applyImpulse(impulse, true)

    // Step-Up Logic - ตรวจจับบันไดและยกตัวละครขึ้น
    const isMoving = forward || backward
    if (isMoving) {
      const stepHeight = 0.5 // ความสูงสูงสุดที่ก้าวขึ้นได้
      const stepCheckDistance = 0.4 // ระยะตรวจด้านหน้า

      // ทิศทางที่ตัวละครกำลังเคลื่อนที่
      const moveDir = new THREE.Vector3(forwardX, 0, forwardZ)
      if (backward) moveDir.negate()

      // ยิง Ray ด้านหน้าระดับเท้า
      const feetPos = new THREE.Vector3(bodyPosition.x, bodyPosition.y - 0.2, bodyPosition.z)
      stepRaycaster.current.set(feetPos, moveDir)
      stepRaycaster.current.far = stepCheckDistance

      const frontHits = stepRaycaster.current.intersectObjects(threeScene.children, true)

      if (frontHits.length > 0) {
        // มีสิ่งกีดขวางด้านหน้า - ตรวจว่าเป็นบันไดหรือไม่
        // ยิง Ray จากจุดที่สูงขึ้นไปดูว่าว่างไหม
        const higherPos = new THREE.Vector3(bodyPosition.x, bodyPosition.y + stepHeight, bodyPosition.z)
        stepRaycaster.current.set(higherPos, moveDir)
        stepRaycaster.current.far = stepCheckDistance

        const upperHits = stepRaycaster.current.intersectObjects(threeScene.children, true)

        // ถ้าด้านบนว่าง = เป็นบันได = ยกตัวละครขึ้น
        if (upperHits.length === 0) {
          const currentVel = body.current.linvel()
          // เพิ่มแรงยกขึ้นเล็กน้อย
          body.current.setLinvel({
            x: currentVel.x,
            y: Math.max(currentVel.y, 3), // ยกขึ้น
            z: currentVel.z
          }, true)
        }
      }
    }

    // Limit max speed (ปรับตาม moveSpeed จาก Settings)
    const baseMaxSpeed = 5
    const maxSpeed = baseMaxSpeed * characterSettings.moveSpeed
    const currentVelX = velocity.x
    const currentVelZ = velocity.z
    const currentSpeed = Math.sqrt(currentVelX ** 2 + currentVelZ ** 2)
    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed
      body.current.setLinvel({ x: currentVelX * scale, y: velocity.y, z: currentVelZ * scale }, true)
    }

    // 3. Jumping - use raycast to detect ground (ต้องยืนบนพื้นจริงๆ เท่านั้น)
    const playerFeet = new THREE.Vector3(bodyPosition.x, bodyPosition.y, bodyPosition.z)
    const downDirection = new THREE.Vector3(0, -1, 0)

    groundRaycaster.current.set(playerFeet, downDirection)
    groundRaycaster.current.far = 0.6 // ระยะตรวจพื้น (ลดลงเพื่อความแม่นยำ)

    const groundHits = groundRaycaster.current.intersectObjects(threeScene.children, true)

    // ต้องมี raycast hit จริงๆ ถึงจะถือว่าอยู่บนพื้น
    // ไม่ใช้ velocity.y เพราะจะทำให้กระโดดกลางอากาศได้
    const isOnGround = groundHits.length > 0 && groundHits[0].distance < 0.6

    // Reset canJump เฉพาะเมื่อยืนบนพื้นจริงๆ
    if (isOnGround) {
      canJump.current = true
    }

    // กระโดดได้เฉพาะเมื่อ canJump เป็น true (ยืนบนพื้น) - ปรับตาม jumpForce จาก Settings
    if (jump && canJump.current && isOnGround) {
      const baseJumpVelocity = 10
      const jumpVelocity = baseJumpVelocity * characterSettings.jumpForce
      body.current.setLinvel({ x: velocity.x, y: jumpVelocity, z: velocity.z }, true)
      canJump.current = false // ป้องกันกระโดดซ้ำ
    }

    // 4. Animation State Logic
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)

    let nextAction = 'Survey'
    if (speed > 0.5) nextAction = 'Walk'
    if (speed > 2) nextAction = 'Run'

    if (currentAction !== nextAction) {
      setCurrentAction(nextAction)
    }

    // 5. Update model rotation - หันหน้าออกจากกล้อง (ไปข้างหน้า)
    scene.rotation.y = characterRotation.current + Math.PI

    // 6. Third-Person Camera - Follow behind character with collision detection
    const playerPos = new THREE.Vector3(bodyPosition.x, bodyPosition.y, bodyPosition.z)
    const playerHead = playerPos.clone().add(new THREE.Vector3(0, 1, 0))

    // เมื่อกด W หรือ A/D (เดิน/หมุน) ค่อยๆ reset camera orbit กลับไปหลังตัวละคร
    // กด S อย่างเดียวจะไม่ทำให้กล้องหมุน
    const isWalkingForward = forward || left || right
    if (isWalkingForward && !isDragging.current) {
      // ค่อยๆ ลด orbit offset กลับไป 0 (ทั้ง X และ Y)
      const resetSpeed = 0.92 // ลดลงทีละ 8% ต่อเฟรม

      cameraOrbitOffsetX.current *= resetSpeed
      if (Math.abs(cameraOrbitOffsetX.current) < 0.01) {
        cameraOrbitOffsetX.current = 0
      }

      cameraOrbitOffsetY.current *= resetSpeed
      if (Math.abs(cameraOrbitOffsetY.current) < 0.01) {
        cameraOrbitOffsetY.current = 0
      }
    }

    // คำนวณมุมกล้อง = ทิศตัวละคร + offset จากเมาส์
    let cameraAngle = characterRotation.current + cameraOrbitOffsetX.current

    // ถ้ากด S อย่างเดียว (ไม่กด W, A, D) - กล้องคงที่ไม่หมุนตาม
    if (backward && !forward && !left && !right) {
      const currentCamPos = smoothCameraPosition.current
      const dx = currentCamPos.x - bodyPosition.x
      const dz = currentCamPos.z - bodyPosition.z
      cameraAngle = Math.atan2(dx, dz)
    }

    // คำนวณความสูงกล้องจาก Y offset (มุมขึ้น/ลง)
    const verticalOffset = cameraOrbitOffsetY.current * 3 // คูณ 3 เพื่อให้เห็นผลชัด
    const adjustedCameraHeight = defaultCameraHeight - verticalOffset

    // ปรับระยะห่างกล้องตาม vertical angle (ยิ่งมองจากบน ยิ่งใกล้)
    const distanceMultiplier = 1 + (cameraOrbitOffsetY.current * 0.3)
    const adjustedDistance = cameraDistance.current * Math.max(0.5, distanceMultiplier)

    // Ideal camera position: behind the character (with orbit offset)
    const idealCamX = playerPos.x + Math.sin(cameraAngle) * adjustedDistance
    const idealCamY = playerPos.y + Math.max(1, adjustedCameraHeight) // ไม่ต่ำกว่า 1
    const idealCamZ = playerPos.z + Math.cos(cameraAngle) * adjustedDistance
    const idealCameraPosition = new THREE.Vector3(idealCamX, idealCamY, idealCamZ)

    // Camera collision detection - ตรวจสอบสิ่งกีดขวางระหว่างกล้องกับตัวละคร
    const directionToCamera = idealCameraPosition.clone().sub(playerHead).normalize()
    const distanceToIdealPos = playerHead.distanceTo(idealCameraPosition)

    cameraRaycaster.current.set(playerHead, directionToCamera)
    cameraRaycaster.current.far = distanceToIdealPos

    // Check for intersections with scene objects (excluding player)
    const intersects = cameraRaycaster.current.intersectObjects(threeScene.children, true)

    let finalCameraPosition = idealCameraPosition.clone()

    // If there's an obstruction, move camera closer
    if (intersects.length > 0) {
      // Find the closest intersection that's not the player
      for (const hit of intersects) {
        // Skip if it's too close (probably the player itself)
        if (hit.distance > 0.5) {
          // Place camera slightly in front of the obstruction
          const safeDistance = Math.max(1.5, hit.distance - 0.5)
          finalCameraPosition = playerHead.clone().add(directionToCamera.multiplyScalar(safeDistance))
          break
        }
      }
    }

    const idealTarget = playerHead.clone()

    // Smooth camera movement (faster when avoiding obstacles)
    const lerpSpeed = intersects.length > 0 ? delta * 10 : delta * 5
    smoothCameraPosition.current.lerp(finalCameraPosition, lerpSpeed)
    smoothCameraTarget.current.lerp(idealTarget, delta * 10)

    // Update camera
    camera.position.copy(smoothCameraPosition.current)
    camera.lookAt(smoothCameraTarget.current)

    // 7. Send position to server (Throttled)
    const now = Date.now()
    if (now - lastSyncTime.current > 50) {
      sendPosition(bodyPosition.x, bodyPosition.y, bodyPosition.z)
      lastSyncTime.current = now
    }
  })

  return (
    <RigidBody
      ref={body}
      colliders={false}
      restitution={0}
      friction={2}
      linearDamping={4} // เพิ่ม damping เพื่อให้หยุดเร็วขึ้นเมื่อปล่อยปุ่ม
      angularDamping={0.5}
      position={spawnPoint}
      enabledRotations={[false, false, false]}
      gravityScale={1.2}
      ccd={true} // Continuous Collision Detection - ป้องกันทะลุพื้น
    >
      {/* ยก Collider ขึ้นเพื่อไม่ให้จมลงไปในพื้น */}
      <CapsuleCollider args={[0.35, 0.35]} position={[0, 0.7, 0]} />
      <group>
        <primitive
          object={scene}
          scale={0.02}
          position={[0, 0, 0]}
        />
      </group>
    </RigidBody>
  )
}
