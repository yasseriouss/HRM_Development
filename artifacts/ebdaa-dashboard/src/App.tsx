import { ThemeProvider } from "next-themes";
import { LangProvider } from "@/contexts/LangContext";
import Analytics from "@/pages/analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LangProvider>
        <Analytics />
        <VercelAnalytics />
      </LangProvider>
    </ThemeProvider>
  );
}
