import { useKeyboardControls, OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, useRapier, CapsuleCollider } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'

export function Player() {
  const body = useRef<RapierRigidBody>(null)
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const { rapier, world } = useRapier()

  // Load Model & Animations
  // Note: standard GLTF load. In a real app, use a store or preload.
  const { scene, animations } = useGLTF('./models/Fox.glb')
  const { actions } = useAnimations(animations, scene)

  // Animation State
  const [currentAction, setCurrentAction] = useState('Survey') // Survey is idle-ish for Fox

  useEffect(() => {
    // Set initial action
    actions[currentAction]?.reset().fadeIn(0.5).play()
    return () => {
      actions[currentAction]?.fadeOut(0.5)
    }
  }, [currentAction, actions])

  useFrame((state, delta) => {
    if (!body.current) return

    const { forward, backward, left, right, jump } = getKeys()

    // 1. Movement Logic
    const impulse = { x: 0, y: 0, z: 0 }

    const impulseStrength = 0.3 * delta * 60 // Adjust for framerate

    // Camera relative movement (Optional enhancement later, simple world-space for now)
    // For now: Simple world-space movement
    if (forward) {
      impulse.z -= impulseStrength
    }
    if (backward) {
      impulse.z += impulseStrength
    }
    if (left) {
      impulse.x -= impulseStrength
    }
    if (right) {
      impulse.x += impulseStrength
    }

    body.current.applyImpulse(impulse, true)

    // 2. Jumping
    // Raycast down to check if grounded
    const origin = body.current.translation()
    origin.y -= 0.05 // Offset slightly
    const direction = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(origin, direction)
    const hit = world.castRay(ray, 0.5, true) // length 0.5 roughly

    if (jump && hit && hit.toi < 0.15) {
      body.current.applyImpulse({ x: 0, y: 0.5, z: 0 }, true)
    }

    // 3. Animation State Logic
    const velocity = body.current.linvel()
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)

    let nextAction = 'Survey'
    if (speed > 0.5) nextAction = 'Walk'
    if (speed > 2) nextAction = 'Run'

    if (currentAction !== nextAction) {
      setCurrentAction(nextAction)
    }

    // 4. Rotate model to face movement direction
    // Simple lookAt based on velocity if moving
    if (speed > 0.1) {
      const angle = Math.atan2(velocity.x, velocity.z)
      // Lerp rotation for smoothness (manual implementation or use Quaternion slerp)
      // const currentRotation = scene.rotation.y
      let targetRotation = angle

      // Shortest path rotation logic could go here
      scene.rotation.y = targetRotation
    }


    // 5. Camera Follow
    const bodyPosition = body.current.translation()

    // Update OrbitControls target to follow player
    // This allows zooming/orbiting while keeping the player in focus
    const controls = state.controls as unknown as { target: THREE.Vector3, update: () => void }
    if (controls) {
      controls.target.set(bodyPosition.x, bodyPosition.y, bodyPosition.z)
      controls.update()
    }
  })

  return (
    <RigidBody
      ref={body}
      colliders={false} // Use explicit collider
      restitution={0.2}
      friction={1}
      linearDamping={0.5}
      angularDamping={0.5}
      position={[0, 1, 0]}
      enabledRotations={[false, false, false]} // Lock rotation to prevent tipping
    >
      <CapsuleCollider args={[0.3, 0.3]} position={[0, 0.3, 0]} />
      <group>
        <primitive
          object={scene}
          scale={0.02}
          position={[0, -0.4, 0]} // Adjust model position relative to collider
        // The Fox model origin is a bit off, adjust as needed
        />
      </group>
    </RigidBody>
  )
}
