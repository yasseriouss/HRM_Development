import { useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useLogin } from "@hrm-development/api-client-react";
import { setAuthToken, setAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/contexts/LangContext";
import { useT } from "@/i18n";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={t("toggle_theme")}
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          title={t("toggle_language")}
          className="px-2 py-1 rounded text-xs font-bold text-muted-foreground hover:text-primary hover:bg-muted transition-colors border border-border"
        >
          {lang === "en" ? "عر" : "EN"}
        </button>
      </div>

      <div className="w-full max-w-md space-y-8 flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-widest uppercase">{t("login_brand")}</h1>
          <p className="text-muted-foreground mt-2">{t("login_title")}</p>
        </div>

        <Card className="border-primary/20 bg-card/50 backdrop-blur w-full">
          <CardHeader>
            <CardTitle>{t("login_sign_in")}</CardTitle>
            <CardDescription>{t("login_sign_in_desc")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("login_email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ebdaa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("login_password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? t("login_authenticating") : t("login_submit")}
              </Button>

              <div className="text-xs text-muted-foreground text-center space-y-1 pt-4 border-t border-border w-full">
                <p className="font-medium">{t("login_demo_credentials")}</p>
                <p>super_admin@ebdaa.com / admin123</p>
                <p>hr@ebdaa.com / hr123</p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          <a
            href="https://yasserious.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {t("created_by")}
          </a>
        </p>
      </footer>
    </div>
  );
}
