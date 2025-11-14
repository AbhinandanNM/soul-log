# Complete Setup Guide: Localhost → Vercel

This guide will walk you through setting up Soul Log on localhost first, then deploying to Vercel.

---

## 🏠 PART 1: LOCALHOST SETUP

### Step 1: Install Prerequisites

1. **Node.js 18+**: [Download here](https://nodejs.org/)
   ```bash
   node --version  # Should show v18 or higher
   ```

2. **PostgreSQL Database** (choose one):
   - **Option A: Cloud Database (Easiest - Recommended)**
     - [Supabase](https://supabase.com) - Free tier
     - [Neon](https://neon.tech) - Free tier
     - [Railway](https://railway.app) - Free tier
   - **Option B: Local PostgreSQL**
     - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
     - macOS: `brew install postgresql && brew services start postgresql`
     - Linux: `sudo apt install postgresql postgresql-contrib`

### Step 2: Get Database Connection String

#### If using Cloud Database (Supabase/Neon/Railway):
1. Create a new project
2. Go to Settings → Database
3. Copy the **Connection String** (URI format)
   - Example: `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

#### If using Local PostgreSQL:
1. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE soul_log;
   \q
   ```
2. Connection string format:
   ```
   postgresql://postgres:your_password@localhost:5432/soul_log
   ```

### Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: "Soul Log Local"
   - **Authorized redirect URIs**: `http://localhost:4000/auth/google/callback`
   - Click **Create**
5. Copy the **Client ID** and **Client Secret**

### Step 4: Install Dependencies

Open terminal in the project root:

```bash
# Install frontend dependencies
cd thought-retrace-main
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 5: Create Environment Files

#### Backend Environment (`server/.env`)

Create `server/.env` file:

```env
# Database Connection
DATABASE_URL=postgresql://user:password@host:5432/database_name
# For cloud databases, add SSL:
PGSSLMODE=require

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Security (generate random string)
SESSION_SECRET=your-random-secret-key-here

# URLs
CLIENT_URL=http://localhost:5173
PORT=4000
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Environment (`.env`)

Create `.env` file in `thought-retrace-main` directory:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### Step 6: Initialize Database

```bash
cd server
npm run setup:db
```

This will create the necessary tables automatically.

### Step 7: Start the Application

You need **TWO terminal windows**:

#### Terminal 1: Backend Server
```bash
cd server
npm run dev
```

✅ Backend should be running on **http://localhost:4000**

#### Terminal 2: Frontend
```bash
cd thought-retrace-main
npm run dev
```

✅ Frontend should be running on **http://localhost:5173**

### Step 8: Test Localhost

1. Open browser: **http://localhost:5173**
2. Click "Sign in with Google"
3. Complete Google authentication
4. You should be redirected back and logged in!

---

## 🚀 PART 2: VERCEL DEPLOYMENT

Once localhost is working, follow these steps to deploy to Vercel.

### Step 1: Prepare Your Code

1. **Ensure everything works on localhost first!**
2. **Commit your code to Git:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   ```

3. **Push to GitHub** (if not already):
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in (use GitHub for easier integration)
3. Connect your GitHub account

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Click **Add New Project**
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `thought-retrace-main` (or leave blank if project is in root)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)
4. **DON'T CLICK DEPLOY YET!** First add environment variables (Step 4)

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
cd thought-retrace-main
vercel

# For production
vercel --prod
```

### Step 4: Configure Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**, add:

#### Required Variables:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

```env
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

```env
SESSION_SECRET=your-random-session-secret
```
*(Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)*

```env
CLIENT_URL=https://your-app-name.vercel.app
```
*(You'll update this after first deployment with your actual URL)*

```env
NODE_ENV=production
```

#### Optional (but recommended):

```env
GOOGLE_CALLBACK_URL=https://your-app-name.vercel.app/api/auth/google/callback
```

```env
PGSSLMODE=require
```

**Important:**
- Set these for **Production**, **Preview**, and **Development** environments
- Use the same `SESSION_SECRET` as localhost (or generate a new one)
- You can use the same database as localhost or create a separate one

### Step 5: Deploy

1. Click **Deploy** in Vercel dashboard
2. Wait for build to complete (2-5 minutes)
3. Note your deployment URL: `https://your-app-name.vercel.app`

### Step 6: Update Google OAuth for Production

1. Go back to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/google/callback
   ```
   *(Replace `your-app-name` with your actual Vercel URL)*
5. **Keep localhost URI too** (so both work):
   ```
   http://localhost:4000/auth/google/callback
   https://your-app-name.vercel.app/api/auth/google/callback
   ```
6. Save changes

### Step 7: Update Vercel Environment Variables

After deployment, update these in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Update `CLIENT_URL` to your actual Vercel URL:
   ```
   CLIENT_URL=https://your-app-name.vercel.app
   ```
3. Update `GOOGLE_CALLBACK_URL`:
   ```
   GOOGLE_CALLBACK_URL=https://your-app-name.vercel.app/api/auth/google/callback
   ```
4. **Redeploy** after updating:
   - Go to **Deployments**
   - Click **...** on latest deployment
   - Click **Redeploy**

### Step 8: Test Vercel Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Test health endpoint: `https://your-app-name.vercel.app/api/health`
   - Should return: `{"status":"ok"}`
3. Test auth status: `https://your-app-name.vercel.app/api/auth/status`
   - Should return: `{"authenticated":false,"user":null}`
4. Test Google Sign-In:
   - Click "Sign in with Google"
   - Should redirect to Google OAuth
   - After authentication, should redirect back to your app

---

## 🔄 WORKFLOW: Localhost + Vercel

### Development Workflow

1. **Develop locally** on `http://localhost:5173`
2. **Test changes** before deploying
3. **Commit and push** to GitHub
4. **Vercel auto-deploys** (if connected to GitHub)
   - Or manually: `vercel --prod`

### Using Different Databases

- **Localhost**: Use one database (local or cloud)
- **Vercel**: Can use the same database or a separate one
- **Recommendation**: Use the same cloud database for both (easier to manage)

### Environment Variables Strategy

**Localhost:**
- `server/.env` - Backend config
- `.env` - Frontend config

**Vercel:**
- All in Vercel Dashboard → Environment Variables
- Same variable names, different values for URLs

---

## ✅ CHECKLIST

### Localhost Setup
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database set up (cloud or local)
- [ ] Google OAuth credentials created
- [ ] `server/.env` file created with all variables
- [ ] `.env` file created in root with `VITE_API_BASE_URL`
- [ ] Dependencies installed (`npm install` in both directories)
- [ ] Database initialized (`npm run setup:db`)
- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Google Sign-In works on localhost

### Vercel Deployment
- [ ] Code committed and pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] All environment variables added to Vercel
- [ ] First deployment successful
- [ ] Google OAuth redirect URI updated with Vercel URL
- [ ] Environment variables updated with actual Vercel URL
- [ ] Redeployed after environment variable updates
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Google Sign-In works on Vercel

---

## 🐛 TROUBLESHOOTING

### Localhost Issues

**Backend won't start:**
- Check `server/.env` has all required variables
- Verify PostgreSQL is running (if local)
- Check port 4000 is not in use

**Frontend can't connect:**
- Verify `VITE_API_BASE_URL=http://localhost:4000` in root `.env`
- Ensure backend is running
- Check browser console for errors

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- For cloud: add `PGSSLMODE=require`
- Check database is not paused (Supabase)

**Google OAuth fails:**
- Verify redirect URI: `http://localhost:4000/auth/google/callback`
- Check Client ID and Secret are correct

### Vercel Issues

**Build fails:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Check `vercel.json` configuration

**Database connection errors:**
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check database allows connections from Vercel
- Ensure database is not paused

**OAuth redirect errors:**
- Verify redirect URI in Google Console matches exactly
- Check `GOOGLE_CALLBACK_URL` in Vercel env vars
- No trailing slashes in URLs

**404 on API routes:**
- Verify `api/[...slug].ts` exists
- Check `vercel.json` rewrites configuration
- Ensure routes start with `/api/`

**Environment variables not working:**
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)
- Verify variables set for correct environment (Production/Preview)

---

## 📚 ADDITIONAL RESOURCES

- **Database Setup**: See `DATABASE_SETUP.md`
- **Vercel Deployment**: See `DEPLOY_TO_VERCEL.md` or `VERCEL_DEPLOYMENT.md`
- **Server README**: See `server/README.md`
- **Main README**: See `README.md`

---

## 🎉 SUCCESS!

Once both localhost and Vercel are working:

- ✅ Develop locally at `http://localhost:5173`
- ✅ Deploy to production at `https://your-app.vercel.app`
- ✅ Both use the same codebase
- ✅ Both can share the same database
- ✅ Google OAuth works in both environments

Happy coding! 🚀


