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
 * Interface สำหรับ State ของเกม
 */
interface GameState {
  gameState: 'menu' | 'mapSelection' | 'playing' | 'paused'
  selectedMap: MapInfo | null
  availableMaps: MapInfo[]
  showControls: boolean

  goToMapSelection: () => void
  selectMap: (map: MapInfo) => void
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  goToMenu: () => void
  toggleControls: () => void
  setAvailableMaps: (maps: MapInfo[]) => void
}

export const useGame = create<GameState>((set) => ({
  gameState: 'menu',
  selectedMap: null,
  availableMaps: [],
  showControls: false,

  goToMapSelection: () => set({ gameState: 'mapSelection' }),
  selectMap: (map) => set({ selectedMap: map }),
  startGame: () => set({ gameState: 'playing' }),
  pauseGame: () => set({ gameState: 'paused' }),
  resumeGame: () => set({ gameState: 'playing' }),
  goToMenu: () => set({ gameState: 'menu', selectedMap: null }),
  toggleControls: () => set((state) => ({ showControls: !state.showControls })),
  setAvailableMaps: (maps) => set({ availableMaps: maps }),
}))
