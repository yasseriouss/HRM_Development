const API_BASE = "/api";

export function getToken(): string | null {
  return localStorage.getItem("hrm_user_token");
}

export function setToken(token: string): void {
  localStorage.setItem("hrm_user_token", token);
}

export function setUser(user: any): void {
  localStorage.setItem("hrm_user", JSON.stringify(user));
}

export function clearToken(): void {
  localStorage.removeItem("hrm_user_token");
  localStorage.removeItem("hrm_user");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-user-token": token } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg =
      (typeof err.message === "string" && err.message) ||
      (typeof err.error === "string" && err.error) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<{ token: string; user: unknown }> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export interface DashboardMetrics {
  total_employees: number;
  active_employees: number;
  active_campaigns: number;
  completed_campaigns: number;
  total_skills: number;
  average_skill_percentage: number;
  class_a_count: number;
  class_b_count: number;
  class_c_count: number;
  class_a_percentage: number;
  class_b_percentage: number;
  class_c_percentage: number;
  pending_training: number;
}

export interface DepartmentPerf {
  department_id: string;
  department_name: string;
  employee_count: number;
  average_percentage: number;
  class_a_count: number;
  class_b_count: number;
  class_c_count: number;
}

export interface ClassTrend {
  campaign_id: string;
  campaign_title: string;
  campaign_type: string;
  end_date: string;
  class_a_count: number;
  class_b_count: number;
  class_c_count: number;
  total: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  employee_name: string;
  department_name: string;
  timestamp: string;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return request("/dashboard/metrics");
}

export async function fetchDepartmentPerformance(): Promise<DepartmentPerf[]> {
  return request("/dashboard/department-performance");
}

export async function fetchClassTrends(): Promise<ClassTrend[]> {
  return request("/dashboard/class-trends");
}

export async function fetchRecentActivity(limit = 8): Promise<ActivityItem[]> {
  return request(`/dashboard/recent-activity?limit=${limit}`);
}

export interface WorkflowInstance {
  id: string;
  title: string;
  status: string;
  completed_steps: number;
  total_steps: number;
  created_at: string;
}

export interface WorkflowTask {
  id: string;
  status: string;
  workflow: WorkflowInstance;
}

export async function fetchWorkflows(): Promise<WorkflowInstance[]> {
  return request("/workflows");
}

export async function fetchMyTasks(): Promise<WorkflowTask[]> {
  return request("/workflows/my/tasks");
}
