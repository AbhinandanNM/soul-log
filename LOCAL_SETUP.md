# Local Development Setup Guide

This guide will help you run Soul Log on your local machine.

## Prerequisites

Before starting, make sure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **PostgreSQL 14+** installed OR a cloud database account (Supabase, Neon, Railway)
- **Google OAuth credentials** (see Google OAuth setup below)

## Step 1: Install Dependencies

### Frontend Dependencies
```bash
cd thought-retrace-main
npm install
```

### Backend Dependencies
```bash
cd server
npm install
```

## Step 2: Set Up Database

Choose one of these options:

### Option A: Cloud Database (Easiest - Recommended)

1. **Supabase** (Free tier):
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings → Database
   - Copy the connection string (URI format)

2. **Neon** (Free tier):
   - Go to [https://neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

### Option B: Local PostgreSQL

1. Install PostgreSQL:
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql && brew services start postgresql`
   - Linux: `sudo apt install postgresql postgresql-contrib`

2. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE soul_log;
   \q
   ```

3. Connection string format:
   ```
   postgresql://postgres:your_password@localhost:5432/soul_log
   ```

## Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:4000/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

### Backend Configuration (`server/.env`)

Create a file `server/.env` with:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database_name
# For cloud databases, add SSL:
PGSSLMODE=require

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Security (generate a random string)
SESSION_SECRET=your-random-secret-key-here

# URLs
CLIENT_URL=http://localhost:5173
PORT=4000
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Configuration (`.env`)

Create a file `.env` in the root `thought-retrace-main` directory:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Step 5: Initialize Database

Run the database setup script:

```bash
cd server
npm run setup:db
```

This will create the necessary tables automatically.

## Step 6: Start the Application

You need **two terminal windows**:

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```

The backend will run on **http://localhost:4000**

### Terminal 2: Frontend
```bash
cd thought-retrace-main
npm run dev
```

The frontend will run on **http://localhost:5173** (or port 8080 if configured differently)

## Step 7: Access the Application

1. Open your browser and go to: **http://localhost:5173**
2. Click "Sign in with Google"
3. You should be redirected to Google for authentication
4. After signing in, you'll be redirected back to the app

## Troubleshooting

### Backend won't start
- Check that all environment variables in `server/.env` are set correctly
- Verify PostgreSQL is running (if using local database)
- Check that port 4000 is not already in use

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL=http://localhost:4000` in root `.env`
- Make sure backend is running on port 4000
- Check browser console for CORS errors

### Database connection errors
- Verify `DATABASE_URL` is correct
- For cloud databases, ensure `PGSSLMODE=require` is set
- Check that database exists and credentials are correct

### Google OAuth errors
- Verify redirect URI matches exactly: `http://localhost:4000/auth/google/callback`
- Check that Google Client ID and Secret are correct
- Ensure Google+ API is enabled in Google Cloud Console

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database set up (local or cloud)
- [ ] Google OAuth credentials created
- [ ] `server/.env` file created with all variables
- [ ] `.env` file created in root with `VITE_API_BASE_URL`
- [ ] Dependencies installed (`npm install` in both directories)
- [ ] Database initialized (`npm run setup:db` in server)
- [ ] Backend running (`npm run dev` in server)
- [ ] Frontend running (`npm run dev` in root)

## Need Help?

- Check `DATABASE_SETUP.md` for detailed database setup
- Check `server/README.md` for backend-specific details
- Check main `README.md` for project overview


