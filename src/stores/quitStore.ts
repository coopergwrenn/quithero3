import { create } from 'zustand';
// import { MMKV } from 'react-native-mmkv';
import { PersonalizedPlan } from '@/src/utils/personalization';
import { analytics } from '@/src/services/analytics';
import type { UserProfile } from '@/src/services/profileService';
import { profileService } from '@/src/services/profileService';

// Initialize MMKV storage - temporarily disabled
// const storage = new MMKV();
const mockStorage: { [key: string]: any } = {};
const storage = {
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  getItem: (key: string) => mockStorage[key] || null,
  removeItem: (key: string) => { delete mockStorage[key]; },
  set: (key: string, value: any) => { mockStorage[key] = value; },
  getString: (key: string) => mockStorage[key] || undefined,
  getBoolean: (key: string) => mockStorage[key] === 'true' || mockStorage[key] === true,
  clearAll: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); },
};

interface QuitData {
  quitDate?: Date;
  cigarettesPerDay?: number;
  costPerPack?: number;
  motivation?: string[];
  triggers?: string[];
  hasQuitBefore?: boolean;
  usingNRT?: boolean;
  nrtType?: string;
  dailyGoal?: string;
  // New onboarding data
  substanceType?: 'cigarettes' | 'vape' | 'both';
  usageAmount?: number;
  firstUseTime?: 'within-5min' | 'within-30min' | 'within-1hour' | 'later';
  primaryMotivation?: 'health' | 'money' | 'family' | 'control' | 'other';
  socialContext?: 'daily' | 'sometimes' | 'rarely' | 'never';
  stressLevel?: 'high' | 'medium' | 'low';
  sleepQuality?: 'poor' | 'fair' | 'good';
  previousAttempts?: 'never' | 'once' | 'multiple';
  quitTimeline?: 'today' | 'this-week' | 'next-week' | 'this-month';
  nrtInterest?: 'yes' | 'maybe' | 'no' | 'already-using';
  riskLevel?: 'high' | 'medium' | 'low';
  personalizedPlan?: PersonalizedPlan;
}

interface QuitStore {
  // User data
  quitData: QuitData;
  isOnboardingComplete: boolean;
  hasSeenPaywall: boolean;
  isPremium: boolean;
  userProfile: UserProfile | null;
  
  // Actions
  updateQuitData: (data: Partial<QuitData>) => void;
  completeOnboarding: () => void;
  markPaywallSeen: () => void;
  setPremium: (premium: boolean) => void;
  restorePurchases: () => Promise<void>;
  
  // Profile actions
  setUserProfile: (profile: UserProfile | null) => void;
  loadUserProfile: () => Promise<void>;
  
  // Persistence
  loadFromStorage: () => void;
  clearData: () => void;
}

export const useQuitStore = create<QuitStore>((set, get) => ({
  quitData: {},
  isOnboardingComplete: false,
  hasSeenPaywall: false,
  isPremium: false,
  userProfile: null,

  updateQuitData: (data) => {
    const newQuitData = { ...get().quitData, ...data };
    set({ quitData: newQuitData });
    storage.set('quitData', JSON.stringify(newQuitData));
  },

  completeOnboarding: () => {
    set({ isOnboardingComplete: true });
    storage.set('isOnboardingComplete', 'true');
    analytics.track('onboarding_flow_completed');
  },

  markPaywallSeen: () => {
    set({ hasSeenPaywall: true });
    storage.set('hasSeenPaywall', 'true');
    analytics.track('paywall_seen');
  },

  setPremium: (premium) => {
    set({ isPremium: premium });
    storage.set('isPremium', premium ? 'true' : 'false');
    analytics.track('premium_status_changed', { is_premium: premium });
  },

  restorePurchases: async () => {
    // This will be implemented with RevenueCat integration
    console.log('Restore purchases called');
  },

  setUserProfile: (profile) => {
    set({ userProfile: profile });
  },

  loadUserProfile: async () => {
    try {
      const profile = await profileService.getUserProfile();
      set({ userProfile: profile });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  },

  loadFromStorage: async () => {
    try {
      const quitDataString = storage.getString('quitData');
      const quitData = quitDataString ? JSON.parse(quitDataString) : {};
      
      // Parse quit date if it exists
      if (quitData.quitDate) {
        quitData.quitDate = new Date(quitData.quitDate);
      }

      const isOnboardingComplete = storage.getBoolean('isOnboardingComplete') ?? false;
      const hasSeenPaywall = storage.getBoolean('hasSeenPaywall') ?? false;
      const isPremium = storage.getBoolean('isPremium') ?? false;

      set({ 
        quitData,
        isOnboardingComplete,
        hasSeenPaywall,
        isPremium,
      });
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  },

  clearData: () => {
    storage.clearAll();
    set({
      quitData: {},
      isOnboardingComplete: false,
      hasSeenPaywall: false,
      isPremium: false,
    });
  },
}));