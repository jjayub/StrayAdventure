# 🎮 ZENKO - Cyberpunk Adventure

A multiplayer 3D browser game built with React Three Fiber and Socket.IO.

---

## 🚀 Deploy to Render (FREE)

### Step 1: Push Your Code to GitHub

If you don't have a GitHub account, create one at [github.com](https://github.com).

**If your code is already on GitHub**, skip to Step 2.

**If not**, run these commands in Terminal:

```bash
# Go to your project folder
cd /Users/jjayub/Desktop/test_project/Stray

# Create a new commit with all changes
git add .
git commit -m "Ready for Render deployment"

# Push to GitHub (if remote exists)
git push
```

**If you don't have a GitHub repository yet:**
1. Go to [github.com/new](https://github.com/new)
2. Name it `stray-game` (or any name you like)
3. Keep it **Public**
4. **Don't** add README, .gitignore, or license
5. Click **Create repository**
6. Follow the commands GitHub shows you

---

### Step 2: Deploy on Render

1. **Go to** [render.com](https://render.com)
2. **Click "Get Started for Free"** and sign up with your GitHub account
3. **Click "New +"** (top right) → Select **"Web Service"**
4. **Connect your GitHub** if not already connected
5. **Find and select** your game repository
6. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `stray-game` (or any name) |
   | **Region** | Singapore (closest to you) |
   | **Branch** | `main` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` |

7. **Click "Create Web Service"**

---

### Step 3: Wait for Deployment

- Render will build your project (takes 3-5 minutes)
- Watch the logs for any errors
- Once you see "Your service is live", you're done!

---

### Step 4: Get Your Game URL 🎉

Your game will be available at:
```
https://stray-game.onrender.com
```
(The exact URL will be shown in your Render dashboard)

**Share this URL with your friends to play together!**

---

## ⚠️ Important Notes About Free Tier

### Sleep Mode
- Your game will **sleep after 15 minutes** of no activity
- When someone visits, it **wakes up in about 30 seconds**
- This is normal for the free tier!

### Usage Limits
- **750 free hours per month** (plenty for casual gaming)
- If you run out, the game stops until next month

### Keep It Awake (Optional)
If you want the game to stay awake longer, you can use a free service like [cron-job.org](https://cron-job.org) to ping your URL every 10 minutes.

---

## 💻 Local Development

### Prerequisites
- Node.js 18 or higher
- npm

### Install & Run
```bash
# Install dependencies
npm install

# Run both client and server in development mode
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

Then open http://localhost:3000 in your browser.

---

## 🎯 Game Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move |
| **Space** | Jump |
| **Mouse** | Look around |
| **E** | Interact |

---

## 🛠 Tech Stack

- **Client**: React, Three.js (React Three Fiber), Vite, TypeScript
- **Server**: Node.js, Express, Socket.IO
- **Physics**: Rapier

---

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
├── render.yaml      # Render configuration
└── DEPLOY.md        # This file
```

---

Made with ❤️ for fun!
