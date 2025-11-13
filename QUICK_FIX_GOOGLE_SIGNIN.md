# Quick Fix: Google Sign-In Not Working

## 🚨 Immediate Steps to Fix

### Step 1: Check What Happens When You Click

1. **Open Browser Console** (F12 → Console tab)
2. **Click "Continue with Google"**
3. **Check what appears in console:**
   - Look for: "Redirecting to Google OAuth: [URL]"
   - Look for any errors (red messages)
   - Check the URL it's trying to redirect to

### Step 2: Verify Environment Variables

Go to **Vercel Dashboard** → **Settings** → **Environment Variables**

**Check these are set:**
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `CLIENT_URL` (should be your Vercel URL)
- ✅ `DATABASE_URL`
- ✅ `SESSION_SECRET`
- ✅ `NODE_ENV` = `production`

**If any are missing:**
1. Add them
2. Click **Save**
3. Go to **Deployments** → Click **"..."** → **Redeploy**

### Step 3: Test API Route Directly

1. **Open browser**
2. **Visit:** `https://your-app.vercel.app/api/auth/google`
3. **What should happen:**
   - ✅ Redirects to Google OAuth (works!)
   - ❌ Shows 404 (API route not working)
   - ❌ Shows 500 (server error)
   - ❌ Shows error page (configuration issue)

**If 404 or error:**
- Check Vercel deployment logs
- Verify `api/[...slug].ts` exists
- Check environment variables

### Step 4: Check Google OAuth Configuration

1. **Go to:** [Google Cloud Console](https://console.cloud.google.com)
2. **Navigate to:** APIs & Services → Credentials
3. **Find your OAuth 2.0 Client ID**
4. **Click Edit** (pencil icon)
5. **Check Authorized redirect URIs:**
   - Should have: `https://your-app.vercel.app/api/auth/google/callback`
   - **NO trailing slash!**
   - Must match your Vercel URL exactly

**If missing or incorrect:**
1. Add/update the redirect URI
2. Click **Save**
3. Try signing in again

### Step 5: Check Browser Network Tab

1. **Open Browser Console** (F12 → Network tab)
2. **Click "Continue with Google"**
3. **Look for request to `/api/auth/google`:**
   - ✅ Status 302 (redirect) - Works!
   - ❌ Status 404 - Route not found
   - ❌ Status 500 - Server error
   - ❌ Status 401 - Authentication error
   - ❌ CORS error - CORS configuration issue

**If error:**
- Check the error message
- Check Vercel function logs
- Verify environment variables

---

## 🔧 Common Fixes

### Fix 1: Update Environment Variables

**Problem:** Environment variables not set or incorrect

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all required variables are set
3. **Important:** `CLIENT_URL` must match your Vercel URL exactly
4. Redeploy after updating

### Fix 2: Update Google OAuth Redirect URI

**Problem:** Redirect URI mismatch

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client ID
3. Add redirect URI: `https://your-app.vercel.app/api/auth/google/callback`
4. **No trailing slash!**
5. Save and try again

### Fix 3: Redeploy After Changes

**Problem:** Changes not applied

**Solution:**
1. After updating environment variables
2. After updating Google OAuth settings
3. Go to Vercel Dashboard → Deployments
4. Click **"..."** on latest deployment
5. Click **Redeploy**
6. Wait for deployment to complete

### Fix 4: Clear Browser Cache

**Problem:** Cached old code

**Solution:**
1. Clear browser cache
2. Clear cookies
3. Try in incognito/private mode
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## 🧪 Quick Test

### Test 1: Check API Health
```
https://your-app.vercel.app/api/health
```
**Expected:** `{"status":"ok"}`

### Test 2: Check Auth Status
```
https://your-app.vercel.app/api/auth/status
```
**Expected:** `{"authenticated":false,"user":null}`

### Test 3: Check Google OAuth Route
```
https://your-app.vercel.app/api/auth/google
```
**Expected:** Redirects to Google OAuth

---

## 📋 Checklist

- [ ] Code fixed (URL construction issue resolved)
- [ ] Code pushed to GitHub
- [ ] Vercel auto-deployed (or manual redeploy)
- [ ] Environment variables set in Vercel
- [ ] Google OAuth redirect URI updated
- [ ] API route `/api/auth/google` works
- [ ] Browser console shows no errors
- [ ] Tested in browser

---

## 🚀 After Fixing

1. **Push the fix to GitHub:**
   ```bash
   git add src/contexts/AuthContext.tsx
   git commit -m "Fix Google sign-in URL construction"
   git push
   ```

2. **Wait for Vercel to auto-deploy** (or manually redeploy)

3. **Test again:**
   - Open your Vercel URL
   - Click "Continue with Google"
   - Should redirect to Google OAuth

---

## 🆘 Still Not Working?

If it's still not working after these fixes:

1. **Check Browser Console:**
   - What error do you see?
   - What URL is it trying to redirect to?

2. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check Function Logs
   - Look for errors

3. **Check Network Tab:**
   - What happens when you click the button?
   - What request is made?
   - What's the response?

4. **Share Details:**
   - Vercel URL
   - Browser console errors
   - Network tab errors
   - Vercel function logs

---

## ✅ Success Indicators

Your Google sign-in is working if:
- ✅ Clicking button redirects to Google
- ✅ After signing in, redirects back to app
- ✅ User is authenticated
- ✅ Can access protected routes
- ✅ User profile is displayed

---

Happy debugging! 🚀

