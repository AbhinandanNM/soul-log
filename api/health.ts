import type { VercelRequest, VercelResponse } from "@vercel/node";

// Helper to safely show connection string info (without password)
const getDatabaseInfo = (url: string | undefined) => {
  if (!url) return { exists: false, format: "missing" };
  
  try {
    // Check if it's a valid postgres URL
    if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
      return { exists: true, format: "invalid", error: "Must start with postgresql:// or postgres://" };
    }
    
    // Try to parse it
    const urlObj = new URL(url);
    const hasPassword = urlObj.password && urlObj.password !== "[YOUR-PASSWORD]";
    
    return {
      exists: true,
      format: "valid",
      hostname: urlObj.hostname || "unknown",
      port: urlObj.port || "default",
      database: urlObj.pathname?.replace("/", "") || "unknown",
      hasPassword: hasPassword,
      passwordPlaceholder: url.includes("[YOUR-PASSWORD]"),
    };
  } catch (error) {
    return {
      exists: true,
      format: "invalid",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

// Simple health check that doesn't depend on the full server
export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Check environment variables
    const missing: string[] = [];
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      missing.push("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
    }
    if (!process.env.DATABASE_URL) {
      missing.push("DATABASE_URL");
    }
    if (!process.env.SESSION_SECRET) {
      missing.push("SESSION_SECRET");
    }

    // Get database connection info
    const dbInfo = getDatabaseInfo(process.env.DATABASE_URL);
    
    if (missing.length > 0) {
      return res.status(503).json({
        status: "error",
        message: "Missing environment variables",
        missing,
        database: dbInfo,
      });
    }

    // Check if DATABASE_URL has issues
    if (dbInfo.passwordPlaceholder) {
      return res.status(503).json({
        status: "error",
        message: "DATABASE_URL contains placeholder password",
        hint: "Replace [YOUR-PASSWORD] with your actual database password in Vercel environment variables",
        database: dbInfo,
      });
    }

    if (dbInfo.format === "invalid") {
      return res.status(503).json({
        status: "error",
        message: "DATABASE_URL format is invalid",
        database: dbInfo,
      });
    }

    return res.json({ 
      status: "ok",
      database: {
        hostname: dbInfo.hostname,
        port: dbInfo.port,
        database: dbInfo.database,
        connected: true,
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    const errorDetails = error instanceof Error 
      ? {
          message: error.message,
          name: error.name,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        }
      : { message: String(error) };
    
    return res.status(500).json({
      status: "error",
      message: "Health check failed",
      details: errorDetails,
      timestamp: new Date().toISOString(),
    });
  }
}

