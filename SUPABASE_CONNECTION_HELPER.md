# Finding Your Supabase Connection String

If you can't find the URI in Settings, here's how to build it manually:

## Method 1: From Database Settings

1. Go to **Settings** → **Database**
2. Look for **Connection info** section
3. You'll see these fields:
   - **Host**: `db.xxxxx.supabase.co` (copy this)
   - **Database name**: `postgres` (usually this)
   - **Port**: `5432` (usually this)
   - **User**: `postgres` (usually this)
   - **Password**: The one you created when setting up the project

4. Build your connection string:
   ```
   postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
   ```

   Replace:
   - `YOUR_PASSWORD` → Your actual database password
   - `xxxxx` → Your project reference (from the Host field)

## Method 2: From Project Settings

1. Go to **Settings** → **Project Settings** (or just **Settings**)
2. Look for **Database** section
3. Find **Connection string** or **Database URL**
4. If you see a connection string, it might have `[YOUR-PASSWORD]` placeholder - replace it

## Method 3: Direct Connection String Format

If you have all the info, use this format:

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

Example:
```
postgresql://postgres:mypassword123@db.abcdefghijk.supabase.co:5432/postgres
```

## What You Need

From Supabase dashboard, find:
- ✅ **Host** (e.g., `db.xxxxx.supabase.co`)
- ✅ **Database** (usually `postgres`)
- ✅ **Port** (usually `5432`)
- ✅ **User** (usually `postgres`)
- ✅ **Password** (the one you set when creating the project)

## Quick Test

Once you have your connection string, test it by creating a `.env` file in the `server` directory:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
PGSSLMODE=require
```

Then run:
```bash
cd server
npm run dev
```

If it connects successfully, you'll see: `Soul Log server listening on port 4000`

If you get connection errors, double-check:
- Password is correct
- Host address is correct
- `PGSSLMODE=require` is set (Supabase requires SSL)

