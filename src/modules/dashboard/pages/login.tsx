import { useState } from "react";
import { login, setToken, setUser } from "@modules/dashboard/lib/api";
import { useLang } from "@shared/contexts/LangContext";
import { Globe, Shield, Cpu, Activity, Lock } from "lucide-react";
import { Button } from "@shared/components/ui/button";

interface LoginProps {
  onLogin: () => void;
}

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-${color}/20`} />
    <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-${color}/20`} />
    <div className={`absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-${color}/20`} />
    <div className={`absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-${color}/20`} />
  </>
);

export default function Login({ onLogin }: LoginProps) {
  const { t, lang, setLang } = useLang();
  const [email, setEmail] = useState("super_admin@hrm-dev.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAr = lang === "ar";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      setToken(res.token as string);
      setUser(res.user);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dash_login_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Top Controls */}
      <div className="absolute top-8 right-8 flex items-center gap-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="h-10 px-3 border border-muted/20 bg-muted/5 hover:bg-muted/10 text-[10px] font-headline font-bold tracking-widest text-foreground hover:text-primary rounded-xl transition-colors uppercase"
        >
          <Globe className="h-3 w-3 me-2" />
          {lang === "en" ? "AR" : "EN"}
        </Button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-5 bg-primary/5 border border-primary/10 mb-6 relative group rounded-2xl">
            <Cpu className="h-10 w-10 text-primary" />
            <div className="absolute -inset-2 border border-primary/5 group-hover:border-primary/20 transition-colors rounded-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight uppercase mb-2">HRM UNIFIED</h1>
          <p className="text-[10px] font-body-default text-muted font-bold tracking-[0.3em] uppercase opacity-60">
            {t('dash_login_title')}
          </p>
        </div>

        <div className="bg-surface border border-muted/10 rounded-3xl p-10 relative group soft-shadow backdrop-blur-md">
          
          <div className="flex items-center gap-3 mb-8 border-b border-muted/5 pb-6">
            <Lock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-headline font-bold text-foreground uppercase tracking-widest">{t('dash_login_sign_in')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-headline font-bold text-muted uppercase tracking-widest block">{t('dash_login_email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-background border border-muted/10 text-foreground font-body-default text-xs focus:outline-none focus:border-primary/50 transition-colors rounded-xl placeholder:text-muted/50"
                required
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-headline font-bold text-muted uppercase tracking-widest block">{t('dash_login_password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-background border border-muted/10 text-foreground font-body-default text-xs focus:outline-none focus:border-primary/50 transition-colors rounded-xl placeholder:text-muted/50"
                required
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                <Shield className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-[10px] text-destructive font-headline font-bold uppercase tracking-widest leading-tight">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-bold text-[12px] tracking-[0.25em] uppercase transition-all rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 animate-spin" />
                  {t('dash_login_signing_in')}
                </div>
              ) : t('dash_login_sign_in_btn')}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-muted/5">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-3 w-3 text-muted" />
              <p className="text-[9px] text-muted font-bold uppercase tracking-widest">{t('dash_login_demo_creds')}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-body-default text-muted font-bold uppercase">SYS_ADMIN: <span className="text-foreground/70 tracking-normal">super_admin@hrm-dev.com / admin123</span></p>
              <p className="text-[10px] font-body-default text-muted font-bold uppercase">HR_COORD: <span className="text-foreground/70 tracking-normal">hr@hrm-dev.com / hr123</span></p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-body-default text-muted font-bold tracking-[0.2em] uppercase opacity-60">
            {t('dash_login_created_by')} <span className="text-primary hover:text-foreground transition-colors cursor-pointer">yasserious.com</span>
          </p>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
    </div>
  );
}
