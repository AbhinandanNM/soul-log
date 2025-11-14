# Quick Start Guide

## 🚀 Fastest Path to Running Locally

### 1. Install Dependencies (2 minutes)

```bash
# Frontend
cd thought-retrace-main
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Set Up Database (5 minutes)

**Easiest option: Use Supabase (Free)**

1. Go to https://supabase.com → Sign up
2. Create new project
3. Go to Settings → Database
4. Copy the **Connection string (URI)**

### 3. Get Google OAuth (5 minutes)

1. Go to https://console.cloud.google.com
2. Create project → Enable Google+ API
3. Create OAuth 2.0 Client ID (Web application)
4. Add redirect: `http://localhost:4000/auth/google/callback`
5. Copy Client ID and Secret

### 4. Create Environment Files (2 minutes)

#### Create `server/.env`:
```env
DATABASE_URL=your-supabase-connection-string-here
PGSSLMODE=require
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=generate-with-command-below
CLIENT_URL=http://localhost:5173
PORT=4000
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Create `.env` in root:
```env
VITE_API_BASE_URL=http://localhost:4000
```

### 5. Initialize Database (1 minute)

```bash
cd server
npm run setup:db
cd ..
```

### 6. Start Both Servers (1 minute)

**Terminal 1:**
```bash
cd server
npm run dev
```

**Terminal 2:**
```bash
cd thought-retrace-main
npm run dev
```

### 7. Open Browser

Visit: **http://localhost:5173** 🎉

---

## 📋 Environment Variables Reference

### `server/.env` (Backend)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
PGSSLMODE=require
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
SESSION_SECRET=xxx
CLIENT_URL=http://localhost:5173
PORT=4000
```

### `.env` (Frontend - in root)
```env
VITE_API_BASE_URL=http://localhost:4000
```

---

## 🚀 Deploy to Vercel (After Localhost Works)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel"
   git push
   ```

2. **Deploy on Vercel:**
   - Go to vercel.com
   - Import GitHub repo
   - Add environment variables (same as `server/.env` but with production URLs)
   - Deploy!

3. **Update Google OAuth:**
   - Add redirect URI: `https://your-app.vercel.app/api/auth/google/callback`

See `COMPLETE_SETUP_GUIDE.md` for detailed instructions!


