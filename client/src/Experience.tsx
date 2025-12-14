import { Sky, Cloud, useGLTF, useProgress, Html } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { useThree } from '@react-three/fiber'
import { Player } from './Player'
import { OtherPlayers } from './OtherPlayers'
import { Effects } from './Effects'
import { useGame } from './stores/useGame'
import { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'

/**
 * Loading Screen Component - แสดง Animation ขณะโหลด Map
 */
function LoadingScreen() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Orbitron, sans-serif',
        textAlign: 'center',
      }}>
        {/* Spinner Animation */}
        <div style={{
          width: 80,
          height: 80,
          border: '4px solid rgba(0, 255, 255, 0.3)',
          borderTop: '4px solid #00ffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 20,
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
        }} />

        {/* Loading Text */}
        <div style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#00ffff',
          textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
          marginBottom: 10,
        }}>
          LOADING MAP
        </div>

        {/* Progress Bar */}
        <div style={{
          width: 200,
          height: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 10,
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#00ffff',
            boxShadow: '0 0 10px #00ffff',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Percentage */}
        <div style={{
          fontSize: 16,
          color: '#ff0080',
          textShadow: '0 0 10px #ff0080',
        }}>
          {Math.round(progress)}%
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Html>
  )
}

/**
 * Interface สำหรับ Map Config
 */
/**
 * Interface สำหรับ Map Config - กำหนดโครงสร้าง config ของแต่ละ Map
 */
interface MapConfig {
  /** ID เฉพาะของ Map */
  id: string
  /** ชื่อแสดงผลของ Map */
  name: string
  /** การตั้งค่าท้องฟ้า */
  skyConfig?: {
    /** ตำแหน่งดวงอาทิตย์ [x, y, z] */
    sunPosition: [number, number, number]
  }
  /** การตั้งค่าแสง */
  lighting?: {
    /** ความเข้มของ Ambient Light */
    ambient: number
    /** ไฟนีออนเพิ่มเติม */
    neonLights?: Array<{
      position: [number, number, number]
      color: string
      intensity: number
    }>
  }
  /** จุดเกิดตัวละคร [x, y, z] - ต้องอยู่บน Map Model */
  spawnPoint?: [number, number, number]
  /** ขนาด Scale ของ Map Model (default: 1) */
  modelScale?: number
  /** ตำแหน่ง Offset ของ Map Model [x, y, z] */
  modelPosition?: [number, number, number]
  /** ซ่อน Default Floor หรือไม่ (default: false, จะซ่อนอัตโนมัติเมื่อมี map.glb) */
  hideDefaultFloor?: boolean
}

/**
 * CameraController Component - ปรับค่า Camera ตาม Settings
 * @param renderDistance - ระยะ Render ที่ต้องการ
 */
function CameraController({ renderDistance }: { renderDistance: number }) {
  const { camera } = useThree()

  useEffect(() => {
    // ปรับ camera far plane ตาม render distance
    camera.far = renderDistance * 1.5
    camera.updateProjectionMatrix()
  }, [camera, renderDistance])

  return null
}

/**
 * Experience Component
 * ฉากหลักของเกม - โหลด Map ที่เลือกจาก Map Selection
 */
export function Experience() {
  const { selectedMap, characterSettings } = useGame()
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null)
  const [hasMapModel, setHasMapModel] = useState(false)

  // โหลด config ของ Map ที่เลือก
  useEffect(() => {
    async function loadMapConfig() {
      if (selectedMap?.scene) {
        try {
          const response = await fetch(selectedMap.scene)
          const config = await response.json()
          setMapConfig(config)

          // Check if map has a 3D model
          const mapId = selectedMap.id
          try {
            const modelResponse = await fetch(`/maps/${mapId}/map.glb`, { method: 'HEAD' })
            setHasMapModel(modelResponse.ok)
          } catch {
            setHasMapModel(false)
          }
        } catch (error) {
          console.error('Failed to load map config:', error)
          setMapConfig(null)
        }
      }
    }
    loadMapConfig()
  }, [selectedMap])

  // Default values
  const sunPosition = mapConfig?.skyConfig?.sunPosition || [100, 20, 100]
  const ambientIntensity = mapConfig?.lighting?.ambient || 1.2
  const neonLights = mapConfig?.lighting?.neonLights || []

  // Render distance from settings (View Distance / Fog)
  const renderDistance = characterSettings.renderDistance

  return (
    <>
      {/* Fog - ควบคุม View Distance (ระยะการ Render) */}
      <fog attach="fog" args={['#87ceeb', renderDistance * 0.3, renderDistance]} />

      {/* Camera Far Plane - ปรับระยะ render ของกล้อง */}
      <CameraController renderDistance={renderDistance} />

      {/* Sky Background */}
      <Sky
        distance={450000}
        sunPosition={sunPosition as [number, number, number]}
        inclination={0.6}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={0.5}
        turbidity={10}
      />

      {/* Clouds */}
      <Cloud position={[-20, 15, -30]} speed={0.2} opacity={0.6} depth={1.5} width={20} segments={20} />
      <Cloud position={[20, 12, -25]} speed={0.3} opacity={0.5} depth={1} width={15} segments={15} />

      {/* Camera is now controlled by Player component (Third-Person) */}

      {/* ===== LIGHTING SYSTEM ===== */}
      <ambientLight intensity={ambientIntensity} />
      <hemisphereLight args={['#87ceeb', '#3d5c3d', 0.8]} />

      {/* Main Sun Light */}
      <directionalLight
        castShadow
        position={[sunPosition[0] * 0.5, sunPosition[1] * 2, sunPosition[2] * 0.5]}
        intensity={3.0}
        color="#fffaf0"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-normalBias={0.02}
      />

      {/* Fill Light */}
      <directionalLight position={[-30, 30, -30]} intensity={0.8} color="#b0c4de" />

      {/* Dynamic Neon Lights from Map Config */}
      {neonLights.map((light, index) => (
        <pointLight
          key={index}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
          distance={10}
          decay={2}
        />
      ))}

      {/* Default neon lights if none specified */}
      {neonLights.length === 0 && (
        <>
          <pointLight position={[-3, 3, 3]} intensity={30} color="#ff0080" distance={8} decay={2} />
          <pointLight position={[3, 3, -3]} intensity={30} color="#00ffff" distance={8} decay={2} />
        </>
      )}

      {/* Physics with realistic gravity (9.81 m/s² * 2 for better game feel) */}
      <Physics gravity={[0, -20, 0]}>
        {/* Floor - แสดงเฉพาะเมื่อไม่มี Map Model (เพื่อป้องกันตัวละครตกลงไปใต้แมพ) */}
        {!hasMapModel && (
          <RigidBody type="fixed" friction={2}>
            <mesh receiveShadow position-y={-1.25} rotation-x={-Math.PI * 0.5} scale={100}>
              <planeGeometry />
              <meshStandardMaterial color="#4a7c4e" roughness={0.9} metalness={0.0} />
            </mesh>
          </RigidBody>
        )}

        {/* Invisible Walls - ป้องกันตัวละครหลุดออกจากแมพ (ขยายให้ใหญ่ขึ้นสำหรับแมพใหญ่) */}
        <RigidBody type="fixed">
          <CuboidCollider args={[500, 100, 0.5]} position={[0, 50, 500]} />
          <CuboidCollider args={[500, 100, 0.5]} position={[0, 50, -500]} />
          <CuboidCollider args={[0.5, 100, 500]} position={[500, 50, 0]} />
          <CuboidCollider args={[0.5, 100, 500]} position={[-500, 50, 0]} />
        </RigidBody>

        {/* Player - รับ spawnPoint จาก Map Config */}
        <Player spawnPoint={mapConfig?.spawnPoint || [0, 1, 0]} />

        {/* Other Players - แสดงผู้เล่นคนอื่นในโลก Multiplayer */}
        <OtherPlayers />

        {/* Map 3D Model - แสดง Loading Screen ขณะโหลด */}
        {hasMapModel && selectedMap && (
          <Suspense fallback={<LoadingScreen />}>
            <MapModel
              mapId={selectedMap.id}
              scale={mapConfig?.modelScale || 1}
              position={mapConfig?.modelPosition || [0, 0, 0]}
            />
          </Suspense>
        )}

        {/* Default decorations if no map model */}
        {!hasMapModel && <DefaultDecorations />}

      </Physics>

      <Effects />
    </>
  )
}

/**
 * MapModel Component - โหลดและแสดง 3D Model ของ Map
 * @param mapId - ID ของ Map สำหรับโหลด glb file
 * @param scale - ขนาดของ Map Model
 * @param position - ตำแหน่งของ Map Model
 */
function MapModel({
  mapId,
  scale,
  position
}: {
  mapId: string
  scale: number
  position: [number, number, number]
}) {
  const { scene } = useGLTF(`/maps/${mapId}/map.glb`)

  // Clone scene to avoid issues with reusing
  const clonedScene = scene.clone()

  // Enable shadows for all meshes
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return (
    <RigidBody
      type="fixed"
      colliders="trimesh"
      friction={0.7}
      restitution={0}
    >
      <primitive
        object={clonedScene}
        scale={scale}
        position={position}
      />
    </RigidBody>
  )
}

/**
 * DefaultDecorations - แสดงวัตถุ Default เมื่อไม่มี Map Model
 */
function DefaultDecorations() {
  return (
    <>
      {/* Neon Box */}
      <RigidBody position={[5, 0, -5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#111" emissive="#00ffff" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </RigidBody>

      {/* Neon Sphere */}
      <RigidBody position={[-5, 0, 5]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.8]} />
          <meshStandardMaterial color="#111" emissive="#ff0080" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </RigidBody>

      {/* Platforms */}
      <RigidBody type="fixed" position={[-8, -0.5, -8]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[5, 1.5, 5]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" position={[-8, 1, -14]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[4, 1, 4]} />
          <meshStandardMaterial color="#4a5a6a" roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* Rocks */}
      <RigidBody type="fixed" position={[10, -0.8, 8]}>
        <mesh receiveShadow castShadow>
          <dodecahedronGeometry args={[1.2]} />
          <meshStandardMaterial color="#666" roughness={0.9} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" position={[12, -0.9, 6]}>
        <mesh receiveShadow castShadow>
          <dodecahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#555" roughness={0.85} />
        </mesh>
      </RigidBody>

      {/* Glowing Pillars */}
      <RigidBody type="fixed" position={[0, 0.5, -12]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.5, 0.5, 3, 16]} />
          <meshStandardMaterial color="#222" emissive="#ff00ff" emissiveIntensity={1} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" position={[3, 0.5, -12]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.5, 0.5, 3, 16]} />
          <meshStandardMaterial color="#222" emissive="#00ff00" emissiveIntensity={1} />
        </mesh>
      </RigidBody>
    </>
  )
}
