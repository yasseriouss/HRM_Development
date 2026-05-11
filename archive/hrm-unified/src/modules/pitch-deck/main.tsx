import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { ThemeProvider } from "next-themes";
import { LangProvider } from "./contexts/LangContext";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]}>
      <LangProvider>
        <Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <App />
        </Router>
      </LangProvider>
    </ThemeProvider>
  </StrictMode>,
);
