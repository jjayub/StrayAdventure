import { useState } from 'react'
import { useGame } from './stores/useGame'

/**
 * GameHUD Component
 * แสดง UI ขณะเล่นเกม ประกอบด้วย:
 * - สถานะการเชื่อมต่อ Server
 * - ปุ่ม Exit กลับไปหน้า Menu
 * - Confirmation Dialog ก่อนออก
 */
interface GameHUDProps {
  isConnected: boolean
  latency: number
}

export function GameHUD({ isConnected, latency }: GameHUDProps) {
  const { goToMenu } = useGame()
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const handleExit = () => {
    setShowExitConfirm(true)
  }

  const confirmExit = () => {
    setShowExitConfirm(false)
    goToMenu()
  }

  const cancelExit = () => {
    setShowExitConfirm(false)
  }

  return (
    <>
      {/* Top Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
      }}>
        {/* Connection Status */}
        <div style={{
          color: isConnected ? '#0f0' : '#f00',
          fontFamily: 'monospace',
          fontSize: '14px',
          textShadow: '0 0 5px #000',
          background: 'rgba(0,0,0,0.5)',
          padding: '8px 12px',
          borderRadius: '6px',
          pointerEvents: 'auto',
        }}>
          {isConnected ? `🟢 Connected (${latency}ms)` : '🔴 Disconnected'}
        </div>

        {/* Exit Button */}
        <button
          onClick={handleExit}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fff',
            background: 'rgba(255,0,0,0.3)',
            border: '2px solid rgba(255,100,100,0.5)',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            pointerEvents: 'auto',
            backdropFilter: 'blur(5px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,0,0,0.6)'
            e.currentTarget.style.borderColor = '#ff6666'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,0,0,0.3)'
            e.currentTarget.style.borderColor = 'rgba(255,100,100,0.5)'
          }}
        >
          ✕ EXIT
        </button>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(5px)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            padding: '40px 50px',
            borderRadius: '16px',
            border: '2px solid #ff6666',
            boxShadow: '0 0 40px rgba(255,100,100,0.3)',
            textAlign: 'center',
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '28px',
              marginBottom: '10px',
            }}>
              ⚠️ Exit Game?
            </h2>
            <p style={{
              color: '#aaa',
              fontSize: '16px',
              marginBottom: '30px',
            }}>
              Your progress will be lost and the game will restart.
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={confirmExit}
                style={{
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#fff',
                  background: 'linear-gradient(90deg, #ff4444, #ff6666)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255,100,100,0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Yes, Exit
              </button>

              <button
                onClick={cancelExit}
                style={{
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#fff',
                  background: 'transparent',
                  border: '2px solid #666',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#666'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
