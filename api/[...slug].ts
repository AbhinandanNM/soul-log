import type { VercelRequest, VercelResponse } from "@vercel/node";
import { app } from "./server";

// Catch-all handler for all API routes - routes to Express app
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}

