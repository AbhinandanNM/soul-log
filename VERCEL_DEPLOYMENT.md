# Deploying Soul Log to Vercel

This guide will help you deploy your Soul Log application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (use Supabase, Neon, or Railway for cloud PostgreSQL)
3. Google OAuth credentials configured
4. Vercel CLI installed (optional): `npm i -g vercel`

## Step 1: Prepare Your Database

### Option A: Use Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Get your database connection string from Project Settings → Database
4. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option B: Use Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string from the dashboard

### Option C: Use Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new PostgreSQL database
3. Copy the connection string

**Important**: Make sure your database allows connections from Vercel's IP addresses. Most cloud providers do this automatically.

## Step 2: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID and click **Edit**
4. Add these to **Authorized redirect URIs**:
   - `https://your-app-name.vercel.app/api/auth/google/callback`
   - (You'll update this with your actual Vercel URL after deployment)
5. Save the changes

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New Project**
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `thought-retrace-main` (or leave blank if in root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Navigate to your project root:
   ```bash
   cd thought-retrace-main
   ```

3. Run:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

## Step 4: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

### Required Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-random-session-secret
CLIENT_URL=https://your-app-name.vercel.app
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://your-app-name.vercel.app/api/auth/google/callback
```

### Optional Variables:

```
PGSSLMODE=require
```

### Generate SESSION_SECRET:

Run this command to generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important Notes:**
- Replace `your-app-name.vercel.app` with your actual Vercel deployment URL
- The `CLIENT_URL` should match your Vercel deployment URL
- Use the full PostgreSQL connection string including `?sslmode=require` for cloud databases
- Make sure all environment variables are set for **Production**, **Preview**, and **Development** environments if needed

## Step 5: Update Google OAuth with Production URL

After deployment, you'll get a URL like `https://your-app-name.vercel.app`:

1. Go back to Google Cloud Console
2. Update the **Authorized redirect URI** to:
   ```
   https://your-app-name.vercel.app/api/auth/google/callback
   ```
3. Save the changes

## Step 6: Redeploy After Environment Variables

After adding environment variables:

1. Go to your Vercel project dashboard
2. Click **Deployments**
3. Click the **...** menu on the latest deployment
4. Click **Redeploy**

Or trigger a new deployment by pushing to your repository.

## Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Try signing in with Google
3. Verify authentication works
4. Test protected routes (like `/journal`)

## Troubleshooting

### Database Connection Issues

- **Error**: "Connection refused" or "Connection timeout"
  - **Solution**: Ensure your database allows connections from Vercel's IPs. Most cloud providers handle this automatically, but check your firewall settings.

- **Error**: "SSL required"
  - **Solution**: Add `?sslmode=require` to your DATABASE_URL

### OAuth Redirect URI Mismatch

- **Error**: "redirect_uri_mismatch"
  - **Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
    ```
    https://your-app-name.vercel.app/api/auth/google/callback
    ```
    (No trailing slash!)

### Session Issues

- **Error**: Sessions not persisting
  - **Solution**: 
    - Check that `SESSION_SECRET` is set and matches between deployments
    - Verify cookie settings in `api/server.ts`
    - Ensure database session table exists (it's auto-created)

### Build Errors

- **Error**: Build fails
  - **Solution**: 
    - Check that all dependencies are in `package.json`
    - Verify build command: `npm run build`
    - Check build logs in Vercel dashboard

### Environment Variables Not Working

- **Error**: "Missing environment variable"
  - **Solution**:
    - Make sure variables are added in Vercel dashboard
    - Redeploy after adding variables
    - Check variable names match exactly (case-sensitive)
    - Verify variables are set for the correct environment (Production/Preview/Development)

## Custom Domain (Optional)

1. Go to **Settings** → **Domains** in your Vercel project
2. Add your custom domain
3. Follow DNS setup instructions
4. Update `CLIENT_URL` and `GOOGLE_CALLBACK_URL` environment variables to use your custom domain

## Monitoring

- View deployment logs in Vercel dashboard
- Check function logs in **Functions** tab
- Monitor database connections in your database provider's dashboard

## Cost Considerations

- Vercel: Free tier includes 100GB bandwidth and unlimited deployments
- PostgreSQL: Free tiers available on Supabase, Neon, and Railway
- Google OAuth: Free for standard usage

## Next Steps

- Set up automatic deployments from your Git repository
- Configure preview deployments for pull requests
- Add custom domain
- Set up monitoring and alerts
- Configure environment-specific settings (dev/staging/prod)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check function logs in Vercel dashboard
3. Verify all environment variables are set correctly
4. Test database connection independently
5. Verify Google OAuth configuration

Happy deploying! 🚀

