import type { EvalClass } from '../data/masterData';

export interface ScoredSkill {
  id: string;
  weight: number;
}

export interface ScoreResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  evalClass: EvalClass;
}

export function calculateScore(scores: Record<string, number>, skills: ScoredSkill[]): ScoreResult {
  let totalScore = 0;
  let maxScore = 0;

  for (const skill of skills) {
    const score = scores[skill.id] ?? 0;
    totalScore += score * skill.weight;
    maxScore += 4 * skill.weight;
  }

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const rounded = Math.round(percentage * 10) / 10;

  let evalClass: EvalClass;
  if (rounded >= 85) {
    evalClass = 'A';
  } else if (rounded >= 60) {
    evalClass = 'B';
  } else {
    evalClass = 'C';
  }

  return { totalScore, maxScore, percentage: rounded, evalClass };
}

export function getScoreColor(score: number): string {
  if (score === 4) return '#16A34A';
  if (score === 3) return '#65A30D';
  if (score === 2) return '#D97706';
  if (score === 1) return '#EA580C';
  return '#DC2626';
}

export function getScoreLabel(score: number): string {
  const labels: Record<number, string> = {
    0: 'Cannot perform',
    1: 'With supervision',
    2: 'Occasional help',
    3: 'Independently',
    4: 'Expert / Trainer',
  };
  return labels[score] ?? '';
}

export function getClassColor(cls: EvalClass): string {
  if (cls === 'A') return '#16A34A';
  if (cls === 'B') return '#CA8A04';
  return '#DC2626';
}

export function getClassBg(cls: EvalClass): string {
  if (cls === 'A') return 'class-a';
  if (cls === 'B') return 'class-b';
  return 'class-c';
}
