# Supabase Database Setup for Soul Log

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `soul-log` (or any name you prefer)
   - **Database Password**: Create a strong password (⚠️ **SAVE THIS** - you'll need it!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier is fine
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be created

## Step 2: Get Your Connection String

1. Once your project is ready, go to **Settings** (gear icon in left sidebar)
2. Click **Database** in the settings menu
3. Look for **Connection string** section (scroll down if needed)
4. You'll see different connection methods. Look for:
   - **Connection string** or **Connection URI** or **URI**
   - OR **Connection pooling** section (we'll use the direct connection, not pooling)
5. You need to find these values:
   - **Host**: `db.xxxxx.supabase.co` (found in Connection info)
   - **Database name**: Usually `postgres`
   - **Port**: Usually `5432` (or `6543` for pooling)
   - **User**: Usually `postgres`
   - **Password**: The password you created in Step 1

6. **Alternative method - Build it manually:**
   - In Database settings, find **Connection info** section
   - You'll see: Host, Database name, Port, User
   - Build the connection string like this:
     ```
     postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
     ```
   - Replace `YOUR_PASSWORD` with your actual database password
   - Replace `xxxxx` with your project reference (shown in the Host field)

7. **If you see "Connection pooling" instead:**
   - Use the **Session mode** connection string (not Transaction mode)
   - It will look like: `postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres`
   - But for our app, the direct connection works better: `postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres`

## Step 3: Create .env File

1. Navigate to the `server` directory:
   ```powershell
   cd C:\ANM\Cursor\thought-retrace-main\thought-retrace-main\server
   ```

2. Create a `.env` file (if it doesn't exist):
   ```powershell
   # In PowerShell
   New-Item -Path .env -ItemType File
   ```

3. Open `.env` in a text editor and add:

   ```
   # Supabase Database Connection
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
   PGSSLMODE=require
   
   # Google OAuth (you'll need to set these up separately)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Session Security (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   SESSION_SECRET=your-generated-session-secret-here
   
   # Application URLs
   CLIENT_URL=http://localhost:5173
   PORT=4000
   ```

4. **Replace** `[YOUR-PASSWORD]` with your actual Supabase database password
5. **Replace** `[project-ref]` with your actual project reference (it's in the connection string)

## Step 4: Generate SESSION_SECRET

Run this command to generate a secure session secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as the value for `SESSION_SECRET` in your `.env` file.

## Step 5: Test the Connection

1. Start the server:
   ```powershell
   cd C:\ANM\Cursor\thought-retrace-main\thought-retrace-main\server
   npm run dev
   ```

2. If successful, you'll see:
   ```
   Soul Log server listening on port 4000
   ```

3. The server will automatically:
   - ✅ Connect to Supabase
   - ✅ Create the `users` table
   - ✅ Create the `session` table
   - ✅ Set up UUID extension

## Troubleshooting

### "Connection refused" or "Connection timeout"
- Check that your Supabase project is fully created (wait a few more minutes)
- Verify the connection string is correct
- Make sure `PGSSLMODE=require` is set in `.env`

### "Authentication failed"
- Double-check your database password
- Make sure you replaced `[YOUR-PASSWORD]` in the connection string

### "Database does not exist"
- Supabase uses the default `postgres` database - this should work automatically
- If issues persist, check your project status in Supabase dashboard

## Next Steps

Once your database is connected:

1. ✅ Set up Google OAuth credentials (see main README)
2. ✅ Start the backend: `cd server && npm run dev`
3. ✅ Start the frontend: `cd .. && npm run dev`
4. ✅ Visit `http://localhost:5173` and sign in!

## Security Note

⚠️ **Never commit your `.env` file to git!** It contains sensitive credentials.

The `.env` file should already be in `.gitignore`, but double-check to be safe.

