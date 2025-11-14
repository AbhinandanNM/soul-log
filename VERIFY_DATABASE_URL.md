# Verify DATABASE_URL in Vercel

## The Problem
Supabase project is active (green) but connection still fails = **Wrong connection string in Vercel**

## Step-by-Step Fix

### Step 1: Get the EXACT Connection String from Supabase

1. Go to **https://supabase.com/dashboard**
2. Click your **active project** (the green one)
3. Click **Settings** (gear icon) → **Database**
4. Scroll down to **"Connection string"** section
5. Click **"URI"** tab (NOT "Session mode" or "Transaction mode")
6. You'll see something like:
   ```
   postgresql://postgres.xzcmwopfjtbulsljwzhu:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 2: Replace [YOUR-PASSWORD]

**Important:** The connection string shows `[YOUR-PASSWORD]` - you need to replace this!

1. If you know your database password:
   - Replace `[YOUR-PASSWORD]` with your actual password
   
2. If you DON'T know the password:
   - In Supabase Dashboard → Settings → Database
   - Scroll to **"Database password"** section
   - Click **"Reset database password"**
   - Copy the new password (you'll only see it once!)
   - Replace `[YOUR-PASSWORD]` in the connection string

### Step 3: Copy the COMPLETE Connection String

Your final connection string should look like:
```
postgresql://postgres.xzcmwopfjtbulsljwzhu:ACTUAL_PASSWORD_HERE@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Check:**
- ✅ Starts with `postgresql://`
- ✅ Has your actual password (not `[YOUR-PASSWORD]`)
- ✅ Uses port `6543` (pooler) - important for Vercel!
- ✅ Ends with `/postgres`

### Step 4: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your project
2. Click **Settings** → **Environment Variables**
3. Find `DATABASE_URL` in the list
4. Click **Edit** (pencil icon)
5. **Delete the old value completely**
6. **Paste the new connection string** from Step 3
7. Make sure it's selected for:
   - ✅ Production
   - ✅ Preview (optional but recommended)
   - ✅ Development (optional)
8. Click **Save**

### Step 5: Verify No Extra Characters

**Common mistakes:**
- ❌ Extra spaces before/after
- ❌ Quotes around the string (`"postgresql://..."`)
- ❌ Line breaks
- ❌ Still has `[YOUR-PASSWORD]` instead of actual password

**Should be:**
- ✅ One continuous line
- ✅ No quotes
- ✅ No spaces
- ✅ Actual password inserted

### Step 6: Redeploy

After saving the environment variable:

1. Go to **Deployments** tab
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Or make a small change and push to GitHub

### Step 7: Test

1. Wait for deployment to finish (1-2 minutes)
2. Visit: `https://your-app.vercel.app/api/health`
3. Should return: `{"status":"ok"}` ✅

## Quick Checklist

- [ ] Supabase project is active (green) ✅
- [ ] Got connection string from Supabase Settings → Database → URI tab
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Connection string uses port 6543 (pooler)
- [ ] Updated `DATABASE_URL` in Vercel (no quotes, no spaces)
- [ ] Saved for Production environment
- [ ] Redeployed on Vercel
- [ ] Health endpoint works

## Still Not Working?

### Check Vercel Logs

1. Vercel Dashboard → Your project → **Deployments**
2. Click latest deployment → **Functions**
3. Click on a function → **View Function Logs**
4. Look for the exact error message

### Test Connection String Format

The error shows `hostname: "unknown"` which means the connection string might be malformed. Double-check:

1. **No quotes** around the value in Vercel
2. **Password is URL-encoded** if it has special characters (`@`, `#`, `%`, etc.)
3. **Complete string** - nothing cut off

### URL Encode Password (if needed)

If your password has special characters, you might need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- etc.

Or better: **Reset the password** in Supabase to something without special characters.

## Example of Correct Format

```
postgresql://postgres.xzcmwopfjtbulsljwzhu:MySecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Notice:
- No quotes
- No spaces
- Actual password (not placeholder)
- Port 6543
- Ends with /postgres



