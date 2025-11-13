import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            Made with <Heart className="h-4 w-4 fill-destructive text-destructive" /> for your wellness journey
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mind Body Soul Log. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
