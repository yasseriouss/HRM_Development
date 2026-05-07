// src/types/database.ts
// ============================================================================
// DATABASE TYPES - TypeScript interfaces matching Supabase schema
// Enhanced by: yasserious.com
// ============================================================================

export type UserRole = 'super_admin' | 'dept_head' | 'hr_coordinator' | 'employee';
export type CampaignType = 'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Custom';
export type CampaignStatus = 'Draft' | 'Active' | 'Completed' | 'Archived';
export type EvaluationClass = 'A' | 'B' | 'C';
export type RecommendationType = 'Immediate' | 'Short-term' | 'Long-term' | 'Promotion';
export type RecommendationStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
export type CriticalityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// DEPARTMENT TYPES
// ============================================================================

export interface Department {
  id: string;
  name: string;
  code: string | null;
  manager_id: string | null;
  manager_email: string | null;
  description: string | null;
  created_date: string;
  created_at: string;
  updated_at: string;
  manager?: User; // Relation
}

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export interface Employee {
  id: string;
  employee_code: string | null;
  full_name: string;
  department_id: string;
  job_title: string | null;
  joined_date: string | null;
  birth_date: string | null;
  current_class: EvaluationClass;
  email: string | null;
  phone: string | null;
  user_id: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  department?: Department; // Relation
  user?: User; // Relation
}

// ============================================================================
// SKILL TYPES
// ============================================================================

export interface Skill {
  id: string;
  code: string | null;
  name: string;
  department_id: string;
  category: string | null;
  weight: number; // 1-5
  criticality: CriticalityLevel;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department; // Relation
}

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export interface EvaluationCampaign {
  id: string;
  title: string;
  type: CampaignType;
  department_id: string | null;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  triggered_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  department?: Department; // Relation
  triggered_by_user?: User; // Relation
}

// ============================================================================
// EVALUATION TYPES
// ============================================================================

export interface Evaluation {
  id: string;
  campaign_id: string;
  employee_id: string;
  skill_id: string;
  score: number; // 0-4
  notes: string | null;
  evaluated_by: string | null;
  evaluation_date: string;
  created_at: string;
  updated_at: string;
  campaign?: EvaluationCampaign; // Relation
  employee?: Employee; // Relation
  skill?: Skill; // Relation
  evaluator?: User; // Relation
}

// ============================================================================
// EVALUATION SUMMARY TYPES
// ============================================================================

export interface EvaluationSummary {
  id: string;
  campaign_id: string;
  employee_id: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  class: EvaluationClass;
  evaluated_skills_count: number;
  updated_at: string;
  campaign?: EvaluationCampaign; // Relation
  employee?: Employee; // Relation
}

// ============================================================================
// TRAINING RECOMMENDATION TYPES
// ============================================================================

export interface TrainingRecommendation {
  id: string;
  employee_id: string;
  skill_id: string | null;
  campaign_id: string | null;
  score: number | null;
  recommendation_type: RecommendationType;
  status: RecommendationStatus;
  assigned_trainer_id: string | null;
  target_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee; // Relation
  skill?: Skill; // Relation
  campaign?: EvaluationCampaign; // Relation
  trainer?: User; // Relation
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  action: string;
  table_name: string | null;
  record_id: string | null;
  user_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: User; // Relation
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateEvaluationFormData {
  campaign_id: string;
  employee_id: string;
  skill_scores: Record<string, number>; // skill_id -> score
  notes?: string;
}

export interface CreateCampaignFormData {
  title: string;
  type: CampaignType;
  department_id?: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardMetrics {
  total_employees: number;
  average_skill_level: number;
  class_a_count: number;
  class_b_count: number;
  class_c_count: number;
  active_campaigns: number;
  completed_campaigns: number;
}

export interface DepartmentMetrics {
  department_id: string;
  department_name: string;
  employee_count: number;
  average_percentage: number;
  class_distribution: {
    a: number;
    b: number;
    c: number;
  };
  top_skills: Skill[];
  weak_skills: Skill[];
}

export interface EmployeeProfile {
  employee: Employee;
  current_evaluation?: EvaluationSummary;
  skill_scores: Record<string, number>; // skill_id -> score
  historical_data: EvaluationSummary[];
  recommendations: TrainingRecommendation[];
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationPayload {
  type: 'campaign_activated' | 'evaluation_submitted' | 'campaign_completed' | 'training_assigned';
  title: string;
  message: string;
  data: Record<string, any>;
  timestamp: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeHistory: boolean;
  startDate?: string;
  endDate?: string;
  departments?: string[];
}
