import type { VercelRequest, VercelResponse } from "@vercel/node";

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

    if (missing.length > 0) {
      return res.status(503).json({
        status: "error",
        message: "Missing environment variables",
        missing,
      });
    }

    return res.json({ status: "ok" });
  } catch (error) {
    console.error("Health check error:", error);
    return res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

