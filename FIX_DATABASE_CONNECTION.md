# Fix Database Connection Error

## The Problem
Your app can't connect to Supabase database. This usually means:
1. **Database is paused** (most common on free tier)
2. **Wrong connection string** in Vercel
3. **Database project was deleted**

## Step-by-Step Fix

### Step 1: Check if Supabase Database is Paused

1. Go to **https://supabase.com/dashboard**
2. Login to your account
3. Find your project (the one with database `db.xzcmwopfjtbulsljwzhu.supabase.co`)
4. **Look for a "Paused" or "Inactive" status**

**If it's paused:**
- Click **"Restore"** or **"Resume"** button
- Wait 1-2 minutes for database to start
- Try your app again

**If you don't see the project:**
- It might have been deleted
- You'll need to create a new Supabase project (see Step 4)

### Step 2: Get the Correct Connection String

1. In Supabase Dashboard → Click your project
2. Go to **Settings** (gear icon) → **Database**
3. Scroll to **Connection string** section
4. Find **"URI"** tab (not "Session mode" or "Transaction mode")
5. Copy the **full connection string** that looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

**Important:**
- Replace `[YOUR-PASSWORD]` with your actual database password
- If you don't know the password, click **"Reset database password"** in Supabase settings
- Use the **pooler** connection (port 6543) for serverless/Vercel

### Step 3: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your project
2. Click **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Click **Edit** (or **Add** if it doesn't exist)
5. **Paste the full connection string** from Step 2
6. Make sure it's set for **Production** environment
7. Click **Save**

### Step 4: If Database Doesn't Exist - Create New One

If your Supabase project was deleted:

1. Go to **https://supabase.com/dashboard**
2. Click **"New Project"**
3. Fill in:
   - **Name:** soul-log (or any name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup
6. Follow **Step 2** to get connection string
7. Follow **Step 3** to update Vercel

### Step 5: Redeploy on Vercel

After updating `DATABASE_URL`:

1. Go to Vercel Dashboard → Your project
2. Click **Deployments** tab
3. Click **"..."** (three dots) on latest deployment
4. Click **"Redeploy"**
5. Or push a new commit to trigger redeploy

### Step 6: Verify It Works

1. Visit: `https://your-app.vercel.app/api/health`
2. Should return: `{"status":"ok"}` (not the database error)
3. Try signing in with Google

## Quick Checklist

- [ ] Supabase project exists and is active (not paused)
- [ ] Copied correct connection string from Supabase (URI format)
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Updated `DATABASE_URL` in Vercel environment variables
- [ ] Set for Production environment
- [ ] Redeployed on Vercel
- [ ] Health endpoint returns `{"status":"ok"}`

## Still Not Working?

### Check Connection String Format

Your `DATABASE_URL` should look like:
```
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**NOT:**
- ❌ `postgresql://user:pass@host/db` (placeholder)
- ❌ Missing password
- ❌ Wrong port (should be 6543 for pooler)
- ❌ Wrong hostname

### Test Connection String Locally

You can test if the connection string works:

```bash
# Install psql (PostgreSQL client)
# Then test connection:
psql "postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

If this fails, the connection string is wrong.

### Check Vercel Logs

1. Vercel Dashboard → Your project → **Deployments**
2. Click latest deployment → **Functions** tab
3. Click on a function → **View Function Logs**
4. Look for database connection errors

## Need Help?

If still stuck, check:
1. Supabase project status in dashboard
2. Vercel environment variables are saved correctly
3. Connection string has no extra spaces or quotes
4. Database password is correct



