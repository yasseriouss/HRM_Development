import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthUser } from "@modules/skill-matrix/lib/auth";
import { useT } from "@modules/skill-matrix/i18n/index";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Target, 
  GraduationCap, 
  Workflow, 
  Settings, 
  UserCircle,
  FileText,
  Presentation,
  Table2,
  ArrowRight
} from "lucide-react";
import { cn } from "@shared/utils/cn";

export default function Hub() {
  const [showSplash, setShowSplash] = useState(true);
  const [, setLocation] = useLocation();
  const user = getAuthUser();
  const t = useT();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const role = user?.role || "employee";
  const isAdminOrHR = role === "super_admin" || role === "hr_coordinator";
  const isDeptHead = role === "dept_head";

  const navigationCards = [
    {
      title: t("nav_dashboard"),
      desc: "Comprehensive analytics and operational overview",
      icon: <LayoutDashboard className="h-8 w-8" />,
      path: "/",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: t("suite_spreadsheet"),
      desc: "Centralized data management and bulk editing",
      icon: <Table2 className="h-8 w-8" />,
      path: "/spreadsheet",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: t("nav_employees"),
      desc: "Manage personnel records and skill profiles",
      icon: <Users className="h-8 w-8" />,
      path: "/skill-matrix/employees",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: t("nav_workflows"),
      desc: "Orchestrate evaluation cycles and tasks",
      icon: <Workflow className="h-8 w-8" />,
      path: "/skill-matrix/workflows",
      show: true,
    },
    {
      title: t("nav_my_profile"),
      desc: "Your personal competency matrix and goals",
      icon: <UserCircle className="h-8 w-8" />,
      path: "/my-profile",
      show: true,
    },
    {
      title: t("suite_docs"),
      desc: "Documentation and methodology knowledge base",
      icon: <FileText className="h-8 w-8" />,
      path: "/docs",
      show: true,
    },
    {
      title: "Job Evaluation",
      desc: "Analytical job grading and equity matrix",
      icon: <Target className="h-8 w-8" />,
      path: "/job-evaluation/dashboard",
      show: isAdminOrHR,
    },
    {
      title: t("nav_settings"),
      desc: "Platform configuration and preferences",
      icon: <Settings className="h-8 w-8" />,
      path: "/skill-matrix/settings",
      show: isAdminOrHR,
    }
  ];

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center shadow-xl shadow-primary/20 animate-pulse">
            <Target className="h-12 w-12" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-headline font-bold text-foreground tracking-tight uppercase">{t("label_mission_control")}</h2>
            <div className="h-1.5 w-48 bg-muted/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="h-full w-1/2 bg-primary"
               />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 px-8 text-foreground">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 bg-foreground rounded-full text-background"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest">{t("label_auth_admin")}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-8xl font-headline font-bold text-foreground tracking-tighter leading-none"
          >
             HRM <span className="text-primary">Unified</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted font-headline font-bold uppercase tracking-[0.3em] text-[10px]"
          >
            {t("nav_hub")} — Protocol v2.5.0
          </motion.p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {navigationCards.filter(c => c.show).map((card, i) => (
            <motion.div
              key={card.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => setLocation(card.path)}
              className="group cursor-pointer bg-surface/50 border border-muted/10 rounded-3xl p-10 hover:shadow-2xl hover:shadow-muted/5 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-background border border-muted/10 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-500 shadow-sm">
                   {card.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-headline font-bold text-foreground tracking-tight group-hover:translate-x-1 transition-transform">{card.title}</h3>
                  <p className="text-xs font-headline font-bold text-muted uppercase tracking-widest leading-relaxed">{card.desc}</p>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-700 delay-100" />
            </motion.div>
          ))}
        </div>

        {/* System Stats Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-20 border-t border-muted/10 flex flex-wrap justify-between items-center gap-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted/5 flex items-center justify-center text-muted">
               <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-headline font-bold text-muted uppercase tracking-widest">Active Factory</p>
              <p className="text-sm font-headline font-bold text-foreground uppercase tracking-tight">Metal Processing Plant</p>
            </div>
          </div>
          
          <div className="flex gap-12 text-[10px] font-headline font-bold text-muted uppercase tracking-[0.2em]">
             <span>Security AES-256</span>
             <span>Latency 12ms</span>
             <span>{t("label_copyright_footer")}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
