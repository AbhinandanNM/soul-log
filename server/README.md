## Soul Log Auth Server

### Required environment variables

Create a `.env` file in this directory with the following keys:

```
DATABASE_URL=postgresql://username:password@localhost:5432/soul_log
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=super-secret-session-key
CLIENT_URL=http://localhost:5173
# Optional overrides:
# GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
# PORT=4000
# PGSSLMODE=require
```

### Database bootstrap

Run the following to create the database (if it does not already exist) and enable UUID support:

```sql
CREATE DATABASE soul_log;
\c soul_log;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

The server automatically creates the `users` table and the session table (`connect-pg-simple`) on startup.

### Development

From the `server` directory:

```sh
npm install
npm run dev
```

The API will be available at `http://localhost:4000`. Ensure the Vite client sets `VITE_API_BASE_URL=http://localhost:4000`.

