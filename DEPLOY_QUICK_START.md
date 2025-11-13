# Quick Start: Deploy to Vercel

## 🚀 Quick Deployment Steps

### 1. Install Dependencies

```bash
cd thought-retrace-main
npm install
```

### 2. Prepare Database

Get a PostgreSQL connection string from:
- **Supabase**: https://supabase.com (free tier available)
- **Neon**: https://neon.tech (free tier available)  
- **Railway**: https://railway.app (free tier available)

### 3. Push to GitHub

```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 4. Deploy to Vercel

**Option A: Via Dashboard (Easiest)**
1. Go to https://vercel.com
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect Vite
5. Configure:
   - **Root Directory**: Leave as is (or set to `thought-retrace-main` if deploying from root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**

**Option B: Via CLI**
```bash
npm i -g vercel
vercel
```

### 5. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=<generate-with-node-crypto>
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Update Google OAuth

1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add redirect URI: `https://your-app.vercel.app/api/auth/google/callback`
4. Save

### 7. Redeploy

After setting environment variables, redeploy:
- Vercel Dashboard → Deployments → Click "..." → Redeploy

### 8. Test

Visit `https://your-app.vercel.app` and test sign-in!

---

## 📝 Files Created for Vercel

- ✅ `vercel.json` - Vercel configuration
- ✅ `api/server.ts` - Express server adapted for Vercel
- ✅ `api/[...slug].ts` - Catch-all API route handler
- ✅ Updated `src/contexts/AuthContext.tsx` - Uses `/api` prefix in production
- ✅ Updated `package.json` - Added server dependencies
- ✅ `.vercelignore` - Excludes unnecessary files

---

## 🔧 Important Notes

- **API Routes**: All API routes are prefixed with `/api` on Vercel
- **Frontend**: Served from `dist` directory after build
- **Database**: Must be accessible from Vercel's IPs (cloud databases handle this)
- **Sessions**: Stored in PostgreSQL via `connect-pg-simple`

---

## 🆘 Need Help?

See `VERCEL_DEPLOYMENT.md` for detailed troubleshooting guide.

