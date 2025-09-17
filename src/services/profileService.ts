import { supabase } from '../lib/supabase';
import type { UserBadge, VapingDependencyScore } from '../utils/personalization';

export interface UserProfile {
  id?: string;
  user_id?: string;
  
  // User identification
  email?: string;
  first_name?: string;
  signup_method?: 'email' | 'google' | 'phone' | 'apple';
  
  // Badge and Identity
  badge_type: string;
  badge_display_name: string;
  badge_description: string;
  badge_assigned_at?: string;
  
  // Dependency Scoring
  dependency_total: number;
  dependency_risk_level: string;
  dependency_risk_description: string;
  
  // Dependency Breakdown
  morning_dependency_score: number;
  usage_frequency_score: number;
  behavioral_compulsion_score: number;
  environmental_factors_score: number;
  struggle_count_score: number;
  
  // Onboarding Responses
  motivation: string;
  device_type?: string;
  usage_frequency?: string;
  first_use_time?: string;
  choice_vs_need?: string;
  triggers?: string[];
  selected_struggles?: string[];
  social_context?: string;
  stress_level?: string;
  sleep_quality?: string;
  previous_attempts?: string;
  quit_timeline?: string;
  support_type?: string;
  
  created_at?: string;
  updated_at?: string;
}

export const profileService = {
  // Save complete onboarding profile
  async saveOnboardingProfile(
    responses: any, 
    badge: UserBadge, 
    dependencyScore: VapingDependencyScore,
    signupMethod?: 'email' | 'google' | 'phone' | 'apple'
  ): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      // Determine signup method if not provided
      let detectedSignupMethod = signupMethod;
      if (!detectedSignupMethod) {
        // Try to detect from user metadata
        const userMetadata = user.app_metadata;
        if (userMetadata?.provider === 'google') {
          detectedSignupMethod = 'google';
        } else if (userMetadata?.provider === 'phone') {
          detectedSignupMethod = 'phone';
        } else if (userMetadata?.provider === 'apple') {
          detectedSignupMethod = 'apple';
        } else {
          detectedSignupMethod = 'email'; // Default fallback
        }
      }
      
      const profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        
        // User identification
        email: user.email || '',
        signup_method: detectedSignupMethod,
        
        // Badge data
        badge_type: badge.type,
        badge_display_name: badge.displayName,
        badge_description: badge.description,
        badge_assigned_at: badge.assignedAt.toISOString(),
        
        // Dependency scoring
        dependency_total: dependencyScore.total,
        dependency_risk_level: dependencyScore.riskLevel,
        dependency_risk_description: dependencyScore.riskDescription,
        
        // Breakdown scores
        morning_dependency_score: dependencyScore.breakdown.morningDependency,
        usage_frequency_score: dependencyScore.breakdown.usageFrequency,
        behavioral_compulsion_score: dependencyScore.breakdown.behavioralCompulsion,
        environmental_factors_score: dependencyScore.breakdown.environmentalFactors,
        struggle_count_score: dependencyScore.breakdown.struggleCount,
        
        // All onboarding responses
        motivation: responses.motivation,
        device_type: responses.substanceType, // Map to correct field name
        usage_frequency: responses.usageAmount,
        first_use_time: responses.firstUseTime,
        choice_vs_need: responses.choiceVsNeed,
        triggers: responses.triggers || [],
        selected_struggles: responses.struggles || [],
        social_context: responses.socialContext,
        stress_level: responses.stressLevel,
        sleep_quality: responses.sleepQuality,
        previous_attempts: responses.previousAttempts,
        quit_timeline: responses.quitTimeline,
        support_type: responses.support,
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('Error saving onboarding profile:', error);
      return null;
    }
  },

  // Get user profile
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Get user's display name
  async getUserDisplayName(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'User';
      
      // First try to get from user profile
      const profile = await this.getUserProfile();
      if (profile?.first_name) {
        return profile.first_name;
      }
      
      // Then try user metadata (from OAuth providers like Google)
      if (user.user_metadata?.full_name) {
        const fullName = user.user_metadata.full_name;
        return fullName.split(' ')[0]; // Get first name
      }
      
      // Fallback to email prefix
      if (user.email) {
        return user.email.split('@')[0];
      }
      
      return 'User';
    } catch (error) {
      console.error('Error getting user display name:', error);
      return 'User';
    }
  },

  // Update profile
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }
};
