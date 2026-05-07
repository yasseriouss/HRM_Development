import { useState } from "react";
import { login, setToken } from "@/lib/api";
import { useT } from "@/i18n";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const t = useT();
  const [email, setEmail] = useState("super_admin@ebdaa.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      setToken(res.token as string);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login_failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">EBDAA</h1>
          <p className="text-muted-foreground mt-1">{t("login_title")}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-foreground mb-6">{t("login_sign_in")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t("login_email")}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t("login_password")}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t("login_signing_in") : t("login_sign_in_btn")}
            </button>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-medium mb-1">{t("login_demo_creds")}</p>
            <p className="text-xs text-muted-foreground">super_admin@ebdaa.com / admin123</p>
            <p className="text-xs text-muted-foreground">hr@ebdaa.com / hr123</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {t("login_created_by")} <span className="text-primary">yasserious.com</span>
        </p>
      </div>
    </div>
  );
}
