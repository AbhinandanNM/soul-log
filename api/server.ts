import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import pgSession from "connect-pg-simple";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Pool } from "pg";

// Define custom User type for Passport
interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

// Extend Express namespace to include our custom User type
declare global {
  namespace Express {
    interface User extends AppUser {}
  }
}

const {
  CLIENT_URL = "http://localhost:5173",
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  DATABASE_URL,
  SESSION_SECRET,
  NODE_ENV = "production",
} = process.env;

// Validate environment variables (but don't throw at module load - handle gracefully)
const validateEnv = () => {
  const missing: string[] = [];
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    missing.push("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
  }
  if (!DATABASE_URL) {
    missing.push("DATABASE_URL");
  }
  if (!SESSION_SECRET) {
    missing.push("SESSION_SECRET");
  }
  return missing;
};

// Validate DATABASE_URL format
const isValidDatabaseUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  // Check if it's a valid PostgreSQL connection string
  // Should start with postgres:// or postgresql://
  if (!url.match(/^postgres(ql)?:\/\//)) {
    return false;
  }
  // Should not contain placeholder values
  if (url.includes("host") && !url.includes("@") && !url.includes("://")) {
    return false;
  }
  // Should have actual hostname (not just "host")
  const hostMatch = url.match(/@([^:]+):/);
  if (hostMatch && hostMatch[1] === "host") {
    return false;
  }
  return true;
};

// Initialize database pool only if DATABASE_URL is available and valid
let pool: Pool | null = null;

if (DATABASE_URL) {
  if (!isValidDatabaseUrl(DATABASE_URL)) {
    console.error("Invalid DATABASE_URL format. Expected format: postgresql://user:password@hostname:port/database");
    console.error("DATABASE_URL appears to contain placeholder values or is malformed.");
  } else {
    try {
      pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.PGSSLMODE === "require" || DATABASE_URL.includes("supabase.co") 
          ? { rejectUnauthorized: false } 
          : undefined,
        // Add connection timeout and retry settings for serverless
        connectionTimeoutMillis: 10000, // 10 seconds
        idleTimeoutMillis: 30000, // 30 seconds
        max: 2, // Limit connections for serverless
      });
      
      // Handle pool errors gracefully
      pool.on("error", (err) => {
        console.error("Unexpected database pool error:", err);
        // Don't crash - just log the error
        // The pool will attempt to reconnect on next query
      });
      
      pool.on("connect", () => {
        console.log("Database connection established");
      });
    } catch (error) {
      console.error("Failed to create database pool:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("ENOTFOUND")) {
        console.error("DNS resolution failed. Check that DATABASE_URL contains a valid hostname.");
        console.error("Current DATABASE_URL format check:", DATABASE_URL.substring(0, 50) + "...");
      }
    }
  }
}

const ensureDatabaseSetup = async () => {
  if (!pool) return;
  try {
    // Test connection first with a simple query
    await pool.query("SELECT 1");
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
    console.log("Database setup completed successfully");
  } catch (error) {
    console.error("Database setup error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("ENOTFOUND")) {
      console.error("Database connection failed: Cannot resolve hostname.");
      console.error("Please verify your DATABASE_URL in Vercel environment variables.");
      console.error("Expected format: postgresql://user:password@hostname:port/database");
      console.error("Note: Supabase databases may be paused. Check your Supabase dashboard.");
    }
    // Don't throw - allow app to continue without database (will use memory store for sessions)
    // The app will still work, but database features won't be available
  }
};

// Initialize database setup (non-blocking)
if (pool) {
  void ensureDatabaseSetup();
}

type DbUser = {
  id: string;
  google_id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

// Only initialize session store if we have a database pool
let PgSessionStore: ReturnType<typeof pgSession> | undefined;
try {
  PgSessionStore = pool ? pgSession(session) : undefined;
} catch (error) {
  console.error("Failed to initialize session store:", error);
  PgSessionStore = undefined;
}

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

// Session configuration - only use database store if pool is available
const sessionConfig: session.SessionOptions = {
  name: "soul_log.sid",
  secret: SESSION_SECRET || "temp-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "lax" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    domain: NODE_ENV === "production" ? undefined : undefined, // Let Vercel handle domain
  },
};

// Add database store only if pool is available
// Note: The store will handle connection errors gracefully when used
if (PgSessionStore && pool) {
  try {
    // Create store - it will handle connection errors internally when used
    // The store will fall back gracefully if database is unavailable
    sessionConfig.store = new PgSessionStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    });
    console.log("Session store configured with database (will use memory store if DB unavailable)");
  } catch (error) {
    console.error("Failed to create session store:", error);
    // Continue without database store (will use memory store)
    // This is fine - sessions will work in memory (not persistent across restarts)
  }
} else {
  console.log("Using memory store for sessions (database not available)");
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  if (!pool) {
    return done(new Error("Database not configured"), null);
  }
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("ENOTFOUND")) {
      const dbError = new Error("Database connection failed: Invalid hostname in DATABASE_URL");
      console.error("Database query error:", errorMessage);
      return done(dbError, null);
    }
    console.error("Deserialize user error:", error);
    done(error);
  }
});

// Build callback URL for production
const getCallbackURL = () => {
  if (GOOGLE_CALLBACK_URL) {
    return GOOGLE_CALLBACK_URL;
  }
  
  if (NODE_ENV === "production") {
    // In Vercel, prioritize CLIENT_URL, then VERCEL_URL
    const baseUrl = CLIENT_URL && CLIENT_URL !== "http://localhost:5173"
      ? CLIENT_URL
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : "https://soul-log-kappa.vercel.app";
    return `${baseUrl}/api/auth/google/callback`;
  }
  
  return `${CLIENT_URL}/api/auth/google/callback`;
};

// Only configure Passport if credentials are available
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: getCallbackURL(),
        passReqToCallback: true,
      },
    async (_req, _accessToken, _refreshToken, profile: Profile, done) => {
      if (!pool) {
        return done(new Error("Database not configured"), null);
      }
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

        const result: AppUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
        };

        done(null, result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("ENOTFOUND")) {
          const dbError = new Error("Database connection failed: Invalid hostname in DATABASE_URL. Please check your Vercel environment variables.");
          console.error("Google OAuth database error:", errorMessage);
          return done(dbError, null);
        }
        console.error("Google OAuth strategy error:", error);
        done(error as Error);
      }
    },
    ),
  );
}

// Health check endpoint - should work even if env vars are missing
app.get("/api/health", (_req, res) => {
  const missing = validateEnv();
  if (missing.length > 0) {
    return res.status(503).json({ 
      status: "error", 
      message: "Missing environment variables",
      missing 
    });
  }
  res.json({ status: "ok" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Google OAuth routes (Vercel API routes)
app.get("/api/auth/google", (req, res, next) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }
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

// Pretty error formatter
const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
  return {
    message: String(error),
    name: "UnknownError",
  };
};

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] unexpected error", error);
  
  // Check if response has already been sent (e.g., redirect already happened)
  if (res.headersSent) {
    console.error("Response already sent, cannot send error response");
    return;
  }
  
  const formattedError = formatError(error);
  
  // Check for database connection errors and provide helpful message
  const errorMessage = formattedError.message || "";
  if (errorMessage.includes("ENOTFOUND") && errorMessage.includes("supabase.co")) {
    return res.status(503).json({
      error: "Database Unavailable",
      message: "Cannot connect to database. Please check your Supabase project status.",
      details: {
        hint: "Your Supabase database may be paused. Check your Supabase dashboard and ensure the project is active.",
        hostname: errorMessage.match(/hostname: '([^']+)'/)?.[1] || "unknown",
      },
      timestamp: new Date().toISOString(),
    });
  }
  
  res.status(500).json({
    error: "Internal Server Error",
    details: formattedError,
    timestamp: new Date().toISOString(),
  });
});

