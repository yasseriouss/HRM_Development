import { useState, useEffect, useRef, useCallback } from "react";
import docContent from "./docs-content.html?raw";

interface NavItem { id: string; label: string; }
interface NavGroup { id: string; label: string; items: NavItem[]; }
interface SearchResult { id: string; title: string; snippetHtml: string; }

const NAV_GROUPS: NavGroup[] = [
  { id: "getting-started", label: "Getting Started", items: [
    { id: "introduction", label: "Introduction" },
    { id: "quick-start", label: "Quick Start" },
    { id: "system-requirements", label: "System Requirements" },
  ]},
  { id: "architecture", label: "Architecture", items: [
    { id: "architecture", label: "System Architecture" },
    { id: "tech-stack", label: "Tech Stack" },
    { id: "data-flow", label: "Data Flow" },
  ]},
  { id: "database", label: "Database Schema", items: [
    { id: "schema-users", label: "Users" },
    { id: "schema-departments", label: "Departments" },
    { id: "schema-employees", label: "Employees" },
    { id: "schema-skills", label: "Skills" },
    { id: "schema-campaigns", label: "Campaigns" },
    { id: "schema-evaluations", label: "Evaluations" },
    { id: "schema-summaries", label: "Summaries" },
    { id: "schema-training", label: "Training" },
    { id: "schema-audit", label: "Audit Logs" },
    { id: "schema-relationships", label: "Relationships (ERD)" },
    { id: "schema-rls", label: "RLS Policies" },
  ]},
  { id: "api", label: "API Reference", items: [
    { id: "api-auth", label: "Authentication" },
    { id: "api-dashboard", label: "Dashboard" },
    { id: "api-departments", label: "Departments" },
    { id: "api-employees", label: "Employees" },
    { id: "api-skills", label: "Skills" },
    { id: "api-campaigns", label: "Campaigns" },
    { id: "api-evaluations", label: "Evaluations" },
    { id: "api-training", label: "Training" },
    { id: "api-reports", label: "Reports & Exports" },
  ]},
  { id: "user-guides", label: "User Guides", items: [
    { id: "role-super-admin", label: "Super Admin" },
    { id: "role-dept-head", label: "Dept Head" },
    { id: "role-hr", label: "HR Coordinator" },
    { id: "role-employee", label: "Employee" },
  ]},
  { id: "technical", label: "Technical Guides", items: [
    { id: "scoring", label: "Scoring & Calculations" },
    { id: "campaigns-logic", label: "Campaign Lifecycle" },
    { id: "training-logic", label: "Training Logic" },
  ]},
  { id: "operations", label: "Operations", items: [
    { id: "migration", label: "Data Migration" },
    { id: "deployment", label: "Deployment Guide" },
    { id: "env-vars", label: "Environment Variables" },
    { id: "demo-credentials", label: "Demo Credentials" },
    { id: "changelog", label: "Changelog" },
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
        const t = el.textContent?.replace(/\s+/g, " ").trim() || "";
        if (t) texts.push(t);
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
  }, []);

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

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

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
              <div className="nav-logo-text">Ebdaa Docs</div>
              <div className="nav-sub">Skill Matrix System · v1.0</div>
            </div>
          </div>
          <div className="nav-credit">
            Created by <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer">yasserious.com</a>
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
            <span>←</span>
            <span>Back to Skill Matrix</span>
          </a>
        </div>

        <div className="search-wrap">
          <div className="search-container">
            <input
              ref={searchInputRef}
              className="search-input"
              type="text"
              placeholder="Search docs…"
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
                  <div className="sr-empty">No results for "{searchQuery}"</div>
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
                  {group.label}
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
                        {item.label}
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
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <span>{theme === "dark" ? "☀" : "☾"}</span>
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>

      <div id="main-wrap">
        <main ref={mainRef} dangerouslySetInnerHTML={{ __html: docContent }} />
      </div>
    </>
  );
}
