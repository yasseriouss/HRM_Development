import { useState, useEffect, useRef, useCallback } from "react";
import docContentEn from "./docs-content.html?raw";
// In a real scenario, we'd have docs-content-ar.html too.
// For now we'll use the same content or a placeholder.
import { useLang } from "./contexts/LangContext";
import { useT } from "./i18n";

interface NavItem { id: string; labelKey: string; }
interface NavGroup { id: string; labelKey: string; items: NavItem[]; }
interface SearchResult { id: string; title: string; snippetHtml: string; }

const NAV_GROUPS: NavGroup[] = [
  { id: "getting-started", labelKey: "group_getting_started", items: [
    { id: "introduction", labelKey: "nav_introduction" },
    { id: "quick-start", labelKey: "nav_quick_start" },
    { id: "system-requirements", labelKey: "nav_system_requirements" },
  ]},
  { id: "architecture", labelKey: "group_architecture", items: [
    { id: "architecture", labelKey: "nav_system_architecture" },
    { id: "tech-stack", labelKey: "nav_tech_stack" },
    { id: "data-flow", labelKey: "nav_data_flow" },
  ]},
  { id: "database", labelKey: "group_database", items: [
    { id: "schema-users", labelKey: "nav_schema_users" },
    { id: "schema-departments", labelKey: "nav_schema_departments" },
    { id: "schema-employees", labelKey: "nav_schema_employees" },
    { id: "schema-skills", labelKey: "nav_schema_skills" },
    { id: "schema-campaigns", labelKey: "nav_schema_campaigns" },
    { id: "schema-evaluations", labelKey: "nav_schema_evaluations" },
    { id: "schema-summaries", labelKey: "nav_schema_summaries" },
    { id: "schema-training", labelKey: "nav_schema_training" },
    { id: "schema-audit", labelKey: "nav_schema_audit" },
    { id: "schema-relationships", labelKey: "nav_schema_relationships" },
    { id: "schema-rls", labelKey: "nav_schema_rls" },
  ]},
  { id: "api", labelKey: "group_api", items: [
    { id: "api-auth", labelKey: "nav_api_auth" },
    { id: "api-dashboard", labelKey: "nav_api_dashboard" },
    { id: "api-departments", labelKey: "nav_api_departments" },
    { id: "api-employees", labelKey: "nav_api_employees" },
    { id: "api-skills", labelKey: "nav_api_skills" },
    { id: "api-campaigns", labelKey: "nav_api_campaigns" },
    { id: "api-evaluations", labelKey: "nav_api_evaluations" },
    { id: "api-training", labelKey: "nav_api_training" },
    { id: "api-reports", labelKey: "nav_api_reports" },
  ]},
  { id: "user-guides", labelKey: "group_user_guides", items: [
    { id: "role-super-admin", labelKey: "nav_role_super_admin" },
    { id: "role-dept-head", labelKey: "nav_role_dept_head" },
    { id: "role-hr", labelKey: "nav_role_hr" },
    { id: "role-employee", labelKey: "nav_role_employee" },
  ]},
  { id: "technical", labelKey: "group_technical", items: [
    { id: "scoring", labelKey: "nav_scoring" },
    { id: "campaigns-logic", labelKey: "nav_campaigns_logic" },
    { id: "training-logic", labelKey: "nav_training_logic" },
  ]},
  { id: "operations", labelKey: "group_operations", items: [
    { id: "migration", labelKey: "nav_migration" },
    { id: "deployment", labelKey: "nav_deployment" },
    { id: "env-vars", labelKey: "nav_env_vars" },
    { id: "demo-credentials", labelKey: "nav_demo_credentials" },
    { id: "changelog", labelKey: "nav_changelog" },
  ]},
];

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlight(text: string, q: string): string {
  const re = new RegExp("(" + escapeRe(q) + ")", "gi");
  return text.replace(re, "<mark>$1</mark>");
}
function getSnippet(rawText: string, q: string): string {
  const lower = rawText.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx === -1) return rawText.slice(0, 120) + (rawText.length > 120 ? "…" : "");
  const start = Math.max(0, idx - 40);
  const end = Math.min(rawText.length, idx + q.length + 80);
  const snippet = (start > 0 ? "…" : "") + rawText.slice(start, end) + (end < rawText.length ? "…" : "");
  return highlight(snippet, q);
}

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { lang, setLang } = useLang();
  const t = useT();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["getting-started", "architecture", "database", "api", "user-guides", "technical", "operations"])
  );
  const [activeSection, setActiveSection] = useState("introduction");
  const [breadcrumb, setBreadcrumb] = useState("Introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchIndexRef = useRef<{ id: string; title: string; fullText: string; rawText: string }[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!mainRef.current) return;
    const index: typeof searchIndexRef.current = [];
    mainRef.current.querySelectorAll("h2[id], h3[id]").forEach((heading) => {
      const id = heading.id;
      const title = heading.textContent?.trim() || "";
      const texts = [title];
      let el = heading.nextElementSibling;
      while (el) {
        if (el.tagName === "H2") break;
        if (heading.tagName === "H3" && el.tagName === "H3") break;
        const tText = el.textContent?.replace(/\s+/g, " ").trim() || "";
        if (tText) texts.push(tText);
        el = el.nextElementSibling;
      }
      index.push({ id, title, fullText: texts.join(" ").toLowerCase(), rawText: texts.slice(1).join(" ").replace(/\s+/g, " ").trim() });
    });
    searchIndexRef.current = index;

    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            setBreadcrumb(entry.target.textContent?.trim() || "");
          }
        });
      },
      { rootMargin: "-48px 0px -60% 0px", threshold: 0 }
    );
    mainRef.current.querySelectorAll("h2[id], section[id]").forEach((el) => {
      observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [lang]); // Re-index when language changes

  const doSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    const matches = searchIndexRef.current.filter((s) => s.fullText.includes(q.toLowerCase().trim()));
    setSearchResults(
      matches.slice(0, 12).map((m) => ({
        id: m.id,
        title: highlight(m.title, q),
        snippetHtml: getSnippet(m.rawText, q),
      }))
    );
    setSearchOpen(true);
  }, []);

  const navigateTo = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("section-flash");
      (target as HTMLElement).style.background = "rgba(212,150,10,.12)";
      setTimeout(() => { (target as HTMLElement).style.background = ""; }, 1200);
    }
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    setSidebarOpen(false);
  }, []);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTheme = () => setTheme((tTheme) => (tTheme === "dark" ? "light" : "dark"));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".search-container")) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (sidebar && !sidebar.contains(e.target as Node)) setSidebarOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [sidebarOpen]);

  return (
    <>
      <aside id="sidebar" className={sidebarOpen ? "open" : ""}>
        <div className="nav-header">
          <div className="nav-logo">
            <div className="nav-logo-mark">ES</div>
            <div>
              <div className="nav-logo-text">{t("app_title")}</div>
              <div className="nav-sub">{t("app_subtitle")}</div>
            </div>
          </div>
          <div className="nav-credit">
            {t("created_by")} <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer">yasserious.com</a>
          </div>
        </div>

        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.8rem',
              background: 'rgba(212,150,10,0.1)',
              border: '1px solid rgba(212,150,10,0.2)',
              borderRadius: '6px',
              color: 'var(--brand-accent)',
              fontSize: '0.75rem',
              fontWeight: '600',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(212,150,10,0.2)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(212,150,10,0.1)')}
          >
            <span>{lang === "ar" ? "←" : "→"}</span>
            <span>{t("back_to_hrm")}</span>
          </a>
        </div>

        <div className="search-wrap">
          <div className="search-container">
            <input
              ref={searchInputRef}
              className="search-input"
              type="text"
              placeholder={t("search_placeholder")}
              autoComplete="off"
              spellCheck={false}
              value={searchQuery}
              onChange={(e) => doSearch(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); searchInputRef.current?.focus(); }}
              >
                ×
              </button>
            )}
            {searchOpen && (
              <div className="search-results">
                {searchResults.length === 0 ? (
                  <div className="sr-empty">{t("no_results")} "{searchQuery}"</div>
                ) : (
                  searchResults.map((r) => (
                    <div key={r.id} className="sr-item" onClick={() => navigateTo(r.id)}>
                      <div className="sr-title" dangerouslySetInnerHTML={{ __html: r.title }} />
                      <div className="sr-snippet" dangerouslySetInnerHTML={{ __html: r.snippetHtml }} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="nav-scroll">
          {NAV_GROUPS.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            return (
              <div key={group.id}>
                <button
                  className="nav-group-header"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isExpanded}
                >
                  {t(group.labelKey as any)}
                  <span className={`nav-chevron${isExpanded ? " expanded" : ""}`}>›</span>
                </button>
                {isExpanded && (
                  <div className="nav-items">
                    {group.items.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={activeSection === item.id ? "active" : ""}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo(item.id);
                        }}
                      >
                        {t(item.labelKey as any)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="overlay" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? "block" : "none" }} />

      <div id="topbar">
        <button className="mobile-menu-btn" aria-label="Menu" onClick={() => setSidebarOpen(true)}>☰</button>
        <div className="breadcrumb">
          <span>{breadcrumb}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="lang-toggle px-2 py-1 text-xs font-bold border border-border rounded hover:bg-muted transition-colors uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={t("toggle_theme")}>
            <span>{theme === "dark" ? "☀" : "☾"}</span>
            <span>{theme === "dark" ? t("theme_light") : t("theme_dark")}</span>
          </button>
        </div>
      </div>

      <div id="main-wrap">
        <main ref={mainRef} dangerouslySetInnerHTML={{ __html: docContentEn }} />
      </div>
    </>
  );
}
