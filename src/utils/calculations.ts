/**
 * Utility functions for quit tracking calculations
 */

export interface QuitStats {
  daysSinceQuit: number;
  moneySaved: number;
  vapesNotUsed: number;
  healthMilestones: HealthMilestone[];
}

export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  daysToAchieve: number;
  achieved: boolean;
  category: 'immediate' | 'short-term' | 'long-term';
}

export function calculateQuitStats(
  quitDate: Date,
  vapesPerDay: number,
  costPerPod: number,
  vapesPerPod: number = 200
): QuitStats {
  const now = new Date();
  const timeDiff = now.getTime() - quitDate.getTime();
  const daysSinceQuit = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
  
  const vapesNotUsed = daysSinceQuit * vapesPerDay;
  const podsNotUsed = vapesNotUsed / vapesPerPod;
  const moneySaved = podsNotUsed * costPerPod;

  const healthMilestones = getHealthMilestones(daysSinceQuit);

  return {
    daysSinceQuit,
    moneySaved,
    vapesNotUsed,
    healthMilestones,
  };
}

function getHealthMilestones(daysSinceQuit: number): HealthMilestone[] {
  const milestones: HealthMilestone[] = [
    {
      id: '20min',
      title: '20 Minutes',
      description: 'Heart rate and blood pressure normalize',
      daysToAchieve: 0, // Same day
      achieved: daysSinceQuit >= 0,
      category: 'immediate',
    },
    {
      id: '12hours',
      title: '12 Hours',
      description: 'Carbon monoxide levels normalize',
      daysToAchieve: 1,
      achieved: daysSinceQuit >= 1,
      category: 'immediate',
    },
    {
      id: '1week',
      title: '1 Week',
      description: 'Taste and smell improve significantly',
      daysToAchieve: 7,
      achieved: daysSinceQuit >= 7,
      category: 'short-term',
    },
    {
      id: '1month',
      title: '1 Month',
      description: 'Lung function begins to improve',
      daysToAchieve: 30,
      achieved: daysSinceQuit >= 30,
      category: 'short-term',
    },
    {
      id: '3months',
      title: '3 Months',
      description: 'Circulation improves, lung function increases',
      daysToAchieve: 90,
      achieved: daysSinceQuit >= 90,
      category: 'long-term',
    },
    {
      id: '1year',
      title: '1 Year',
      description: 'Risk of heart disease cut in half',
      daysToAchieve: 365,
      achieved: daysSinceQuit >= 365,
      category: 'long-term',
    },
  ];

  return milestones;
}

export function formatDuration(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }
    return `${weeks}w ${remainingDays}d`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return months === 1 ? '1 month' : `${months} months`;
    }
    return `${months}m ${remainingDays}d`;
  }
  
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  if (remainingDays === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  const months = Math.floor(remainingDays / 30);
  return `${years}y ${months}m`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}