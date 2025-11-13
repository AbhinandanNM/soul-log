# Deploy to Vercel - Step by Step Guide

## 🚀 Quick Deployment Steps

### Step 1: Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** (or **Log In** if you already have an account)
3. Choose **Continue with GitHub** (recommended - easier to connect repositories)

### Step 2: Import Your GitHub Repository

1. After logging in, click **Add New Project** (or **Import Project**)
2. You'll see a list of your GitHub repositories
3. Find your repository (e.g., `soul-log` or whatever you named it)
4. Click **Import** next to your repository

### Step 3: Configure Project Settings

Vercel will auto-detect your project settings, but verify:

- **Framework Preset**: Should be **Vite** (auto-detected)
- **Root Directory**: 
  - If your repo root is `thought-retrace-main`, set it to `thought-retrace-main`
  - If your repo root is already the project, leave it blank (`.`)
- **Build Command**: `npm run build` (should be auto-filled)
- **Output Directory**: `dist` (should be auto-filled)
- **Install Command**: `npm install` (should be auto-filled)

**Important**: 
- If your GitHub repo structure is:
  ```
  your-repo/
    thought-retrace-main/
      src/
      package.json
      ...
  ```
  Then set **Root Directory** to `thought-retrace-main`

- If your GitHub repo structure is:
  ```
  your-repo/
    src/
    package.json
    ...
  ```
  Then leave **Root Directory** blank (`.`)

### Step 4: Add Environment Variables

**BEFORE clicking Deploy**, click **Environment Variables** to add:

#### Required Environment Variables:

```
DATABASE_URL
```
Value: Your PostgreSQL connection string
Example: `postgresql://user:password@host:5432/database?sslmode=require`

```
GOOGLE_CLIENT_ID
```
Value: Your Google OAuth Client ID
Example: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`

```
GOOGLE_CLIENT_SECRET
```
Value: Your Google OAuth Client Secret
Example: `GOCSPX-YourSecretKeyHere123456789`

```
SESSION_SECRET
```
Value: A random secret string (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

```
CLIENT_URL
```
Value: Your Vercel deployment URL (you'll get this after first deploy)
Example: `https://your-app-name.vercel.app`

```
NODE_ENV
```
Value: `production`

#### Optional Environment Variables:

```
GOOGLE_CALLBACK_URL
```
Value: `https://your-app-name.vercel.app/api/auth/google/callback`
(Update this after you get your Vercel URL)

```
PGSSLMODE
```
Value: `require` (for cloud databases)

**How to Add:**
1. Click **Add** for each variable
2. Enter the **Name** and **Value**
3. Select environments: **Production**, **Preview**, **Development** (or just Production)
4. Click **Save**
5. Repeat for each variable

### Step 5: Deploy!

1. After adding environment variables, click **Deploy**
2. Vercel will start building your project
3. Wait for the build to complete (usually 1-3 minutes)
4. You'll see your deployment URL when it's done: `https://your-app-name.vercel.app`

### Step 6: Update Environment Variables with Your URL

After deployment, you'll get a URL like `https://your-app-name.vercel.app`:

1. Go to **Settings** → **Environment Variables**
2. Update `CLIENT_URL` to: `https://your-app-name.vercel.app`
3. Update `GOOGLE_CALLBACK_URL` to: `https://your-app-name.vercel.app/api/auth/google/callback`
4. Click **Save**
5. Go to **Deployments** tab
6. Click the **...** menu on the latest deployment
7. Click **Redeploy**

### Step 7: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID and click **Edit**
4. In **Authorized redirect URIs**, add:
   ```
   https://your-app-name.vercel.app/api/auth/google/callback
   ```
   (Replace `your-app-name` with your actual Vercel URL)
5. Click **Save**

### Step 8: Test Your Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Try signing in with Google
3. Verify authentication works
4. Test protected routes (like `/journal`)

---

## 📋 Checklist

- [ ] Code pushed to GitHub
- [ ] Signed up/Logged in to Vercel
- [ ] Imported GitHub repository
- [ ] Configured project settings (Root Directory, Build Command, etc.)
- [ ] Added environment variables:
  - [ ] DATABASE_URL
  - [ ] GOOGLE_CLIENT_ID
  - [ ] GOOGLE_CLIENT_SECRET
  - [ ] SESSION_SECRET
  - [ ] CLIENT_URL (update after first deploy)
  - [ ] NODE_ENV
- [ ] Deployed to Vercel
- [ ] Updated CLIENT_URL and GOOGLE_CALLBACK_URL with Vercel URL
- [ ] Updated Google OAuth redirect URI
- [ ] Tested deployment

---

## 🎯 Quick Command Reference

### Generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Get PostgreSQL Connection String:
- **Supabase**: Project Settings → Database → Connection string
- **Neon**: Dashboard → Connection string
- **Railway**: Database → Connect → Connection string

---

## 🔍 Troubleshooting

### Build Fails

**Error**: "Build command failed"
- Check build logs in Vercel dashboard
- Verify `package.json` has all dependencies
- Check that Root Directory is correct

**Solution**: 
1. Check build logs for specific error
2. Test build locally: `npm run build`
3. Fix any errors and push to GitHub (auto-redeploys)

### Environment Variables Not Working

**Error**: "Missing environment variable"
- Verify all variables are added in Vercel
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

**Solution**:
1. Go to Settings → Environment Variables
2. Verify all variables are present
3. Redeploy the project

### Database Connection Fails

**Error**: "Connection refused" or "Connection timeout"
- Verify DATABASE_URL is correct
- Check database allows connections from Vercel
- Ensure SSL is enabled (`?sslmode=require`)

**Solution**:
1. Verify DATABASE_URL format: `postgresql://user:pass@host:5432/db?sslmode=require`
2. Check database firewall settings (most cloud providers allow all by default)
3. Test connection string independently

### OAuth Redirect URI Mismatch

**Error**: "redirect_uri_mismatch"
- Verify redirect URI in Google Cloud Console matches Vercel URL
- Check GOOGLE_CALLBACK_URL environment variable

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client ID
3. Add redirect URI: `https://your-app.vercel.app/api/auth/google/callback`
4. Save changes
5. Try again

### Sessions Not Working

**Error**: Sessions not persisting
- Check SESSION_SECRET is set
- Verify database session table exists (auto-created)
- Check cookie settings

**Solution**:
1. Verify SESSION_SECRET is set in environment variables
2. Check database has `session` table (auto-created on first request)
3. Verify DATABASE_URL is correct

---

## 🎉 Success!

Once deployed, your app will be live at:
```
https://your-app-name.vercel.app
```

### Features:
- ✅ Automatic deployments on every Git push
- ✅ Preview deployments for pull requests
- ✅ Custom domain support
- ✅ SSL/HTTPS included
- ✅ Global CDN
- ✅ Serverless functions

---

## 📚 Next Steps

1. **Set up automatic deployments**: Already done! Every push to main branch auto-deploys
2. **Add custom domain**: Settings → Domains → Add domain
3. **Monitor deployments**: View logs in Vercel dashboard
4. **Set up preview deployments**: Automatically creates preview URLs for pull requests

---

## 💡 Pro Tips

1. **Environment-specific variables**: Set different values for Production, Preview, and Development
2. **Preview deployments**: Test changes in pull requests before merging
3. **Custom domains**: Add your own domain in Settings → Domains
4. **Monitoring**: Check function logs in Vercel dashboard for debugging
5. **Performance**: Vercel automatically optimizes your app (CDN, caching, etc.)

Happy deploying! 🚀

