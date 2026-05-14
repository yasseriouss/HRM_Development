import { useState, useEffect, useRef, useCallback } from "react";
import docContentEn from "./docs-content.html?raw";
import docContentAr from "./docs-content-ar.html?raw";
import { useLang } from "@shared/contexts/LangContext";
import { getBrandLogoUrl } from "@shared/lib/brand";

interface NavItem { id: string; labelKey: string; }
interface NavGroup { id: string; labelKey: string; items: NavItem[]; }
interface SearchResult { id: string; title: string; snippetHtml: string; }

const NAV_GROUPS: NavGroup[] = [
  { id: "getting-started", labelKey: "docs_group_getting_started", items: [
    { id: "introduction", labelKey: "docs_nav_introduction" },
    { id: "quick-start", labelKey: "docs_nav_quick_start" },
    { id: "system-requirements", labelKey: "docs_nav_system_requirements" },
  ]},
  { id: "architecture", labelKey: "docs_group_architecture", items: [
    { id: "architecture", labelKey: "docs_nav_system_architecture" },
    { id: "tech-stack", labelKey: "docs_nav_tech_stack" },
    { id: "data-flow", labelKey: "docs_nav_data_flow" },
    { id: "operational-flow", labelKey: "docs_nav_operational_flow" },
  ]},
  { id: "database", labelKey: "docs_group_database", items: [
    { id: "schema-users", labelKey: "docs_nav_schema_users" },
    { id: "schema-departments", labelKey: "docs_nav_schema_departments" },
    { id: "schema-employees", labelKey: "docs_nav_schema_employees" },
    { id: "schema-skills", labelKey: "docs_nav_schema_skills" },
    { id: "schema-campaigns", labelKey: "docs_nav_schema_campaigns" },
    { id: "schema-evaluations", labelKey: "docs_nav_schema_evaluations" },
    { id: "schema-summaries", labelKey: "docs_nav_schema_summaries" },
    { id: "schema-training", labelKey: "docs_nav_schema_training" },
    { id: "schema-audit", labelKey: "docs_nav_schema_audit" },
    { id: "schema-relationships", labelKey: "docs_nav_schema_relationships" },
    { id: "schema-rls", labelKey: "docs_nav_schema_rls" },
  ]},
  { id: "api", labelKey: "docs_group_api", items: [
    { id: "api-auth", labelKey: "docs_nav_api_auth" },
    { id: "api-dashboard", labelKey: "docs_nav_api_dashboard" },
    { id: "api-departments", labelKey: "docs_nav_api_departments" },
    { id: "api-employees", labelKey: "docs_nav_api_employees" },
    { id: "api-skills", labelKey: "docs_nav_api_skills" },
    { id: "api-campaigns", labelKey: "docs_nav_api_campaigns" },
    { id: "api-evaluations", labelKey: "docs_nav_api_evaluations" },
    { id: "api-training", labelKey: "docs_nav_api_training" },
    { id: "api-reports", labelKey: "docs_nav_api_reports" },
  ]},
  { id: "user-guides", labelKey: "docs_group_user_guides", items: [
    { id: "role-super-admin", labelKey: "docs_nav_role_super_admin" },
    { id: "role-dept-head", labelKey: "docs_nav_role_dept_head" },
    { id: "role-hr", labelKey: "docs_nav_role_hr" },
    { id: "role-employee", labelKey: "docs_nav_role_employee" },
  ]},
  { id: "technical", labelKey: "docs_group_technical", items: [
    { id: "scoring", labelKey: "docs_nav_scoring" },
    { id: "campaigns-logic", labelKey: "docs_nav_campaigns_logic" },
    { id: "training-logic", labelKey: "docs_nav_training_logic" },
  ]},
  { id: "operations", labelKey: "docs_group_operations", items: [
    { id: "migration", labelKey: "docs_nav_migration" },
    { id: "deployment", labelKey: "docs_nav_deployment" },
    { id: "env-vars", labelKey: "docs_nav_env_vars" },
    { id: "roadmap", labelKey: "docs_nav_roadmap" },
    { id: "demo-credentials", labelKey: "docs_nav_demo_credentials" },
    { id: "changelog", labelKey: "docs_nav_changelog" },
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

export default function DocsModule() {
  const { lang, t } = useLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["getting-started", "architecture", "database", "api", "user-guides", "technical", "operations"])
  );
  const [activeSection, setActiveSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchIndexRef = useRef<{ id: string; title: string; fullText: string; rawText: string }[]>([]);
  const mainRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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
          }
        });
      },
      { rootMargin: "-48px 0px -60% 0px", threshold: 0 }
    );
    mainRef.current.querySelectorAll("h2[id], section[id]").forEach((el) => {
      observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [lang]);

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
      (target as HTMLElement).style.background = "rgba(237, 111, 92, .12)";
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".search-container")) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="flex w-full h-full bg-background/50">
      <aside id="docs-sidebar" className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:sticky top-0 left-0 w-80 h-full bg-surface border-r border-muted/10 flex flex-col z-40 transition-transform duration-300`}>
        <div className="p-8 border-b border-muted/5 bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={getBrandLogoUrl()}
              alt="HRM Unified"
              className="h-10 w-auto max-w-[140px] object-contain shrink-0"
              width={140}
              height={40}
            />
            <div>
              <div className="font-headline font-bold text-sm text-foreground uppercase tracking-tight leading-none">{t("docs_app_title")}</div>
              <div className="text-[10px] text-muted font-medium mt-1 uppercase tracking-widest leading-none opacity-70">{t("docs_app_subtitle")}</div>
            </div>
          </div>
          <div className="text-[9px] text-muted/60 font-mono tracking-widest uppercase mt-4">
            {t("docs_created_by")} <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary transition-colors">yasserious.com</a>
          </div>
        </div>

        <div className="p-6">
          <div className="relative search-container">
            <input
              ref={searchInputRef}
              className="w-full px-5 py-3.5 bg-background border border-muted/10 rounded-2xl font-body text-xs outline-none transition-all focus:border-primary/30 focus:ring-4 focus:ring-primary/5 placeholder:text-muted/40"
              type="text"
              placeholder={t("docs_search_placeholder")}
              autoComplete="off"
              spellCheck={false}
              value={searchQuery}
              onChange={(e) => doSearch(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
            />
            {searchQuery && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors text-lg"
                onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); searchInputRef.current?.focus(); }}
              >
                ×
              </button>
            )}
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-surface border border-muted/10 rounded-2xl shadow-2xl shadow-black/5 max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-muted text-xs italic">{t("docs_no_results")} "{searchQuery}"</div>
                ) : (
                  searchResults.map((r) => (
                    <div key={r.id} className="p-4 cursor-pointer hover:bg-muted/5 border-b border-muted/5 last:border-0 transition-colors group" onClick={() => navigateTo(r.id)}>
                      <div className="font-headline font-bold text-xs mb-1 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: r.title }} />
                      <div className="text-[11px] text-muted line-clamp-2 leading-relaxed opacity-70" dangerouslySetInnerHTML={{ __html: r.snippetHtml }} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 pb-12 custom-scrollbar">
          {NAV_GROUPS.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            return (
              <div key={group.id} className="mb-2">
                <button
                  className="w-full flex items-center justify-between py-3 text-[10px] font-headline font-bold text-muted hover:text-primary uppercase tracking-[0.15em] transition-colors group"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isExpanded}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1 h-1 rounded-full bg-primary/20 group-hover:bg-primary transition-colors ${isExpanded ? 'bg-primary' : ''}`} />
                    {t(group.labelKey as any)}
                  </span>
                  <span className={`transition-transform duration-300 opacity-40 group-hover:opacity-100 ${isExpanded ? "rotate-90" : ""}`}>›</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[1000px] opacity-100 mb-4" : "max-h-0 opacity-0"}`}>
                  <div className="flex flex-col gap-1 border-l border-muted/5 ml-0.5 pl-3 mt-1">
                    {group.items.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`py-2 px-3 text-[11px] font-medium rounded-xl transition-all duration-200 ${
                          activeSection === item.id 
                            ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5" 
                            : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo(item.id);
                        }}
                      >
                        {t(item.labelKey as any)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)} />

      <div id="docs-content-wrap" className="flex-1 overflow-y-auto h-full scroll-smooth custom-scrollbar">
        <main 
          ref={mainRef} 
          className="max-w-4xl mx-auto px-8 md:px-16 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700" 
          dangerouslySetInnerHTML={{ __html: lang === "ar" ? docContentAr : docContentEn }} 
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        #docs-content-wrap {
          background-image: radial-gradient(circle at 50% 0%, oklch(64% 0.13 28 / 0.03) 0%, transparent 50%);
        }

        /* Documentation Content Typography & Layout */
        main h1 {
          font-family: var(--font-headline);
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 2rem;
          color: var(--foreground);
        }

        main h2 {
          font-family: var(--font-headline);
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-top: 5rem;
          margin-bottom: 1.5rem;
          color: var(--foreground);
          scroll-margin-top: 6rem;
          position: relative;
        }

        main h2::after {
          content: "";
          position: absolute;
          bottom: -0.5rem;
          left: 0;
          width: 3rem;
          height: 3px;
          background: var(--primary);
          border-radius: 99px;
          opacity: 0.3;
        }

        main h3 {
          font-family: var(--font-headline);
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: var(--foreground);
        }

        main p {
          font-size: 1rem;
          line-height: 1.8;
          color: var(--foreground);
          opacity: 0.85;
          margin-bottom: 1.5rem;
        }

        main .lead {
          font-size: 1.25rem;
          line-height: 1.6;
          color: var(--muted);
          font-weight: 500;
          margin-bottom: 3rem;
        }

        main ul, main ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        main li {
          margin-bottom: 0.75rem;
          line-height: 1.6;
          color: var(--foreground);
          opacity: 0.85;
        }

        main .card {
          background: var(--surface);
          border: 1px solid oklch(var(--color-border) / 0.1);
          border-radius: 2rem;
          padding: 2rem;
          margin: 1.5rem 0;
          box-shadow: 0 10px 40px -10px oklch(22% 0.02 50 / 0.05);
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        main .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px -15px oklch(22% 0.02 50 / 0.1);
          border-color: var(--primary);
        }

        main .grid-4 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          margin: 3rem 0;
        }

        main .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin: 3rem 0;
        }

        main .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin: 3rem 0;
        }

        main .callout {
          background: oklch(64% 0.13 28 / 0.04);
          border: 1px solid oklch(64% 0.13 28 / 0.1);
          border-left: 6px solid var(--primary);
          padding: 2rem;
          border-radius: 1.5rem;
          margin: 3rem 0;
          position: relative;
        }

        main .table-wrap {
          margin: 3rem 0;
          border: 1px solid oklch(var(--color-border) / 0.1);
          border-radius: 2rem;
          overflow: hidden;
          background: var(--surface);
          box-shadow: 0 10px 40px -10px oklch(22% 0.02 50 / 0.05);
        }

        main table {
          width: 100%;
          border-collapse: collapse;
        }

        main th {
          background: oklch(var(--color-muted) / 0.03);
          text-align: left;
          padding: 1.25rem 1.5rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
          border-bottom: 1px solid oklch(var(--color-border) / 0.1);
        }

        main td {
          padding: 1.25rem 1.5rem;
          font-size: 0.875rem;
          border-bottom: 1px solid oklch(var(--color-border) / 0.05);
          color: var(--foreground);
        }

        main code {
          background: oklch(22% 0.02 50 / 0.05);
          color: var(--primary);
          padding: 0.2rem 0.5rem;
          border-radius: 0.5rem;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.85em;
          font-weight: 600;
        }

        main pre {
          background: oklch(22% 0.02 50);
          color: oklch(90% 0.018 70);
          padding: 2.5rem;
          border-radius: 2rem;
          margin: 3rem 0;
          font-size: 0.875rem;
          line-height: 1.6;
          overflow-x: auto;
          position: relative;
          box-shadow: 0 20px 50px -12px rgba(0,0,0,0.2);
        }

        main .pre-label {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: oklch(90% 0.018 70 / 0.3);
        }

        main .steps {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin: 4rem 0;
        }

        main .step {
          display: flex;
          gap: 2rem;
          padding: 2rem;
          background: var(--surface);
          border-radius: 2rem;
          border: 1px solid oklch(var(--color-border) / 0.1);
          transition: all 0.3s ease;
        }

        main .step:hover {
          border-color: var(--primary);
          background: oklch(64% 0.13 28 / 0.02);
        }

        main .step-num {
          width: 3.5rem;
          height: 3.5rem;
          background: var(--primary);
          color: white;
          border-radius: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 10px 20px -5px oklch(64% 0.13 28 / 0.4);
        }

        main .step-title {
          font-family: var(--font-headline);
          font-weight: 700;
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        main .step-desc {
          font-size: 0.875rem;
          color: var(--muted);
          line-height: 1.6;
        }

        main .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        main .badge-green { background: oklch(80% 0.15 140 / 0.1); color: oklch(60% 0.15 140); }
        main .badge-blue { background: oklch(80% 0.1 240 / 0.1); color: oklch(60% 0.1 240); }
        main .badge-amber { background: oklch(80% 0.15 70 / 0.1); color: oklch(60% 0.15 70); }

        .section-flash {
          animation: flash 1.2s ease-out;
        }

        @keyframes flash {
          0% { background: oklch(64% 0.13 28 / 0.15); box-shadow: 0 0 0 10px oklch(64% 0.13 28 / 0.15); border-radius: 1rem; }
          100% { background: transparent; box-shadow: 0 0 0 0 transparent; }
        }

        /* RTL Adjustments */
        [dir="rtl"] main {
          font-family: var(--font-tajawal);
        }
        [dir="rtl"] main h1, [dir="rtl"] main h2, [dir="rtl"] main h3 {
          letter-spacing: 0;
        }
        [dir="rtl"] main th { text-align: right; }
        [dir="rtl"] main .callout {
          border-left: none;
          border-right: 6px solid var(--primary);
          border-radius: 1.5rem;
        }
        [dir="rtl"] main .pre-label { right: auto; left: 1.5rem; }
      `}} />
    </div>
  );
}
