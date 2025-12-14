# Browser-Based 3D Cyberpunk Cat Adventure Game
## Complete Development Specification (Opus Edition)

---

## 📋 สารบัญ (Table of Contents)

1. [Project Vision](#1-project-vision)
2. [Game Design](#2-game-design)
3. [Technology Architecture](#3-technology-architecture)
4. [Asset Acquisition Strategy](#4-asset-acquisition-strategy)
5. [Graphics Pipeline](#5-graphics-pipeline)
6. [Audio System](#6-audio-system)
7. [Project Structure](#7-project-structure)
8. [Implementation Steps](#8-implementation-steps)
9. [Performance Optimization](#9-performance-optimization)
10. [Self-Hosted Server Setup](#10-self-hosted-server-setup)
11. [Testing Strategy](#11-testing-strategy)
12. [Asset Replacement Guide](#12-asset-replacement-guide)

---

## 1. Project Vision

### 1.1 Core Concept
สร้างเกม 3D บน browser คุณภาพสูงที่ผู้เล่นควบคุมแมวสำรวจเมือง cyberpunk ที่ถูกทิ้งร้าง โดยเน้นการสำรวจ, ไขปริศนา, และ parkour

### 1.2 Target Experience
- **Emotional Goal:** ความรู้สึกโดดเดี่ยวแต่อบอุ่นในโลกเทคโนโลยีที่ล่มสลาย
- **Gameplay Feel:** การเคลื่อนไหวลื่นไหลของแมว, การสำรวจที่ให้รางวัล
- **Visual Identity:** Neon-noir aesthetic ผสมความเสื่อมโทรมอินทรีย์

### 1.3 Technical Goals
| Metric | Desktop Target | Mobile Target |
|--------|---------------|---------------|
| Frame Rate | 60 FPS constant | 30 FPS minimum |
| Initial Load | < 3 seconds | < 5 seconds |
| RAM Usage | < 512 MB | < 256 MB |
| Draw Calls | < 100/frame | < 50/frame |
| Total Asset Size | < 50 MB compressed | < 30 MB compressed |

### 1.4 Platform Support
- **Primary:** Chrome 120+, Firefox 120+, Edge 120+
- **Secondary:** Safari 17+, Mobile browsers
- **Input:** Keyboard/Mouse, Gamepad, Touch (mobile)

---

## 2. Game Design

### 2.1 Core Gameplay Loop

```
┌─────────────────────────────────────────────────────────┐
│                    EXPLORATION LOOP                      │
├─────────────────────────────────────────────────────────┤
│  DISCOVER → NAVIGATE → INTERACT → REWARD → DISCOVER     │
│     ↓          ↓          ↓          ↓         ↓        │
│  New Area   Parkour    Puzzles   Unlock    Progress     │
│  Visual     Climbing   NPCs      New Path  Story        │
│  Cues       Jumping    Objects   Items     Abilities    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Player Mechanics

#### Movement System
| Action | Input | Description |
|--------|-------|-------------|
| Walk/Run | WASD/Arrow Keys | Analog speed based on stick input or hold Shift for run |
| Jump | Space | Variable height based on press duration |
| Climb | Auto-trigger | Near climbable surfaces (pipes, ledges, walls) |
| Squeeze | Auto-trigger | Near narrow gaps, slows movement |
| Sprint | Hold Shift | 1.5x speed, drains stamina |
| Crouch/Stealth | Hold Ctrl | 0.5x speed, reduces detection |

#### Interaction System
| Action | Input | Context |
|--------|-------|---------|
| Primary Interact | E | Talk to NPCs, activate objects |
| Meow/Call | Q | Alert NPCs, solve sound puzzles |
| Scratch | F | Mark territory, activate switches |
| Knock Object | Right Click | Push objects off ledges |
| Examine | Hold E | Detailed view of collectibles |

### 2.3 Progression System

```
Level 1: The Slums (Tutorial)
├── Learn: Basic movement, jumping
├── Collectibles: 5 Memories
└── Unlock: Sprint ability

Level 2: The Market District  
├── Learn: Climbing, NPC interaction
├── Collectibles: 10 Memories, 3 B-12 Cores
└── Unlock: Meow communication

Level 3: The Rooftops
├── Learn: Advanced parkour, stealth
├── Collectibles: 15 Memories, 5 B-12 Cores
└── Unlock: Enhanced vision

Level 4: The Factory
├── Learn: Puzzle solving, environmental hazards
├── Collectibles: 20 Memories, 7 B-12 Cores
└── Unlock: Robot companion abilities

Level 5: The Tower (Finale)
├── Challenge: All mechanics combined
├── Collectibles: 10 Memories, 3 B-12 Cores
└── Ending: Based on completion percentage
```

### 2.4 NPC System

#### Robot Types
| Type | Behavior | Interaction |
|------|----------|-------------|
| Friendly Bot | Stationary/Patrol | Dialogue, hints, trades |
| Worker Bot | Task-focused | Can be distracted |
| Guardian Bot | Hostile patrol | Must avoid or disable |
| Companion Bot | Follows player | Assists with puzzles |

---

## 3. Technology Architecture

### 3.1 Core Technology Stack

```
┌──────────────────────────────────────────────────────────┐
│                    RENDERING LAYER                        │
├──────────────────────────────────────────────────────────┤
│  Three.js r170+ (Primary Renderer)                        │
│  ├── WebGPU Renderer (Modern browsers, fallback to WebGL2)│
│  ├── EffectComposer (Post-processing pipeline)            │
│  ├── PMREMGenerator (Environment reflections)             │
│  └── Custom Shaders (GLSL/WGSL)                          │
├──────────────────────────────────────────────────────────┤
│                    PHYSICS LAYER                          │
├──────────────────────────────────────────────────────────┤
│  Rapier3D WASM (Primary - High performance)               │
│  ├── Rigid body dynamics                                  │
│  ├── Character controller                                 │
│  ├── Trigger volumes                                      │
│  └── Ray casting for interactions                         │
├──────────────────────────────────────────────────────────┤
│                    ASSET LAYER                            │
├──────────────────────────────────────────────────────────┤
│  GLTFLoader + DRACOLoader (3D Models)                     │
│  KTX2Loader + BasisTextureLoader (Compressed textures)    │
│  AudioLoader + Howler.js (Spatial audio)                  │
│  FontLoader (3D text for signs)                           │
├──────────────────────────────────────────────────────────┤
│                    GAME LOGIC LAYER                       │
├──────────────────────────────────────────────────────────┤
│  TypeScript (Type safety, better tooling)                 │
│  Finite State Machine (Character/NPC states)              │
│  Event System (Decoupled communication)                   │
│  Behavior Trees (AI decision making)                      │
├──────────────────────────────────────────────────────────┤
│                    UI LAYER                               │
├──────────────────────────────────────────────────────────┤
│  HTML/CSS Overlay (Menus, HUD)                            │
│  CSS Custom Properties (Theming)                          │
│  GSAP (UI animations)                                     │
│  Three.js Sprites (In-world UI)                           │
└──────────────────────────────────────────────────────────┘
```

### 3.2 NPM Dependencies

```json
{
  "dependencies": {
    "three": "^0.170.0",
    "@dimforge/rapier3d-compat": "^0.14.0",
    "howler": "^2.2.4",
    "gsap": "^3.12.5",
    "stats.js": "^0.17.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.4.0",
    "@types/three": "^0.170.0",
    "gltf-pipeline": "^4.1.0",
    "gltfpack": "^0.21.0"
  }
}
```

### 3.3 Build & Development Tools

| Tool | Purpose | Command |
|------|---------|---------|
| Vite | Dev server & bundling | `npm run dev` / `npm run build` |
| gltfpack | Model optimization | `gltfpack -i model.glb -o model_opt.glb -tc` |
| toktx | Texture compression | `toktx --t2 --bcmp output.ktx2 input.png` |
| Draco | Mesh compression | Built into gltfpack |

### 3.4 Browser Feature Detection

```javascript
// การตรวจสอบ feature support
const features = {
  webgpu: 'gpu' in navigator,
  webgl2: !!document.createElement('canvas').getContext('webgl2'),
  sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
  wasm: typeof WebAssembly === 'object',
  pointerLock: 'pointerLockElement' in document,
  gamepad: 'getGamepads' in navigator
};
```

---

## 4. Asset Acquisition Strategy

### 4.1 Free 3D Model Sources

#### Primary Sources (CC0/Public Domain)

| Source | URL | Best For | License |
|--------|-----|----------|---------|
| **Poly Haven** | https://polyhaven.com/models | Environment props, realistic | CC0 |
| **Sketchfab** | https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1571c0500f0a&type=models | Varied models | CC0 filter |
| **Kenney** | https://kenney.nl/assets | Stylized, low-poly | CC0 |
| **Quaternius** | https://quaternius.com/ | Low-poly characters/props | CC0 |
| **Kay Lousberg** | https://kaylousberg.itch.io/ | Stylized game assets | CC0 |
| **OpenGameArt** | https://opengameart.org/art-search?keys=3d | Game-ready assets | Various (check each) |

#### Recommended Models for This Project

**Character - Cat:**
```
Primary Option: 
- Sketchfab: "Low Poly Cat" by Google Poly (CC-BY)
  https://sketchfab.com/3d-models/cat-rigged-animated
  
Backup Options:
- Quaternius: "Ultimate Animals Pack" (CC0)
  https://quaternius.com/packs/ultimateanimals.html
  
- Turbosquid Free: Search "cat animated free"
  (Check license carefully - look for Editorial/Personal free)
```

**Robots/NPCs:**
```
- Quaternius: "Robot Pack" (CC0)
  https://quaternius.com/packs/robots.html
  
- Sketchfab: Search "robot CC0" or "droid CC0"
  
- Kenney: "Platformer Kit" includes robot enemies
  https://kenney.nl/assets/platformer-kit
```

**Environment - Cyberpunk City:**
```
Buildings:
- Poly Haven: Various building models (CC0)
- Kenney: "City Kit Suburban/Commercial" (CC0)
  https://kenney.nl/assets/city-kit-suburban
  https://kenney.nl/assets/city-kit-commercial

Props (Neon signs, barrels, crates):
- Quaternius: "Ultimate Props Pack" (CC0)
  https://quaternius.com/packs/ultimateprops.html
  
- Kenney: "Furniture Kit" (CC0)
  https://kenney.nl/assets/furniture-kit
```

### 4.2 Free Texture Sources (PBR)

| Source | URL | Formats | License |
|--------|-----|---------|---------|
| **Poly Haven** | https://polyhaven.com/textures | PNG, EXR | CC0 |
| **ambientCG** | https://ambientcg.com/ | PNG, JPG | CC0 |
| **Textures.com** | https://www.textures.com/ | JPG, PNG | Free tier (15/day) |
| **3D Textures** | https://3dtextures.me/ | PNG | CC0 |
| **cgbookcase** | https://www.cgbookcase.com/ | PNG, EXR | CC0 |

#### Recommended Textures

```
Concrete/Asphalt (Streets, buildings):
- ambientCG: "Concrete" category - multiple variations
- Poly Haven: "concrete_floor", "asphalt"

Metal (Pipes, machinery):
- ambientCG: "Metal" category - rust, painted, brushed
- Poly Haven: "corrugated_iron", "metal_plate"

Neon/Emissive:
- Create custom in image editor (simple gradient + glow)
- Use color values: #FF00FF (magenta), #00FFFF (cyan), #FF6B00 (orange)

Organic (Plants, debris):
- Poly Haven: "bark", "moss", "dead_leaves"
- ambientCG: "Ground" category
```

### 4.3 Free HDRI Environment Maps

| Source | Recommended HDRIs | Resolution |
|--------|-------------------|------------|
| **Poly Haven** | "city_night", "neon_photostudio", "industrial_sunset" | 1K-8K |
| **HDRIHaven (old)** | Archived on Poly Haven | 1K-4K |

```
Download Links:
- Night City: https://polyhaven.com/a/evening_road_01
- Industrial: https://polyhaven.com/a/industrial_sunset
- Studio: https://polyhaven.com/a/studio_small_09
```

### 4.4 Free Audio Sources

#### Sound Effects

| Source | URL | Format | License |
|--------|-----|--------|---------|
| **Freesound** | https://freesound.org/ | WAV, MP3 | Various (CC0 filter available) |
| **Sonniss GDC Bundle** | https://sonniss.com/gameaudiogdc | WAV | Royalty-free |
| **Zapsplat** | https://www.zapsplat.com/ | MP3, WAV | Free tier (attribution) |
| **Mixkit** | https://mixkit.co/free-sound-effects/ | WAV | Free commercial |
| **OpenGameArt** | https://opengameart.org/art-search-advanced?field_art_type_tid%5B%5D=13 | Various | Check each |

#### Recommended Sound Packs

```
Cat Sounds:
- Freesound: Search "cat meow" with CC0 license filter
  Example pack: https://freesound.org/people/Lamoot/packs/14993/
  
Footsteps:
- Sonniss GDC: "Footsteps" folder (multiple surfaces)
- Freesound: "footsteps concrete", "footsteps metal"

Ambient:
- Freesound: "city ambience", "industrial hum", "wind"
- Mixkit: "City" category

UI Sounds:
- Kenney: "UI Audio" (CC0)
  https://kenney.nl/assets/ui-audio
  
- Freesound: "button click", "menu select"
```

#### Music (Background)

| Source | URL | Style | License |
|--------|-----|-------|---------|
| **Incompetech** | https://incompetech.com/ | Various | CC-BY 3.0 |
| **Free Music Archive** | https://freemusicarchive.org/ | Various | Various |
| **Uppbeat** | https://uppbeat.io/ | Modern | Free tier (credit) |
| **Pixabay** | https://pixabay.com/music/ | Various | Free commercial |

```
Recommended Tracks (Search terms):
- "cyberpunk ambient"
- "synthwave atmospheric"  
- "dark electronic ambient"
- "lo-fi chill instrumental"
```

### 4.5 Free Font Sources

| Font | Source | Style | License |
|------|--------|-------|---------|
| **Orbitron** | Google Fonts | Sci-fi display | OFL |
| **Share Tech Mono** | Google Fonts | Monospace terminal | OFL |
| **Audiowide** | Google Fonts | Futuristic | OFL |
| **Rajdhani** | Google Fonts | Modern geometric | OFL |
| **Noto Sans Thai** | Google Fonts | Thai support | OFL |

```
Google Fonts Links:
https://fonts.google.com/specimen/Orbitron
https://fonts.google.com/specimen/Share+Tech+Mono
https://fonts.google.com/specimen/Audiowide
```

---

## 5. Graphics Pipeline

### 5.1 Rendering Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   RENDER PIPELINE                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │ G-Buffer│ →  │ Lighting│ →  │  Post   │ → Output    │
│  │  Pass   │    │   Pass  │    │ Process │             │
│  └─────────┘    └─────────┘    └─────────┘             │
│       │              │              │                   │
│   Geometry      Shadow Maps    ┌────┴────┐             │
│   Normals       Env Maps       │ Effects │             │
│   Depth         Point Lights   ├─────────┤             │
│   Albedo                       │ SSAO    │             │
│                                │ Bloom   │             │
│                                │ Color   │             │
│                                │ FXAA    │             │
│                                │ Vignette│             │
│                                └─────────┘             │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Material System

#### Standard PBR Material Setup
```javascript
// Template สำหรับ material configuration
const materialConfig = {
  // Base textures (required)
  map: diffuseTexture,           // Color/Albedo
  normalMap: normalTexture,       // Surface detail
  roughnessMap: roughnessTexture, // Shininess variation
  
  // Optional enhancements
  metalnessMap: metalnessTexture, // Metal vs dielectric
  aoMap: aoTexture,               // Ambient occlusion
  emissiveMap: emissiveTexture,   // Self-illumination
  
  // Environment
  envMap: cubeTexture,            // Reflections
  envMapIntensity: 0.8,
  
  // Settings
  roughness: 0.5,
  metalness: 0.0,
  emissive: new Color(0x000000),
  emissiveIntensity: 1.0
};
```

#### Special Materials

**Neon Emissive Material:**
```javascript
const neonMaterial = {
  emissive: new Color(0xff00ff),
  emissiveIntensity: 3.0,
  color: new Color(0x220022),
  roughness: 0.3,
  metalness: 0.1
};
// Post-process bloom จะทำให้เรืองแสง
```

**Hologram Material:**
```javascript
// Custom shader required
// Features: transparency, scanlines, flicker, edge glow
// Reference: three.js examples/webgl_materials_variations_toon
```

**Wet/Rain Surface:**
```javascript
const wetMaterial = {
  roughness: 0.1,
  metalness: 0.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1
  // Requires MeshPhysicalMaterial
};
```

### 5.3 Lighting Setup

#### Scene Lighting Template
```javascript
// Primary light (Moon/Main source)
const directionalLight = {
  color: 0x8888ff,      // Cool blue moonlight
  intensity: 0.5,
  position: [50, 100, 50],
  castShadow: true,
  shadow: {
    mapSize: 2048,
    camera: {
      near: 0.5,
      far: 500,
      left: -100,
      right: 100,
      top: 100,
      bottom: -100
    },
    bias: -0.0001
  }
};

// Ambient fill (Hemisphere)
const hemisphereLight = {
  skyColor: 0x222244,    // Dark blue sky
  groundColor: 0x111122, // Dark ground bounce
  intensity: 0.3
};

// Neon accent lights (Point lights, max 8)
const neonLights = [
  { color: 0xff00ff, intensity: 2, distance: 20, position: [x, y, z] },
  { color: 0x00ffff, intensity: 2, distance: 20, position: [x, y, z] },
  { color: 0xff6600, intensity: 1.5, distance: 15, position: [x, y, z] }
];
```

### 5.4 Post-Processing Stack

```javascript
// Effect order matters! This is the recommended sequence
const postProcessingStack = [
  // 1. Base render
  'RenderPass',
  
  // 2. Ambient Occlusion (depth-based shadows)
  'SSAOPass',           // intensity: 0.5, radius: 4, bias: 0.5
  
  // 3. Bloom (glow effect for neon)
  'UnrealBloomPass',    // strength: 1.5, radius: 0.4, threshold: 0.85
  
  // 4. Color correction
  'ColorCorrectionPass', // saturation: 1.1, contrast: 1.05
  
  // 5. Tone mapping (HDR to LDR)
  // Built into renderer: ACESFilmicToneMapping
  
  // 6. Anti-aliasing
  'SMAAPass',           // Better quality than FXAA
  
  // 7. Film effects (optional, for style)
  'FilmPass',           // grain: 0.1, scanlines: 0
  
  // 8. Vignette (optional)
  'VignettePass'        // darkness: 0.5, offset: 0.5
];
```

### 5.5 Quality Presets

```javascript
const qualityPresets = {
  ultra: {
    shadowMapSize: 4096,
    ssaoSamples: 32,
    bloomResolution: 1,      // Full res
    antialias: 'SMAA',
    maxPointLights: 8,
    textureAnisotropy: 16,
    lodBias: 0
  },
  high: {
    shadowMapSize: 2048,
    ssaoSamples: 16,
    bloomResolution: 0.5,
    antialias: 'FXAA',
    maxPointLights: 6,
    textureAnisotropy: 8,
    lodBias: 0
  },
  medium: {
    shadowMapSize: 1024,
    ssaoSamples: 8,
    bloomResolution: 0.25,
    antialias: 'FXAA',
    maxPointLights: 4,
    textureAnisotropy: 4,
    lodBias: 1
  },
  low: {
    shadowMapSize: 512,
    ssaoSamples: 0,          // Disabled
    bloomResolution: 0,      // Disabled
    antialias: 'none',
    maxPointLights: 2,
    textureAnisotropy: 1,
    lodBias: 2
  },
  mobile: {
    shadowMapSize: 512,
    ssaoSamples: 0,
    bloomResolution: 0,
    antialias: 'none',
    maxPointLights: 2,
    textureAnisotropy: 1,
    lodBias: 2,
    pixelRatio: 0.75         // Render at lower resolution
  }
};
```

---

## 6. Audio System

### 6.1 Audio Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AUDIO SYSTEM                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│  │   Music     │   │    SFX      │   │   Ambient   │   │
│  │   Manager   │   │   Manager   │   │   Manager   │   │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   │
│         │                 │                  │          │
│         └────────────┬────┴──────────────────┘          │
│                      │                                   │
│              ┌───────┴───────┐                          │
│              │  Master Bus   │                          │
│              │  (Howler.js)  │                          │
│              └───────────────┘                          │
│                                                          │
│  Features:                                              │
│  - Spatial audio (3D positioning)                       │
│  - Dynamic mixing (duck music when dialogue)            │
│  - Crossfade between areas                              │
│  - Distance attenuation                                 │
│  - Reverb zones                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Audio Categories & Volumes

```javascript
const audioCategories = {
  master: { volume: 1.0, mutable: true },
  music: { volume: 0.7, mutable: true, parent: 'master' },
  sfx: { volume: 0.8, mutable: true, parent: 'master' },
  ambient: { volume: 0.6, mutable: true, parent: 'master' },
  voice: { volume: 1.0, mutable: true, parent: 'master' },
  ui: { volume: 0.5, mutable: true, parent: 'master' }
};
```

### 6.3 Sound Asset Specifications

| Category | Format | Sample Rate | Channels | Notes |
|----------|--------|-------------|----------|-------|
| Music | MP3/OGG | 44.1kHz | Stereo | Loop seamlessly |
| SFX | MP3/OGG | 44.1kHz | Mono | For 3D positioning |
| Ambient | MP3/OGG | 44.1kHz | Stereo | Long loops |
| UI | MP3 | 44.1kHz | Mono | Short, punchy |

---

## 7. Project Structure

### 7.1 Directory Layout

```
project-root/
│
├── index.html                    # Entry point
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts               # Build config
│
├── src/
│   ├── main.ts                  # Application entry
│   │
│   ├── core/                    # Engine core
│   │   ├── Game.ts              # Main game class
│   │   ├── Scene.ts             # Scene management
│   │   ├── AssetManager.ts      # Asset loading/caching
│   │   ├── InputManager.ts      # Input handling
│   │   ├── AudioManager.ts      # Sound system
│   │   ├── SaveManager.ts       # Save/load system
│   │   └── EventBus.ts          # Event communication
│   │
│   ├── entities/                # Game objects
│   │   ├── Player.ts            # Player controller
│   │   ├── Cat.ts               # Cat-specific behaviors
│   │   ├── NPC.ts               # NPC base class
│   │   ├── Robot.ts             # Robot NPCs
│   │   ├── Collectible.ts       # Pickup items
│   │   └── InteractiveObject.ts # Interactable props
│   │
│   ├── systems/                 # Game systems
│   │   ├── PhysicsSystem.ts     # Rapier physics wrapper
│   │   ├── AnimationSystem.ts   # Animation controller
│   │   ├── AISystem.ts          # NPC AI/Behavior trees
│   │   ├── DialogueSystem.ts    # Conversation handling
│   │   ├── QuestSystem.ts       # Quest/objective tracking
│   │   └── ParticleSystem.ts    # Particle effects
│   │
│   ├── graphics/                # Rendering
│   │   ├── Renderer.ts          # Three.js renderer setup
│   │   ├── PostProcessing.ts    # Effect composer
│   │   ├── Lighting.ts          # Light management
│   │   ├── Materials.ts         # Material library
│   │   ├── Shaders/             # Custom shaders
│   │   │   ├── neon.glsl
│   │   │   ├── hologram.glsl
│   │   │   └── outline.glsl
│   │   └── Camera.ts            # Camera controller
│   │
│   ├── ui/                      # User interface
│   │   ├── UIManager.ts         # UI controller
│   │   ├── HUD.ts               # In-game HUD
│   │   ├── MenuSystem.ts        # Menu screens
│   │   ├── DialogueUI.ts        # Dialogue display
│   │   └── components/          # Reusable UI components
│   │
│   ├── levels/                  # Level-specific code
│   │   ├── LevelManager.ts      # Level loading/switching
│   │   ├── Level1_Slums.ts
│   │   ├── Level2_Market.ts
│   │   └── ...
│   │
│   ├── utils/                   # Utilities
│   │   ├── MathUtils.ts
│   │   ├── ObjectPool.ts
│   │   ├── PerformanceMonitor.ts
│   │   └── Debug.ts
│   │
│   └── types/                   # TypeScript types
│       ├── game.d.ts
│       ├── assets.d.ts
│       └── events.d.ts
│
├── public/                      # Static assets (copied as-is)
│   └── favicon.ico
│
└── assets/                      # Game assets
    ├── models/
    │   ├── characters/
    │   │   ├── cat/
    │   │   │   ├── cat.glb           # Main model + rig
    │   │   │   └── animations/       # Separate animations
    │   │   │       ├── idle.glb
    │   │   │       ├── walk.glb
    │   │   │       ├── run.glb
    │   │   │       ├── jump.glb
    │   │   │       └── meow.glb
    │   │   └── npcs/
    │   │       ├── robot_friendly.glb
    │   │       ├── robot_worker.glb
    │   │       └── robot_guard.glb
    │   │
    │   ├── environment/
    │   │   ├── buildings/
    │   │   │   ├── building_apartment.glb
    │   │   │   ├── building_shop.glb
    │   │   │   └── building_factory.glb
    │   │   ├── props/
    │   │   │   ├── props_street.glb      # Batched street props
    │   │   │   ├── props_interior.glb    # Batched interior props
    │   │   │   └── props_neon.glb        # Neon signs
    │   │   └── nature/
    │   │       └── plants_debris.glb
    │   │
    │   └── items/
    │       ├── collectible_memory.glb
    │       └── collectible_core.glb
    │
    ├── textures/
    │   ├── characters/
    │   │   ├── cat_diffuse.ktx2
    │   │   ├── cat_normal.ktx2
    │   │   └── cat_orm.ktx2          # Occlusion/Roughness/Metalness packed
    │   │
    │   ├── environment/
    │   │   ├── concrete_*.ktx2
    │   │   ├── metal_*.ktx2
    │   │   └── neon_emissive.ktx2
    │   │
    │   ├── hdri/
    │   │   ├── city_night.hdr
    │   │   └── studio.hdr
    │   │
    │   └── ui/
    │       ├── icons.png
    │       └── cursor.png
    │
    ├── audio/
    │   ├── music/
    │   │   ├── theme_main.mp3
    │   │   ├── ambient_slums.mp3
    │   │   └── ambient_rooftops.mp3
    │   │
    │   ├── sfx/
    │   │   ├── footsteps/
    │   │   │   ├── step_concrete_01.mp3
    │   │   │   ├── step_concrete_02.mp3
    │   │   │   ├── step_metal_01.mp3
    │   │   │   └── step_metal_02.mp3
    │   │   ├── cat/
    │   │   │   ├── meow_01.mp3
    │   │   │   ├── meow_02.mp3
    │   │   │   ├── purr.mp3
    │   │   │   └── scratch.mp3
    │   │   ├── environment/
    │   │   │   ├── door_open.mp3
    │   │   │   ├── switch_toggle.mp3
    │   │   │   └── object_fall.mp3
    │   │   └── ui/
    │   │       ├── click.mp3
    │   │       ├── hover.mp3
    │   │       └── confirm.mp3
    │   │
    │   └── ambient/
    │       ├── city_hum.mp3
    │       ├── wind.mp3
    │       └── rain.mp3
    │
    ├── fonts/
    │   ├── Orbitron-Regular.woff2
    │   └── ShareTechMono-Regular.woff2
    │
    └── data/
        ├── levels/
        │   ├── level_01.json         # Level geometry/object placement
        │   ├── level_02.json
        │   └── level_config.json     # Level metadata
        │
        ├── dialogue/
        │   ├── npc_dialogues.json
        │   └── localization/
        │       ├── en.json
        │       └── th.json
        │
        └── config/
            ├── game_settings.json
            ├── controls.json
            └── audio_config.json
```

---

## 8. Implementation Steps

### Phase 0: Environment Setup (Day 1-2)

#### Step 0.1: Initialize Project
```bash
# สร้างโปรเจค
mkdir cyberpunk-cat-game
cd cyberpunk-cat-game

# Initialize npm
npm init -y

# Install dependencies
npm install three @dimforge/rapier3d-compat howler gsap stats.js

# Install dev dependencies
npm install -D typescript vite @types/three
```

#### Step 0.2: Configure TypeScript
```bash
# สร้าง tsconfig.json
npx tsc --init

# แก้ไข tsconfig.json:
# - "target": "ES2022"
# - "module": "ESNext"  
# - "moduleResolution": "bundler"
# - "strict": true
```

#### Step 0.3: Configure Vite
```javascript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 0
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
```

#### Step 0.4: Create Basic HTML
```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyberpunk Cat Adventure</title>
  <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body>
  <div id="game-container"></div>
  <div id="ui-overlay"></div>
  <div id="loading-screen">
    <div class="loading-bar"></div>
    <p class="loading-text">Loading...</p>
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

### Phase 1: Core Engine (Week 1)

#### Step 1.1: Basic Three.js Setup
**Files to create:**
- `src/core/Game.ts` - Main game loop
- `src/graphics/Renderer.ts` - Three.js renderer initialization
- `src/graphics/Camera.ts` - Third-person camera

**Goals:**
- [ ] Initialize WebGL/WebGPU renderer with fallback
- [ ] Set up render loop with delta time
- [ ] Create orbit camera for testing
- [ ] Add Stats.js for FPS monitoring
- [ ] Test with simple cube geometry

#### Step 1.2: Asset Loading System
**Files to create:**
- `src/core/AssetManager.ts` - Centralized asset loading
- `src/utils/ProgressTracker.ts` - Loading progress

**Goals:**
- [ ] Implement GLTFLoader with DRACO support
- [ ] Implement KTX2Loader for compressed textures
- [ ] Create asset manifest system
- [ ] Build loading screen with progress bar
- [ ] Test with placeholder assets

#### Step 1.3: Physics Integration
**Files to create:**
- `src/systems/PhysicsSystem.ts` - Rapier wrapper

**Goals:**
- [ ] Initialize Rapier WASM
- [ ] Create physics world with gravity
- [ ] Implement rigid body creation helpers
- [ ] Add debug visualization
- [ ] Test collision detection

#### Step 1.4: Input System
**Files to create:**
- `src/core/InputManager.ts` - Input abstraction

**Goals:**
- [ ] Keyboard input handling
- [ ] Mouse input with pointer lock
- [ ] Gamepad support
- [ ] Input mapping configuration
- [ ] Action-based input system (not raw keys)

---

### Phase 2: Player Controller (Week 2)

#### Step 2.1: Character Controller
**Files to create:**
- `src/entities/Player.ts` - Player entity
- `src/entities/Cat.ts` - Cat-specific mechanics

**Goals:**
- [ ] Capsule collider for player
- [ ] Ground detection (ray casting)
- [ ] Basic WASD movement
- [ ] Variable jump (hold for higher)
- [ ] Sprint mechanic

#### Step 2.2: Third-Person Camera
**Update:** `src/graphics/Camera.ts`

**Goals:**
- [ ] Follow player with smooth interpolation
- [ ] Collision with environment (no clipping through walls)
- [ ] Zoom control (scroll wheel)
- [ ] Auto-adjust during climbing
- [ ] Camera shake effects

#### Step 2.3: Animation System
**Files to create:**
- `src/systems/AnimationSystem.ts` - Animation controller

**Goals:**
- [ ] Load animations from separate files
- [ ] Animation state machine (idle, walk, run, jump)
- [ ] Blend trees for smooth transitions
- [ ] Procedural animations (tail, ears)
- [ ] Root motion support

---

### Phase 3: Environment (Week 3)

#### Step 3.1: Level Loading
**Files to create:**
- `src/levels/LevelManager.ts` - Level lifecycle
- `src/levels/Level1_Slums.ts` - First level

**Goals:**
- [ ] Load level geometry from GLTF
- [ ] Parse collision meshes
- [ ] Spawn points and triggers
- [ ] Level streaming for large areas
- [ ] Smooth level transitions

#### Step 3.2: Lighting System
**Files to create:**
- `src/graphics/Lighting.ts` - Dynamic lighting

**Goals:**
- [ ] Directional light (moon)
- [ ] Point lights for neon
- [ ] Light probes for indirect
- [ ] Dynamic light switching
- [ ] Light cookies for patterns

#### Step 3.3: Post-Processing
**Files to create:**
- `src/graphics/PostProcessing.ts` - Effect composer

**Goals:**
- [ ] SSAO implementation
- [ ] Bloom for neon glow
- [ ] Color grading LUT
- [ ] SMAA anti-aliasing
- [ ] Quality preset switching

---

### Phase 4: Interactions (Week 4)

#### Step 4.1: Interaction System
**Files to create:**
- `src/entities/InteractiveObject.ts` - Base interactable
- `src/systems/InteractionSystem.ts` - Proximity detection

**Goals:**
- [ ] Raycast-based interaction detection
- [ ] Interaction prompts (UI)
- [ ] Multiple interaction types
- [ ] State persistence

#### Step 4.2: NPC System
**Files to create:**
- `src/entities/NPC.ts` - NPC base
- `src/entities/Robot.ts` - Robot variants
- `src/systems/AISystem.ts` - Behavior trees

**Goals:**
- [ ] Patrol paths
- [ ] Player detection
- [ ] Dialogue triggers
- [ ] State machines (idle, alert, chase)

#### Step 4.3: Dialogue System
**Files to create:**
- `src/systems/DialogueSystem.ts` - Conversation engine
- `src/ui/DialogueUI.ts` - Dialogue display

**Goals:**
- [ ] JSON-based dialogue trees
- [ ] Branching conversations
- [ ] Localization support
- [ ] Portrait display
- [ ] Text typewriter effect

---

### Phase 5: Audio & Polish (Week 5)

#### Step 5.1: Audio System
**Files to create:**
- `src/core/AudioManager.ts` - Sound management

**Goals:**
- [ ] Howler.js integration
- [ ] 3D spatial audio
- [ ] Music crossfading
- [ ] Ambient sound layers
- [ ] UI sound effects

#### Step 5.2: Particle Effects
**Files to create:**
- `src/systems/ParticleSystem.ts` - Particle management

**Goals:**
- [ ] Dust particles (movement)
- [ ] Spark effects (electrical)
- [ ] Rain/weather effects
- [ ] Smoke/steam
- [ ] Object pooling

#### Step 5.3: UI Implementation
**Files to create:**
- `src/ui/UIManager.ts` - UI controller
- `src/ui/HUD.ts` - Game HUD
- `src/ui/MenuSystem.ts` - Menus

**Goals:**
- [ ] Main menu
- [ ] Pause menu
- [ ] Settings (graphics, audio, controls)
- [ ] HUD (stamina, objectives)
- [ ] Inventory screen

---

### Phase 6: Optimization (Week 6)

#### Step 6.1: Performance Optimization
**Goals:**
- [ ] Implement LOD system
- [ ] Frustum culling verification
- [ ] Occlusion culling
- [ ] Texture atlasing
- [ ] Instanced rendering

#### Step 6.2: Loading Optimization
**Goals:**
- [ ] Asset compression (DRACO, KTX2)
- [ ] Lazy loading implementation
- [ ] Progressive loading
- [ ] Cache management

#### Step 6.3: Memory Optimization
**Goals:**
- [ ] Object pooling
- [ ] Proper disposal of unused assets
- [ ] Memory profiling
- [ ] Leak detection

---

### Phase 7: Content & Testing (Week 7-8)

#### Step 7.1: Level Design
**Goals:**
- [ ] Complete Level 1 layout
- [ ] Place all collectibles
- [ ] Set up NPC positions
- [ ] Test parkour routes
- [ ] Balance difficulty

#### Step 7.2: Testing
**Goals:**
- [ ] Cross-browser testing
- [ ] Performance benchmarking
- [ ] Bug fixing
- [ ] User testing
- [ ] Accessibility check

#### Step 7.3: Deployment
**Goals:**
- [ ] Production build
- [ ] Server configuration
- [ ] CDN setup (optional)
- [ ] Analytics integration
- [ ] Error reporting

---

## 9. Performance Optimization

### 9.1 Model Optimization Pipeline

```bash
# Step 1: Optimize with gltfpack
gltfpack -i input.glb -o output.glb \
  -tc \                    # Texture compression (KTX2)
  -cc \                    # Mesh compression (Draco)
  -kn \                    # Keep normals
  -si 0.5                  # Simplification ratio (50%)

# Step 2: Alternative - Use gltf-transform
npx gltf-transform optimize input.glb output.glb \
  --texture-compress webp \
  --draco-compression-level 7

# Step 3: Verify file sizes
ls -la *.glb
```

### 9.2 Texture Optimization

| Use Case | Format | Resolution | Notes |
|----------|--------|------------|-------|
| Character diffuse | KTX2 (BC7) | 1024x1024 | Highest quality |
| Character normal | KTX2 (BC5) | 1024x1024 | Two-channel |
| Environment | KTX2 (BC7) | 512-1024 | Depends on size |
| Props | KTX2 (BC7) | 256-512 | Texture atlas |
| UI | WebP | As needed | Lossless |
| Emissive | PNG | 256x256 | Small, simple |

### 9.3 Draw Call Reduction

```javascript
// Technique 1: Geometry batching
const mergedGeometry = BufferGeometryUtils.mergeGeometries([
  geometry1, geometry2, geometry3
]);

// Technique 2: Instanced rendering
const instancedMesh = new InstancedMesh(
  sharedGeometry,
  sharedMaterial,
  count
);

// Technique 3: Texture atlasing
// Combine multiple textures into one
// Adjust UV coordinates accordingly

// Target: < 100 draw calls per frame
```

### 9.4 LOD Configuration

```javascript
const lodLevels = {
  // Distance in world units
  high: { distance: 0, triangles: '100%' },     // 0-20 units
  medium: { distance: 20, triangles: '50%' },   // 20-50 units
  low: { distance: 50, triangles: '25%' },      // 50-100 units
  billboard: { distance: 100, triangles: '0%' } // 100+ units (2D sprite)
};
```

---

## 10. Self-Hosted Server Setup

### 10.1 Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Storage | 10 GB SSD | 50+ GB SSD |
| Network | 100 Mbps | 1 Gbps |
| OS | Ubuntu 22.04 | Ubuntu 22.04 LTS |

### 10.2 Nginx Configuration

```nginx
# /etc/nginx/sites-available/game

server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Root directory
    root /var/www/game/dist;
    index index.html;
    
    # CORS and SharedArrayBuffer headers (required for Rapier WASM)
    add_header Cross-Origin-Opener-Policy same-origin;
    add_header Cross-Origin-Embedder-Policy require-corp;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript 
               application/rss+xml application/atom+xml image/svg+xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|glb|ktx2|hdr|mp3|ogg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Opener-Policy same-origin;
        add_header Cross-Origin-Embedder-Policy require-corp;
    }
    
    # WASM files
    location ~* \.wasm$ {
        types { application/wasm wasm; }
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Cross-Origin-Opener-Policy same-origin;
        add_header Cross-Origin-Embedder-Policy require-corp;
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 10.3 Deployment Script

```bash
#!/bin/bash
# deploy.sh

# Variables
SERVER_USER="your-user"
SERVER_HOST="your-server-ip"
SERVER_PATH="/var/www/game"
BUILD_DIR="dist"

# Build
echo "Building project..."
npm run build

# Compress
echo "Compressing build..."
tar -czf build.tar.gz $BUILD_DIR

# Upload
echo "Uploading to server..."
scp build.tar.gz $SERVER_USER@$SERVER_HOST:/tmp/

# Deploy
echo "Deploying..."
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  cd /tmp
  tar -xzf build.tar.gz
  rm -rf /var/www/game/dist.bak
  mv /var/www/game/dist /var/www/game/dist.bak 2>/dev/null
  mv dist /var/www/game/
  rm build.tar.gz
  sudo systemctl reload nginx
EOF

# Cleanup
rm build.tar.gz

echo "Deployment complete!"
```

### 10.4 SSL Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (runs twice daily via systemd timer)
sudo certbot renew --dry-run
```

---

## 11. Testing Strategy

### 11.1 Performance Benchmarks

```javascript
// Performance test suite
const benchmarks = {
  renderFrame: {
    target: 16.67,  // 60 FPS
    warning: 20,    // 50 FPS
    critical: 33.33 // 30 FPS
  },
  physicsStep: {
    target: 2,      // ms
    warning: 4,
    critical: 8
  },
  assetLoad: {
    target: 3000,   // ms total
    warning: 5000,
    critical: 10000
  },
  memoryUsage: {
    target: 256,    // MB
    warning: 384,
    critical: 512
  }
};
```

### 11.2 Browser Testing Matrix

| Browser | Version | Priority | Notes |
|---------|---------|----------|-------|
| Chrome | 120+ | High | Primary target |
| Firefox | 120+ | High | Test WebGL fallback |
| Edge | 120+ | Medium | Chromium-based |
| Safari | 17+ | Medium | WebGPU support |
| Mobile Chrome | Latest | Low | Touch controls |
| Mobile Safari | Latest | Low | iOS testing |

### 11.3 Test Scenarios

```
1. Fresh Load Test
   - Clear cache, load game
   - Measure: Load time, first render, memory

2. Extended Play Test
   - Play for 30 minutes
   - Measure: Frame stability, memory growth

3. Level Transition Test
   - Load Level 1 → Level 2 → Level 1
   - Measure: Load times, memory after transition

4. Stress Test
   - Maximum particles, NPCs, lights
   - Measure: Minimum FPS, frame drops

5. Low-End Device Test
   - Disable GPU acceleration
   - Test quality auto-detection
```

---

## 12. Asset Replacement Guide

### 12.1 Replacing 3D Models

```
1. การเตรียม Model ใหม่
   - Export เป็น GLTF 2.0 (.glb)
   - ใช้ Y-up coordinate system
   - Scale: 1 unit = 1 meter
   - Origin ที่ฐานของ model
   
2. การ Optimize
   - ใช้ gltfpack หรือ gltf-transform
   - Target: < 15,000 triangles สำหรับ character
   - Target: < 5,000 triangles สำหรับ props
   
3. การ Replace
   - Copy file ใหม่ไปยัง folder เดิม
   - ใช้ชื่อไฟล์เดียวกัน
   - หรือแก้ไข path ใน AssetManager
   
4. Animations
   - ต้องมี bone names ตรงกัน
   - หรือ remap ใน AnimationSystem
```

### 12.2 Replacing Textures

```
1. การเตรียม Texture ใหม่
   - Resolution: Power of 2 (512, 1024, 2048)
   - Format: PNG สำหรับ source
   
2. การ Compress
   # ติดตั้ง toktx (Khronos Texture Tools)
   # https://github.com/KhronosGroup/KTX-Software/releases
   
   toktx --t2 --bcmp output.ktx2 input.png
   
3. การ Replace
   - Copy .ktx2 file ไปยัง folder เดิม
   - ใช้ชื่อไฟล์เดียวกัน (เปลี่ยนนามสกุลเป็น .ktx2)
```

### 12.3 Replacing Audio

```
1. การเตรียม Audio ใหม่
   - Format: MP3 (128-192 kbps) หรือ OGG
   - SFX: Mono, 44.1kHz
   - Music: Stereo, 44.1kHz
   - Normalize ให้ -3dB peak
   
2. การ Loop Music
   - ใช้ Audacity ตัด silence ตอนต้น/ท้าย
   - Export: File → Export → Export as MP3
   
3. การ Replace
   - Copy file ใหม่ไปยัง folder เดิม
   - ใช้ชื่อไฟล์เดียวกัน
```

### 12.4 Asset Naming Convention

```
Models:
  [category]_[name].glb
  Examples: char_cat.glb, env_building_01.glb, prop_crate.glb

Textures:
  [model]_[type].ktx2
  Types: diffuse, normal, orm (occlusion/roughness/metalness), emissive
  Examples: cat_diffuse.ktx2, concrete_normal.ktx2

Audio:
  [category]_[name]_[variant].mp3
  Examples: sfx_footstep_concrete_01.mp3, music_ambient_slums.mp3

Animations:
  [character]_[action].glb
  Examples: cat_idle.glb, cat_walk.glb, robot_patrol.glb
```

---

## 📚 Resources & References

### Documentation
- Three.js: https://threejs.org/docs/
- Rapier Physics: https://rapier.rs/docs/
- Howler.js: https://howlerjs.com/
- TypeScript: https://www.typescriptlang.org/docs/

### Tutorials
- Three.js Journey: https://threejs-journey.com/
- Discover Three.js: https://discoverthreejs.com/
- Three.js Fundamentals: https://threejs.org/manual/

### Tools
- Blender: https://www.blender.org/ (3D modeling)
- gltfpack: https://github.com/zeux/meshoptimizer
- KTX Tools: https://github.com/KhronosGroup/KTX-Software
- Audacity: https://www.audacityteam.org/ (Audio editing)

### Community
- Three.js Discord: https://discord.gg/threejs
- Three.js Forum: https://discourse.threejs.org/
- r/threejs: https://www.reddit.com/r/threejs/

---

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-XX-XX | Initial Opus specification |

---

**Document Version:** 1.0.0 (Opus Edition)
**Last Updated:** December 2024
**Author:** AI Assistant (Claude Opus 4.5)

---

> 💡 **Note:** เอกสารนี้เป็น living document ควรอัพเดทตามความก้าวหน้าของโปรเจค และเทคโนโลยีใหม่ๆ ที่ออกมา

