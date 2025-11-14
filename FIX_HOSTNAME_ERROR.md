# Fix: ENOTFOUND db.xzcmwopfjtbulsljwzhu.supabase.co

## The Problem
Your `DATABASE_URL` is using the wrong hostname format. The hostname `db.xzcmwopfjtbulsljwzhu.supabase.co` cannot be resolved.

## The Solution: Use Pooler Connection

Supabase provides **two types of connection strings**:
1. **Direct connection** (port 5432) - `db.xxxxx.supabase.co` ❌ **This doesn't work well with Vercel**
2. **Pooler connection** (port 6543) - `aws-0-us-east-1.pooler.supabase.com` ✅ **Use this for Vercel**

## Step-by-Step Fix

### Step 1: Get the CORRECT Connection String

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** (gear icon) → **Database**
3. Scroll to **"Connection string"** section
4. **IMPORTANT:** Click **"URI"** tab
5. Look for **"Connection pooling"** section
6. You should see two options:
   - **Session mode** (port 5432) - ❌ Don't use this
   - **Transaction mode** (port 6543) - ✅ **Use this one!**

### Step 2: Copy the Pooler Connection String

The connection string should look like:
```
postgresql://postgres.xzcmwopfjtbulsljwzhu:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Key differences:**
- ✅ Uses `pooler.supabase.com` (not `db.xxxxx.supabase.co`)
- ✅ Uses port `6543` (not `5432`)
- ✅ Has `pooler` in the hostname

### Step 3: Replace Password

1. If you see `[YOUR-PASSWORD]`, replace it with your actual database password
2. If you don't know the password:
   - Supabase Dashboard → Settings → Database
   - Click **"Reset database password"**
   - Copy the new password
   - Replace `[YOUR-PASSWORD]` in the connection string

### Step 4: Update Vercel

1. Go to **Vercel Dashboard** → Your project
2. **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Click **Edit**
5. **Delete the old value completely**
6. **Paste the NEW pooler connection string** (from Step 2)
7. Make sure it's set for **Production**
8. Click **Save**

### Step 5: Redeploy

1. Vercel Dashboard → **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

## Verify the Fix

After redeploying, check:

1. **Health endpoint:** `https://your-app.vercel.app/api/health`
   - Should return: `{"status":"ok"}`

2. **Auth status:** `https://your-app.vercel.app/api/auth/status`
   - Should return: `{"authenticated":false,"user":null}` (no errors)

3. **Try signing in:**
   - Should work without database errors

## Why This Happens

- **Direct connection** (`db.xxxxx.supabase.co:5432`) doesn't work well with serverless functions
- **Pooler connection** (`pooler.supabase.com:6543`) is designed for serverless/serverless functions
- Vercel functions need the pooler to handle connection pooling properly

## Still Not Working?

### Check Your Connection String Format

**WRONG (Direct - won't work):**
```
postgresql://postgres:password@db.xzcmwopfjtbulsljwzhu.supabase.co:5432/postgres
```

**CORRECT (Pooler - use this):**
```
postgresql://postgres.xzcmwopfjtbulsljwzhu:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Verify in Supabase

1. Supabase Dashboard → Settings → Database
2. Look for **"Connection pooling"** section
3. Make sure you're copying from the **pooler** connection (port 6543)
4. NOT the direct connection (port 5432)

## Quick Checklist

- [ ] Using pooler connection (port 6543)
- [ ] Hostname contains `pooler.supabase.com`
- [ ] NOT using `db.xxxxx.supabase.co`
- [ ] Password replaced (no `[YOUR-PASSWORD]`)
- [ ] Updated in Vercel environment variables
- [ ] Redeployed on Vercel
- [ ] Health endpoint works
- [ ] No more ENOTFOUND errors



