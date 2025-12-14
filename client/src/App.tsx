import { Canvas } from '@react-three/fiber'
import { Experience } from './Experience'
import { Suspense } from 'react'
import { KeyboardControls } from '@react-three/drei'

export default function App() {
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
      ]}
    >
      <Canvas
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [2.5, 4, 6]
        }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}
