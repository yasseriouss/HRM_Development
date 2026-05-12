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
  UserCircle 
} from "lucide-react";
import { Card } from "@shared/components/ui/card";
import { SoftCard } from "@shared/components/ui/soft-card";
import { Loader } from "@shared/components/ui/loader";

export default function Hub() {
  const [showSplash, setShowSplash] = useState(true);
  const [, setLocation] = useLocation();
  const user = getAuthUser();
  const t = useT();

  useEffect(() =>{
    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const role = user?.role || "employee";
  const isAdminOrHR = role === "super_admin" || role === "hr_coordinator";
  const isDeptHead = role === "dept_head";
  const isEmployee = role === "employee";

  const navigationCards = [
    {
      title: t("nav_dashboard"),
      icon: <LayoutDashboard className="h-10 w-10 mb-4 text-primary" />,
      path: "/dashboard",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: t("nav_my_profile"),
      icon: <UserCircle className="h-10 w-10 mb-4 text-primary" />,
      path: "/my-profile",
      show: true, // Everyone has a profile
    },
    {
      title: t("nav_campaigns"),
      icon: <Target className="h-10 w-10 mb-4 text-primary" />,
      path: "/campaigns",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: t("nav_departments"),
      icon: <Building2 className="h-10 w-10 mb-4 text-primary" />,
      path: "/departments",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: t("nav_employees"),
      icon: <Users className="h-10 w-10 mb-4 text-primary" />,
      path: "/employees",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: t("nav_evaluations"),
      icon: <GraduationCap className="h-10 w-10 mb-4 text-primary" />,
      path: "/evaluations",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: t("nav_workflows"),
      icon: <Workflow className="h-10 w-10 mb-4 text-primary" />,
      path: "/workflows",
      show: true,
    },
    {
      title: t("nav_settings"),
      icon: <Settings className="h-10 w-10 mb-4 text-primary" />,
      path: "/settings",
      show: true,
    },
  ];

  return (
    <div className="w-full h-full relative overflow-hidden bg-background text-foreground">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-background"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Logo" 
                className="w-40 h-40 object-contain mb-8 filter grayscale opacity-20" 
              />
              <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight uppercase leading-none">
                HRM UNIFIED
              </h1>
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-4 opacity-60">Management Suite</p>
              <div className="mt-12">
                <Loader text={t("label_initializing_systems")} />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full p-8 md:p-16 overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto">
              <header className="mb-20 text-center md:text-left md:flex md:items-end md:justify-between border-b border-muted/5 pb-12">
                <div>
                   <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight uppercase mb-4 text-foreground leading-none">{t("label_main_directory")}</h1>
                   <p className="text-[10px] text-muted uppercase tracking-[0.3em] font-bold opacity-60">{t("label_select_destination")}</p>
                </div>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {navigationCards
                  .filter((card) => card.show)
                  .map((card, index) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="cursor-pointer"
                      onClick={() => setLocation(card.path)}
                    >
                      <SoftCard 
                        title={card.title}
                        footerText={t("label_sys_module_ready")}
                        className="h-64 flex flex-col justify-between"
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                            {card.icon}
                          </div>
                        </div>
                      </SoftCard>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
