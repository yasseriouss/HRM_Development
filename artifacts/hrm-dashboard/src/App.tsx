import { ThemeProvider } from "next-themes";
import { LangProvider } from "@/contexts/LangContext";
import Analytics from "@/pages/analytics";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LangProvider>
        <Analytics />
      </LangProvider>
    </ThemeProvider>
  );
}
