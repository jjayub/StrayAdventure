import { useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useSocket } from './stores/useSocket'

/**
 * Player Component
 * ควบคุมตัวละครหลักของเกม:
 * - W/S เดินหน้า/ถอยหลัง ตามทิศที่ตัวละครหันหน้า
 * - A/D หมุนตัวละคร
 * - Space กระโดด
 * - กล้องตามหลังตัวละคร (หลบสิ่งกีดขวาง)
 * - Scroll Zoom เข้า/ออก
 */
export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const canJump = useRef(true)
  const lastSyncTime = useRef(0)
  const [, getKeys] = useKeyboardControls()
  const { camera, gl, scene: threeScene } = useThree()

  // Character rotation (the direction character is facing)
  const characterRotation = useRef(0) // radians

  // Camera settings
  const cameraDistance = useRef(6) // ระยะห่างจากตัวละคร
  const cameraHeight = useRef(2.5) // ความสูงกล้อง
  const smoothCameraPosition = useRef(new THREE.Vector3(0, 5, 10))
  const smoothCameraTarget = useRef(new THREE.Vector3())

  // Camera orbit offset (for mouse look-around)
  const cameraOrbitOffset = useRef(0) // มุมหมุนกล้องจากเมาส์
  const isDragging = useRef(false)
  const lastMouseX = useRef(0)

  // Raycaster for camera collision, ground detection, and step-up
  const cameraRaycaster = useRef(new THREE.Raycaster())
  const groundRaycaster = useRef(new THREE.Raycaster())
  const stepRaycaster = useRef(new THREE.Raycaster())

  // Socket connection
  const sendPosition = useSocket((state) => state.sendPosition)

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

    // Mouse drag to orbit camera
    const handleMouseDown = (e: MouseEvent) => {
      // Left click or right click to start dragging
      if (e.button === 0 || e.button === 2) {
        isDragging.current = true
        lastMouseX.current = e.clientX
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - lastMouseX.current
        // ความเร็วหมุนกล้อง (ไม่เร็วเกินไป)
        const sensitivity = 0.003
        cameraOrbitOffset.current -= deltaX * sensitivity
        // จำกัดมุมหมุน (-PI to PI)
        cameraOrbitOffset.current = Math.max(-Math.PI, Math.min(Math.PI, cameraOrbitOffset.current))
        lastMouseX.current = e.clientX
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

    // 1. Rotate character with A/D keys (ลดความเร็วการหมุน)
    const rotationSpeed = 1.5 * delta // ลดจาก 3 เป็น 1.5
    if (left) {
      characterRotation.current += rotationSpeed
    }
    if (right) {
      characterRotation.current -= rotationSpeed
    }

    // 2. Movement based on character facing direction
    const impulse = { x: 0, y: 0, z: 0 }
    const impulseStrength = 0.12 * delta * 60 // เพิ่มจาก 0.08 เป็น 0.12

    // Forward/backward direction based on character rotation
    const forwardX = -Math.sin(characterRotation.current)
    const forwardZ = -Math.cos(characterRotation.current)

    if (forward) {
      impulse.x += forwardX * impulseStrength
      impulse.z += forwardZ * impulseStrength
    }
    if (backward) {
      impulse.x -= forwardX * impulseStrength * 0.5 // Slower backward
      impulse.z -= forwardZ * impulseStrength * 0.5
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

    // Limit max speed
    const maxSpeed = 5 // เพิ่มจาก 4 เป็น 5
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

    // กระโดดได้เฉพาะเมื่อ canJump เป็น true (ยืนบนพื้น)
    if (jump && canJump.current && isOnGround) {
      body.current.setLinvel({ x: velocity.x, y: 7, z: velocity.z }, true)
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

    // เมื่อตัวละครเคลื่อนที่ ค่อยๆ reset camera orbit กลับไปหลังตัวละคร
    const isWalking = forward || backward
    if (isWalking && !isDragging.current) {
      // ค่อยๆ ลด orbit offset กลับไป 0
      cameraOrbitOffset.current *= 0.95 // ลดลง 5% ต่อเฟรม
      if (Math.abs(cameraOrbitOffset.current) < 0.01) {
        cameraOrbitOffset.current = 0
      }
    }

    // คำนวณมุมกล้อง = ทิศตัวละคร + offset จากเมาส์
    const cameraAngle = characterRotation.current + cameraOrbitOffset.current

    // Ideal camera position: behind the character (with orbit offset)
    const idealCamX = playerPos.x + Math.sin(cameraAngle) * cameraDistance.current
    const idealCamY = playerPos.y + cameraHeight.current
    const idealCamZ = playerPos.z + Math.cos(cameraAngle) * cameraDistance.current
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
      restitution={0.2}
      friction={1}
      linearDamping={0.5}
      angularDamping={0.5}
      position={[0, 1, 0]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.3, 0.3]} position={[0, 0.3, 0]} />
      <group>
        <primitive
          object={scene}
          scale={0.02}
          position={[0, -0.4, 0]}
        />
      </group>
    </RigidBody>
  )
}
