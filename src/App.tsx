import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@shared/components/ui/toaster";
import { TooltipProvider } from "@shared/components/ui/tooltip";
import { LangProvider } from "@shared/contexts/LangContext";
import { FactoryProvider } from "@shared/contexts/FactoryContext";
import { getAuthToken, getAuthUser } from "@shared/lib/auth";
import { Layout } from "@shared/components/Layout";
import { ErrorBoundary } from "@modules/skill-matrix/components/error-boundary";
import type { ComponentType } from "react";

// Dashboard Module
import DashboardHome from "@modules/dashboard/pages/dashboard";
import DashboardLogin from "@modules/dashboard/pages/login";

// Skill Matrix Module
import Hub from "@modules/skill-matrix/pages/hub";
import EmployeesPage from "@modules/skill-matrix/pages/employees/index";
import EmployeeProfilePage from "@modules/skill-matrix/pages/employees/[id]";
import DepartmentsPage from "@modules/skill-matrix/pages/departments/index";
import DepartmentDetailPage from "@modules/skill-matrix/pages/departments/[id]";
import CampaignsPage from "@modules/skill-matrix/pages/campaigns/index";
import CampaignDetailPage from "@modules/skill-matrix/pages/campaigns/[id]";
import SkillsPage from "@modules/skill-matrix/pages/skills/index";
import TrainingPage from "@modules/skill-matrix/pages/training/index";
import EvaluationsPage from "@modules/skill-matrix/pages/evaluations/index";
import SettingsPage from "@modules/skill-matrix/pages/settings";
import MyProfilePage from "@modules/skill-matrix/pages/my-profile";
import WorkflowsPage from "@modules/skill-matrix/pages/workflows/index";
import WorkflowDetailPage from "@modules/skill-matrix/pages/workflows/[id]";
import MyTasksPage from "@modules/skill-matrix/pages/my-tasks";
import ManualPage from "@modules/skill-matrix/pages/manual";
import JobEvaluationGuide from "@modules/skill-matrix/pages/job-evaluation/guide";
import JobEvaluationDashboard from "@modules/skill-matrix/pages/job-evaluation/dashboard";
import JobProfilesPage from "@modules/skill-matrix/pages/job-evaluation/profiles";

// Spreadsheet Module
import SpreadsheetPage from "@modules/spreadsheet/pages/spreadsheet";

// Docs Module
import DocsApp from "@modules/docs/App"; // Docs uses App as main entry

// Interactive Presentation Module
import InteractivePresentationApp from "@modules/interactive-presentation/App"; // Interactive Presentation uses App as main entry

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProtectedRouteProps {
  component: ComponentType;
  roles?: string[];
}

function ProtectedRoute({ component: Component, roles }: ProtectedRouteProps) {
  const token = getAuthToken();
  const user = getAuthUser();

  if (!token || !user) {
    return <Redirect to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

const ADMIN_HR_DEPT = ["super_admin", "hr_coordinator", "dept_head"];
const ALL_ROLES = ["super_admin", "hr_coordinator", "dept_head", "employee"];

function AppRoutes() {
  const [location] = useLocation();

  if (location === "/login") {
    return <DashboardLogin onLogin={() => window.location.href = "/"} />;
  }

  return (
    <Layout>
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.split('/')[1]} // Animate only on major module change
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Switch>
              {/* Dashboard */}
              <Route path="/" component={() => <ProtectedRoute component={DashboardHome} roles={ALL_ROLES} />} />

              {/* Skill Matrix */}
              <Route path="/skill-matrix" component={() => <ProtectedRoute component={Hub} roles={ALL_ROLES} />} />
              <Route path="/skill-matrix/employees" component={() => <ProtectedRoute component={EmployeesPage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/employees/:id" component={() => <ProtectedRoute component={EmployeeProfilePage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/departments" component={() => <ProtectedRoute component={DepartmentsPage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/departments/:id" component={() => <ProtectedRoute component={DepartmentDetailPage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/campaigns" component={() => <ProtectedRoute component={CampaignsPage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/campaigns/:id" component={() => <ProtectedRoute component={CampaignDetailPage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/skills" component={() => <ProtectedRoute component={SkillsPage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/training" component={() => <ProtectedRoute component={TrainingPage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/evaluations" component={() => <ProtectedRoute component={EvaluationsPage} roles={ADMIN_HR_DEPT} />} />
              <Route path="/skill-matrix/workflows" component={() => <ProtectedRoute component={WorkflowsPage} roles={ALL_ROLES} />} />
              <Route path="/skill-matrix/workflows/:id" component={() => <ProtectedRoute component={WorkflowDetailPage} roles={ALL_ROLES} />} />
              <Route path="/skill-matrix/my-tasks" component={() => <ProtectedRoute component={MyTasksPage} roles={ALL_ROLES} />} />
              <Route path="/skill-matrix/settings" component={() => <ProtectedRoute component={SettingsPage} roles={ALL_ROLES} />} />
              <Route path="/skill-matrix/manual" component={() => <ProtectedRoute component={ManualPage} roles={ALL_ROLES} />} />
              
              {/* Job Evaluation */}
              <Route path="/job-evaluation/guide" component={() => <ProtectedRoute component={JobEvaluationGuide} roles={ALL_ROLES} />} />
              <Route path="/job-evaluation/dashboard" component={() => <ProtectedRoute component={JobEvaluationDashboard} roles={ADMIN_HR_DEPT} />} />
              <Route path="/job-evaluation/profiles" component={() => <ProtectedRoute component={JobProfilesPage} roles={ADMIN_HR_DEPT} />} />

              {/* Spreadsheet */}
              <Route path="/spreadsheet" component={() => <ProtectedRoute component={SpreadsheetPage} roles={ADMIN_HR_DEPT} />} />

              {/* Docs */}
              <Route path="/docs/:rest*">
                {() => (
                  <WouterRouter base="/docs">
                    <ProtectedRoute component={DocsApp} roles={ALL_ROLES} />
                  </WouterRouter>
                )}
              </Route>
              
              {/* Interactive Presentation */}
              <Route path="/interactive-presentation/:rest*">
                {() => (
                  <WouterRouter base="/interactive-presentation">
                    <ProtectedRoute component={InteractivePresentationApp} roles={ALL_ROLES} />
                  </WouterRouter>
                )}
              </Route>

              <Route path="/my-profile" component={() => <ProtectedRoute component={MyProfilePage} roles={ALL_ROLES} />} />

              <Route component={() => <div className="text-white">404 - Module Not Found</div>} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </ErrorBoundary>
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" themes={["dark", "light"]} disableTransitionOnChange>
      <LangProvider>
        <QueryClientProvider client={queryClient}>
          <FactoryProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppRoutes />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </FactoryProvider>
        </QueryClientProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
