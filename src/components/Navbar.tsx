import { Link, useLocation } from "react-router-dom";
import { Brain, Heart, Sparkles, BookOpen, Home, LogOut, LogIn, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const initials = user?.name?.[0] ?? user?.email?.[0] ?? "S";

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/mind", label: "Mind", icon: Brain },
    { path: "/body", label: "Body", icon: Heart },
    { path: "/soul", label: "Soul", icon: Sparkles },
    { path: "/journal", label: "Journal", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-mind flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline">Soul Log</span>
          </Link>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                asChild
                variant={location.pathname === path ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "transition-all",
                  location.pathname === path && "shadow-soft"
                )}
              >
                <Link to={path} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </Button>
            ))}
            <div className="ml-2 flex items-center gap-2">
              {loading ? (
                <Button variant="ghost" size="sm" disabled className="gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Loading</span>
                </Button>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 pl-1 pr-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? user.email ?? "Soul Log user"} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-sm">{user.name ?? user.email ?? "My Soul Log"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="font-medium leading-tight">{user.name ?? "Soul Log member"}</p>
                      {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/journal">Open Journal</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/mind">Mind Insights</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/soul">Soul Practices</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 text-destructive focus:text-destructive"
                      onSelect={async () => {
                        const { error } = await signOut();
                        if (error) {
                          toast({
                            title: "Sign out failed",
                            description: error,
                            variant: "destructive",
                          });
                        } else {
                          toast({
                            title: "Signed out",
                            description: "See you again soon.",
                          });
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button size="sm" className="gap-2" onClick={() => signInWithGoogle(location.pathname)}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
