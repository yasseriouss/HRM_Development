import { Button } from "@shared/components/ui/button";
import { useLocation } from "wouter";
import { AlertTriangle, Home, Terminal, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background font-sans selection:bg-primary/30 selection:text-foreground overflow-hidden text-foreground">
      
      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
        <h1 className="text-[40rem] font-headline font-bold tracking-tighter">404</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 p-16 max-w-2xl w-full text-center space-y-10 border border-muted/10 bg-surface/50 rounded-3xl shadow-sm"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <ShieldAlert className="h-20 w-20 text-destructive" />
              <div className="absolute -inset-4 border border-destructive/20 rounded-full animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 bg-destructive/50 rounded-full" />
              <span className="font-headline font-bold tracking-[0.2em] uppercase text-[10px] text-destructive">ACCESS DENIED // PATH NOT FOUND
              </span>
              <div className="h-1 w-8 bg-destructive/50 rounded-full" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-8xl font-headline font-bold tracking-tighter text-foreground uppercase leading-none">404 ERR
            </h1>
            <p className="text-muted font-headline font-bold text-sm max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
              The requested node does not exist within the current sector or has been permanently decommissioned.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-muted/10">
          <Button 
            onClick={() =>navigate("/")} 
            className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground font-headline font-bold text-[11px] tracking-widest uppercase py-7 px-12 h-auto hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <Home className="h-4 w-4 me-3" />INITIALIZE RETURN SEQ
          </Button>
          
          <Button 
            variant="outline"
            className="w-full sm:w-auto rounded-full border-muted/20 bg-background text-foreground font-headline font-bold text-[11px] tracking-widest uppercase py-7 px-12 h-auto hover:bg-muted/5 transition-all"
            onClick={() => window.location.reload()}
          >
            <Terminal className="h-4 w-4 me-3 text-destructive" />RETRY HANDSHAKE
          </Button>
        </div>

        <div className="pt-8 flex items-center justify-between font-headline font-bold text-[9px] text-muted uppercase tracking-widest">
           <span>SECTOR FAILURE_v4.1</span>
           <span className="flex items-center gap-2">
             <AlertTriangle className="h-3 w-3" />RETRYING CONNECTION...
           </span>
        </div>
      </motion.div>

      <footer className="absolute bottom-10 z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-px w-12 bg-muted/20" />
          <p className="text-[10px] font-headline font-bold text-muted uppercase tracking-[0.2em]">HRM SYSTEM AUTO LOG
          </p>
          <div className="h-px w-12 bg-muted/20" />
        </div>
        <p className="text-[9px] font-headline font-bold text-muted tracking-widest uppercase">
          DEVELOPED BY :: <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors border-b border-transparent hover:border-primary">YASSERIOUS.COM</a>
        </p>
      </footer>
    </div>
  );
}