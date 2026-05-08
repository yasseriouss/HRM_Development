import { useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Sun, Moon, Shield, Lock, User, Globe, Cpu, AlertCircle, Zap, ShieldCheck } from "lucide-react";
import { useLogin } from "@hrm-development/api-client-react";
import { setAuthToken, setAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/contexts/LangContext";
import { useT } from "@/i18n";
import { motion, AnimatePresence } from "framer-motion";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r border-${color}/40`} />
  </>
);

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginMutation.mutateAsync({ data: { email, password } });
      setAuthToken(response.token);
      setAuthUser(response.user);
      setLocation("/");
    } catch {
      toast({
        title: t("login_failed_title"),
        description: t("login_failed_desc"),
        variant: "destructive",
      });
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-6 font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      {/* Deep Industrial Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0F0F0F_0%,#000000_100%)]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      
      {/* Floating UI Elements / Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(#primary 1px, transparent 1px), linear-gradient(90deg, #primary 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      {/* Top Controls - Standardized */}
      <div className="absolute top-10 right-10 flex items-center gap-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="h-12 w-12 border border-white/5 bg-black/40 backdrop-blur-md hover:bg-white/10 text-zinc-500 hover:text-primary rounded-none transition-all shadow-2xl"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="h-12 px-6 border border-white/5 bg-black/40 backdrop-blur-md hover:bg-white/10 text-[10px] font-headline font-black tracking-[0.2em] text-zinc-500 hover:text-white rounded-none transition-all uppercase shadow-2xl"
        >
          <Globe className="h-3.5 w-3.5 mr-3 text-primary" />
          {lang === "en" ? "AR" : "EN"}
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[520px] space-y-12 z-10"
      >
        {/* Brand Header - Mission Control Style */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-black border-2 border-primary/20 flex items-center justify-center relative shadow-[0_0_40px_rgba(255,255,255,0.03)]">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div className="absolute -inset-2 border border-primary/10 animate-[pulse_3s_infinite]" />
              <CornerMarks />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-headline font-black text-white tracking-tighter uppercase leading-none">
               {t("login_brand")}
            </h1>
            <div className="flex items-center justify-center gap-4">
               <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary/20" />
               <span className="text-[10px] font-mono text-primary font-black tracking-[0.5em] uppercase">SYSTEM_ACCESS_PORTAL_v2.4</span>
               <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary/20" />
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <Card className="border-2 border-zinc-900 bg-[#0A0A0A]/80 backdrop-blur-2xl rounded-none relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          
          <CardHeader className="relative p-12 pb-6 text-center">
            <CardTitle className="font-headline font-black text-3xl text-white uppercase tracking-tighter leading-none">{t("login_sign_in")}</CardTitle>
            <CardDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
              <Lock className="h-3 w-3" /> {t("login_sign_in_desc")}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit} className="relative">
            <CardContent className="p-12 space-y-10">
              <div className="space-y-4">
                <Label className="font-headline font-black text-[10px] text-zinc-600 tracking-[0.3em] uppercase flex items-center gap-3">
                  <User className="h-3.5 w-3.5 text-primary" /> {t("login_email")}
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="NODE_IDENTIFIER"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-16 bg-white/5 border-zinc-800 rounded-none font-mono text-sm tracking-[0.1em] text-white placeholder:text-zinc-800 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all px-6"
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-headline font-black text-[10px] text-zinc-600 tracking-[0.3em] uppercase flex items-center gap-3">
                  <Lock className="h-3.5 w-3.5 text-primary" /> {t("login_password")}
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="SECURE_PHRASE"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-16 bg-white/5 border-zinc-800 rounded-none font-mono text-sm tracking-[0.1em] text-white placeholder:text-zinc-800 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all px-6"
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-12 pt-0 flex flex-col gap-10">
              <Button
                type="submit"
                className="w-full h-18 bg-primary text-primary-foreground hover:bg-primary/90 font-headline font-black text-xs tracking-[0.3em] uppercase rounded-none transition-all py-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-[0.98] group"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-3 animate-pulse">
                    <Zap className="h-4 w-4 animate-spin" /> AUTHORIZING_STREAM...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    EXECUTE_LOGIN_SEQUENCE <Zap className="h-4 w-4 group-hover:text-amber-300 transition-colors" />
                  </span>
                )}
              </Button>

              <div className="w-full space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-900" />
                  <p className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest">{t("login_demo_credentials")}</p>
                  <div className="h-px flex-1 bg-zinc-900" />
                </div>
                
                <div className="bg-white/5 p-8 space-y-4 border border-zinc-900 relative">
                  <AlertCircle className="absolute -right-2 -top-2 h-6 w-6 text-primary opacity-20" />
                  <div className="space-y-3 font-mono text-[9px] text-zinc-600 uppercase tracking-tighter">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-zinc-900 pb-3">
                      <span className="font-black text-primary">ADMIN_NODE:</span>
                      <span className="text-zinc-400">super_admin@hrm-dev.com // admin123</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <span className="font-black text-primary">COORD_NODE:</span>
                      <span className="text-zinc-400">hr@hrm-dev.com // hr123</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </form>
          <CornerMarks />
        </Card>
      </motion.div>

      {/* Industrial Footer Status */}
      <footer className="absolute bottom-12 w-full px-12 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6 opacity-30 group hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-black text-white uppercase tracking-widest">SECURE_LINK_ESTABLISHED</span>
                <span className="text-[8px] font-mono text-zinc-700 uppercase">AES-256-GCM_ENCRYPTION_ACTIVE</span>
              </div>
           </div>

           <div className="flex items-center gap-10">
              <div className="flex flex-col items-end opacity-20 hover:opacity-50 transition-opacity">
                 <span className="text-[8px] font-mono text-white uppercase tracking-tighter">NODE_TELEMETRY</span>
                 <span className="text-[10px] font-mono font-black text-primary uppercase">LATENCY: 0.0004MS</span>
              </div>
              <a
                href="https://yasserious.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="h-10 w-[1px] bg-zinc-900" />
                <div className="text-right">
                   <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest leading-none">{t("created_by")}</p>
                   <p className="text-[10px] font-headline font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">YASSERIOUS_ENGINEERING</p>
                </div>
              </a>
           </div>
        </div>
      </footer>
    </div>
  );
}
