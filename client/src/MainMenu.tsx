import { useGame } from './stores/useGame'

/**
 * Main Menu Component
 * แสดงหน้าเมนูหลักก่อนเริ่มเกม
 * ใช้ภาพแมวเป็น Background (Stray-inspired)
 */
export function MainMenu() {
  const { goToMapSelection, toggleControls, showControls } = useGame()

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 2000,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
        filter: 'brightness(1) saturate(1.3)',
      }} />

      {/* Gradient Overlay for Cyberpunk feel */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(255,0,128,0.15) 0%, rgba(0,0,0,0.5) 50%, rgba(0,255,255,0.15) 100%)',
      }} />

      {/* Scanlines Effect (Retro CRT) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
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
        {/* Game Title - Animated Neon Cyberpunk Style */}
        <h1
          className="neon-title"
          style={{
            fontSize: '100px',
            fontWeight: 900,
            fontFamily: "'Orbitron', sans-serif",
            color: '#fff',
            marginBottom: '50px',
            letterSpacing: '20px',
            position: 'relative',
          }}
        >
          <span className="neon-title-text">ZENKO</span>
        </h1>

        {/* Menu Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <MenuButton onClick={goToMapSelection} primary>
            ▶ START GAME
          </MenuButton>

          <MenuButton onClick={toggleControls}>
            🎮 HOW TO PLAY
          </MenuButton>
        </div>

        {/* Footer */}
        <p style={{
          position: 'absolute',
          bottom: '20px',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '12px',
          letterSpacing: '2px',
        }}>
          Personal Hobby Project • Not affiliated with BlueTwelve Studio
        </p>
      </div>

      {/* Controls Modal */}
      {showControls && (
        <ControlsModal onClose={toggleControls} />
      )}
    </div>
  )
}

/**
 * Menu Button Component
 * ปุ่มสำหรับเมนู พร้อม Hover Effect
 */
function MenuButton({
  children,
  onClick,
  primary = false
}: {
  children: React.ReactNode
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '18px 50px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: primary ? '#000' : '#fff',
        background: primary
          ? 'linear-gradient(90deg, #00ffff, #00ff88)'
          : 'rgba(0,0,0,0.5)',
        border: primary ? 'none' : '2px solid rgba(255,255,255,0.5)',
        borderRadius: '8px',
        cursor: 'pointer',
        letterSpacing: '3px',
        transition: 'all 0.3s ease',
        minWidth: '280px',
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = primary
          ? '0 0 30px #00ffff'
          : '0 0 20px rgba(255,255,255,0.5)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}

/**
 * Controls Modal Component
 * แสดงวิธีเล่นเกม (Controller Instructions)
 * ใช้ Background เดียวกับหน้า Menu
 */
function ControlsModal({ onClose }: { onClose: () => void }) {
  const controls = [
    { key: 'W / ↑', action: 'Move Forward' },
    { key: 'S / ↓', action: 'Move Backward' },
    { key: 'A / ←', action: 'Move Left' },
    { key: 'D / →', action: 'Move Right' },
    { key: 'SPACE', action: 'Jump' },
    { key: 'Mouse', action: 'Rotate Camera' },
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
        zIndex: 3000,
      }}
      onClick={onClose}
    >
      {/* Background Image - Same as Menu */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("/menu-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.9) saturate(1.3) blur(2px)',
      }} />

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(255,0,128,0.2) 0%, rgba(0,0,0,0.6) 50%, rgba(0,255,255,0.2) 100%)',
      }} />

      {/* Scanlines Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: 'rgba(10, 10, 20, 0.85)',
            padding: '40px 60px',
            borderRadius: '16px',
            border: '2px solid #00ffff',
            boxShadow: '0 0 40px rgba(0,255,255,0.3), 0 0 80px rgba(0,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{
            color: '#00ffff',
            fontSize: '32px',
            marginBottom: '30px',
            textAlign: 'center',
            textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
          }}>
            🎮 CONTROLS
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {controls.map((control, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '40px',
                }}
              >
                <span style={{
                  color: '#ff0080',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  background: 'rgba(255,0,128,0.15)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ff0080',
                  minWidth: '100px',
                  textAlign: 'center',
                  boxShadow: '0 0 10px rgba(255,0,128,0.2)',
                }}>
                  {control.key}
                </span>
                <span style={{
                  color: '#fff',
                  fontSize: '16px',
                  textShadow: '0 0 5px rgba(255,255,255,0.3)',
                }}>
                  {control.action}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: '30px',
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              background: 'linear-gradient(90deg, rgba(0,255,255,0.2), rgba(255,0,128,0.2))',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(90deg, rgba(0,255,255,0.4), rgba(255,0,128,0.4))'
              e.currentTarget.style.borderColor = '#00ffff'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,255,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(90deg, rgba(0,255,255,0.2), rgba(255,0,128,0.2))'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}
