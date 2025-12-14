import { useState } from 'react'
import { useGame } from './stores/useGame'

/**
 * GameHUD Component
 * แสดง UI ขณะเล่นเกม ประกอบด้วย:
 * - สถานะการเชื่อมต่อ Server
 * - ปุ่ม Exit กลับไปหน้า Menu
 * - ปุ่ม Settings เปิด/ปิด Settings Panel
 * - Settings Panel สำหรับปรับค่าตัวละคร
 * - Confirmation Dialog ก่อนออก
 */
interface GameHUDProps {
  isConnected: boolean
  latency: number
}

export function GameHUD({ isConnected, latency }: GameHUDProps) {
  const { goToMenu, showSettings, toggleSettings, characterSettings, updateCharacterSettings } = useGame()
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

        {/* Right Side Buttons */}
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          {/* Settings Button */}
          <button
            onClick={toggleSettings}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#fff',
              background: showSettings ? 'rgba(0,200,255,0.6)' : 'rgba(0,200,255,0.3)',
              border: '2px solid rgba(0,200,255,0.5)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(5px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,200,255,0.6)'
              e.currentTarget.style.borderColor = '#00c8ff'
            }}
            onMouseLeave={(e) => {
              if (!showSettings) {
                e.currentTarget.style.background = 'rgba(0,200,255,0.3)'
              }
              e.currentTarget.style.borderColor = 'rgba(0,200,255,0.5)'
            }}
          >
            ⚙️ Settings
          </button>

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
      </div>

      {/* Settings Panel - แสดงที่มุมซ้ายล่าง */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '280px',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '2px solid rgba(0, 200, 255, 0.4)',
          boxShadow: '0 0 30px rgba(0, 200, 255, 0.2)',
          padding: '20px',
          zIndex: 1000,
          fontFamily: 'Orbitron, sans-serif',
        }}>
          {/* Panel Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(0, 200, 255, 0.3)',
            paddingBottom: '10px',
          }}>
            <h3 style={{
              margin: 0,
              color: '#00c8ff',
              fontSize: '16px',
              textShadow: '0 0 10px rgba(0, 200, 255, 0.5)',
            }}>
              ⚙️ Character Settings
            </h3>
            <button
              onClick={toggleSettings}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0 5px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Move Speed Slider */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>
                🏃 Move Speed
              </label>
              <span style={{
                color: '#00c8ff',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                {characterSettings.moveSpeed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={characterSettings.moveSpeed}
              onChange={(e) => updateCharacterSettings({ moveSpeed: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, #00c8ff ${((characterSettings.moveSpeed - 0.5) / 9.5) * 100}%, #333 ${((characterSettings.moveSpeed - 0.5) / 9.5) * 100}%)`,
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#666',
              marginTop: '4px',
            }}>
              <span>0.5x</span>
              <span>10x</span>
            </div>
          </div>

          {/* Rotation Speed Slider */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>
                🔄 Rotation Speed
              </label>
              <span style={{
                color: '#ff00ff',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                {characterSettings.rotationSpeed.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={characterSettings.rotationSpeed}
              onChange={(e) => updateCharacterSettings({ rotationSpeed: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, #ff00ff ${((characterSettings.rotationSpeed - 0.5) / 2.5) * 100}%, #333 ${((characterSettings.rotationSpeed - 0.5) / 2.5) * 100}%)`,
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#666',
              marginTop: '4px',
            }}>
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Jump Force Slider */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>
                🦘 Jump Force
              </label>
              <span style={{
                color: '#00ff88',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                {characterSettings.jumpForce.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={characterSettings.jumpForce}
              onChange={(e) => updateCharacterSettings({ jumpForce: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, #00ff88 ${((characterSettings.jumpForce - 0.5) / 2.5) * 100}%, #333 ${((characterSettings.jumpForce - 0.5) / 2.5) * 100}%)`,
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#666',
              marginTop: '4px',
            }}>
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Render Distance Slider */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>
                👁️ View Distance
              </label>
              <span style={{
                color: '#ffaa00',
                fontSize: '13px',
                fontWeight: 'bold',
              }}>
                {characterSettings.renderDistance}m
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={characterSettings.renderDistance}
              onChange={(e) => updateCharacterSettings({ renderDistance: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, #ffaa00 ${((characterSettings.renderDistance - 50) / 1950) * 100}%, #333 ${((characterSettings.renderDistance - 50) / 1950) * 100}%)`,
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#666',
              marginTop: '4px',
            }}>
              <span>Near</span>
              <span>Far</span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => updateCharacterSettings({ moveSpeed: 1, rotationSpeed: 1, jumpForce: 1, renderDistance: 500 })}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#fff',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            🔄 Reset to Default
          </button>
        </div>
      )}

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
