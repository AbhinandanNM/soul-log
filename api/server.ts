import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import pgSession from "connect-pg-simple";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Pool } from "pg";

const {
  CLIENT_URL = "http://localhost:5173",
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  DATABASE_URL,
  SESSION_SECRET,
  NODE_ENV = "production",
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
}

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

if (!SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET environment variable.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.PGSSLMODE === "require" || DATABASE_URL.includes("supabase.co") 
    ? { rejectUnauthorized: false } 
    : undefined,
});

const ensureDatabaseSetup = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        google_id TEXT UNIQUE NOT NULL,
        email TEXT,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } catch (error) {
    console.error("Database setup error:", error);
  }
};

// Initialize database setup
void ensureDatabaseSetup();

type DbUser = {
  id: string;
  google_id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

const PgSessionStore = pgSession(session);

export const app = express();

app.set("trust proxy", 1);

// CORS configuration - allow your Vercel frontend domain
const allowedOrigins = [
  CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL ? `https://${process.env.VERCEL}` : undefined,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/^https?:\/\//, '')))) {
        callback(null, true);
      } else {
        callback(null, true); // For Vercel, we'll allow all in dev
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    name: "soul_log.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "lax" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      domain: NODE_ENV === "production" ? undefined : undefined, // Let Vercel handle domain
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const { rows } = await pool.query<DbUser>("SELECT * FROM users WHERE id = $1", [id]);
    if (!rows.length) {
      return done(null, false);
    }

    const { email, name, avatar_url } = rows[0];

    done(null, {
      id,
      email,
      name,
      avatarUrl: avatar_url,
    });
  } catch (error) {
    done(error);
  }
});

// Build callback URL for production
const getCallbackURL = () => {
  if (GOOGLE_CALLBACK_URL) {
    return GOOGLE_CALLBACK_URL;
  }
  
  if (NODE_ENV === "production") {
    // In Vercel, use the Vercel URL or custom domain
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.CLIENT_URL || CLIENT_URL;
    return `${baseUrl}/api/auth/google/callback`;
  }
  
  return `${CLIENT_URL}/api/auth/google/callback`;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackURL(),
      passReqToCallback: true,
    },
    async (_req, _accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value ?? null;
        const name = profile.displayName ?? null;
        const avatarUrl = profile.photos?.[0]?.value ?? null;

        const existing = await pool.query<DbUser>("SELECT * FROM users WHERE google_id = $1", [googleId]);

        let user: DbUser;

        if (existing.rows.length) {
          const { rows } = await pool.query<DbUser>(
            `
              UPDATE users
              SET email = $2,
                  name = $3,
                  avatar_url = $4,
                  updated_at = NOW()
              WHERE google_id = $1
              RETURNING *;
            `,
            [googleId, email, name, avatarUrl],
          );
          user = rows[0];
        } else {
          const { rows } = await pool.query<DbUser>(
            `
              INSERT INTO users (google_id, email, name, avatar_url)
              VALUES ($1, $2, $3, $4)
              RETURNING *;
            `,
            [googleId, email, name, avatarUrl],
          );
          user = rows[0];
        }

        const result: Express.User = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
        };

        done(null, result);
      } catch (error) {
        done(error as Error);
      }
    },
  ),
);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Google OAuth routes (Vercel API routes)
app.get("/api/auth/google", (req, res, next) => {
  if (req.query.returnTo && typeof req.query.returnTo === "string") {
    req.session.returnTo = req.query.returnTo;
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })(req, res, next);
});

// Legacy route (for local development)
app.get("/auth/google", (req, res, next) => {
  if (req.query.returnTo && typeof req.query.returnTo === "string") {
    req.session.returnTo = req.query.returnTo;
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })(req, res, next);
});

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_oauth_failed`,
    session: true,
  }),
  (req, res) => {
    const destination = req.session.returnTo || `${CLIENT_URL}/journal`;
    delete req.session.returnTo;
    res.redirect(destination);
  },
);

// Legacy routes (for local development)
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_oauth_failed`,
    session: true,
  }),
  (req, res) => {
    const destination = req.session.returnTo || `${CLIENT_URL}/journal`;
    delete req.session.returnTo;
    res.redirect(destination);
  },
);

app.get("/api/auth/status", (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }

  const { id, email, name, avatarUrl } = req.user;
  res.json({
    authenticated: true,
    user: {
      id,
      email,
      name,
      avatarUrl,
    },
  });
});

app.get("/auth/status", (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }

  const { id, email, name, avatarUrl } = req.user;
  res.json({
    authenticated: true,
    user: {
      id,
      email,
      name,
      avatarUrl,
    },
  });
});

app.post("/api/auth/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }
      res.clearCookie("soul_log.sid");
      res.json({ success: true });
    });
  });
});

// Legacy route (for local development)
app.post("/auth/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }
      res.clearCookie("soul_log.sid");
      res.json({ success: true });
    });
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] unexpected error", error);
  res.status(500).json({ error: "Internal Server Error" });
});

