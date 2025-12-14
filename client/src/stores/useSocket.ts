import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

/**
 * Interface สำหรับข้อมูลผู้เล่นคนอื่น
 */
interface OtherPlayerData {
  id: string
  nickname: string
  x: number
  y: number
  z: number
  rotation: number
}

/**
 * Interface สำหรับ State ของ Socket Connection
 * ใช้จัดการสถานะการเชื่อมต่อและการส่งข้อมูลระหว่าง Client-Server
 */
interface SocketState {
  socket: Socket | null
  isConnected: boolean
  latency: number
  otherPlayers: Map<string, OtherPlayerData>
  playerListVersion: number // ใช้ track เมื่อ player เข้า/ออก เท่านั้น
  connect: () => void
  disconnect: () => void
  sendPosition: (x: number, y: number, z: number, rotation: number) => void
  setNickname: (nickname: string) => void
  getOtherPlayersArray: () => OtherPlayerData[]
}

/**
 * เก็บตำแหน่งผู้เล่นแบบ mutable (ไม่ trigger re-render)
 * ใช้สำหรับ position updates ที่เกิดบ่อยมาก
 */
const playerPositions = new Map<string, OtherPlayerData>()

/**
 * ดึงตำแหน่งผู้เล่นจาก mutable store
 */
export const getPlayerPosition = (id: string): OtherPlayerData | undefined => {
  return playerPositions.get(id)
}

/**
 * ดึงผู้เล่นทั้งหมดจาก mutable store
 */
export const getAllPlayerPositions = (): OtherPlayerData[] => {
  return Array.from(playerPositions.values())
}

/**
 * Zustand Store สำหรับจัดการ WebSocket Connection
 * - ใช้ Socket.io เพื่อสื่อสารกับ Game Server
 * - รองรับการ Sync ตำแหน่งผู้เล่นแบบ Real-time
 * - จัดการข้อมูลผู้เล่นคนอื่นสำหรับ Multiplayer
 * - ใช้ mutable store สำหรับ position updates เพื่อลด re-renders
 */
export const useSocket = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  latency: 0,
  otherPlayers: new Map(),
  playerListVersion: 0,

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
        playerPositions.clear()
        set({ isConnected: false, otherPlayers: new Map(), playerListVersion: 0 })
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

      // รับรายชื่อผู้เล่นทั้งหมดเมื่อเชื่อมต่อ
      socket.on('players:list', (players: Array<{ id: string; nickname: string; x: number; y: number; z: number; rotation: number }>) => {
        const newPlayers = new Map<string, OtherPlayerData>()
        players.forEach(player => {
          if (player.id !== socket.id) {
            const playerData = {
              id: player.id,
              nickname: player.nickname || 'Unknown',
              x: player.x,
              y: player.y,
              z: player.z,
              rotation: player.rotation || 0,
            }
            newPlayers.set(player.id, playerData)
            playerPositions.set(player.id, playerData)
          }
        })
        set((state) => ({
          otherPlayers: newPlayers,
          playerListVersion: state.playerListVersion + 1
        }))
        console.log('📋 Players list received:', newPlayers.size, 'other players')
      })

      // ผู้เล่นใหม่เข้ามา
      socket.on('player:joined', (data: { id: string; nickname: string }) => {
        if (data.id !== socket.id) {
          const playerData = {
            id: data.id,
            nickname: data.nickname || 'Unknown',
            x: 0,
            y: 1,
            z: 0,
            rotation: 0,
          }
          playerPositions.set(data.id, playerData)

          const { otherPlayers } = get()
          const newPlayers = new Map(otherPlayers)
          newPlayers.set(data.id, playerData)
          set((state) => ({
            otherPlayers: newPlayers,
            playerListVersion: state.playerListVersion + 1
          }))
          console.log('👤 Player joined:', data.nickname)
        }
      })

      // ผู้เล่นออก
      socket.on('player:left', (data: { id: string }) => {
        const leftPlayer = playerPositions.get(data.id)
        playerPositions.delete(data.id)

        const { otherPlayers } = get()
        const newPlayers = new Map(otherPlayers)
        newPlayers.delete(data.id)
        set((state) => ({
          otherPlayers: newPlayers,
          playerListVersion: state.playerListVersion + 1
        }))
        console.log('👋 Player left:', leftPlayer?.nickname || data.id)
      })

      // อัปเดตตำแหน่งผู้เล่นคนอื่น - ใช้ mutable store ไม่ trigger re-render
      socket.on('player:update', (data: { id: string; x: number; y: number; z: number; rotation: number; nickname?: string }) => {
        if (data.id !== socket.id) {
          const existingPlayer = playerPositions.get(data.id)
          const playerData = {
            id: data.id,
            nickname: data.nickname || existingPlayer?.nickname || 'Unknown',
            x: data.x,
            y: data.y,
            z: data.z,
            rotation: data.rotation || 0,
          }
          // อัปเดต mutable store เท่านั้น - ไม่ trigger re-render
          playerPositions.set(data.id, playerData)
        }
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
      playerPositions.clear()
      set({ socket: null, isConnected: false, otherPlayers: new Map(), playerListVersion: 0 })
    }
  },

  /**
   * ส่งตำแหน่งผู้เล่นไปยัง Server
   * ใช้สำหรับ Sync ตำแหน่งแบบ Real-time
   * @param x - ตำแหน่งแกน X
   * @param y - ตำแหน่งแกน Y
   * @param z - ตำแหน่งแกน Z
   * @param rotation - มุมหมุนของตัวละคร (radians)
   */
  sendPosition: (x: number, y: number, z: number, rotation: number) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('player:position', { x, y, z, rotation })
    }
  },

  /**
   * ส่งชื่อผู้เล่นไปยัง Server
   * @param nickname - ชื่อผู้เล่น
   */
  setNickname: (nickname: string) => {
    const { socket } = get()
    if (socket && socket.connected) {
      socket.emit('player:nickname', { nickname })
      console.log('📝 Nickname set:', nickname)
    }
  },

  /**
   * ดึงรายชื่อผู้เล่นคนอื่นเป็น Array
   * @returns Array ของผู้เล่นคนอื่น
   */
  getOtherPlayersArray: () => {
    return Array.from(playerPositions.values())
  },
}))
