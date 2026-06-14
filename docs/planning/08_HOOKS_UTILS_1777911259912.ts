// src/hooks/useAuth.ts
// ============================================================================
// AUTHENTICATION HOOK
// Enhanced by: yasserious.com
// ============================================================================

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '../types/database';

interface UseAuthReturn {
  user: AuthUser | null;
  userData: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setUser(data.session?.user || null);

        // Fetch user data from database
        if (data.session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (userError) throw userError;
          setUserData(userData);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);

        if (session?.user) {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUserData(userData || null);
          } catch (err) {
            console.error('Error fetching user data:', err);
          }
        } else {
          setUserData(null);
        }
      }
    );

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserData(null);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<boolean> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  return { user, userData, loading, error, login, logout, signUp };
}

---

// src/hooks/useEvaluations.ts
// ============================================================================
// EVALUATIONS HOOK
// Enhanced by: yasserious.com
// ============================================================================

import { useEffect, useState } from 'react';
import { evaluationService } from '../services/evaluationService';
import type {
  Evaluation,
  EvaluationSummary,
  EvaluationCampaign,
} from '../types/database';

interface UseEvaluationsReturn {
  campaigns: EvaluationCampaign[];
  evaluations: Evaluation[];
  summary: EvaluationSummary | null;
  loading: boolean;
  error: string | null;
  submitEvaluation: (evaluation: Partial<Evaluation>) => Promise<boolean>;
  getCampaignEvaluations: (campaignId: string) => Promise<void>;
}

export function useEvaluations(): UseEvaluationsReturn {
  const [campaigns, setCampaigns] = useState<EvaluationCampaign[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const { success, data } = await evaluationService.getCampaigns('Active');

      if (success) {
        setCampaigns(data || []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const getCampaignEvaluations = async (campaignId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { success, data } = await evaluationService.getCampaignEvaluations(
        campaignId
      );

      if (success) {
        setEvaluations(data || []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitEvaluation = async (
    evaluation: Partial<Evaluation>
  ): Promise<boolean> => {
    try {
      setError(null);
      const { success } = await evaluationService.submitEvaluation(evaluation);

      if (success) {
        // Reload evaluations
        if (evaluation.campaign_id) {
          await getCampaignEvaluations(evaluation.campaign_id);
        }
      }

      return success;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  return {
    campaigns,
    evaluations,
    summary,
    loading,
    error,
    submitEvaluation,
    getCampaignEvaluations,
  };
}

---

// src/utils/calculateScore.ts
// ============================================================================
// SCORING CALCULATION UTILITIES
// Enhanced by: yasserious.com
// ============================================================================

import type { Skill } from '../types/database';

export interface ScoreCalculation {
  totalScore: number;
  maxScore: number;
  percentage: number;
  class: 'A' | 'B' | 'C';
}

/**
 * Calculate score for an employee based on skills and weights
 */
export function calculateScore(
  skillScores: Record<string, number>,
  skills: Skill[]
): ScoreCalculation {
  let totalScore = 0;
  let maxScore = 0;

  skills.forEach((skill) => {
    const score = skillScores[skill.id] || 0;
    totalScore += score * skill.weight;
    maxScore += 4 * skill.weight;
  });

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  let evaluationClass: 'A' | 'B' | 'C';
  if (percentage >= 85) {
    evaluationClass = 'A';
  } else if (percentage >= 60) {
    evaluationClass = 'B';
  } else {
    evaluationClass = 'C';
  }

  return {
    totalScore,
    maxScore,
    percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
    class: evaluationClass,
  };
}

/**
 * Get training recommendation based on class
 */
export function getTrainingRecommendation(
  evaluationClass: 'A' | 'B' | 'C'
): { title: string; description: string; priority: string } {
  const recommendations = {
    A: {
      title: '⭐ Promotion Ready',
      description:
        'Employee is ready for advancement and can mentor junior staff',
      priority: 'low',
    },
    B: {
      title: '📚 Training Needed',
      description: 'Core performer with some skill gaps requiring targeted training',
      priority: 'medium',
    },
    C: {
      title: '🚨 Intensive Training Required',
      description:
        'Significant skill gaps requiring immediate attention and support',
      priority: 'high',
    },
  };

  return recommendations[evaluationClass];
}

/**
 * Get color for score
 */
export function getScoreColor(score: number): string {
  if (score === 4) return 'bg-green-600';
  if (score === 3) return 'bg-lime-500';
  if (score === 2) return 'bg-amber-500';
  if (score === 1) return 'bg-orange-500';
  return 'bg-red-600';
}

/**
 * Get color for class
 */
export function getClassColor(evaluationClass: 'A' | 'B' | 'C'): string {
  if (evaluationClass === 'A') return 'bg-green-100 text-green-800';
  if (evaluationClass === 'B') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

---

// src/utils/formatters.ts
// ============================================================================
// FORMATTING UTILITIES
// Enhanced by: yasserious.com
// ============================================================================

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Format email for display
 */
export function formatEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

---

// src/utils/validators.ts
// ============================================================================
// VALIDATION UTILITIES
// Enhanced by: yasserious.com
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  isStrong: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isStrong: errors.length === 0,
    errors,
  };
}

/**
 * Validate score (0-4)
 */
export function isValidScore(score: any): boolean {
  const num = Number(score);
  return Number.isInteger(num) && num >= 0 && num <= 4;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
}
