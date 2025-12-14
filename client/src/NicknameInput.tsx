import { useState, useCallback } from 'react'
import { useGame } from './stores/useGame'
import { playHoverSound, playClickSound, playKeyPressSound } from './hooks/useUISound'

/**
 * NicknameInput Component
 * หน้าสำหรับใส่ชื่อผู้เล่นก่อนเข้าเกม
 * ใช้ UI/UX แบบ Stray - Minimalist Dark Theme
 */
export function NicknameInput() {
  const { setNickname, goToMapSelection, goToMenu } = useGame()
  const [inputValue, setInputValue] = useState('')
  const [hoveredButton, setHoveredButton] = useState<string | null>('continue')
  const [error, setError] = useState('')

  /**
   * Handle button hover พร้อมเล่นเสียง
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
   * Handle continue - ตรวจสอบและบันทึกชื่อ
   */
  const handleContinue = useCallback(() => {
    const trimmedName = inputValue.trim()

    // Validation
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }
    if (trimmedName.length > 16) {
      setError('Name must be 16 characters or less')
      return
    }
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmedName)) {
      setError('Only letters, numbers, spaces, - and _ allowed')
      return
    }

    playClickSound()
    setNickname(trimmedName)
    goToMapSelection()
  }, [inputValue, setNickname, goToMapSelection])

  /**
   * Handle back to menu
   */
  const handleBack = useCallback(() => {
    playClickSound()
    goToMenu()
  }, [goToMenu])

  /**
   * Handle key press - Enter เพื่อ continue
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue()
    }
  }, [handleContinue])

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

      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)',
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
        {/* Title */}
        <h1 style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '8px',
          textTransform: 'uppercase',
          marginBottom: '50px',
        }}>
          Enter Your Name
        </h1>

        {/* Input Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '40px',
        }}>
          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => {
              // เล่นเสียง mechanical keyboard เมื่อกดปุ่ม (ไม่รวม modifier keys)
              if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                playKeyPressSound()
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder="Nickname"
            maxLength={16}
            autoFocus
            style={{
              width: '300px',
              padding: '15px 20px',
              fontSize: '18px',
              fontWeight: 400,
              fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
              color: 'rgba(255,255,255,0.9)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '2px',
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '2px',
              transition: 'all 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          />

          {/* Error Message */}
          {error && (
            <p style={{
              color: 'rgba(255,100,100,0.9)',
              fontSize: '13px',
              letterSpacing: '1px',
              margin: 0,
            }}>
              {error}
            </p>
          )}

          {/* Character Count */}
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px',
            letterSpacing: '1px',
            margin: 0,
          }}>
            {inputValue.length} / 16
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <NicknameButton
            label="CONTINUE"
            isHovered={hoveredButton === 'continue'}
            onHover={() => handleHover('continue')}
            onClick={handleContinue}
            disabled={inputValue.trim().length < 2}
          />
          <NicknameButton
            label="BACK"
            isHovered={hoveredButton === 'back'}
            onHover={() => handleHover('back')}
            onClick={handleBack}
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
    </div>
  )
}

/**
 * Stray-Style Nickname Button
 * ปุ่มแบบ minimalist เหมือน MainMenu
 */
function NicknameButton({
  label,
  isHovered,
  onHover,
  onClick,
  disabled = false,
}: {
  label: string
  isHovered: boolean
  onHover: () => void
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => {
        if (!disabled) {
          playClickSound()
          onClick()
        }
      }}
      onMouseEnter={onHover}
      onFocus={onHover}
      disabled={disabled}
      style={{
        padding: '12px 40px',
        fontSize: '16px',
        fontWeight: 500,
        color: disabled
          ? 'rgba(255,255,255,0.3)'
          : isHovered
            ? '#000'
            : 'rgba(255,255,255,0.7)',
        background: disabled
          ? 'transparent'
          : isHovered
            ? 'rgba(255,255,255,0.95)'
            : 'transparent',
        border: 'none',
        borderRadius: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '4px',
        textTransform: 'uppercase',
        transition: 'all 0.15s ease',
        minWidth: '220px',
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )
}
