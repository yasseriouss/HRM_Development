import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <p className="text-8xl font-bold text-primary">404</p>
          <h1 className="text-2xl font-semibold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            The page you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
        <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">
          Back to Dashboard
        </Button>
      </div>
      <footer className="absolute bottom-6 text-xs text-muted-foreground">
        Created by{" "}
        <a
          href="https://yasserious.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          yasserious.com
        </a>
      </footer>
    </div>
  );
}
