# สเปคการพัฒนาเกม 3D บนเว็บเซิร์ฟเวอร์ (Advanced Browser-Based 3D Game Specification)
> **Edition:** Gemini Pro 3 Optimized
> **Target:** High-Performance Web-Based Architecture

## 1. ภาพรวมโครงการ (Project Overview)

**วัตถุประสงค์:** สร้างเกม 3D คุณภาพระดับคอนโซล (Console-Quality) ที่รันบนเว็บเบราว์เซอร์ได้อย่างลื่นไหล โดยใช้เทคโนโลยีเว็บสมัยใหม่ล่าสุด (Next-Gen Web Tech) โดยเน้นธีมการสำรวจแบบ Cyberpunk ผ่านตัวละครสัตว์ (Stray-inspired) พร้อมระบบ Server-Side ที่แข็งแกร่ง

**แพลตฟอร์ม:** Modern Web Browsers (Chrome, Edge, Firefox, Safari) ที่รองรับ WebGL 2.0 หรือ WebGPU
**สถาปัตยกรรม:** Client-Server Architecture (Smart Client, Robust Backend)

---

## 2. สแต็คเทคโนโลยีขั้นสูง (Advanced Technology Stack)

เพื่อให้ได้ประสิทธิภาพสูงสุดและรองรับอนาคต เราจะอัปเกรดจากสแต็คพื้นฐานเป็นสแต็คระดับองค์กร (Enterprise Grade):

### 2.1 Core Engine & Rendering (Client-Side)
-   **Graphics Engine:** **Three.js** (ร่วมกับ **React Three Fiber**)
    -   *เหตุผล:* React Three Fiber (R3F) ช่วยจัดการ State ของเกมที่ซับซ้อนได้ดีกว่า Vanilla Three.js มาก และมี Ecosystem ที่ทรงพลัง
    -   **Renderer:** รองรับ **WebGPU Renderer** (Experimental) เพื่อประสิทธิภาพสูงสุด และ Fallback เป็น WebGL 2.0
-   **Language:** **TypeScript** (Strict Mode) - เพื่อความเสถียรของโค้ดและการดูแลรักษาในระยะยาว
-   **Build Tool:** **Vite** - เพื่อความรวดเร็วในการพัฒนาและ HMR (Hot Module Replacement)

### 2.2 Physics & Logic
-   **Physics Engine:** **Rapier.js (WASM)**
    -   *เหตุผล:* เร็วกว่า Cannon.js และ Ammo.js มาก เพราะรันด้วย WebAssembly (WASM) และรองรับ Multi-threading ได้ดีกว่า
-   **Game Logic:** **ECS (Entity Component System)** โดยใช้ `miniplex` หรือ `bitecs`
    -   *เหตุผล:* ประสิทธิภาพสูงกว่า OOP เมื่อมี Objects จำนวนมากในฉาก (Data-oriented design)

### 2.3 Server & Backend (Web-Based Server Integration)
-   **API Server:** **Node.js (NestJS)** หรือ **Go (Fiber)**
    -   เพื่อจัดการ User Auth, Save States, Leaderboards และ Analytics
-   **Real-time Communication:** **WebSocket (Socket.io)**
    -   สำหรับการซิงค์ข้อมูลสถานะ, Multiplayer (ถ้ามี), หรือ Anti-cheat validation
-   **Database:** **PostgreSQL** (ข้อมูลผู้เล่น) + **Redis** (Session/Cache)
-   **Storage:** **AWS S3** หรือ **Cloudflare R2** สำหรับเก็บ Assets ขนาดใหญ่ (Models, Textures)

---

## 3. สถาปัตยกรรมระบบ (System Architecture)

### 3.1 Client-Side Architecture (Frontend)
โครงสร้างแบบ ECS (Entity Component System) ผสานกับ React Components:

```
src/
├── components/          # React UI Components (HUD, Menus)
├── ecs/                 # ECS Logic
│   ├── components/      # Data Components (Position, Velocity, Health)
│   └── systems/         # Logic Systems (MovementSystem, PhysicsSystem)
├── experiences/         # 3D Scenes (R3F Components)
│   ├── World.tsx
│   ├── Player.tsx
│   └── PostProcessing.tsx
├── hooks/               # Custom Hooks (useKeyboard, useStore)
├── stores/              # Global State (Zustand/Valtio)
└── utils/               # Helpers & Asset Loaders
```

### 3.2 Server-Side Architecture (Backend)
โครงสร้างแบบ Microservices หรือ Modular Monolith:

```
server/
├── src/
│   ├── modules/
│   │   ├── auth/        # Authentication (JWT)
│   │   ├── users/       # User Profiles & Stats
│   │   ├── game-state/  # Save/Load Game Progress
│   │   └── analytics/   # Telemetry & Performance Logs
│   ├── shared/          # Shared Types/DTOs
│   └── main.ts
└── docker-compose.yml   # DB & Cache Setup
```

---

## 4. การจัดการกราฟิกขั้นสูง (High-Fidelity Graphics Plan)

### 4.1 Rendering Pipeline
ใช้เทคนิค **Deferred Rendering** หรือ **Forward+** (ถ้า WebGPU เอื้ออำนวย) เพื่อรองรับแสงจำนวนมาก

1.  **Geometry Pass:** เรนเดอร์ G-Buffer (Normal, Albedo, Depth, Roughness/Metalness)
2.  **Lighting Pass:** คำนวณแสง (Direct + Indirect)
3.  **Post-Processing Pass:** ใส่ Effects

### 4.2 Visual Features (Tiered Quality)
-   **Global Illumination (GI):** ใช้ **Voxel Cone Tracing** (แบบย่อส่วน) หรือ Pre-baked Lightmaps เพื่อแสงสมจริง
-   **Reflections:** **Screen Space Reflections (SSR)** ผสมกับ Reflection Probes
-   **Shadows:** **Cascaded Shadow Maps (CSM)** เพื่อเงาคมชัดทุกระยะ และ **Contact Shadows**
-   **Post-Effects:**
    -   Bloom (Selective)
    -   Tone Mapping (ACES Filmic)
    -   Chromatic Aberration & Vignette (Cinematic feel)
    -   Depth of Field (Dynamic focus)

### 4.3 Asset Optimization Pipeline
-   **Models:** บีบอัดด้วย **Draco** และใช้ **Meshopt**
-   **Textures:** ใช้ฟอร์แมต **KTX2** (Basis Universal) ซึ่ง GPU ถอดรหัสได้โดยตรง ลดการใช้ VRAM มหาศาล
-   **LOD (Level of Detail):** สร้าง LOD อัตโนมัติ 3 ระดับ (High, Medium, Low)

---

## 5. การปรับแต่งประสิทธิภาพ (Performance Optimization Strategy)

### 5.1 Memory Management
-   **Asset Streaming:** โหลด Assets เฉพาะที่จำเป็นตาม Zone (Chunk-based loading)
-   **Instanced Rendering:** ใช้ `InstancedMesh` สำหรับวัตถุซ้ำๆ (ต้นไม้, เศษขยะ, รั้ว)
-   **Object Pooling:** นำ Object เก่ากลับมาใช้ใหม่แทนการสร้างใหม่ (สำหรับกระสุน, Particle)

### 5.2 Web Worker Offloading
ย้ายงานหนักออกจาก Main Thread ไปยัง Web Workers:
-   **Physics Calculation:** รัน Rapier ใน Worker
-   **Pathfinding:** คำนวณเส้นทาง AI
-   **Geometry Generation:** สร้าง Mesh แบบ Procedural

---

## 6. แผนการพัฒนา (Development Roadmap)

### Phase 1: Core Foundation (Week 1-3)
- [ ] Setup Project (Vite + R3F + TypeScript)
- [ ] Setup Backend API (NestJS + Docker)
- [ ] Implement Asset Pipeline (GLTF -> Optimized GLB)
- [ ] Basic Scene & Player Controller (Rapier Physics)

### Phase 2: Gameplay Mechanics (Week 4-6)
- [ ] Implement ECS Architecture
- [ ] Player Movement (Jump, Climb, Parkour)
- [ ] Interactive Objects System
- [ ] AI Behavior Trees (Basic NPC)

### Phase 3: Visual Fidelity (Week 7-9)
- [ ] Lighting System Setup (Shadows, Environment Maps)
- [ ] Material Polish (PBR tweaking)
- [ ] Post-processing Stack Integration
- [ ] Audio System (Positional Audio)

### Phase 4: Server Integration & Optimization (Week 10-12)
- [ ] Cloud Save System implementation
- [ ] Authentication & User Accounts
- [ ] Profiling & Performance Tuning (Lighthouse/Chrome DevTools)
- [ ] WebGPU Testing & Fallbacks

---

## 7. มาตรฐานโค้ดและข้อควรระวัง (Best Practices)

1.  **Don't block the main thread:** งานคำนวณหนักๆ ต้องไปอยู่ Worker
2.  **GPU-First:** ใช้ Shader ทำงานแทน CPU ให้มากที่สุด (เช่น Animation, Particles)
3.  **Clean Code:** ใช้ ESLint + Prettier และทำตามหลัก SOLID Principles
4.  **Network Awareness:** ออกแบบให้เกมเล่นได้แม้เน็ตช้า (Optimistic UI updates)
5.  **Security:** Validate ข้อมูลที่ส่งมาจาก Client เสมอที่ฝั่ง Server (Never trust client)

---

## 8. สรุป (Conclusion)
เอกสารชุดนี้ถูกปรับปรุงโดย **Gemini Pro 3** เพื่อยกระดับมาตรฐานจาก Hobby Project เป็น **Professional Web-Based Game Architecture** โดยเน้นความยืดหยุ่น ประสิทธิภาพ และคุณภาพกราฟิกสูงสุดที่เป็นไปได้ในปัจจุบัน
