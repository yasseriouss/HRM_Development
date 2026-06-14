import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Lock, User, Globe, Zap } from "lucide-react";
import { useLogin } from "../../../api";
import { setAuthToken, setAuthUser } from "@modules/skill-matrix/lib/auth";
import { Button } from "@shared/components/ui/button";
import { getBrandLogoUrl } from "@shared/lib/brand";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@shared/components/ui/card";
import { useToast } from "@shared/hooks/use-toast";
import { useLang } from "@shared/contexts/LangContext";
import { useT } from "@modules/skill-matrix/i18n";
import { motion, AnimatePresence } from "framer-motion";

// CornerMarks removed - legacy industrial element


export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Editorial Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(64%_0.13_28/0.05)_0%,transparent_70%)]" />
      
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(var(--muted) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Top Controls - Standardized */}
      <div className="absolute top-10 right-10 flex items-center gap-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="h-12 px-6 border border-muted/20 bg-surface/50 backdrop-blur-md hover:bg-surface text-xs font-headline font-bold tracking-tight text-muted-foreground hover:text-primary rounded-2xl transition-all uppercase shadow-sm"
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
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-surface border border-muted/20 rounded-3xl flex items-center justify-center relative shadow-xl shadow-primary/5 p-3">
              <img
                src={getBrandLogoUrl()}
                alt="HRM Unified"
                className="max-h-full max-w-full object-contain"
                width={160}
                height={80}
              />
              <div className="absolute -inset-3 border border-primary/10 rounded-4xl animate-[pulse_3s_infinite]" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-6xl font-headline font-extrabold text-foreground tracking-tight leading-none">{t("login_brand")}</h1>
            <div className="flex items-center justify-center gap-4">
               <div className="h-px flex-1 bg-linear-to-r from-transparent to-primary/20" />
               <span className="text-[10px] font-mono text-primary font-black tracking-[0.5em] uppercase">{t("label_system_access_portal")}</span>
               <div className="h-px flex-1 bg-linear-to-l from-transparent to-primary/20" />
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <Card className="border border-muted/20 bg-surface/80 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-primary/5">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          
          <CardHeader className="relative p-12 pb-6 text-center">
            <CardTitle className="font-headline font-extrabold text-3xl text-foreground tracking-tight leading-none">{t("login_sign_in")}</CardTitle>
            <CardDescription className="text-muted-foreground font-sans text-xs font-medium uppercase tracking-wider mt-4 flex items-center justify-center gap-2">
              <Lock className="h-3.5 w-3.5 text-primary/60" />{t("login_sign_in_desc")}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit} className="relative">
            <CardContent className="p-12 space-y-10">
              <div className="space-y-4">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase flex items-center gap-3">
                  <User className="h-4 w-4 text-primary" />{t("login_email")}
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("label_node_identifier")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-16 bg-background/50 border-muted/20 rounded-2xl font-sans text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all px-6"
                  />
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 w-0 bg-primary/40 group-focus-within:w-[calc(100%-32px)] transition-all duration-500" />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase flex items-center gap-3">
                  <Lock className="h-4 w-4 text-primary" />{t("login_password")}
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("label_secure_phrase")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-16 bg-background/50 border-muted/20 rounded-2xl font-sans text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all px-6"
                  />
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 w-0 bg-primary/40 group-focus-within:w-[calc(100%-32px)] transition-all duration-500" />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-12 pt-0 flex flex-col gap-10">
              <Button
                type="submit"
                variant="default"
                className="w-full h-18 text-sm font-bold tracking-tight rounded-2xl shadow-xl shadow-primary/10 group relative overflow-hidden transition-all duration-500"
                disabled={loginMutation.isPending}
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-3 animate-pulse">
                    <Zap className="h-4 w-4 animate-spin text-white" />{t("action_authorizing_stream")}
                  </span>
                ) : (
                  <span className="flex items-center gap-3 font-headline uppercase tracking-widest">{t("action_execute_login")} <Zap className="h-4 w-4 group-hover:scale-110 transition-transform duration-500" />
                  </span>
                )}
              </Button>

              <div className="w-full space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-muted/20" />
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{t("login_demo_credentials")}</p>
                  <div className="h-px flex-1 bg-muted/20" />
                </div>
                
                <div className="bg-background/50 p-8 space-y-4 border border-muted/10 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <Shield className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-3 font-sans text-xs text-muted-foreground font-medium">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-muted/5 pb-3">
                      <span className="font-bold text-primary/80 uppercase tracking-tight">ADMIN:</span>
                      <span className="text-foreground/70">super_admin@hrm-dev.com // admin123</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <span className="font-bold text-primary/80 uppercase tracking-tight">COORDINATOR:</span>
                      <span className="text-foreground/70">hr@hrm-dev.com // hr123</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <footer className="absolute bottom-12 w-full px-12 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{t("label_secure_link")}</span>
                <span className="text-[9px] font-medium text-muted-foreground uppercase">{t("label_encryption_active")}</span>
              </div>
           </div>

           <div className="flex items-center gap-10">
              <div className="flex flex-col items-end opacity-40 hover:opacity-100 transition-opacity">
                 <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{t("label_node_telemetry")}</span>
                 <span className="text-[11px] font-black text-primary uppercase">0.0004MS RESPONSE</span>
              </div>
              <a
                href="https://yasserious.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 group"
              >
                <div className="h-10 w-px bg-muted/20" />
                <div className="text-end">
                   <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-none mb-1">{t('common_created_by')}</p>
                   <p className="text-xs font-headline font-extrabold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{t("label_yasserious_eng")}</p>
                </div>
              </a>
           </div>
        </div>
      </footer>
    </div>
  );
}
