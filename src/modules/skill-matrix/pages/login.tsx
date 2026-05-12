import { useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Sun, Moon, Shield, Lock, User, Globe, Cpu, AlertCircle, Zap, ShieldCheck } from "lucide-react";
import { useLogin } from "@hrm-development/api-client-react";
import { setAuthToken, setAuthUser } from "@modules/skill-matrix/lib/auth";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@shared/components/ui/card";
import { useToast } from "@shared/hooks/use-toast";
import { useLang } from "@shared/contexts/LangContext";
import { useT } from "@modules/skill-matrix/i18n";
import { motion, AnimatePresence } from "framer-motion";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.3)]`} />
    <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.3)]`} />
    <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.3)]`} />
    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.3)]`} />
  </>);

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
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

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
          <Globe className="h-3.5 w-3.5 me-3 text-primary" />
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
            <h1 className="text-6xl font-headline font-black text-white tracking-tighter uppercase leading-none">{t("login_brand")}
            </h1>
            <div className="flex items-center justify-center gap-4">
               <div className="h-px flex-1 bg-linear-to-r from-transparent to-primary/20" />
               <span className="text-[10px] font-mono text-primary font-black tracking-[0.5em] uppercase">{t("label_system_access_portal")}</span>
               <div className="h-px flex-1 bg-linear-to-l from-transparent to-primary/20" />
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <Card className="border-2 border-zinc-900 bg-[#0A0A0A]/80 backdrop-blur-2xl rounded-none relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          
          <CardHeader className="relative p-12 pb-6 text-center">
            <CardTitle className="font-headline font-black text-3xl text-white uppercase tracking-tighter leading-none">{t("login_sign_in")}</CardTitle>
            <CardDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
              <Lock className="h-3 w-3" />{t("login_sign_in_desc")}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit} className="relative">
            <CardContent className="p-12 space-y-10">
              <div className="space-y-4">
                <Label className="font-headline font-black text-[10px] text-zinc-600 tracking-[0.3em] uppercase flex items-center gap-3">
                  <User className="h-3.5 w-3.5 text-primary" />{t("login_email")}
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("label_node_identifier")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-16 bg-white/5 border-zinc-800 rounded-none font-mono text-sm tracking-widest text-white placeholder:text-zinc-800 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all px-6"
                  />
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-headline font-black text-[10px] text-zinc-600 tracking-[0.3em] uppercase flex items-center gap-3">
                  <Lock className="h-3.5 w-3.5 text-primary" />{t("login_password")}
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("label_secure_phrase")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-16 bg-white/5 border-zinc-800 rounded-none font-mono text-sm tracking-widest text-white placeholder:text-zinc-800 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all px-6"
                  />
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-primary group-focus-within:w-full transition-all duration-500" />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-12 pt-0 flex flex-col gap-10">
              <Button
                type="submit"
                variant="default"
                className="w-full h-18 text-xs tracking-[0.4em] shadow-[0_20px_40px_rgba(0,0,0,0.4)] group relative overflow-hidden transition-all duration-500 hover:shadow-primary/20"
                disabled={loginMutation.isPending}
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-3 animate-pulse">
                    <Zap className="h-4 w-4 animate-spin text-primary" />{t("action_authorizing_stream")}
                  </span>
                ) : (
                  <span className="flex items-center gap-3">{t("action_execute_login")} <Zap className="h-4 w-4 group-hover:text-primary transition-colors duration-500" />
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
                      <span className="font-black text-primary">ADMIN NODE:</span>
                      <span className="text-zinc-400">super_admin@hrm-dev.com // admin123</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <span className="font-black text-primary">COORD NODE:</span>
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
                <span className="text-[9px] font-mono font-black text-white uppercase tracking-widest">{t("label_secure_link")}</span>
                <span className="text-[8px] font-mono text-zinc-700 uppercase">{t("label_encryption_active")}</span>
              </div>
           </div>

           <div className="flex items-center gap-10">
              <div className="flex flex-col items-end opacity-20 hover:opacity-50 transition-opacity">
                 <span className="text-[8px] font-mono text-white uppercase tracking-tighter">{t("label_node_telemetry")}</span>
                 <span className="text-[10px] font-mono font-black text-primary uppercase">LATENCY: 0.0004MS</span>
              </div>
              <a
                href="https://yasserious.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <div className="h-10 w-px bg-zinc-900" />
                <div className="text-end">
                   <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest leading-none">{t('common_created_by')}</p>
                   <p className="text-[10px] font-headline font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">{t("label_yasserious_eng")}</p>
                </div>
              </a>
           </div>
        </div>
      </footer>
    </div>
  );
}
