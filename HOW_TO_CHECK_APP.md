# How to Check Your Deployed App

## 🚀 Quick Steps to Check Your App

### Step 1: Get Your Vercel URL

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (e.g., `soul-log`)
3. You'll see your deployment URL at the top:
   ```
   https://your-app-name.vercel.app
   ```
4. **Copy this URL**

### Step 2: Open Your App in Browser

1. Open any web browser (Chrome, Firefox, Edge, etc.)
2. Paste your Vercel URL in the address bar
3. Press **Enter**
4. Your app should load!

---

## ✅ What to Check

### 1. App Loads Successfully

**What to look for:**
- ✅ App loads without errors
- ✅ You see the Soul Log homepage
- ✅ Navigation bar appears
- ✅ Footer appears
- ✅ No error messages in the browser

**If there are errors:**
- Check browser console (F12 → Console tab)
- Check Vercel deployment logs
- Verify environment variables are set

### 2. Homepage Works

**What to check:**
- ✅ Homepage loads
- ✅ Links work
- ✅ Navigation works
- ✅ Footer appears

**Test:**
- Click on navigation links
- Check if routes work

### 3. Login Page Works

**What to check:**
- ✅ Go to `/login` or click "Sign In"
- ✅ Login page loads
- ✅ "Continue with Google" button appears
- ✅ No errors

**Test:**
1. Visit: `https://your-app.vercel.app/login`
2. Verify the login page loads
3. Check if the Google sign-in button is visible

### 4. Google OAuth Works

**What to check:**
- ✅ Click "Continue with Google"
- ✅ Redirects to Google sign-in
- ✅ After signing in, redirects back to app
- ✅ User is authenticated
- ✅ Redirected to `/journal` or protected route

**Test:**
1. Click "Continue with Google"
2. Sign in with your Google account
3. Verify you're redirected back to the app
4. Check if you're logged in

**If OAuth fails:**
- Check Google OAuth redirect URI in Google Cloud Console
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check `CLIENT_URL` matches your Vercel URL
- Verify redirect URI matches exactly: `https://your-app.vercel.app/api/auth/google/callback`

### 5. Protected Routes Work

**What to check:**
- ✅ After login, can access `/journal`
- ✅ Protected routes require authentication
- ✅ Unauthenticated users are redirected to `/login`

**Test:**
1. Sign in with Google
2. Visit: `https://your-app.vercel.app/journal`
3. Verify journal page loads
4. Sign out
5. Try accessing `/journal` without login
6. Verify you're redirected to `/login`

### 6. API Routes Work

**What to check:**
- ✅ API routes are accessible
- ✅ Health check endpoint works
- ✅ Auth endpoints work

**Test:**
1. Visit: `https://your-app.vercel.app/api/health`
2. Should return: `{"status":"ok"}`
3. Visit: `https://your-app.vercel.app/api/auth/status`
4. Should return: `{"authenticated":false,"user":null}` (if not logged in)

### 7. Database Connection Works

**What to check:**
- ✅ User record is created after first login
- ✅ Sessions are stored
- ✅ User data persists

**Test:**
1. Sign in with Google
2. Check your database (Supabase/Neon/Railway)
3. Verify `users` table has your user record
4. Verify `session` table has session data

---

## 🔍 How to Check for Errors

### 1. Browser Console

**How to check:**
1. Open your app in browser
2. Press **F12** (or Right-click → Inspect)
3. Click **Console** tab
4. Look for errors (red messages)

**Common errors:**
- `Failed to fetch` - API routes not working
- `404` - Route not found
- `401` - Authentication failed
- `500` - Server error

### 2. Vercel Deployment Logs

**How to check:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Click **Deployments** tab
4. Click on the latest deployment
5. Check **Build Logs** and **Function Logs**

**What to look for:**
- Build errors
- Function errors
- Environment variable errors
- Database connection errors

### 3. Network Tab

**How to check:**
1. Open your app in browser
2. Press **F12** → **Network** tab
3. Refresh the page
4. Look for failed requests (red)

**What to check:**
- API requests status (200 = success, 404 = not found, 500 = server error)
- Request/response data
- Headers

### 4. Database Dashboard

**How to check:**
1. Go to your database provider (Supabase/Neon/Railway)
2. Check database dashboard
3. Verify tables exist:
   - `users` table
   - `session` table
4. Check if data is being stored

---

## 🧪 Complete Testing Checklist

### Basic Functionality
- [ ] App loads at Vercel URL
- [ ] Homepage displays correctly
- [ ] Navigation works
- [ ] Footer appears
- [ ] No console errors

### Authentication
- [ ] Login page loads
- [ ] Google sign-in button appears
- [ ] Clicking "Continue with Google" redirects to Google
- [ ] After signing in, redirects back to app
- [ ] User is authenticated
- [ ] User profile is displayed

### Protected Routes
- [ ] Can access `/journal` after login
- [ ] Cannot access `/journal` without login
- [ ] Redirected to `/login` when not authenticated
- [ ] Protected routes work correctly

### API Routes
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] `/api/auth/status` works
- [ ] `/api/auth/google` redirects to Google
- [ ] `/api/auth/google/callback` works
- [ ] `/api/auth/logout` works

### Database
- [ ] User record created in database
- [ ] Session stored in database
- [ ] User data persists
- [ ] Database tables exist

### Environment Variables
- [ ] All environment variables are set
- [ ] `DATABASE_URL` is correct
- [ ] `GOOGLE_CLIENT_ID` is correct
- [ ] `GOOGLE_CLIENT_SECRET` is correct
- [ ] `SESSION_SECRET` is set
- [ ] `CLIENT_URL` matches Vercel URL

---

## 🐛 Common Issues and Solutions

### Issue: App shows blank page

**Solution:**
1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify build succeeded
4. Check if `dist` folder exists in build

### Issue: "Failed to fetch" error

**Solution:**
1. Check API routes are accessible
2. Verify environment variables are set
3. Check function logs in Vercel
4. Verify database connection

### Issue: OAuth redirect error

**Solution:**
1. Check Google OAuth redirect URI matches Vercel URL
2. Verify `CLIENT_URL` is set correctly
3. Check `GOOGLE_CALLBACK_URL` is correct
4. Verify redirect URI has no trailing slash

### Issue: Database connection error

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database allows connections from Vercel
3. Ensure SSL is enabled (`?sslmode=require`)
4. Test connection string independently

### Issue: Sessions not working

**Solution:**
1. Verify `SESSION_SECRET` is set
2. Check database connection works
3. Verify `session` table exists
4. Check cookie settings

---

## 📊 Quick Test URLs

Replace `your-app.vercel.app` with your actual Vercel URL:

```
# Homepage
https://your-app.vercel.app/

# Login
https://your-app.vercel.app/login

# Journal (protected)
https://your-app.vercel.app/journal

# API Health Check
https://your-app.vercel.app/api/health

# API Auth Status
https://your-app.vercel.app/api/auth/status
```

---

## 🎯 Success Indicators

Your app is working correctly if:
- ✅ App loads without errors
- ✅ Google sign-in works
- ✅ Authentication succeeds
- ✅ Protected routes work
- ✅ API routes respond
- ✅ Database connection works
- ✅ User data is stored
- ✅ Sessions persist

---

## 🆘 Need Help?

If something doesn't work:
1. Check browser console (F12)
2. Check Vercel deployment logs
3. Check function logs in Vercel
4. Verify environment variables
5. Test API routes directly
6. Check database connection

Happy testing! 🚀

