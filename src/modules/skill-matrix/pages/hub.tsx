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
      color: "zinc",
    },
    {
      title: t("suite_spreadsheet"),
      desc: "Centralized data management and bulk editing",
      icon: <Table2 className="h-8 w-8" />,
      path: "/spreadsheet",
      show: isAdminOrHR || isDeptHead,
      color: "zinc",
    },
    {
      title: t("nav_employees"),
      desc: "Manage personnel records and skill profiles",
      icon: <Users className="h-8 w-8" />,
      path: "/skill-matrix/employees",
      show: isAdminOrHR || isDeptHead,
      color: "zinc",
    },
    {
      title: t("nav_workflows"),
      desc: "Orchestrate evaluation cycles and tasks",
      icon: <Workflow className="h-8 w-8" />,
      path: "/skill-matrix/workflows",
      show: true,
      color: "zinc",
    },
    {
      title: t("nav_my_profile"),
      desc: "Your personal competency matrix and goals",
      icon: <UserCircle className="h-8 w-8" />,
      path: "/my-profile",
      show: true,
      color: "zinc",
    },
    {
      title: t("suite_docs"),
      desc: "Documentation and methodology knowledge base",
      icon: <FileText className="h-8 w-8" />,
      path: "/docs",
      show: true,
      color: "zinc",
    },
    {
      title: "Job Evaluation",
      desc: "Analytical job grading and equity matrix",
      icon: <Target className="h-8 w-8" />,
      path: "/job-evaluation/dashboard",
      show: isAdminOrHR,
      color: "zinc",
    },
    {
      title: t("nav_settings"),
      desc: "Platform configuration and preferences",
      icon: <Settings className="h-8 w-8" />,
      path: "/skill-matrix/settings",
      show: isAdminOrHR,
      color: "zinc",
    }
  ];

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#FDFCFB] flex items-center justify-center z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="w-24 h-24 bg-zinc-900 rounded-4xl flex items-center justify-center text-white shadow-2xl shadow-zinc-200 animate-pulse">
            <Target className="h-12 w-12" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold font-comfortaa text-zinc-900 tracking-tighter uppercase">{t("label_mission_control")}</h2>
            <div className="h-1 w-48 bg-zinc-100 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="h-full w-1/2 bg-zinc-900"
               />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-20 px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900 rounded-full text-white"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t("label_auth_admin")}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-8xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none"
          >
             HRM <span className="text-zinc-300">Unified</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-[10px]"
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
              className="group cursor-pointer bg-white border border-zinc-100 rounded-4xl p-10 hover:shadow-2xl hover:shadow-zinc-100 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <ArrowRight className="h-6 w-6 text-zinc-300" />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                   {card.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-comfortaa text-zinc-900 tracking-tight group-hover:translate-x-1 transition-transform">{card.title}</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">{card.desc}</p>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-zinc-900 group-hover:w-full transition-all duration-700 delay-100" />
            </motion.div>
          ))}
        </div>

        {/* System Stats Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-20 border-t border-zinc-100 flex flex-wrap justify-between items-center gap-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
               <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Factory</p>
              <p className="text-sm font-bold text-zinc-900 font-comfortaa">Metal Processing Plant</p>
            </div>
          </div>
          
          <div className="flex gap-12 text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em]">
             <span>Security AES-256</span>
             <span>Latency 12ms</span>
             <span>{t("label_copyright_footer")}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
