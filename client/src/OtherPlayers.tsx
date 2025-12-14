import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useSocket, getPlayerPosition } from './stores/useSocket'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

/**
 * Interface สำหรับข้อมูลผู้เล่นคนอื่น
 */
interface OtherPlayer {
  id: string
  nickname: string
  x: number
  y: number
  z: number
  rotation: number
}

/**
 * OtherPlayers Component
 * แสดงผู้เล่นคนอื่นในโลก 3D พร้อม:
 * - โมเดล 3D (Fox)
 * - Nickname ลอยอยู่เหนือหัว
 * - Smooth interpolation สำหรับการเคลื่อนไหว
 * - ใช้ mutable store เพื่อลด re-renders
 */
export function OtherPlayers() {
  // ใช้ playerListVersion เพื่อ trigger re-render เฉพาะเมื่อ player เข้า/ออก
  const playerListVersion = useSocket((state) => state.playerListVersion)
  const otherPlayers = useSocket((state) => state.otherPlayers)

  // แปลง Map เป็น Array เมื่อ playerListVersion เปลี่ยน
  const playersArray = useMemo(() => {
    return Array.from(otherPlayers.values())
  }, [playerListVersion, otherPlayers])

  return (
    <>
      {playersArray.map((player) => (
        <OtherPlayerModel key={player.id} playerId={player.id} initialData={player} />
      ))}
    </>
  )
}

/**
 * OtherPlayerModel Component
 * แสดงโมเดลของผู้เล่นคนอื่นแต่ละคน
 * ใช้ mutable store เพื่อดึงตำแหน่งแบบ real-time โดยไม่ trigger re-render
 */
function OtherPlayerModel({ playerId, initialData }: { playerId: string; initialData: OtherPlayer }) {
  const groupRef = useRef<THREE.Group>(null)
  const [nickname, setNickname] = useState(initialData.nickname)

  // Target position สำหรับ interpolation
  const targetPosition = useRef(new THREE.Vector3(initialData.x, initialData.y, initialData.z))
  const targetRotation = useRef(initialData.rotation)
  const currentRotation = useRef(initialData.rotation + Math.PI)

  // Load Model & Animations - ใช้ URL แยกเพื่อไม่ให้ share scene กับ Player
  const { scene, animations } = useGLTF('./models/Fox.glb')

  // Clone scene อย่างถูกต้องสำหรับ skinned mesh และ reset rotation
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene)
    // Reset rotation เพื่อไม่ให้มีค่า rotation จาก Player.tsx ที่ share scene
    clone.rotation.set(0, 0, 0)
    return clone
  }, [scene])

  const { actions } = useAnimations(animations, clonedScene)

  // เล่น animation เริ่มต้น
  useEffect(() => {
    if (actions['Survey']) {
      actions['Survey'].reset().fadeIn(0.5).play()
    }
  }, [actions])

  // Smooth interpolation สำหรับตำแหน่งและการหมุน
  // อ่านจาก mutable store โดยตรง - ไม่มี re-render
  useFrame((_, delta) => {
    if (!groupRef.current || !clonedScene) return

    // ดึงตำแหน่งล่าสุดจาก mutable store
    const playerData = getPlayerPosition(playerId)
    if (playerData) {
      targetPosition.current.set(playerData.x, playerData.y, playerData.z)
      targetRotation.current = playerData.rotation

      // อัปเดต nickname ถ้าเปลี่ยน
      if (playerData.nickname !== nickname) {
        setNickname(playerData.nickname)
      }
    }

    // Lerp ตำแหน่ง
    groupRef.current.position.lerp(targetPosition.current, delta * 10)

    // อัปเดต rotation ของ model โดยตรง - เหมือน Player.tsx
    // Player.tsx ใช้: scene.rotation.y = characterRotation.current + Math.PI
    const targetRot = targetRotation.current + Math.PI
    let rotDiff = targetRot - currentRotation.current

    // Normalize rotation difference
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2

    currentRotation.current += rotDiff * delta * 8
    // Apply rotation โดยตรงกับ clonedScene เหมือนที่ Player.tsx ทำ
    clonedScene.rotation.y = currentRotation.current

    // เลือก animation ตามความเร็ว
    const speed = targetPosition.current.distanceTo(groupRef.current.position)
    if (speed > 0.05) {
      if (actions['Run'] && !actions['Run'].isRunning()) {
        Object.values(actions).forEach(action => action?.fadeOut(0.2))
        actions['Run'].reset().fadeIn(0.2).play()
      }
    } else {
      if (actions['Survey'] && !actions['Survey'].isRunning()) {
        Object.values(actions).forEach(action => action?.fadeOut(0.2))
        actions['Survey'].reset().fadeIn(0.2).play()
      }
    }
  })

  return (
    <group ref={groupRef} position={[initialData.x, initialData.y, initialData.z]}>
      {/* Player Model - apply rotation directly to clonedScene */}
      <primitive
        object={clonedScene}
        scale={0.02}
      />

      {/* Nickname Label - ลอยอยู่เหนือหัว */}
      <Html
        position={[0, 2.2, 0]}
        center
        distanceFactor={8}
        occlude={false}
        style={{
          pointerEvents: 'none',
        }}
      >
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#ffffff',
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: "'Segoe UI', sans-serif",
          fontWeight: 500,
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}>
          {nickname}
        </div>
      </Html>
    </group>
  )
}
