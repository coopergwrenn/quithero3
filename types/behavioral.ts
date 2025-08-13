/**
 * Types for behavioral science features
 * Based on ACT/CBT frameworks and clinical research
 */

export interface MotivationFactor {
  id: string;
  label: string;
  category: 'health' | 'financial' | 'social' | 'personal';
  weight: number; // 1-5 importance scale
}

export interface Trigger {
  id: string;
  name: string;
  category: 'emotional' | 'social' | 'routine' | 'environmental';
  intensity: number; // 1-5 scale
  replacementStrategy?: string;
}

export interface QuitPlan {
  id: string;
  userId?: string;
  createdAt: Date;
  quitDate: Date;
  method: 'cold-turkey' | 'gradual' | 'nrt';
  motivations: MotivationFactor[];
  triggers: Trigger[];
  nrtPlan?: NRTPlan;
  dailyGoals: string[];
  emergencyContacts: EmergencyContact[];
}

export interface NRTPlan {
  type: 'patch' | 'gum' | 'lozenge' | 'inhaler' | 'nasal-spray';
  duration: number; // weeks
  schedule: NRTSchedule[];
  reminders: boolean;
}

export interface NRTSchedule {
  week: number;
  dosage: string;
  frequency: string;
}

export interface EmergencyContact {
  name: string;
  phone?: string;
  relationship: string;
}

export interface CravingLog {
  id: string;
  timestamp: Date;
  intensity: number; // 1-10 scale
  trigger?: string;
  duration: number; // seconds
  strategy: string;
  successful: boolean;
  notes?: string;
}

export interface MilestoneReward {
  id: string;
  title: string;
  description: string;
  achievedAt?: Date;
  category: 'health' | 'financial' | 'social' | 'personal';
  unlockDays: number;
}