import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: { pathname: string } } | undefined;
  const from = locationState?.from?.pathname || "/";

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/20">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <Card className="shadow-elevated">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-soul">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Welcome to Soul Log</CardTitle>
                <CardDescription>Sign in with Google to continue your wellness journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button type="button" className="w-full gap-2" onClick={() => signInWithGoogle(from)} disabled={loading}>
                  <LogIn className="h-4 w-4" />
                  Continue with Google
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  We use Google OAuth to keep your Soul Log entries secure. By continuing, you agree to let us store your
                  profile information in our PostgreSQL database.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;

