import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Static files for maps
const MAPS_DIR = path.join(__dirname, '../../client/public/maps');

// Ensure maps directory exists
if (!fs.existsSync(MAPS_DIR)) {
  fs.mkdirSync(MAPS_DIR, { recursive: true });
}

// Multer config for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

/**
 * Interface สำหรับข้อมูล Map
 */
interface MapInfo {
  id: string;
  name: string;
  description: string;
  preview: string;
  scene: string;
}

/**
 * Interface สำหรับเก็บข้อมูลผู้เล่น
 */
interface PlayerData {
  id: string;
  x: number;
  y: number;
  z: number;
  lastUpdate: number;
}

// เก็บข้อมูลผู้เล่นทั้งหมดที่ Online อยู่
const players: Map<string, PlayerData> = new Map();

// ============ API ROUTES ============

app.get('/', (req, res) => {
  res.send('🎮 Stray Game Server Running');
});

/**
 * API: ดึงรายการ Maps ทั้งหมด
 */
app.get('/api/maps', (req, res) => {
  try {
    const mapsJsonPath = path.join(MAPS_DIR, 'maps.json');

    if (fs.existsSync(mapsJsonPath)) {
      const mapsData = JSON.parse(fs.readFileSync(mapsJsonPath, 'utf-8'));
      res.json(mapsData);
    } else {
      res.json({ maps: [] });
    }
  } catch (error) {
    console.error('Error loading maps:', error);
    res.status(500).json({ error: 'Failed to load maps' });
  }
});

/**
 * API: Upload Map ใหม่
 * - รับ config.json
 * - สร้างโฟลเดอร์สำหรับ map
 * - Generate preview อัตโนมัติ
 */
app.post('/api/maps/upload', upload.single('config'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const configFile = req.file;

    if (!name || !configFile) {
      return res.status(400).json({ error: 'Name and config file are required' });
    }

    // Generate unique ID
    const mapId = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + uuidv4().substring(0, 8);
    const mapDir = path.join(MAPS_DIR, mapId);

    // Create map directory
    fs.mkdirSync(mapDir, { recursive: true });

    // Parse and validate config
    let configData;
    try {
      configData = JSON.parse(configFile.buffer.toString());
    } catch {
      return res.status(400).json({ error: 'Invalid JSON config file' });
    }

    // Update config with proper ID and name
    configData.id = mapId;
    configData.name = name;

    // Save config file
    fs.writeFileSync(
      path.join(mapDir, 'config.json'),
      JSON.stringify(configData, null, 2)
    );

    // Generate preview placeholder (gradient image)
    // In production, you would use puppeteer to capture actual screenshot
    await generatePreviewPlaceholder(mapDir, name);

    // Update maps.json
    const mapsJsonPath = path.join(MAPS_DIR, 'maps.json');
    let mapsData: { maps: MapInfo[] } = { maps: [] };

    if (fs.existsSync(mapsJsonPath)) {
      mapsData = JSON.parse(fs.readFileSync(mapsJsonPath, 'utf-8'));
    }

    const newMap: MapInfo = {
      id: mapId,
      name: name,
      description: description || 'Custom map',
      preview: `/maps/${mapId}/preview.png`,
      scene: `/maps/${mapId}/config.json`
    };

    mapsData.maps.push(newMap);
    fs.writeFileSync(mapsJsonPath, JSON.stringify(mapsData, null, 2));

    console.log(`✅ Map uploaded: ${name} (${mapId})`);

    res.json({
      success: true,
      map: newMap,
      message: 'Map uploaded successfully! Preview will be generated when the map is first loaded.'
    });

  } catch (error) {
    console.error('Error uploading map:', error);
    res.status(500).json({ error: 'Failed to upload map' });
  }
});

/**
 * API: รับ screenshot จาก client เพื่อ update preview
 * Client จะ capture screenshot หลังจากโหลด map ครั้งแรก
 */
app.post('/api/maps/:mapId/preview', upload.single('preview'), (req, res) => {
  try {
    const { mapId } = req.params;
    const previewFile = req.file;

    if (!previewFile) {
      return res.status(400).json({ error: 'Preview image is required' });
    }

    const mapDir = path.join(MAPS_DIR, mapId);

    if (!fs.existsSync(mapDir)) {
      return res.status(404).json({ error: 'Map not found' });
    }

    // Save preview image
    fs.writeFileSync(
      path.join(mapDir, 'preview.png'),
      previewFile.buffer
    );

    console.log(`📸 Preview updated for map: ${mapId}`);
    res.json({ success: true });

  } catch (error) {
    console.error('Error updating preview:', error);
    res.status(500).json({ error: 'Failed to update preview' });
  }
});

/**
 * API: ลบ Map
 */
app.delete('/api/maps/:mapId', (req, res) => {
  try {
    const { mapId } = req.params;
    const mapDir = path.join(MAPS_DIR, mapId);

    if (!fs.existsSync(mapDir)) {
      return res.status(404).json({ error: 'Map not found' });
    }

    // Remove map directory
    fs.rmSync(mapDir, { recursive: true });

    // Update maps.json
    const mapsJsonPath = path.join(MAPS_DIR, 'maps.json');
    if (fs.existsSync(mapsJsonPath)) {
      const mapsData = JSON.parse(fs.readFileSync(mapsJsonPath, 'utf-8'));
      mapsData.maps = mapsData.maps.filter((m: MapInfo) => m.id !== mapId);
      fs.writeFileSync(mapsJsonPath, JSON.stringify(mapsData, null, 2));
    }

    console.log(`🗑️ Map deleted: ${mapId}`);
    res.json({ success: true });

  } catch (error) {
    console.error('Error deleting map:', error);
    res.status(500).json({ error: 'Failed to delete map' });
  }
});

// API: ดึงรายชื่อผู้เล่นทั้งหมด
app.get('/api/players', (req, res) => {
  res.json(Array.from(players.values()));
});

// ============ SOCKET.IO ============

io.on('connection', (socket) => {
  console.log('✅ Player connected:', socket.id);

  players.set(socket.id, {
    id: socket.id,
    x: 0,
    y: 0,
    z: 0,
    lastUpdate: Date.now()
  });

  socket.emit('players:list', Array.from(players.values()));
  socket.broadcast.emit('player:joined', { id: socket.id });

  socket.on('disconnect', () => {
    console.log('❌ Player disconnected:', socket.id);
    players.delete(socket.id);
    socket.broadcast.emit('player:left', { id: socket.id });
  });

  socket.on('player:position', (data: { x: number; y: number; z: number }) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      player.z = data.z;
      player.lastUpdate = Date.now();

      socket.broadcast.emit('player:update', {
        id: socket.id,
        x: data.x,
        y: data.y,
        z: data.z
      });
    }
  });

  socket.on('ping', () => {
    socket.emit('pong', Date.now());
  });
});

// ============ HELPER FUNCTIONS ============

/**
 * Generate placeholder preview image
 * สร้างรูป preview แบบ placeholder (สี gradient)
 * ในการใช้งานจริง ควรใช้ puppeteer capture screenshot จากเกม
 */
async function generatePreviewPlaceholder(mapDir: string, mapName: string): Promise<void> {
  // Create a simple SVG as placeholder
  const svg = `
    <svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="45%" font-family="Arial" font-size="32" fill="#00ffff" text-anchor="middle">
        🗺️
      </text>
      <text x="50%" y="60%" font-family="Arial" font-size="24" fill="#ffffff" text-anchor="middle">
        ${mapName}
      </text>
      <text x="50%" y="75%" font-family="Arial" font-size="14" fill="#888888" text-anchor="middle">
        Preview will update on first play
      </text>
    </svg>
  `;

  fs.writeFileSync(path.join(mapDir, 'preview.svg'), svg);

  // Also create a simple PNG placeholder using a data URL approach
  // For real PNG generation, you'd need sharp or canvas library
  // For now, we'll use the SVG and client will handle it
  fs.copyFileSync(
    path.join(mapDir, 'preview.svg'),
    path.join(mapDir, 'preview.png')
  );
}

// ============ START SERVER ============

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Maps directory: ${MAPS_DIR}`);
});
