# Dr. KnAI — Live Demo

Interactive platform demo for Dr. KnAI's unified multi-modal pet AI platform.

## Quick Start (Local)

```bash
npm install
npm run dev
```

## Deploy to Vercel (Easiest)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Dr. KnAI demo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/drknai-demo.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your `drknai-demo` repo
4. Vercel auto-detects Vite — just click **"Deploy"**
5. Done! You'll get a URL like `drknai-demo.vercel.app`

Every future `git push` will auto-deploy.

## Alternative: GitHub Pages (Free)

```bash
npm run build
npx gh-pages -d dist
```
Then enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch.

## Tech Stack
- React 18 + Vite
- Zero external UI libraries (all inline styles)
- Fully simulated data (no backend needed)
