# Post-Deployment Checklist - What to Do Now

## ✅ Your app is deployed! Now complete these steps:

### Step 1: Get Your Vercel URL

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project (soul-log)
3. You'll see your deployment URL at the top, like:
   ```
   https://soul-log-xxx.vercel.app
   ```
   Or if you have a custom domain:
   ```
   https://your-custom-domain.com
   ```
4. **Copy this URL** - you'll need it for the next steps

### Step 2: Add Environment Variables

Go to **Settings** → **Environment Variables** in your Vercel project and add:

#### Required Variables:

1. **DATABASE_URL**
   - Value: Your PostgreSQL connection string
   - Example: `postgresql://user:password@host:5432/database?sslmode=require`
   - Get from: Supabase/Neon/Railway dashboard

2. **GOOGLE_CLIENT_ID**
   - Value: Your Google OAuth Client ID
   - Example: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
   - Get from: Google Cloud Console → Credentials

3. **GOOGLE_CLIENT_SECRET**
   - Value: Your Google OAuth Client Secret
   - Example: `GOCSPX-YourSecretKeyHere123456789`
   - Get from: Google Cloud Console → Credentials

4. **SESSION_SECRET**
   - Value: A random secret string
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

5. **CLIENT_URL**
   - Value: Your Vercel deployment URL
   - Example: `https://soul-log-xxx.vercel.app`
   - **Use the URL from Step 1!**

6. **NODE_ENV**
   - Value: `production`

#### Optional Variables:

7. **GOOGLE_CALLBACK_URL**
   - Value: `https://soul-log-xxx.vercel.app/api/auth/google/callback`
   - **Use your Vercel URL from Step 1!**

8. **PGSSLMODE** (if needed)
   - Value: `require`
   - Only if your database requires SSL

**How to Add:**
1. Click **Add New** for each variable
2. Enter the **Name** and **Value**
3. Select environments: **Production** (and Preview/Development if needed)
4. Click **Save**
5. Repeat for each variable

### Step 3: Redeploy After Adding Environment Variables

After adding all environment variables:

1. Go to **Deployments** tab
2. Click the **...** (three dots) menu on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** (optional)
5. Click **Redeploy**
6. Wait for the deployment to complete

### Step 4: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID and click **Edit** (pencil icon)
4. Scroll to **Authorized redirect URIs**
5. Click **Add URI**
6. Add this exact URL:
   ```
   https://your-vercel-url.vercel.app/api/auth/google/callback
   ```
   (Replace `your-vercel-url` with your actual Vercel URL from Step 1)
7. Click **Save**

### Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see your Soul Log app
3. Click **Continue with Google** or go to `/login`
4. Try signing in with Google
5. Verify:
   - ✅ Google OAuth redirect works
   - ✅ Authentication succeeds
   - ✅ You're redirected to `/journal`
   - ✅ Your profile is displayed
   - ✅ Protected routes work

### Step 6: Verify Database Connection

Your database should be automatically set up on first API call:

1. The `users` table will be created automatically
2. The `session` table will be created automatically
3. First sign-in will create your user record

**To verify:**
- Check your database dashboard (Supabase/Neon/Railway)
- Look for `users` and `session` tables
- Check if your user record exists after signing in

---

## 🔍 Troubleshooting

### Issue: "Missing environment variable" error

**Solution:**
1. Go to Settings → Environment Variables
2. Verify all variables are added
3. Check variable names match exactly (case-sensitive)
4. Redeploy after adding variables

### Issue: "Database connection failed"

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database allows connections from Vercel (most cloud providers do automatically)
3. Ensure SSL is enabled: add `?sslmode=require` to `DATABASE_URL`
4. Test connection string independently

### Issue: "OAuth redirect_uri_mismatch"

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client ID
3. Verify redirect URI matches exactly:
   ```
   https://your-vercel-url.vercel.app/api/auth/google/callback
   ```
4. No trailing slash!
5. Save and try again

### Issue: "Sessions not working"

**Solution:**
1. Verify `SESSION_SECRET` is set
2. Check `DATABASE_URL` is correct
3. Verify database connection works
4. Check database has `session` table (auto-created on first request)

### Issue: "404 on API routes"

**Solution:**
1. Verify API routes are in `api/` directory
2. Check `api/[...slug].ts` exists
3. Verify `api/server.ts` is properly configured
4. Check deployment logs for errors

### Issue: "Build succeeds but app doesn't work"

**Solution:**
1. Check browser console for errors
2. Check Vercel function logs (Deployments → View Function Logs)
3. Verify environment variables are set
4. Check API routes are accessible

---

## ✅ Success Checklist

- [ ] Deployment URL obtained
- [ ] All environment variables added
- [ ] Project redeployed after adding variables
- [ ] Google OAuth redirect URI updated
- [ ] App loads at Vercel URL
- [ ] Google sign-in works
- [ ] Authentication succeeds
- [ ] Protected routes work
- [ ] Database connection works
- [ ] User record created in database

---

## 🎉 You're Done!

Once all steps are complete, your app should be:
- ✅ Live at your Vercel URL
- ✅ Authenticating users with Google OAuth
- ✅ Storing sessions in PostgreSQL
- ✅ Protecting routes
- ✅ Ready to use!

---

## 📚 Next Steps (Optional)

1. **Add Custom Domain**: Settings → Domains → Add domain
2. **Set up Monitoring**: Check function logs in Vercel dashboard
3. **Enable Preview Deployments**: Automatically creates preview URLs for pull requests
4. **Set up Analytics**: Add analytics to track usage
5. **Configure CI/CD**: Automatic deployments on every push

---

## 🆘 Need Help?

If something doesn't work:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Check function logs in Vercel dashboard
4. Verify all environment variables are set
5. Test database connection independently
6. Verify Google OAuth configuration

Happy deploying! 🚀

