import type { VercelRequest, VercelResponse } from "@vercel/node";

// Lazy load server to avoid crashes at module load time
let app: any = null;

const getApp = async () => {
  if (!app) {
    try {
      // Use .js extension as that's what it will be after compilation
      const serverModule = await import("../server.js");
      app = serverModule.app;
    } catch (error) {
      console.error("Failed to load server:", error);
      throw error;
    }
  }
  return app;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp();
    return expressApp(req as any, res as any);
  } catch (error) {
    console.error("Handler error:", error);
    const errorDetails = error instanceof Error 
      ? {
          message: error.message,
          name: error.name,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        }
      : { message: String(error) };
    
    return res.status(500).json({
      error: "Internal Server Error",
      details: errorDetails,
      timestamp: new Date().toISOString(),
      path: "/api/auth/status",
    });
  }
}
