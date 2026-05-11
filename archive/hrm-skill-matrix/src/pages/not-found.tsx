import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { AlertTriangle, Home, Terminal, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-s-2 border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-e-2 border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-s-2 border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-e-2 border-${color}/40`} />
  </>
);

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      
      {/* Glitch Effect Background Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
        <h1 className="text-[40rem] font-headline font-black tracking-tighter">404</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 p-16 max-w-2xl w-full text-center space-y-10 border-2 border-rose-500/20 bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(225,29,72,0.05)]"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <ShieldAlert className="h-20 w-20 text-rose-500 animate-pulse" />
              <div className="absolute -inset-4 border border-rose-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 bg-rose-500" />
              <span className="font-headline font-black tracking-[0.4em] uppercase text-[10px] text-rose-500">ACCESS DENIED // PATH NOT FOUND
              </span>
              <div className="h-1 w-8 bg-rose-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-8xl font-headline font-black tracking-tighter text-white uppercase leading-none">404 ERR
            </h1>
            <p className="text-secondary/40 font-mono text-sm max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
              The requested node does not exist within the current sector or has been permanently decommissioned.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-white/5">
          <Button 
            onClick={() =>navigate("/")} 
            className="w-full sm:w-auto rounded-none bg-primary text-primary-foreground font-headline font-black text-[11px] tracking-[0.2em] uppercase py-7 px-12 h-auto hover:bg-primary/90 transition-all shadow-[0 0 20px_rgba(255,255,255,0.05)]"
          >
            <Home className="h-4 w-4 me-3" />INITIALIZE RETURN SEQ
          </Button>
          
          <Button 
            variant="outline"
            className="w-full sm:w-auto rounded-none border-zinc-800 bg-zinc-900/50 text-white font-headline font-black text-[11px] tracking-[0.2em] uppercase py-7 px-12 h-auto hover:bg-zinc-800 transition-all"
            onClick={() => window.location.reload()}
          >
            <Terminal className="h-4 w-4 me-3 text-rose-500" />RETRY HANDSHAKE
          </Button>
        </div>

        <div className="pt-8 flex items-center justify-between font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
           <span>SECTOR FAILURE_v4.1</span>
           <span className="flex items-center gap-2">
             <AlertTriangle className="h-3 w-3" />RETRYING CONNECTION...
           </span>
        </div>

        <CornerMarks color="rose" />
      </motion.div>

      <footer className="absolute bottom-10 z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-px w-12 bg-white/10" />
          <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.4em]">HRM SYSTEM AUTO LOG
          </p>
          <div className="h-px w-12 bg-white/10" />
        </div>
        <p className="text-[9px] font-mono text-zinc-800">
          DEVELOPED BY :: <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors border-b border-transparent hover:border-primary">YASSERIOUS.COM</a>
        </p>
      </footer>
    </div>
  );
}
