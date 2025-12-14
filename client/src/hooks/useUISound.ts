/**
 * useUISound Hook
 * จัดการเสียง UI effects สำหรับเกม
 * ใช้ Web Audio API สร้างเสียงแบบ synthesized หรือเล่นไฟล์เสียง
 */

// Audio context singleton เพื่อ reuse across components
let audioContext: AudioContext | null = null

/**
 * สร้างหรือดึง AudioContext singleton
 * @returns AudioContext instance
 */
const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/**
 * เล่นเสียง hover แบบ synthesized
 * เสียง soft blip ที่เหมาะกับ menu UI
 * @param volume - ระดับเสียง (0.0 - 1.0), default 0.15
 */
export const playHoverSound = (volume: number = 0.15): void => {
  try {
    const ctx = getAudioContext()

    // Resume context ถ้าถูก suspended (browser policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const currentTime = ctx.currentTime

    // สร้าง oscillator สำหรับ tone หลัก
    const oscillator = ctx.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, currentTime) // เริ่มที่ 800Hz
    oscillator.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.05) // ขึ้นไป 1200Hz

    // สร้าง gain node สำหรับควบคุม volume และ envelope
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01) // Attack เร็ว
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08) // Decay

    // เชื่อมต่อ nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // เล่นและหยุด
    oscillator.start(currentTime)
    oscillator.stop(currentTime + 0.1)
  } catch (error) {
    // Silent fail - บาง browser อาจ block audio
    console.warn('Could not play hover sound:', error)
  }
}

/**
 * เล่นเสียง click/select แบบ synthesized
 * เสียงที่หนักกว่า hover สำหรับ confirm action
 * @param volume - ระดับเสียง (0.0 - 1.0), default 0.2
 */
export const playClickSound = (volume: number = 0.2): void => {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const currentTime = ctx.currentTime

    // Oscillator 1 - Low tone
    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(400, currentTime)
    osc1.frequency.exponentialRampToValueAtTime(200, currentTime + 0.1)

    // Oscillator 2 - High tone สำหรับ brightness
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(800, currentTime)
    osc2.frequency.exponentialRampToValueAtTime(600, currentTime + 0.08)

    // Gain nodes
    const gain1 = ctx.createGain()
    gain1.gain.setValueAtTime(volume, currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15)

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(volume * 0.5, currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1)

    // เชื่อมต่อ
    osc1.connect(gain1)
    osc2.connect(gain2)
    gain1.connect(ctx.destination)
    gain2.connect(ctx.destination)

    // เล่น
    osc1.start(currentTime)
    osc2.start(currentTime)
    osc1.stop(currentTime + 0.2)
    osc2.stop(currentTime + 0.15)
  } catch (error) {
    console.warn('Could not play click sound:', error)
  }
}

/**
 * เล่นไฟล์เสียงจาก URL
 * ใช้สำหรับ custom sound files
 * @param url - path ไปยังไฟล์เสียง
 * @param volume - ระดับเสียง (0.0 - 1.0), default 0.3
 */
export const playSound = async (url: string, volume: number = 0.3): Promise<void> => {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer

    const gainNode = ctx.createGain()
    gainNode.gain.value = volume

    source.connect(gainNode)
    gainNode.connect(ctx.destination)

    source.start(0)
  } catch (error) {
    console.warn('Could not play sound:', url, error)
  }
}

/**
 * Custom hook สำหรับ UI sounds
 * @returns Object containing sound functions
 */
export const useUISound = () => {
  return {
    playHoverSound,
    playClickSound,
    playSound,
  }
}

export default useUISound
