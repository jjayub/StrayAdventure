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
 * เล่นเสียง hover สำหรับ Map Card แบบ synthesized
 * เสียง low swoosh/whoosh ที่แตกต่างจาก menu button
 * @param volume - ระดับเสียง (0.0 - 1.0), default 0.12
 */
export const playMapHoverSound = (volume: number = 0.12): void => {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const currentTime = ctx.currentTime

    // Low frequency sweep - เสียง whoosh ต่ำ
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(200, currentTime)
    osc.frequency.exponentialRampToValueAtTime(350, currentTime + 0.08)
    osc.frequency.exponentialRampToValueAtTime(250, currentTime + 0.15)

    // เพิ่ม subtle noise layer
    const osc2 = ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(150, currentTime)
    osc2.frequency.exponentialRampToValueAtTime(200, currentTime + 0.1)

    // Gain envelope - นุ่มนวลกว่า menu hover
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.02)
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, currentTime + 0.08)
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.18)

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0, currentTime)
    gain2.gain.linearRampToValueAtTime(volume * 0.3, currentTime + 0.015)
    gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.12)

    // Low-pass filter เพื่อให้เสียงนุ่มขึ้น
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600

    // Connect
    osc.connect(filter)
    osc2.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Play
    osc.start(currentTime)
    osc2.start(currentTime)
    osc.stop(currentTime + 0.2)
    osc2.stop(currentTime + 0.15)
  } catch (error) {
    console.warn('Could not play map hover sound:', error)
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
 * เล่นเสียงกระโดด แบบ synthesized
 * เสียง "whoosh" ขึ้นสูง
 * @param volume - ระดับเสียง (0.0 - 1.0), default 0.25
 */
export const playJumpSound = (volume: number = 0.25): void => {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const currentTime = ctx.currentTime

    // Oscillator - เสียง whoosh ขึ้นสูง
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, currentTime + 0.1)
    osc.frequency.exponentialRampToValueAtTime(200, currentTime + 0.2)

    // Noise-like effect with second oscillator
    const osc2 = ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(100, currentTime)
    osc2.frequency.exponentialRampToValueAtTime(300, currentTime + 0.15)

    // Gain envelope
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(volume, currentTime)
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.25)

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(volume * 0.3, currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2)

    // Connect
    osc.connect(gainNode)
    osc2.connect(gain2)
    gainNode.connect(ctx.destination)
    gain2.connect(ctx.destination)

    // Play
    osc.start(currentTime)
    osc2.start(currentTime)
    osc.stop(currentTime + 0.3)
    osc2.stop(currentTime + 0.25)
  } catch (error) {
    console.warn('Could not play jump sound:', error)
  }
}

/**
 * เล่นเสียงฝีเท้าวิ่ง/เดิน แบบ synthesized
 * เสียง soft thump สำหรับ footstep
 * @param volume - ระดับเสียง (0.0 - 1.0), default 0.15
 * @param isRunning - กำลังวิ่งหรือไม่ (เสียงจะต่างกัน)
 */
export const playFootstepSound = (volume: number = 0.15, isRunning: boolean = false): void => {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const currentTime = ctx.currentTime

    // สร้างเสียง thump ด้วย noise-like oscillator
    const osc = ctx.createOscillator()
    osc.type = 'triangle'

    // วิ่ง = เสียงสูงกว่าและสั้นกว่า
    const baseFreq = isRunning ? 80 : 60
    const duration = isRunning ? 0.06 : 0.08

    osc.frequency.setValueAtTime(baseFreq, currentTime)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, currentTime + duration)

    // เพิ่ม variation เล็กน้อยให้เสียงไม่ซ้ำเกินไป
    const pitchVariation = 0.9 + Math.random() * 0.2
    osc.frequency.value *= pitchVariation

    // Gain - attack เร็ว, decay เร็ว
    const gainNode = ctx.createGain()
    const adjustedVolume = volume * (isRunning ? 1.2 : 1)
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(adjustedVolume, currentTime + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration + 0.02)

    // Low-pass filter เพื่อให้เสียงนุ่มขึ้น
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = isRunning ? 400 : 300

    // Connect
    osc.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Play
    osc.start(currentTime)
    osc.stop(currentTime + duration + 0.05)
  } catch (error) {
    console.warn('Could not play footstep sound:', error)
  }
}

/**
 * เล่นเสียงลงพื้น (landing) แบบ synthesized
 * เสียง thump หนักกว่า footstep
 * @param volume - ระดับเสียง (0.0 - 1.0), default 0.3
 */
export const playLandingSound = (volume: number = 0.3): void => {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const currentTime = ctx.currentTime

    // Low thump
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(100, currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, currentTime + 0.1)

    // Impact noise
    const osc2 = ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(200, currentTime)
    osc2.frequency.exponentialRampToValueAtTime(50, currentTime + 0.08)

    // Gains
    const gain1 = ctx.createGain()
    gain1.gain.setValueAtTime(volume, currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15)

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(volume * 0.5, currentTime)
    gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1)

    // Filter
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 250

    // Connect
    osc.connect(filter)
    filter.connect(gain1)
    osc2.connect(gain2)
    gain1.connect(ctx.destination)
    gain2.connect(ctx.destination)

    // Play
    osc.start(currentTime)
    osc2.start(currentTime)
    osc.stop(currentTime + 0.2)
    osc2.stop(currentTime + 0.15)
  } catch (error) {
    console.warn('Could not play landing sound:', error)
  }
}

/**
 * Custom hook สำหรับ UI sounds
 * @returns Object containing sound functions
 */
export const useUISound = () => {
  return {
    playHoverSound,
    playMapHoverSound,
    playClickSound,
    playSound,
    playJumpSound,
    playFootstepSound,
    playLandingSound,
  }
}

export default useUISound
