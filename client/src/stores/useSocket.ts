import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

/**
 * Interface สำหรับ State ของ Socket Connection
 * ใช้จัดการสถานะการเชื่อมต่อและการส่งข้อมูลระหว่าง Client-Server
 */
interface SocketState {
  socket: Socket | null
  isConnected: boolean
  latency: number
  connect: () => void
  disconnect: () => void
  sendPosition: (x: number, y: number, z: number) => void
}

/**
 * Zustand Store สำหรับจัดการ WebSocket Connection
 * - ใช้ Socket.io เพื่อสื่อสารกับ Game Server
 * - รองรับการ Sync ตำแหน่งผู้เล่นแบบ Real-time
 */
export const useSocket = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  latency: 0,

  /**
   * เชื่อมต่อไปยัง Game Server
   * URL สามารถเปลี่ยนได้ผ่าน Environment Variable
   * ถ้าไม่มี server จะทำงานแบบ offline (Single Player Mode)
   */
  connect: () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

    // ถ้าไม่มี server URL หรือเป็น offline mode ให้ข้ามการเชื่อมต่อ
    if (import.meta.env.VITE_OFFLINE_MODE === 'true') {
      console.log('🎮 Running in offline/single-player mode')
      set({ isConnected: false, latency: 0 })
      return
    }

    try {
      const socket = io(serverUrl, {
        // ตั้งค่า timeout และ retry ให้เหมาะสม
        timeout: 5000,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      })

      socket.on('connect', () => {
        console.log('✅ Connected to server:', socket.id)
        set({ isConnected: true })
      })

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from server')
        set({ isConnected: false })
      })

      // ถ้าเชื่อมต่อไม่ได้ ให้ทำงานแบบ offline
      socket.on('connect_error', () => {
        console.log('🎮 Server not available - running in offline/single-player mode')
        set({ isConnected: false, latency: 0 })
      })

      // รับค่า Latency กลับมาจาก Server
      socket.on('pong', (serverTime: number) => {
        const latency = Date.now() - serverTime
        set({ latency })
      })

      // ตัวอย่าง: รับตำแหน่งผู้เล่นคนอื่น (สำหรับ Multiplayer)
      socket.on('player:update', (data: { id: string; x: number; y: number; z: number }) => {
        console.log('Other player moved:', data)
        // TODO: Update other player's position in the scene
      })

      set({ socket })
    } catch {
      // ถ้ามี error ให้ทำงานแบบ offline
      console.log('🎮 Could not connect to server - running in offline mode')
      set({ isConnected: false, latency: 0 })
    }
  },

  /**
   * ตัดการเชื่อมต่อจาก Server
   */
  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false })
    }
  },

  /**
   * ส่งตำแหน่งผู้เล่นไปยัง Server
   * ใช้สำหรับ Sync ตำแหน่งแบบ Real-time
   * @param x - ตำแหน่งแกน X
   * @param y - ตำแหน่งแกน Y
   * @param z - ตำแหน่งแกน Z
   */
  sendPosition: (x: number, y: number, z: number) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('player:position', { x, y, z })
    }
  },
}))
