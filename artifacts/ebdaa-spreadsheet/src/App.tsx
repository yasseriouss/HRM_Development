import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { EbdaaSystemSheet } from './pages/EbdaaSystemSheet';
import { InstructionsSheet } from './pages/InstructionsSheet';
import { DepartmentsSheet } from './pages/DepartmentsSheet';
import { SkillsLibrarySheet } from './pages/SkillsLibrarySheet';
import { EmployeesSheet } from './pages/EmployeesSheet';
import { CampaignsSheet } from './pages/CampaignsSheet';
import { EvalSheet } from './pages/EvalSheet';
import { CalculationsSheet } from './pages/CalculationsSheet';
import { BlankTemplateSheet } from './pages/BlankTemplateSheet';
import { PrintReportSheet } from './pages/PrintReportSheet';
import { exportToExcel } from './utils/excelExport';
import type { ScoreMap } from './data/masterData';
import {
  UPHOLSTERY_EMPLOYEES, UPHOLSTERY_SKILLS, UPHOLSTERY_SAMPLE_SCORES,
  PAINTING_EMPLOYEES, PAINTING_SKILLS, PAINTING_SAMPLE_SCORES,
  NATURAL_WOOD_EMPLOYEES, NATURAL_WOOD_SKILLS, NATURAL_WOOD_SAMPLE_SCORES,
  ASSEMBLY_EMPLOYEES, ASSEMBLY_SKILLS, ASSEMBLY_SAMPLE_SCORES,
  CUTTING_EMPLOYEES, CUTTING_SKILLS, CUTTING_SAMPLE_SCORES,
  QC_EMPLOYEES, QC_SKILLS, QC_SAMPLE_SCORES,
  LOGISTICS_EMPLOYEES, LOGISTICS_SKILLS, LOGISTICS_SAMPLE_SCORES,
  MAINTENANCE_EMPLOYEES, MAINTENANCE_SKILLS, MAINTENANCE_SAMPLE_SCORES,
  ADMIN_EMPLOYEES, ADMIN_SKILLS, ADMIN_SAMPLE_SCORES,
} from './data/masterData';
import { LangProvider, useLang } from './contexts/LangContext';
import { useT } from './i18n';

const TABS = [
  { id: 'system',       key_label: 'tab_system',       key_short: 'tab_system_short',       icon: '🏭' },
  { id: 'instructions', key_label: 'tab_instructions', key_short: 'tab_instructions_short', icon: '📖' },
  { id: 'departments',  key_label: 'tab_departments',  key_short: 'tab_departments_short',  icon: '🏢' },
  { id: 'skills',       key_label: 'tab_skills',       key_short: 'tab_skills_short',       icon: '📚' },
  { id: 'employees',    key_label: 'tab_employees',    key_short: 'tab_employees_short',    icon: '👥' },
  { id: 'campaigns',    key_label: 'tab_campaigns',    key_short: 'tab_campaigns_short',    icon: '📅' },
  { id: 'upholstery',   key_label: 'tab_upholstery',   key_short: 'tab_upholstery_short',   icon: '✨' },
  { id: 'painting',     key_label: 'tab_painting',     key_short: 'tab_painting_short',     icon: '🎨' },
  { id: 'naturalwood',  key_label: 'tab_naturalwood',  key_short: 'tab_naturalwood_short',  icon: '🪵' },
  { id: 'assembly',     key_label: 'tab_assembly',     key_short: 'tab_assembly_short',     icon: '🔧' },
  { id: 'cutting',      key_label: 'tab_cutting',      key_short: 'tab_cutting_short',      icon: '⚙️' },
  { id: 'qc',           key_label: 'tab_qc',           key_short: 'tab_qc_short',           icon: '🔍' },
  { id: 'logistics',    key_label: 'tab_logistics',    key_short: 'tab_logistics_short',    icon: '🚚' },
  { id: 'maintenance',  key_label: 'tab_maintenance',  key_short: 'tab_maintenance_short',  icon: '🛠️' },
  { id: 'admin',        key_label: 'tab_admin',        key_short: 'tab_admin_short',        icon: '🗂️' },
  { id: 'calculations', key_label: 'tab_calculations', key_short: 'tab_calculations_short', icon: '📊' },
  { id: 'blank',        key_label: 'tab_blank',        key_short: 'tab_blank_short',        icon: '📝' },
  { id: 'print',        key_label: 'tab_print',        key_short: 'tab_print_short',        icon: '🖨' },
] as const;

type TabId = typeof TABS[number]['id'];

const STORAGE_KEYS = {
  upholstery:  'ebdaa_scores_upholstery',
  painting:    'ebdaa_scores_painting',
  naturalwood: 'ebdaa_scores_naturalwood',
  assembly:    'ebdaa_scores_assembly',
  cutting:     'ebdaa_scores_cutting',
  qc:          'ebdaa_scores_qc',
  logistics:   'ebdaa_scores_logistics',
  maintenance: 'ebdaa_scores_maintenance',
  admin:       'ebdaa_scores_admin',
};

const LAST_SAVED_KEY = 'ebdaa_scores_last_saved';

function loadScores(key: string, fallback: ScoreMap): ScoreMap {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as ScoreMap;
  } catch {}
  return fallback;
}

function loadLastSaved(): number | null {
  try {
    const raw = localStorage.getItem(LAST_SAVED_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch { return null; }
}

function saveScores(key: string, scores: ScoreMap) {
  try {
    localStorage.setItem(key, JSON.stringify(scores));
  } catch {}
}

function persistLastSaved(ts: number) {
  try { localStorage.setItem(LAST_SAVED_KEY, String(ts)); } catch {}
}

// ── Backup / Restore ──────────────────────────────────────────────────────────

const BACKUP_DEPT_KEYS = ['upholstery', 'painting', 'naturalwood', 'assembly', 'cutting', 'qc', 'logistics', 'maintenance', 'admin'] as const;

type BackupPayload = {
  version: number;
  exportedAt: string;
  scores: Record<typeof BACKUP_DEPT_KEYS[number], ScoreMap>;
};

type ValidateResult =
  | { ok: true; data: BackupPayload }
  | { ok: false; reason: 'invalid' | 'version' };

function isScoreMap(v: unknown): v is ScoreMap {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  return Object.values(v as Record<string, unknown>).every(val => typeof val === 'number');
}

function validateBackup(data: unknown): ValidateResult {
  if (typeof data !== 'object' || data === null) return { ok: false, reason: 'invalid' };
  const d = data as Record<string, unknown>;
  if (typeof d.version !== 'number') return { ok: false, reason: 'invalid' };
  if (d.version !== 1) return { ok: false, reason: 'version' };
  if (typeof d.scores !== 'object' || d.scores === null) return { ok: false, reason: 'invalid' };
  const scores = d.scores as Record<string, unknown>;
  for (const key of BACKUP_DEPT_KEYS) {
    if (!(key in scores) || !isScoreMap(scores[key])) return { ok: false, reason: 'invalid' };
  }
  return { ok: true, data: data as BackupPayload };
}

function usePersistedScores(
  storageKey: string,
  defaultScores: ScoreMap,
  onSaved: (ts: number) => void,
) {
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const [scores, setScoresState] = useState<ScoreMap>(() =>
    loadScores(storageKey, defaultScores)
  );

  const setScores = useCallback((next: ScoreMap) => {
    setScoresState(next);
    saveScores(storageKey, next);
    const ts = Date.now();
    persistLastSaved(ts);
    onSavedRef.current(ts);
  }, [storageKey]);

  return [scores, setScores] as const;
}

type TFn = (k: Parameters<ReturnType<typeof useT>>[0], vars?: Record<string, string | number>) => string;

function useRelativeTime(ts: number | null, t: TFn, lang: string): string {
  const [label, setLabel] = useState('');
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (!ts) { setLabel(''); return; }
    const update = () => {
      const diff = Date.now() - ts;
      const seconds = Math.floor(diff / 1000);
      if (seconds < 15) setLabel(tRef.current('last_saved_just_now'));
      else if (seconds < 60) setLabel(tRef.current('last_saved_seconds_ago', { n: seconds }));
      else if (seconds < 3600) setLabel(tRef.current('last_saved_minutes_ago', { n: Math.floor(seconds / 60) }));
      else setLabel(tRef.current('last_saved_hours_ago', { n: Math.floor(seconds / 3600) }));
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [ts, lang]);

  return label;
}

function AppInner() {
  const [activeTab, setActiveTab] = useState<TabId>('system');
  const [exporting, setExporting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(loadLastSaved);
  const t = useT();
  const { lang, setLang } = useLang();
  const { resolvedTheme, setTheme } = useTheme();

  const handleSaved = useCallback((ts: number) => setLastSavedAt(ts), []);
  const lastSavedLabel = useRelativeTime(lastSavedAt, t, lang);

  const importFileRef = useRef<HTMLInputElement>(null);
  const importTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msgKey: string } | null>(null);

  const showImportStatus = useCallback((type: 'success' | 'error', msgKey: string) => {
    setImportStatus({ type, msgKey });
    clearTimeout(importTimerRef.current);
    importTimerRef.current = setTimeout(() => setImportStatus(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(importTimerRef.current), []);

  const [uphScores, setUphScores] = usePersistedScores(STORAGE_KEYS.upholstery, UPHOLSTERY_SAMPLE_SCORES, handleSaved);
  const [pntScores, setPntScores] = usePersistedScores(STORAGE_KEYS.painting, PAINTING_SAMPLE_SCORES, handleSaved);
  const [nwdScores, setNwdScores] = usePersistedScores(STORAGE_KEYS.naturalwood, NATURAL_WOOD_SAMPLE_SCORES, handleSaved);
  const [asmScores, setAsmScores] = usePersistedScores(STORAGE_KEYS.assembly, ASSEMBLY_SAMPLE_SCORES, handleSaved);
  const [cutScores, setCutScores] = usePersistedScores(STORAGE_KEYS.cutting, CUTTING_SAMPLE_SCORES, handleSaved);
  const [qcScores, setQcScores]   = usePersistedScores(STORAGE_KEYS.qc, QC_SAMPLE_SCORES, handleSaved);
  const [logScores, setLogScores] = usePersistedScores(STORAGE_KEYS.logistics, LOGISTICS_SAMPLE_SCORES, handleSaved);
  const [mntScores, setMntScores] = usePersistedScores(STORAGE_KEYS.maintenance, MAINTENANCE_SAMPLE_SCORES, handleSaved);
  const [admScores, setAdmScores] = usePersistedScores(STORAGE_KEYS.admin, ADMIN_SAMPLE_SCORES, handleSaved);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportToExcel(uphScores, pntScores, nwdScores, asmScores, cutScores, qcScores, logScores, mntScores, admScores);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  }, [uphScores, pntScores, nwdScores, asmScores, cutScores, qcScores, logScores, mntScores, admScores]);

  const handleReset = useCallback(() => {
    setUphScores(UPHOLSTERY_SAMPLE_SCORES);
    setPntScores(PAINTING_SAMPLE_SCORES);
    setNwdScores(NATURAL_WOOD_SAMPLE_SCORES);
    setAsmScores(ASSEMBLY_SAMPLE_SCORES);
    setCutScores(CUTTING_SAMPLE_SCORES);
    setQcScores(QC_SAMPLE_SCORES);
    setLogScores(LOGISTICS_SAMPLE_SCORES);
    setMntScores(MAINTENANCE_SAMPLE_SCORES);
    setAdmScores(ADMIN_SAMPLE_SCORES);
    setResetKey(k => k + 1);
    setShowResetConfirm(false);
  }, [setUphScores, setPntScores, setNwdScores, setAsmScores, setCutScores, setQcScores, setLogScores, setMntScores, setAdmScores]);

  const handleBackupExport = useCallback(() => {
    const payload: BackupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      scores: {
        upholstery: uphScores,
        painting: pntScores,
        naturalwood: nwdScores,
        assembly: asmScores,
        cutting: cutScores,
        qc: qcScores,
        logistics: logScores,
        maintenance: mntScores,
        admin: admScores,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebdaa-scores-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [uphScores, pntScores, nwdScores, asmScores, cutScores, qcScores, logScores, mntScores, admScores]);

  const handleBackupImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onerror = () => showImportStatus('error', 'import_error_invalid');
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const result = validateBackup(data);
        if (!result.ok) {
          showImportStatus('error', result.reason === 'version' ? 'import_error_version' : 'import_error_invalid');
          return;
        }
        const { scores } = result.data;
        setUphScores(scores.upholstery);
        setPntScores(scores.painting);
        setNwdScores(scores.naturalwood);
        setAsmScores(scores.assembly);
        setCutScores(scores.cutting);
        setQcScores(scores.qc);
        setLogScores(scores.logistics);
        setMntScores(scores.maintenance);
        setAdmScores(scores.admin);
        setResetKey(k => k + 1);
        showImportStatus('success', 'import_success');
      } catch {
        showImportStatus('error', 'import_error_invalid');
      }
    };
    reader.readAsText(file);
  }, [setUphScores, setPntScores, setNwdScores, setAsmScores, setCutScores, setQcScores, setLogScores, setMntScores, setAdmScores, showImportStatus]);

  const renderContent = () => {
    switch (activeTab) {
      case 'system': return <EbdaaSystemSheet />;
      case 'instructions': return <InstructionsSheet />;
      case 'departments': return <DepartmentsSheet />;
      case 'skills': return <SkillsLibrarySheet />;
      case 'employees': return <EmployeesSheet />;
      case 'campaigns': return <CampaignsSheet />;
      case 'upholstery':
        return (
          <EvalSheet
            key={`upholstery-${resetKey}`}
            title="Upholstery"
            icon="✨"
            employees={UPHOLSTERY_EMPLOYEES}
            skills={UPHOLSTERY_SKILLS}
            initialScores={uphScores}
            onScoresChange={setUphScores}
            hasSampleData
          />
        );
      case 'painting':
        return (
          <EvalSheet
            key={`painting-${resetKey}`}
            title="Painting"
            icon="🎨"
            employees={PAINTING_EMPLOYEES}
            skills={PAINTING_SKILLS}
            initialScores={pntScores}
            onScoresChange={setPntScores}
            hasSampleData
          />
        );
      case 'naturalwood':
        return (
          <EvalSheet
            key={`naturalwood-${resetKey}`}
            title="Natural Wood"
            icon="🪵"
            employees={NATURAL_WOOD_EMPLOYEES}
            skills={NATURAL_WOOD_SKILLS}
            initialScores={nwdScores}
            onScoresChange={setNwdScores}
            hasSampleData
          />
        );
      case 'assembly':
        return (
          <EvalSheet
            key={`assembly-${resetKey}`}
            title="Assembly"
            icon="🔧"
            employees={ASSEMBLY_EMPLOYEES}
            skills={ASSEMBLY_SKILLS}
            initialScores={asmScores}
            onScoresChange={setAsmScores}
            hasSampleData
          />
        );
      case 'cutting':
        return (
          <EvalSheet
            key={`cutting-${resetKey}`}
            title="Cutting"
            icon="⚙️"
            employees={CUTTING_EMPLOYEES}
            skills={CUTTING_SKILLS}
            initialScores={cutScores}
            onScoresChange={setCutScores}
            hasSampleData
          />
        );
      case 'qc':
        return (
          <EvalSheet
            key={`qc-${resetKey}`}
            title="Quality Control"
            icon="🔍"
            employees={QC_EMPLOYEES}
            skills={QC_SKILLS}
            initialScores={qcScores}
            onScoresChange={setQcScores}
            hasSampleData
          />
        );
      case 'logistics':
        return (
          <EvalSheet
            key={`logistics-${resetKey}`}
            title="Logistics"
            icon="🚚"
            employees={LOGISTICS_EMPLOYEES}
            skills={LOGISTICS_SKILLS}
            initialScores={logScores}
            onScoresChange={setLogScores}
            hasSampleData
          />
        );
      case 'maintenance':
        return (
          <EvalSheet
            key={`maintenance-${resetKey}`}
            title="Maintenance"
            icon="🛠️"
            employees={MAINTENANCE_EMPLOYEES}
            skills={MAINTENANCE_SKILLS}
            initialScores={mntScores}
            onScoresChange={setMntScores}
            hasSampleData
          />
        );
      case 'admin':
        return (
          <EvalSheet
            key={`admin-${resetKey}`}
            title="Administration"
            icon="🗂️"
            employees={ADMIN_EMPLOYEES}
            skills={ADMIN_SKILLS}
            initialScores={admScores}
            onScoresChange={setAdmScores}
            hasSampleData
          />
        );
      case 'calculations':
        return (
          <CalculationsSheet
            departments={[
              { title: 'Upholstery',       icon: '✨', employees: UPHOLSTERY_EMPLOYEES,    skills: UPHOLSTERY_SKILLS,    scores: uphScores },
              { title: 'Painting',          icon: '🎨', employees: PAINTING_EMPLOYEES,      skills: PAINTING_SKILLS,      scores: pntScores },
              { title: 'Natural Wood',      icon: '🪵', employees: NATURAL_WOOD_EMPLOYEES,  skills: NATURAL_WOOD_SKILLS,  scores: nwdScores },
              { title: 'Assembly',          icon: '🔧', employees: ASSEMBLY_EMPLOYEES,      skills: ASSEMBLY_SKILLS,      scores: asmScores },
              { title: 'Cutting',           icon: '⚙️', employees: CUTTING_EMPLOYEES,      skills: CUTTING_SKILLS,       scores: cutScores },
              { title: 'Quality Control',   icon: '🔍', employees: QC_EMPLOYEES,            skills: QC_SKILLS,            scores: qcScores  },
              { title: 'Logistics',         icon: '🚚', employees: LOGISTICS_EMPLOYEES,     skills: LOGISTICS_SKILLS,     scores: logScores },
              { title: 'Maintenance',       icon: '🛠️', employees: MAINTENANCE_EMPLOYEES,  skills: MAINTENANCE_SKILLS,   scores: mntScores },
              { title: 'Administration',    icon: '🗂️', employees: ADMIN_EMPLOYEES,        skills: ADMIN_SKILLS,         scores: admScores },
            ]}
          />
        );
      case 'blank': return <BlankTemplateSheet />;
      case 'print':
        return (
          <PrintReportSheet
            departments={[
              { title: 'Upholstery', icon: '✨', employees: UPHOLSTERY_EMPLOYEES, skills: UPHOLSTERY_SKILLS, scores: uphScores },
              { title: 'Painting', icon: '🎨', employees: PAINTING_EMPLOYEES, skills: PAINTING_SKILLS, scores: pntScores },
              { title: 'Natural Wood', icon: '🪵', employees: NATURAL_WOOD_EMPLOYEES, skills: NATURAL_WOOD_SKILLS, scores: nwdScores },
              { title: 'Assembly', icon: '🔧', employees: ASSEMBLY_EMPLOYEES, skills: ASSEMBLY_SKILLS, scores: asmScores },
              { title: 'Cutting', icon: '⚙️', employees: CUTTING_EMPLOYEES, skills: CUTTING_SKILLS, scores: cutScores },
              { title: 'Quality Control', icon: '🔍', employees: QC_EMPLOYEES, skills: QC_SKILLS, scores: qcScores },
              { title: 'Logistics', icon: '🚚', employees: LOGISTICS_EMPLOYEES, skills: LOGISTICS_SKILLS, scores: logScores },
              { title: 'Maintenance', icon: '🛠️', employees: MAINTENANCE_EMPLOYEES, skills: MAINTENANCE_SKILLS, scores: mntScores },
              { title: 'Administration', icon: '🗂️', employees: ADMIN_EMPLOYEES, skills: ADMIN_SKILLS, scores: admScores },
            ]}
          />
        );
      default: return null;
    }
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xl">🏭</span>
            <div className="hidden sm:block">
              <span className="font-bold text-foreground text-sm">{t('app_title')}</span>
              <span className="text-muted-foreground text-xs ms-2">{t('app_subtitle')}</span>
            </div>
            <a
              href="/"
              className="ms-2 px-2.5 py-1 rounded border border-amber-500/30 bg-amber-500/5 text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <span>←</span>
              <span>Skill Matrix</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://yasserious.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 text-amber-400/70 hover:text-amber-400 transition-colors text-xs"
            >
              ✨ {t('created_by')}
            </a>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={t('toggle_theme')}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              title={t('toggle_language')}
              className="h-8 px-2.5 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-bold"
            >
              {lang === 'en' ? t('lang_ar') : t('lang_en')}
            </button>

            {/* Hidden file input for backup import */}
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleBackupImport}
            />

            {/* Backup export button */}
            <button
              onClick={handleBackupExport}
              title={t('backup_export')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors border border-border"
            >
              <span>📤</span>
              <span>{t('backup_export')}</span>
            </button>

            {/* Backup import button */}
            <button
              onClick={() => importFileRef.current?.click()}
              title={t('backup_import')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors border border-border"
            >
              <span>📥</span>
              <span>{t('backup_import')}</span>
            </button>

            {/* Reset Scores button */}
            {showResetConfirm ? (
              <div className="flex items-center gap-1.5 bg-red-900/60 border border-red-500/40 rounded-lg px-3 py-1">
                <span className="text-red-300 text-xs">{t('reset_confirm')}</span>
                <button
                  onClick={handleReset}
                  className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                >
                  {t('reset_yes')}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
                >
                  {t('reset_no')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors border border-border"
                title={t('reset_scores')}
              >
                <span>↺</span>
                <span>{t('reset_scores')}</span>
              </button>
            )}

            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-60 shrink-0"
            >
              {exporting ? (
                <>
                  <span className="animate-spin text-xs">⟳</span>
                  <span>{t('exporting')}</span>
                </>
              ) : (
                <>
                  <span>⬇</span>
                  <span className="hidden sm:inline">{t('export_excel')}</span>
                  <span className="sm:hidden">.xlsx</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-border/50">
          <div className="flex min-w-max px-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="hidden lg:inline">{t(tab.key_label as Parameters<typeof t>[0])}</span>
                <span className="lg:hidden">{t(tab.key_short as Parameters<typeof t>[0])}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>

      <footer className="border-t border-border bg-muted/30 py-3 px-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{t('app_footer')}</span>
            {lastSavedLabel && !importStatus && (
              <span className="flex items-center gap-1 text-green-500/70">
                <span>💾</span>
                <span>{t('last_saved_prefix')}: {lastSavedLabel}</span>
              </span>
            )}
            {importStatus && (
              <span className={`flex items-center gap-1 font-medium transition-all ${
                importStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>{importStatus.type === 'success' ? '✓' : '✕'}</span>
                <span>{t(importStatus.msgKey as Parameters<typeof t>[0])}</span>
              </span>
            )}
          </div>
          <a
            href="https://yasserious.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400/60 hover:text-amber-400 transition-colors"
          >
            {t('created_by')}
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]}>
      <LangProvider>
        <AppInner />
      </LangProvider>
    </ThemeProvider>
  );
}
