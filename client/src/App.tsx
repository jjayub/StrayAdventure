import { Canvas } from '@react-three/fiber'
import { Experience } from './Experience'
import { Suspense, useEffect, useState } from 'react'
import { KeyboardControls } from '@react-three/drei'
import { useSocket } from './stores/useSocket'
import { useGame } from './stores/useGame'
import { MainMenu } from './MainMenu'
import { NicknameInput } from './NicknameInput'
import { MapSelection } from './MapSelection'
import { GameHUD } from './GameHUD'

/**
 * Loading Overlay Component - แสดงขณะโหลดเกม
 */
function LoadingOverlay() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      {/* Animated Logo/Spinner */}
      <div style={{
        width: 100,
        height: 100,
        border: '5px solid rgba(0, 255, 255, 0.2)',
        borderTop: '5px solid #00ffff',
        borderRight: '5px solid #ff0080',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(255, 0, 128, 0.3)',
      }} />

      {/* Loading Text */}
      <div style={{
        marginTop: 30,
        fontFamily: 'Orbitron, sans-serif',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00ffff',
        textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
        letterSpacing: 5,
      }}>
        LOADING
      </div>

      {/* Subtext */}
      <div style={{
        marginTop: 10,
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: 16,
        color: '#ff0080',
        textShadow: '0 0 10px #ff0080',
        letterSpacing: 3,
      }}>
        กำลังเตรียมโลก 3D...
      </div>

      {/* Animated dots */}
      <div style={{
        marginTop: 20,
        display: 'flex',
        gap: 8,
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              backgroundColor: '#00ffff',
              borderRadius: '50%',
              animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              boxShadow: '0 0 10px #00ffff',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/**
 * Main Application Component
 * จุดเริ่มต้นของเกม ประกอบด้วย:
 * - MainMenu: หน้าเมนูหลัก
 * - MapSelection: หน้าเลือก Map
 * - GameHUD: แสดง UI ขณะเล่นเกม (Exit button, Status)
 * - KeyboardControls: จัดการ Input จากคีย์บอร์ด
 * - Canvas: พื้นที่แสดงผล 3D (Three.js/R3F)
 * - Socket Connection: เชื่อมต่อกับ Game Server
 */
export default function App() {
  const { connect, disconnect, isConnected, latency } = useSocket()
  const { gameState, selectedMap } = useGame()

  // ใช้ key เพื่อ reset Experience component เมื่อเริ่มเกมใหม่
  const [gameKey, setGameKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // เชื่อมต่อ Server เมื่อ Component mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  // Reset game key และแสดง loading เมื่อเริ่มเล่นใหม่
  useEffect(() => {
    if (gameState === 'playing') {
      setIsLoading(true)
      setGameKey(prev => prev + 1)

      // Hide loading after a short delay (map will load via Suspense)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [gameState, selectedMap])

  return (
    <>
      {/* Loading Overlay - แสดงขณะโหลด Map */}
      {isLoading && <LoadingOverlay />}

      {/* Main Menu */}
      {gameState === 'menu' && <MainMenu />}

      {/* Nickname Input */}
      {gameState === 'nicknameInput' && <NicknameInput />}

      {/* Map Selection */}
      {gameState === 'mapSelection' && <MapSelection />}

      {/* In-Game HUD */}
      {gameState === 'playing' && !isLoading && (
        <GameHUD isConnected={isConnected} latency={latency} />
      )}

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
            {/* key ทำให้ Experience reset เมื่อเริ่มเกมใหม่ */}
            <Experience key={gameKey} />
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </>
  )
}
