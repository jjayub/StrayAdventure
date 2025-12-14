import { useState, useCallback } from 'react'
import { useGame } from './stores/useGame'
import { playHoverSound, playClickSound } from './hooks/useUISound'

/**
 * Main Menu Component
 * แสดงหน้าเมนูหลักก่อนเริ่มเกม
 * สไตล์ Stray - Minimalist Dark Theme with Spotlight
 */
export function MainMenu() {
  const { goToMapSelection, toggleControls, showControls } = useGame()
  const [hoveredButton, setHoveredButton] = useState<string | null>('start')

  /**
   * Handle button hover พร้อมเล่นเสียง
   * เล่นเสียงเฉพาะเมื่อเปลี่ยนปุ่มที่ hover
   */
  const handleHover = useCallback((buttonId: string) => {
    setHoveredButton((prev) => {
      if (prev !== buttonId) {
        playHoverSound()
      }
      return buttonId
    })
  }, [])

  /**
   * Handle button click พร้อมเล่นเสียง
   */
  const handleClick = useCallback((action: () => void) => {
    playClickSound()
    action()
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 2000,
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      background: '#000',
      overflow: 'hidden',
    }}>
      {/* Background Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("/menu-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(1.1) saturate(1.1)',
      }} />

      {/* Light Overlay for text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Game Logo - Proportional to screen width, aspect ratio preserved */}
        <img
          src="/logo.png"
          alt="Stray"
          style={{
            width: '45vw',
            height: 'auto',
            maxWidth: '800px',
            minWidth: '280px',
            marginBottom: '50px',
            filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.4))',
            objectFit: 'contain',
          }}
        />

        {/* Menu Buttons - Stray Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <StrayMenuButton
            label="START GAME"
            isHovered={hoveredButton === 'start'}
            onHover={() => handleHover('start')}
            onClick={() => handleClick(goToMapSelection)}
          />
          <StrayMenuButton
            label="SETTINGS"
            isHovered={hoveredButton === 'settings'}
            onHover={() => handleHover('settings')}
            onClick={() => handleClick(toggleControls)}
          />
          <StrayMenuButton
            label="CREDITS"
            isHovered={hoveredButton === 'credits'}
            onHover={() => handleHover('credits')}
            onClick={() => handleClick(() => { })}
          />
          <StrayMenuButton
            label="QUIT"
            isHovered={hoveredButton === 'quit'}
            onHover={() => handleHover('quit')}
            onClick={() => handleClick(() => {
              window.location.href = 'https://hr.dkcmain.org:9000/'
            })}
          />
        </div>

        {/* Version Info - Bottom Left */}
        <p style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '11px',
          letterSpacing: '1px',
        }}>
          v1.0.0 (Fan Project)
        </p>

      </div>

      {/* Controls/Settings Modal */}
      {showControls && (
        <SettingsModal onClose={toggleControls} />
      )}
    </div>
  )
}

/**
 * Stray-Style Menu Button
 * ปุ่มเมนูแบบ minimalist เหมือน Stray
 */
function StrayMenuButton({
  label,
  isHovered,
  onHover,
  onClick,
}: {
  label: string
  isHovered: boolean
  onHover: () => void
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      style={{
        padding: '12px 40px',
        fontSize: '16px',
        fontWeight: 500,
        color: isHovered ? '#000' : 'rgba(255,255,255,0.7)',
        background: isHovered ? 'rgba(255,255,255,0.95)' : 'transparent',
        border: 'none',
        borderRadius: '2px',
        cursor: 'pointer',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        transition: 'all 0.15s ease',
        minWidth: '220px',
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      }}
    >
      {label}
    </button>
  )
}

/**
 * Settings Modal Component - Stray Style
 * แสดง Settings/Controls แบบ minimalist
 */
function SettingsModal({ onClose }: { onClose: () => void }) {
  /**
   * Handle close พร้อมเล่นเสียง click
   */
  const handleClose = () => {
    playClickSound()
    onClose()
  }

  const controls = [
    { key: 'W', action: 'Move Forward' },
    { key: 'S', action: 'Move Backward / U-Turn' },
    { key: 'A', action: 'Turn Left' },
    { key: 'D', action: 'Turn Right' },
    { key: 'SPACE', action: 'Jump' },
    { key: 'Mouse Drag', action: 'Rotate Camera' },
    { key: 'Scroll', action: 'Zoom In/Out' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 3000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={handleClose}
    >
      {/* Modal Content */}
      <div
        style={{
          background: 'rgba(20,25,20,0.95)',
          padding: '50px 80px',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
          minWidth: '400px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '20px',
          fontWeight: 500,
          marginBottom: '40px',
          textAlign: 'center',
          letterSpacing: '8px',
          textTransform: 'uppercase',
        }}>
          Controls
        </h2>

        {/* Control List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {controls.map((control, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '15px',
              }}
            >
              <span style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                letterSpacing: '1px',
              }}>
                {control.action}
              </span>
              <span style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'monospace',
                background: 'rgba(255,255,255,0.1)',
                padding: '6px 14px',
                borderRadius: '3px',
                letterSpacing: '1px',
              }}>
                {control.key}
              </span>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            marginTop: '40px',
            width: '100%',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.7)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '3px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            playHoverSound()
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
        >
          Back
        </button>
      </div>
    </div>
  )
}
