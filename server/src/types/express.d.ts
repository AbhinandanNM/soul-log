import "express-session";

declare module "express-session" {
  interface SessionData {
    returnTo?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string | null;
      name: string | null;
      avatarUrl: string | null;
    }
  }
}

export {};



