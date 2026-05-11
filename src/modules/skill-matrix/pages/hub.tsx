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
import { IndustrialCard } from "@shared/components/ui/industrial-card";
import { Loader } from "@shared/components/ui/loader";

export default function Hub() {
  const [showSplash, setShowSplash] = useState(true);
  const [, setLocation] = useLocation();
  const user = getAuthUser();
  const t = useT();

  useEffect(() =>{
    // Show splash for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const role = user?.role || "employee";
  const isAdminOrHR = role === "super_admin" || role === "hr_coordinator";
  const isDeptHead = role === "dept_head";
  const isEmployee = role === "employee";

  const navigationCards = [
    {
      title: "DASHBOARD",
      icon: <LayoutDashboard className="h-12 w-12 mb-4 text-primary" />,
      path: "/dashboard",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: "MY PROFILE",
      icon: <UserCircle className="h-12 w-12 mb-4 text-primary" />,
      path: "/my-profile",
      show: true, // Everyone has a profile
    },
    {
      title: "CAMPAIGNS",
      icon: <Target className="h-12 w-12 mb-4 text-primary" />,
      path: "/campaigns",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: "DEPARTMENTS",
      icon: <Building2 className="h-12 w-12 mb-4 text-primary" />,
      path: "/departments",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: "EMPLOYEES",
      icon: <Users className="h-12 w-12 mb-4 text-primary" />,
      path: "/employees",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: "EVALUATIONS",
      icon: <GraduationCap className="h-12 w-12 mb-4 text-primary" />,
      path: "/evaluations",
      show: isAdminOrHR || isDeptHead,
    },
    {
      title: "WORKFLOWS",
      icon: <Workflow className="h-12 w-12 mb-4 text-primary" />,
      path: "/workflows",
      show: true,
    },
    {
      title: "SETTINGS",
      icon: <Settings className="h-12 w-12 mb-4 text-primary" />,
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
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#121212]"
          >
            <div className="scanline"></div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col items-center screen-flicker"
            >
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Grand Line ERP Logo" 
                className="w-48 h-48 object-contain mb-8 filter drop-shadow-[0 0 15px_rgba(212,175,55,0.5)]" 
              />
              <h1 className="text-3xl tracking-[0.3em] font-headline text-primary uppercase">
                GRAND LINE ERP
              </h1>
              <div className="mt-8">
                <Loader text={t("label_initializing_systems")} />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full p-8 overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto">
              <header className="mb-12 text-center">
                <h1 className="text-4xl font-headline tracking-widest uppercase mb-4 text-primary">{t("label_main_directory")}
                </h1>
                <p className="text-muted-foreground uppercase tracking-widest font-mono">{t("label_select_destination")}
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {navigationCards
                  .filter((card) => card.show)
                  .map((card, index) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer"
                      onClick={() => setLocation(card.path)}
                    >
                      <IndustrialCard 
                        title={card.title}
                        footerText={t("label_sys_module_ready")}
                        className="h-48 flex flex-col items-center justify-center border-border/50 hover:border-primary/50 transition-colors group cursor-pointer"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="group-hover:scale-110 transition-transform duration-300 text-primary/80 group-hover:text-primary filter drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">
                            {card.icon}
                          </div>
                        </div>
                      </IndustrialCard>
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
