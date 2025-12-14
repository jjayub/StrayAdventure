import { useState } from 'react'
import { useGame } from './stores/useGame'
import { playHoverSound, playClickSound } from './hooks/useUISound'
import { HealthStaminaBar } from './components/HealthStaminaBar'

/**
 * GameHUD Component - Stray Style
 * แสดง UI ขณะเล่นเกม ประกอบด้วย:
 * - สถานะการเชื่อมต่อ Server (มุมซ้ายบน)
 * - ปุ่ม Settings และ Exit (มุมขวาบน)
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
      {/* Health & Stamina Bars */}
      <HealthStaminaBar />

      {/* Top Bar - Stray Style */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '15px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
      }}>
        {/* Connection Status - Minimal */}
        <div style={{
          color: isConnected ? 'rgba(100,255,100,0.8)' : 'rgba(100,200,255,0.8)',
          fontFamily: "'Segoe UI', sans-serif",
          fontSize: '12px',
          letterSpacing: '1px',
          pointerEvents: 'auto',
        }}>
          {isConnected ? `● ONLINE (${latency}ms)` : '● SINGLE PLAYER'}
        </div>

        {/* Right Side Buttons - Stray Style */}
        <div style={{ display: 'flex', gap: '15px', pointerEvents: 'auto' }}>
          {/* Settings Button */}
          <button
            onClick={() => {
              playClickSound()
              toggleSettings()
            }}
            style={{
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 500,
              color: showSettings ? '#000' : 'rgba(255,255,255,0.8)',
              background: showSettings ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              backdropFilter: 'blur(5px)',
            }}
            onMouseEnter={(e) => {
              playHoverSound()
              if (!showSettings) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!showSettings) {
                e.currentTarget.style.background = 'rgba(0,0,0,0.4)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }
            }}
          >
            Settings
          </button>

          {/* Exit Button */}
          <button
            onClick={() => {
              playClickSound()
              handleExit()
            }}
            style={{
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              backdropFilter: 'blur(5px)',
            }}
            onMouseEnter={(e) => {
              playHoverSound()
              e.currentTarget.style.background = 'rgba(255,100,100,0.3)'
              e.currentTarget.style.borderColor = 'rgba(255,100,100,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.4)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Settings Panel - Stray Style */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          bottom: '25px',
          left: '25px',
          width: '300px',
          background: 'rgba(15, 20, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '25px',
          zIndex: 1000,
          fontFamily: "'Segoe UI', sans-serif",
        }}>
          {/* Panel Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              Settings
            </h3>
            <button
              onClick={() => {
                playClickSound()
                toggleSettings()
              }}
              onMouseEnter={() => playHoverSound()}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              ✕
            </button>
          </div>

          {/* Move Speed Slider */}
          <SettingsSlider
            label="Move Speed"
            value={characterSettings.moveSpeed}
            min={0.5}
            max={10}
            step={0.5}
            unit="x"
            color="#4ecdc4"
            onChange={(value) => updateCharacterSettings({ moveSpeed: value })}
          />

          {/* Rotation Speed Slider */}
          <SettingsSlider
            label="Rotation Speed"
            value={characterSettings.rotationSpeed}
            min={0.5}
            max={3}
            step={0.1}
            unit="x"
            color="#a855f7"
            onChange={(value) => updateCharacterSettings({ rotationSpeed: value })}
          />

          {/* Jump Force Slider */}
          <SettingsSlider
            label="Jump Force"
            value={characterSettings.jumpForce}
            min={0.5}
            max={3}
            step={0.1}
            unit="x"
            color="#22c55e"
            onChange={(value) => updateCharacterSettings({ jumpForce: value })}
          />

          {/* View Distance Slider */}
          <SettingsSlider
            label="View Distance"
            value={characterSettings.renderDistance}
            min={50}
            max={2000}
            step={50}
            unit="m"
            color="#f59e0b"
            onChange={(value) => updateCharacterSettings({ renderDistance: value })}
          />

          {/* Reset Button */}
          <button
            onClick={() => {
              playClickSound()
              updateCharacterSettings({ moveSpeed: 1, rotationSpeed: 1, jumpForce: 1, renderDistance: 500 })
            }}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginTop: '10px',
            }}
            onMouseEnter={(e) => {
              playHoverSound()
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            }}
          >
            Reset to Default
          </button>
        </div>
      )}

      {/* Exit Confirmation Dialog - Stray Style */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(5px)',
        }}>
          <div style={{
            background: 'rgba(15,20,15,0.98)',
            padding: '50px 60px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            minWidth: '350px',
          }}>
            <h2 style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
              fontWeight: 500,
              marginBottom: '15px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}>
              Exit Game?
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              marginBottom: '35px',
              letterSpacing: '1px',
            }}>
              You will return to the main menu.
            </p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <StrayButton onClick={confirmExit} primary>
                Yes
              </StrayButton>
              <StrayButton onClick={cancelExit}>
                No
              </StrayButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Settings Slider Component - Stray Style
 * Slider สำหรับปรับค่าต่างๆ แบบ minimalist
 */
function SettingsSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  color,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  color: string
  onChange: (value: number) => void
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        <label style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '12px',
          letterSpacing: '1px',
        }}>
          {label}
        </label>
        <span style={{
          color: color,
          fontSize: '12px',
          fontWeight: 500,
        }}>
          {value.toFixed(unit === 'm' ? 0 : 1)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '4px',
          borderRadius: '2px',
          background: `linear-gradient(to right, ${color} ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
          appearance: 'none',
          cursor: 'pointer',
          outline: 'none',
        }}
      />
    </div>
  )
}

/**
 * Stray-Style Button
 * ปุ่มแบบ minimalist พร้อม sound effects
 */
function StrayButton({
  children,
  onClick,
  primary = false,
}: {
  children: React.ReactNode
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      onClick={() => {
        playClickSound()
        onClick()
      }}
      style={{
        padding: '12px 35px',
        fontSize: '13px',
        fontWeight: 500,
        color: primary ? '#000' : 'rgba(255,255,255,0.7)',
        background: primary ? 'rgba(255,255,255,0.9)' : 'transparent',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.2)',
        borderRadius: '2px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        minWidth: '100px',
      }}
      onMouseEnter={(e) => {
        playHoverSound()
        if (!primary) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
        }
      }}
      onMouseLeave={(e) => {
        if (!primary) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
        }
      }}
    >
      {children}
    </button>
  )
}

/**
 * Controller Hint Component
 * แสดง Controller Button + Action
 */
function ControllerHint({ button, action }: { button: string; action: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '11px',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.6)',
      }}>
        {button}
      </div>
      <span style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: '12px',
        letterSpacing: '1px',
      }}>
        {action}
      </span>
    </div>
  )
}
