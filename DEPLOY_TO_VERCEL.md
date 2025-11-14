# Deploy to Vercel - Complete Guide

## Quick Deploy (If Already Connected to GitHub)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Vercel will auto-deploy** if your repo is connected. Check your Vercel dashboard.

## Manual Deploy via Vercel CLI

### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# From project root directory
vercel

# For production deployment
vercel --prod
```

## Required Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

### 1. Database Configuration
```
DATABASE_URL=postgresql://user:password@hostname:port/database
```
**Example (Supabase):**
```
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 2. Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Session & Security
```
SESSION_SECRET=your-random-secret-key-min-32-characters
```

### 4. Client URL (Optional - auto-detected)
```
CLIENT_URL=https://your-app.vercel.app
```

### 5. Google Callback URL (Optional - auto-generated)
```
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback
```

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs:**
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```
5. Save changes

## Verify Deployment

### 1. Check Health Endpoint
```
https://your-app.vercel.app/api/health
```
Should return: `{"status":"ok"}`

### 2. Check Auth Status
```
https://your-app.vercel.app/api/auth/status
```
Should return: `{"authenticated":false,"user":null}`

### 3. Test Google Sign-In
- Visit: `https://your-app.vercel.app/login`
- Click "Sign in with Google"
- Should redirect to Google OAuth

## Troubleshooting

### Build Fails
- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Verify `package.json` has correct build script: `"build": "vite build"`

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if Supabase database is paused (unpause it)
- Ensure database allows connections from Vercel IPs

### OAuth Redirect Errors
- Verify redirect URI in Google Cloud Console matches exactly
- Check `GOOGLE_CALLBACK_URL` in Vercel environment variables
- Ensure no trailing slashes in URLs

### 404 Errors on API Routes
- Verify `api/[...slug].ts` exists
- Check `vercel.json` configuration
- Ensure routes start with `/api/`

## Project Structure for Vercel

```
your-project/
├── api/
│   ├── [...slug].ts          # Catch-all API handler
│   ├── server.ts              # Express app
│   ├── health.ts              # Health check
│   └── auth/
│       ├── google.ts
│       ├── google/
│       │   └── callback.ts
│       ├── status.ts
│       └── logout.ts
├── src/                       # React frontend
├── dist/                      # Build output (auto-generated)
├── vercel.json                # Vercel config
├── package.json
└── vite.config.ts
```

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Google OAuth redirect URI added to Google Cloud Console
- [ ] Database is active and accessible
- [ ] Code pushed to GitHub (if using auto-deploy)
- [ ] Build completes successfully
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Google Sign-In works end-to-end

## Redeploy After Changes

```bash
# If using Vercel CLI
vercel --prod

# Or push to GitHub (if auto-deploy enabled)
git push origin main
```

## View Logs

```bash
# Via CLI
vercel logs

# Or in Vercel Dashboard
# Go to: Your Project → Deployments → Click deployment → View Function Logs
```



