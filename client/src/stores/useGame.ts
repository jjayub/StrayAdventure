import { create } from 'zustand'

/**
 * Interface สำหรับข้อมูล Map
 */
export interface MapInfo {
  id: string
  name: string
  description: string
  preview: string
  scene: string
}

/**
 * Interface สำหรับ Character Settings - ค่าปรับแต่งตัวละคร
 */
export interface CharacterSettings {
  /** ความเร็วในการเคลื่อนที่ (1 = ปกติ, 10 = เร็วขึ้น 10 เท่า) */
  moveSpeed: number
  /** ความเร็วในการหมุนตัว */
  rotationSpeed: number
  /** ความแรงในการกระโดด */
  jumpForce: number
  /** ระยะการ Render (View Distance) - ยิ่งมากยิ่งเห็นไกล */
  renderDistance: number
}

/**
 * Interface สำหรับ State ของเกม
 */
interface GameState {
  gameState: 'menu' | 'nicknameInput' | 'mapSelection' | 'playing' | 'paused'
  selectedMap: MapInfo | null
  availableMaps: MapInfo[]
  showControls: boolean
  /** แสดง/ซ่อน Settings Panel */
  showSettings: boolean
  /** ค่าปรับแต่งตัวละคร */
  characterSettings: CharacterSettings
  /** ชื่อผู้เล่น */
  nickname: string

  goToNicknameInput: () => void
  goToMapSelection: () => void
  selectMap: (map: MapInfo) => void
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  goToMenu: () => void
  toggleControls: () => void
  setAvailableMaps: (maps: MapInfo[]) => void
  /** เปิด/ปิด Settings Panel */
  toggleSettings: () => void
  /** อัพเดทค่า Character Settings */
  updateCharacterSettings: (settings: Partial<CharacterSettings>) => void
  /** ตั้งชื่อผู้เล่น */
  setNickname: (nickname: string) => void
}

/** ค่าเริ่มต้นของ Character Settings */
const defaultCharacterSettings: CharacterSettings = {
  moveSpeed: 1,
  rotationSpeed: 1,
  jumpForce: 1,
  renderDistance: 500,
}

export const useGame = create<GameState>((set) => ({
  gameState: 'menu',
  selectedMap: null,
  availableMaps: [],
  showControls: false,
  showSettings: false,
  characterSettings: { ...defaultCharacterSettings },
  nickname: '',

  goToNicknameInput: () => set({ gameState: 'nicknameInput' }),
  goToMapSelection: () => set({ gameState: 'mapSelection' }),
  selectMap: (map) => set({ selectedMap: map }),
  startGame: () => set({ gameState: 'playing' }),
  pauseGame: () => set({ gameState: 'paused' }),
  resumeGame: () => set({ gameState: 'playing' }),
  goToMenu: () => set({ gameState: 'menu', selectedMap: null }),
  toggleControls: () => set((state) => ({ showControls: !state.showControls })),
  setAvailableMaps: (maps) => set({ availableMaps: maps }),
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  updateCharacterSettings: (settings) => set((state) => ({
    characterSettings: { ...state.characterSettings, ...settings }
  })),
  setNickname: (nickname) => set({ nickname }),
}))
