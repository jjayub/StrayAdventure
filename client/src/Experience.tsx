import { OrbitControls } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Player } from './Player'

export function Experience() {

  return (
    <>
      <OrbitControls makeDefault />

      <directionalLight
        castShadow
        position={[1, 2, 3]}
        intensity={1.5}
        shadow-normalBias={0.04}
      />
      <ambientLight intensity={0.5} />

      <Physics debug>
        {/* Floor */}
        <RigidBody type="fixed">
          <mesh receiveShadow position-y={-1.25} rotation-x={-Math.PI * 0.5} scale={20}>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" />
          </mesh>
        </RigidBody>

        {/* Walls */}
        <RigidBody type="fixed">
          <CuboidCollider args={[10, 2, 0.5]} position={[0, 1, 10]} />
          <CuboidCollider args={[10, 2, 0.5]} position={[0, 1, -10]} />
          <CuboidCollider args={[0.5, 2, 10]} position={[10, 1, 0]} />
          <CuboidCollider args={[0.5, 2, 10]} position={[-10, 1, 0]} />
        </RigidBody>

        {/* Player (Fox) */}
        <Player />

        {/* Obstacle 1 */}
        <RigidBody position={[2, 0, -2]}>
          <mesh castShadow>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
          </mesh>
        </RigidBody>

        {/* Obstacle 2 */}
        <RigidBody position={[-2, 0, 2]}>
          <mesh castShadow>
            <sphereGeometry args={[0.5]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        </RigidBody>

      </Physics>
    </>
  )
}
