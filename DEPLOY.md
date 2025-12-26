# 🎮 ZENKO - Cyberpunk Adventure

A multiplayer 3D browser game built with React Three Fiber and Socket.IO.

## 🚀 Deploy to Railway (Free)

### Step 1: Push to GitHub
First, make sure your code is pushed to a GitHub repository.

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app) and sign up with your GitHub account
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your Stray repository
4. Railway will automatically detect the configuration and start deploying!

### Step 3: Wait for Build
- Railway will install dependencies, build the client, and start the server
- This takes about 2-5 minutes the first time
- You can watch the build progress in the Railway dashboard

### Step 4: Get Your URL
- Once deployed, Railway provides you a URL like `https://your-app-name.up.railway.app`
- Share this link with your friends to play together!

## 💻 Local Development

### Prerequisites
- Node.js 18 or higher
- npm

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
# Run both client and server
npm run dev
```

Or run them separately:
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 🎯 Game Controls

- **WASD** - Move
- **Space** - Jump
- **Mouse** - Look around
- **E** - Interact

## 🛠 Tech Stack

- **Client**: React, Three.js (React Three Fiber), Vite, TypeScript
- **Server**: Node.js, Express, Socket.IO
- **Physics**: Rapier

## 📁 Project Structure

```
Stray/
├── client/          # React frontend
│   ├── src/         # Source files
│   ├── public/      # Static assets
│   └── dist/        # Production build
├── server/          # Node.js backend
│   ├── src/         # Source files
│   └── dist/        # Production build
├── package.json     # Root package (for deployment)
├── railway.json     # Railway configuration
└── nixpacks.toml    # Build configuration
```

## 🌐 Environment Variables

### Client (Vite)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SERVER_URL` | WebSocket server URL | `http://localhost:3000` |
| `VITE_OFFLINE_MODE` | Run without server | `false` |

### Server
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |

---

Made with ❤️ for fun!
