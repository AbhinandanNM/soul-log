import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type SoulLogUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

type AuthContextValue = {
  user: SoulLogUser | null;
  loading: boolean;
  signInWithGoogle: (returnTo?: string) => void;
  signOut: () => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// In production on Vercel, use relative paths for API calls
// In development, use the full API URL
const getApiBaseUrl = () => {
  // Check if we're in production (on Vercel)
  if (import.meta.env.PROD || window.location.hostname !== "localhost") {
    // Use relative paths for same-origin requests
    return "";
  }
  // Development: use the configured API URL or default
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000";
};

const API_BASE_URL = getApiBaseUrl();

const buildUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  
  // For production, use /api prefix
  const apiPath = API_BASE_URL ? path : `/api${path}`;
  return `${API_BASE_URL.replace(/\/$/, "")}${apiPath}`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SoulLogUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(buildUrl("/auth/status"), {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = (await response.json()) as { authenticated: boolean; user: SoulLogUser | null };

      setUser(data.authenticated ? data.user : null);
    } catch (error) {
      console.error("Failed to fetch session", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      await fetchSession();
      if (isMounted) {
        setLoading(false);
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [fetchSession]);

  const value = useMemo<AuthContextValue>(() => {
    const signInWithGoogle = (returnTo?: string) => {
      try {
        // Build the full URL for Google OAuth
        const authPath = buildUrl("/auth/google");
        let authUrl: string;
        
        // If it's already a full URL, use it directly
        if (authPath.startsWith("http")) {
          authUrl = authPath;
        } else {
          // For production, use window.location.origin
          // For development, use API_BASE_URL
          const baseUrl = API_BASE_URL || window.location.origin;
          // Ensure we have a proper absolute URL
          authUrl = `${baseUrl}${authPath.startsWith("/") ? authPath : `/${authPath}`}`;
        }
        
        // Add returnTo parameter if provided
        if (returnTo) {
          try {
            const url = new URL(authUrl);
            url.searchParams.set("returnTo", returnTo);
            authUrl = url.toString();
          } catch (urlError) {
            // Fallback: append as query string
            const separator = authUrl.includes("?") ? "&" : "?";
            authUrl = `${authUrl}${separator}returnTo=${encodeURIComponent(returnTo)}`;
          }
        }

        // Log for debugging (remove in production if needed)
        console.log("Redirecting to Google OAuth:", authUrl);

        // Redirect to Google OAuth
        window.location.href = authUrl;
      } catch (error) {
        console.error("Error initiating Google sign-in:", error);
        // Show user-friendly error
        alert("Failed to initiate Google sign-in. Please check the console for details.");
      }
    };

    const signOut = async () => {
      try {
        const response = await fetch(buildUrl("/auth/logout"), {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          return { error: errorData.error ?? "Unable to sign out" };
        }

        setUser(null);
        return {};
      } catch (error) {
        console.error("Failed to sign out", error);
        return { error: "Unable to sign out" };
      }
    };

    const refreshUser = async () => {
      await fetchSession();
    };

    return {
      user,
      loading,
      signInWithGoogle,
      signOut,
      refreshUser,
    };
  }, [user, loading, fetchSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
