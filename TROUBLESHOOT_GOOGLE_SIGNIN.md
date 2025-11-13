# Troubleshooting Google Sign-In Not Working

## 🔍 Common Issues and Solutions

### Issue 1: Button Does Nothing (No Redirect)

**Symptoms:**
- Clicking "Continue with Google" does nothing
- No redirect to Google
- No errors in console

**Possible Causes:**
1. API route not accessible
2. Environment variables not set
3. URL construction issue
4. CORS issue

**Solutions:**

#### Check 1: Verify API Route is Accessible

1. Open your Vercel URL in browser
2. Try accessing: `https://your-app.vercel.app/api/auth/google`
3. You should be redirected to Google OAuth
4. If you get 404 or error, API route is not working

**Fix:**
- Check Vercel deployment logs
- Verify `api/[...slug].ts` exists
- Verify `api/server.ts` is properly configured
- Check environment variables are set

#### Check 2: Verify Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables:

**Required:**
- ✅ `GOOGLE_CLIENT_ID` - Must be set
- ✅ `GOOGLE_CLIENT_SECRET` - Must be set
- ✅ `CLIENT_URL` - Must match your Vercel URL
- ✅ `DATABASE_URL` - Must be set
- ✅ `SESSION_SECRET` - Must be set
- ✅ `NODE_ENV` - Should be `production`

**Fix:**
- Add missing environment variables
- Redeploy after adding variables
- Verify variable names match exactly (case-sensitive)

#### Check 3: Check Browser Console

1. Open browser console (F12)
2. Click "Continue with Google"
3. Look for errors:
   - `Failed to fetch` - API route issue
   - `404` - Route not found
   - `CORS error` - CORS configuration issue
   - `TypeError` - JavaScript error

**Fix:**
- Check error message
- Verify API route is accessible
- Check CORS configuration
- Verify URL construction

#### Check 4: Check Network Tab

1. Open browser console (F12) → Network tab
2. Click "Continue with Google"
3. Look for requests:
   - `/api/auth/google` - Should redirect
   - Check request status (200 = success, 404 = not found, 500 = server error)

**Fix:**
- If 404: Check API route exists
- If 500: Check server logs
- If CORS error: Check CORS configuration

---

### Issue 2: Redirect URI Mismatch

**Symptoms:**
- Redirects to Google
- Google shows error: "redirect_uri_mismatch"
- Error 400: redirect_uri_mismatch

**Solution:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click **Edit** (pencil icon)
5. In **Authorized redirect URIs**, add:
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```
   (Replace `your-app.vercel.app` with your actual Vercel URL)
6. **Important:** No trailing slash!
7. Click **Save**

**Verify:**
- Redirect URI in Google Console matches exactly
- `CLIENT_URL` environment variable matches Vercel URL
- `GOOGLE_CALLBACK_URL` is set correctly (optional)

---

### Issue 3: Database Connection Error

**Symptoms:**
- Redirects to Google
- Signs in successfully
- Redirects back to app
- Shows error or fails

**Solution:**

1. Check `DATABASE_URL` environment variable:
   - Format: `postgresql://user:password@host:5432/database?sslmode=require`
   - Must be correct
   - Must include `?sslmode=require` for cloud databases

2. Verify database connection:
   - Check database dashboard (Supabase/Neon/Railway)
   - Verify database is accessible
   - Check firewall settings

3. Check Vercel function logs:
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check Function Logs
   - Look for database connection errors

**Fix:**
- Update `DATABASE_URL` if incorrect
- Verify database allows connections from Vercel
- Check database credentials
- Ensure SSL is enabled

---

### Issue 4: Session Not Working

**Symptoms:**
- Signs in successfully
- Redirects back to app
- Not logged in
- Redirected to login again

**Solution:**

1. Check `SESSION_SECRET` environment variable:
   - Must be set
   - Must be a random string
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. Verify database session table:
   - Check database dashboard
   - Verify `session` table exists
   - Check if sessions are being stored

3. Check cookie settings:
   - Verify `CLIENT_URL` matches Vercel URL
   - Check cookie domain settings
   - Verify secure cookie settings

**Fix:**
- Set `SESSION_SECRET` if missing
- Verify database connection
- Check cookie configuration
- Verify `CLIENT_URL` is correct

---

### Issue 5: CORS Error

**Symptoms:**
- Browser console shows CORS error
- `Access-Control-Allow-Origin` error
- Request blocked by CORS

**Solution:**

1. Check CORS configuration in `api/server.ts`:
   - Verify `CLIENT_URL` is set correctly
   - Check CORS origin settings
   - Verify credentials are enabled

2. Check Vercel headers:
   - Verify API routes have correct headers
   - Check CORS headers in response

**Fix:**
- Update CORS configuration
- Verify `CLIENT_URL` matches Vercel URL
- Check CORS headers in API response

---

## 🧪 Step-by-Step Debugging

### Step 1: Check API Route

1. Open browser
2. Visit: `https://your-app.vercel.app/api/health`
3. Should return: `{"status":"ok"}`
4. If error, API routes are not working

### Step 2: Check Google OAuth Route

1. Open browser
2. Visit: `https://your-app.vercel.app/api/auth/google`
3. Should redirect to Google OAuth
4. If 404, route is not configured
5. If 500, check server logs

### Step 3: Check Environment Variables

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all required variables are set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `CLIENT_URL`
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NODE_ENV`

### Step 4: Check Google OAuth Configuration

1. Go to Google Cloud Console → Credentials
2. Verify redirect URI matches:
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```
3. Verify Client ID and Secret match environment variables

### Step 5: Check Database Connection

1. Check database dashboard
2. Verify connection string is correct
3. Check if database is accessible
4. Verify tables exist (users, session)

### Step 6: Check Browser Console

1. Open browser console (F12)
2. Click "Continue with Google"
3. Check for errors:
   - JavaScript errors
   - Network errors
   - CORS errors

### Step 7: Check Vercel Logs

1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Check Build Logs
4. Check Function Logs
5. Look for errors

---

## 🔧 Quick Fixes

### Fix 1: Update Environment Variables

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add/update all required variables
3. Redeploy

### Fix 2: Update Google OAuth Redirect URI

1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client ID
3. Add redirect URI: `https://your-app.vercel.app/api/auth/google/callback`
4. Save

### Fix 3: Redeploy

1. Go to Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

### Fix 4: Clear Browser Cache

1. Clear browser cache
2. Clear cookies
3. Try again in incognito/private mode

---

## ✅ Success Checklist

- [ ] API route `/api/health` returns `{"status":"ok"}`
- [ ] API route `/api/auth/google` redirects to Google
- [ ] All environment variables are set
- [ ] Google OAuth redirect URI is correct
- [ ] Database connection works
- [ ] Session secret is set
- [ ] `CLIENT_URL` matches Vercel URL
- [ ] No errors in browser console
- [ ] No errors in Vercel logs

---

## 🆘 Still Not Working?

If none of the above solutions work:

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check Function Logs for errors

2. **Check Database Logs:**
   - Check database dashboard
   - Look for connection errors
   - Verify database is accessible

3. **Test API Routes Directly:**
   - Visit `/api/health` - Should work
   - Visit `/api/auth/google` - Should redirect
   - Visit `/api/auth/status` - Should return status

4. **Verify Configuration:**
   - Check all environment variables
   - Verify Google OAuth settings
   - Check database connection
   - Verify API routes are configured

5. **Contact Support:**
   - Share error messages
   - Share Vercel logs
   - Share browser console errors
   - Share configuration details

---

## 📝 Common Error Messages

### "redirect_uri_mismatch"
- **Cause:** Google OAuth redirect URI doesn't match
- **Fix:** Update redirect URI in Google Cloud Console

### "Failed to fetch"
- **Cause:** API route not accessible
- **Fix:** Check API route exists and is configured

### "Database connection error"
- **Cause:** Database connection failed
- **Fix:** Verify `DATABASE_URL` is correct

### "Session secret missing"
- **Cause:** `SESSION_SECRET` not set
- **Fix:** Add `SESSION_SECRET` environment variable

### "CORS error"
- **Cause:** CORS configuration issue
- **Fix:** Check CORS configuration in API server

---

Happy debugging! 🚀

