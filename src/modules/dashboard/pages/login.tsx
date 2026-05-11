import { useState } from "react";
import { login, setToken } from "@modules/dashboard/lib/api";
import { useLang } from "@shared/contexts/LangContext";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Shield, Cpu, Activity, Lock } from "lucide-react";
import { Button } from "@shared/components/ui/button";

interface LoginProps {
  onLogin: () => void;
}

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
  </>
);

export default function Login({ onLogin }: LoginProps) {
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("super_admin@hrm-dev.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const isAr = lang === "ar";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      setToken(res.token as string);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dash_login_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden industrial-grid">
      <div className="scanline" />
      
      {/* Top Controls */}
      <div className="absolute top-8 right-8 flex items-center gap-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="h-10 w-10 border border-white/5 bg-white/5 hover:bg-white/10 text-secondary/40 hover:text-primary rounded-none transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="h-10 px-3 border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-headline font-black tracking-widest text-secondary/40 hover:text-white rounded-none transition-colors uppercase"
        >
          <Globe className="h-3 w-3 me-2" />
          {lang === "en" ? "AR" : "EN"}
        </Button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-primary/5 border border-primary/20 mb-6 relative group">
            <Cpu className="h-8 w-8 text-primary animate-pulse" />
            <div className="absolute -inset-2 border border-primary/10 group-hover:border-primary/30 transition-colors" />
          </div>
          <h1 className="text-4xl font-headline font-black text-white tracking-tighter uppercase mb-2">HRM UNIFIED</h1>
          <p className="text-[10px] font-mono text-primary/60 font-black tracking-[0.5em] uppercase italic">
            {t('dash_login_title')}
          </p>
        </div>

        <div className="bg-[#0A0A0A] border border-zinc-900 rounded-none p-10 relative group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <CornerMarks />
          
          <div className="flex items-center gap-3 mb-8 border-b border-zinc-900 pb-6">
            <Lock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-headline font-black text-white uppercase tracking-widest">{t('dash_login_sign_in')}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-headline font-black text-zinc-500 uppercase tracking-widest block">{t('dash_login_email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-white/5 border border-zinc-900 text-white font-mono text-xs focus:outline-none focus:border-primary/50 transition-colors rounded-none placeholder:text-zinc-800"
                required
                placeholder="AUTHENTICATION_ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-headline font-black text-zinc-500 uppercase tracking-widest block">{t('dash_login_password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-white/5 border border-zinc-900 text-white font-mono text-xs focus:outline-none focus:border-primary/50 transition-colors rounded-none placeholder:text-zinc-800"
                required
                placeholder="SECURITY_TOKEN"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                <Shield className="h-4 w-4 text-rose-500 shrink-0" />
                <p className="text-[10px] text-rose-500 font-headline font-black uppercase tracking-widest leading-tight">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-black text-[12px] tracking-[0.3em] uppercase transition-all rounded-none shadow-[0_0_20px_rgba(var(--primary),0.2)] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 animate-spin" />
                  {t('dash_login_signing_in')}
                </div>
              ) : t('dash_login_sign_in_btn')}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-900">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-3 w-3 text-zinc-600" />
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{t('dash_login_demo_creds')}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-zinc-500 uppercase">SYS_ADMIN: <span className="text-zinc-400">super_admin@hrm-dev.com / admin123</span></p>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">HR_COORD: <span className="text-zinc-400">hr@hrm-dev.com / hr123</span></p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-mono text-zinc-700 tracking-[0.4em] uppercase">
            {t('dash_login_created_by')} <span className="text-primary/60">yasserious.com</span>
          </p>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
    </div>
  );
}
