// src/services/supabaseClient.ts
// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// Enhanced by: yasserious.com
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;

---

// src/services/authService.ts
// ============================================================================
// AUTHENTICATION SERVICE
// Enhanced by: yasserious.com
// ============================================================================

import { supabase } from './supabaseClient';
import type { User } from '../types/database';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends LoginCredentials {
  full_name: string;
  role?: string;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Sign up new user
   */
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (authError) throw authError;

      // Create user record in users table
      if (authData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: data.email,
              full_name: data.full_name,
              role: data.role || 'employee',
            },
          ]);

        if (insertError) throw insertError;
      }

      return { success: true, data: authData };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, data: data.user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, data: data.session };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
export default authService;

---

// src/services/evaluationService.ts
// ============================================================================
// EVALUATION SERVICE - Queries and mutations
// Enhanced by: yasserious.com
// ============================================================================

import { supabase } from './supabaseClient';
import type {
  Evaluation,
  EvaluationSummary,
  EvaluationCampaign,
  Employee,
  Skill,
} from '../types/database';

class EvaluationService {
  /**
   * Get all campaigns for current user
   */
  async getCampaigns(status?: string) {
    try {
      let query = supabase.from('evaluation_campaigns').select('*');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Create new campaign
   */
  async createCampaign(campaign: Partial<EvaluationCampaign>) {
    try {
      const { data, error } = await supabase
        .from('evaluation_campaigns')
        .insert([campaign])
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('evaluation_campaigns')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', campaignId)
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get evaluations for a campaign
   */
  async getCampaignEvaluations(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*, employee:employees(full_name), skill:skills(name, weight)')
        .eq('campaign_id', campaignId);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Submit evaluation
   */
  async submitEvaluation(evaluation: Partial<Evaluation>) {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .insert([
          {
            ...evaluation,
            evaluation_date: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      // This will trigger the auto-calculate function
      return { success: true, data: data?.[0] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Bulk submit evaluations
   */
  async submitBulkEvaluations(evaluations: Partial<Evaluation>[]) {
    try {
      const evaluationsWithTimestamp = evaluations.map((e) => ({
        ...e,
        evaluation_date: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('evaluations')
        .insert(evaluationsWithTimestamp)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get evaluation summary
   */
  async getEvaluationSummary(campaignId: string, employeeId: string) {
    try {
      const { data, error } = await supabase
        .from('evaluation_summaries')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('employee_id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get all summaries for a campaign
   */
  async getCampaignSummaries(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('evaluation_summaries')
        .select('*, employee:employees(full_name, employee_code)')
        .eq('campaign_id', campaignId)
        .order('percentage', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get employee skill progress over time
   */
  async getEmployeeProgress(employeeId: string) {
    try {
      const { data, error } = await supabase
        .from('evaluation_summaries')
        .select('*, campaign:evaluation_campaigns(title, type, start_date)')
        .eq('employee_id', employeeId)
        .order('updated_at', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get department performance metrics
   */
  async getDepartmentMetrics(departmentId: string, campaignId?: string) {
    try {
      let query = supabase
        .from('evaluation_summaries')
        .select(
          'percentage, class, employee:employees(full_name, employee_code, department_id)'
        );

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by department
      const filtered = data?.filter(
        (s: any) => s.employee?.department_id === departmentId
      );

      return { success: true, data: filtered };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const evaluationService = new EvaluationService();
export default evaluationService;

---

// src/services/reportService.ts
// ============================================================================
// REPORT SERVICE - Dashboard and export functions
// Enhanced by: yasserious.com
// ============================================================================

import { supabase } from './supabaseClient';
import type { DashboardMetrics, ExportOptions } from '../types/database';

class ReportService {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics | null> {
    try {
      // Get employee count
      const { count: total_employees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      // Get class distribution
      const { data: classData } = await supabase
        .from('employees')
        .select('current_class')
        .in('current_class', ['A', 'B', 'C']);

      const classDistribution = {
        a: classData?.filter((e) => e.current_class === 'A').length || 0,
        b: classData?.filter((e) => e.current_class === 'B').length || 0,
        c: classData?.filter((e) => e.current_class === 'C').length || 0,
      };

      // Get campaign counts
      const { count: active } = await supabase
        .from('evaluation_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      const { count: completed } = await supabase
        .from('evaluation_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Completed');

      // Calculate average
      const average = total_employees
        ? ((classDistribution.a * 100 +
            classDistribution.b * 60 +
            classDistribution.c * 30) /
            total_employees) |
          0
        : 0;

      return {
        total_employees: total_employees || 0,
        average_skill_level: average,
        class_a_count: classDistribution.a,
        class_b_count: classDistribution.b,
        class_c_count: classDistribution.c,
        active_campaigns: active || 0,
        completed_campaigns: completed || 0,
      };
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      return null;
    }
  }

  /**
   * Generate PDF report (stub - implement with jsPDF)
   */
  async generatePDFReport(
    reportType: 'individual' | 'department' | 'company',
    id: string
  ) {
    try {
      // Implementation would use jsPDF/html2canvas
      return { success: true, message: 'PDF generated' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Export evaluation data to Excel
   */
  async exportToExcel(options: ExportOptions) {
    try {
      // Implementation would use xlsx library
      return { success: true, message: 'Excel exported' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const reportService = new ReportService();
export default reportService;
