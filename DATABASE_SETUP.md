# Database Setup Guide for Soul Log

This guide will help you set up a PostgreSQL database for Soul Log.

## Option 1: Quick Setup with Cloud Database (Recommended)

### Using Supabase (Free Tier)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: soul-log (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Wait for project to be created (2-3 minutes)
6. Go to **Settings** → **Database**
7. Find **Connection string** → **URI**
8. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

### Using Neon (Free Tier)

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up or log in
3. Click "Create Project"
4. Fill in project details
5. Once created, click on your project
6. Find **Connection Details** → **Connection string**
7. Copy the connection string

### Using Railway

1. Go to [https://railway.app](https://railway.app)
2. Sign up or log in
3. Click "New Project" → "Add PostgreSQL"
4. Once created, click on the PostgreSQL service
5. Go to **Variables** tab
6. Copy the `DATABASE_URL` value

## Option 2: Local PostgreSQL Setup

### Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`

**macOS:**
- `brew install postgresql`
- `brew services start postgresql`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

1. Open PostgreSQL command line:
   ```bash
   psql -U postgres
   ```

2. Create database:
   ```sql
   CREATE DATABASE soul_log;
   ```

3. Exit:
   ```sql
   \q
   ```

4. Your connection string will be:
   ```
   postgresql://postgres:your_password@localhost:5432/soul_log
   ```

## Configure Your .env File

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Create a `.env` file (copy from `.env.example` if it exists):
   ```bash
   # Windows PowerShell
   New-Item -Path .env -ItemType File
   
   # Or manually create .env file
   ```

3. Add your database URL:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database_name
   ```

   **For cloud databases**, add SSL mode:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database_name?sslmode=require
   PGSSLMODE=require
   ```

4. Add other required variables:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   SESSION_SECRET=generate-random-string-here
   CLIENT_URL=http://localhost:5173
   PORT=4000
   ```

5. Generate SESSION_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Test Database Connection

Run the setup script:
```bash
cd server
npm run setup:db
```

Or manually test:
```bash
cd server
node -e "import('pg').then(({Pool})=>{const p=new Pool({connectionString:process.env.DATABASE_URL});p.query('SELECT NOW()').then(()=>{console.log('✅ Connected!');process.exit(0)}).catch(e=>{console.error('❌ Failed:',e.message);process.exit(1)})})"
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running
- Check if port 5432 is correct
- Verify firewall settings

### Authentication Failed
- Double-check username and password
- For cloud databases, ensure you're using the correct credentials from the dashboard

### Database Does Not Exist
- Create it first: `CREATE DATABASE soul_log;`
- Or use the default `postgres` database temporarily

### SSL Required
- Add `?sslmode=require` to your connection string
- Or set `PGSSLMODE=require` in your `.env` file

## Next Steps

Once your database is configured:

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. The server will automatically:
   - Create the `users` table
   - Create the `session` table (for storing login sessions)
   - Set up UUID extension

3. Start the frontend:
   ```bash
   npm run dev
   ```

4. Visit `http://localhost:5173` and sign in with Google!



