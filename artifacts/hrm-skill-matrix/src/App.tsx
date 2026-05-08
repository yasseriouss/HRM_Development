import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/contexts/LangContext";
import { getAuthToken, getAuthUser } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { ErrorBoundary } from "@/components/error-boundary";
import type { ComponentType } from "react";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import EmployeesPage from "@/pages/employees/index";
import EmployeeProfilePage from "@/pages/employees/[id]";
import DepartmentsPage from "@/pages/departments/index";
import DepartmentDetailPage from "@/pages/departments/[id]";
import CampaignsPage from "@/pages/campaigns/index";
import CampaignDetailPage from "@/pages/campaigns/[id]";
import SkillsPage from "@/pages/skills/index";
import TrainingPage from "@/pages/training/index";
import EvaluationsPage from "@/pages/evaluations/index";
import SettingsPage from "@/pages/settings";
import MyProfilePage from "@/pages/my-profile";
import WorkflowsPage from "@/pages/workflows/index";
import WorkflowDetailPage from "@/pages/workflows/[id]";
import MyTasksPage from "@/pages/my-tasks";
import ManualPage from "@/pages/manual";
import JobEvaluationGuide from "@/pages/job-evaluation/guide";
import JobEvaluationDashboard from "@/pages/job-evaluation/dashboard";
import JobProfilesPage from "@/pages/job-evaluation/profiles";

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

const ADMIN_HR = ["super_admin", "hr_coordinator"];
const ADMIN_HR_DEPT = ["super_admin", "hr_coordinator", "dept_head"];
const ALL_ROLES = ["super_admin", "hr_coordinator", "dept_head", "employee"];
const WORKFLOW_ROLES = ["super_admin", "hr_coordinator", "dept_head", "employee"];

function EmployeeRedirect() {
  const user = getAuthUser();
  if (user?.role === "employee") return <Redirect to="/my-profile" />;
  return <ProtectedRoute component={Dashboard} roles={ADMIN_HR_DEPT} />;
}

function AppRoutes() {
  const [location] = useLocation();

  if (location === "/login") {
    return <Login />;
  }

  return (
    <Layout>
      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Switch location={location}>
              <Route path="/" component={EmployeeRedirect} />
              <Route
                path="/my-profile"
                component={() => <ProtectedRoute component={MyProfilePage} roles={ALL_ROLES} />}
              />
              <Route
                path="/employees"
                component={() => <ProtectedRoute component={EmployeesPage} roles={ADMIN_HR_DEPT} />}
              />
              <Route
                path="/employees/:id"
                component={() => (
                  <ProtectedRoute component={EmployeeProfilePage} roles={ADMIN_HR_DEPT} />
                )}
              />
              <Route
                path="/departments"
                component={() => (
                  <ProtectedRoute component={DepartmentsPage} roles={ADMIN_HR_DEPT} />
                )}
              />
              <Route
                path="/departments/:id"
                component={() => (
                  <ProtectedRoute component={DepartmentDetailPage} roles={ADMIN_HR_DEPT} />
                )}
              />
              <Route
                path="/campaigns"
                component={() => <ProtectedRoute component={CampaignsPage} roles={ADMIN_HR_DEPT} />}
              />
              <Route
                path="/campaigns/:id"
                component={() => (
                  <ProtectedRoute component={CampaignDetailPage} roles={ADMIN_HR_DEPT} />
                )}
              />
              <Route
                path="/evaluations"
                component={() => (
                  <ProtectedRoute component={EvaluationsPage} roles={ADMIN_HR_DEPT} />
                )}
              />
              <Route
                path="/skills"
                component={() => <ProtectedRoute component={SkillsPage} roles={ADMIN_HR} />}
              />
              <Route
                path="/training"
                component={() => <ProtectedRoute component={TrainingPage} roles={ADMIN_HR_DEPT} />}
              />
              <Route
                path="/workflows"
                component={() => <ProtectedRoute component={WorkflowsPage} roles={WORKFLOW_ROLES} />}
              />
              <Route
                path="/workflows/:id"
                component={() => <ProtectedRoute component={WorkflowDetailPage} roles={WORKFLOW_ROLES} />}
              />
              <Route
                path="/my-tasks"
                component={() => <ProtectedRoute component={MyTasksPage} roles={WORKFLOW_ROLES} />}
              />
              <Route
                path="/settings"
                component={() => (
                  <ProtectedRoute component={SettingsPage} roles={ALL_ROLES} />
                )}
              />
              <Route
                path="/manual"
                component={() => (
                  <ProtectedRoute component={ManualPage} roles={ALL_ROLES} />
                )}
              />
              <Route
                path="/job-evaluation/guide"
                component={() => (
                  <ProtectedRoute component={JobEvaluationGuide} roles={ALL_ROLES} />
                )}
              />
              <Route
                path="/job-evaluation/dashboard"
                component={() => (
                  <ProtectedRoute component={JobEvaluationDashboard} roles={ADMIN_HR_DEPT} />
                )}
              />
              <Route
                path="/job-evaluation/profiles"
                component={() => (
                  <ProtectedRoute component={JobProfilesPage} roles={ADMIN_HR_DEPT} />
                )}
              />
              <Route component={NotFound} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </ErrorBoundary>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]} disableTransitionOnChange>
      <LangProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;
