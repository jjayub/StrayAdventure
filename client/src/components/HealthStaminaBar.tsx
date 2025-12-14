/**
 * HealthStaminaBar Component
 * แสดง Health Bar และ Stamina Bar แบบ minimalist
 * - Health Bar: สีแดง
 * - Stamina Bar: สีฟ้า (ปกติ) / สีเหลืองสว่าง (กำลัง recover)
 * 
 * สไตล์: Dark theme, subtle glow, match กับ Stray menu style
 */
import { useGame } from '../stores/useGame'

export function HealthStaminaBar() {
  const health = useGame((state) => state.health)
  const stamina = useGame((state) => state.stamina)
  const isSprinting = useGame((state) => state.isSprinting)
  const isStaminaDepleted = useGame((state) => state.isStaminaDepleted)

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      {/* Health Bar */}
      <StatBar
        value={health}
        maxValue={100}
        color="#dc2626"
        glowColor="rgba(220, 38, 38, 0.5)"
        label="HP"
        icon="❤"
      />

      {/* Stamina Bar */}
      <StatBar
        value={stamina}
        maxValue={100}
        color={isStaminaDepleted ? '#facc15' : '#3b82f6'}
        glowColor={isStaminaDepleted ? 'rgba(250, 204, 21, 0.6)' : 'rgba(59, 130, 246, 0.5)'}
        label="SP"
        icon="⚡"
        isPulsing={isStaminaDepleted}
        isActive={isSprinting}
      />
    </div>
  )
}

/**
 * StatBar Component
 * Bar แสดงค่า stat แบบ minimalist
 */
interface StatBarProps {
  value: number
  maxValue: number
  color: string
  glowColor: string
  label: string
  icon: string
  isPulsing?: boolean
  isActive?: boolean
}

function StatBar({ value, maxValue, color, glowColor, label, icon, isPulsing, isActive }: StatBarProps) {
  const percentage = (value / maxValue) * 100

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      {/* Icon */}
      <div style={{
        fontSize: '14px',
        opacity: 0.8,
        width: '20px',
        textAlign: 'center',
        filter: isPulsing ? `drop-shadow(0 0 6px ${glowColor})` : 'none',
        animation: isPulsing ? 'pulse 1s ease-in-out infinite' : 'none',
      }}>
        {icon}
      </div>

      {/* Bar Container */}
      <div style={{
        width: '200px',
        height: '8px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '4px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        backdropFilter: 'blur(5px)',
        boxShadow: isActive ? `0 0 15px ${glowColor}` : '0 2px 10px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Fill */}
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: '3px',
          transition: 'width 0.15s ease-out, background 0.3s ease',
          boxShadow: `0 0 10px ${glowColor}`,
          animation: isPulsing ? 'staminaPulse 0.8s ease-in-out infinite' : 'none',
        }} />
      </div>

      {/* Label */}
      <div style={{
        fontSize: '11px',
        fontFamily: "'Segoe UI', sans-serif",
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: '1px',
        minWidth: '25px',
      }}>
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontSize: '11px',
        fontFamily: "'Segoe UI', sans-serif",
        fontWeight: 600,
        color: color,
        minWidth: '35px',
        textAlign: 'right',
        textShadow: `0 0 8px ${glowColor}`,
      }}>
        {Math.round(value)}%
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes staminaPulse {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  )
}

export default HealthStaminaBar
