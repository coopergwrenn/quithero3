import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getCurrentUser, getUserProfile, createUserProfile, updateUserProfile } from '@/src/lib/supabase';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthStore {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  syncQuitData: (quitData: any) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get or create user profile
        let profile;
        try {
          profile = await getUserProfile(session.user.id);
        } catch (error) {
          // Create profile if it doesn't exist
          profile = await createUserProfile({
            id: session.user.id,
            email: session.user.email,
            created_at: new Date().toISOString(),
          });
        }
        
        set({ 
          user: session.user, 
          profile, 
          session,
          loading: false 
        });
      } else {
        set({ loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          let profile;
          try {
            profile = await getUserProfile(session.user.id);
          } catch (error) {
            profile = await createUserProfile({
              id: session.user.id,
              email: session.user.email,
              created_at: new Date().toISOString(),
            });
          }
          
          set({ 
            user: session.user, 
            profile, 
            session 
          });
        } else if (event === 'SIGNED_OUT') {
          set({ 
            user: null, 
            profile: null, 
            session: null 
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      const profile = await getUserProfile(data.user.id);
      set({ 
        user: data.user, 
        profile, 
        session: data.session 
      });
    }
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      const profile = await createUserProfile({
        id: data.user.id,
        email: data.user.email,
        created_at: new Date().toISOString(),
      });
      
      set({ 
        user: data.user, 
        profile, 
        session: data.session 
      });
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    set({ 
      user: null, 
      profile: null, 
      session: null 
    });
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { user, profile } = get();
    if (!user || !profile) throw new Error('No authenticated user');
    
    const updatedProfile = await updateUserProfile(user.id, {
      ...updates,
      last_active: new Date().toISOString(),
    });
    
    set({ profile: updatedProfile });
  },

  syncQuitData: async (quitData: any) => {
    const { user } = get();
    if (!user) return;
    
    const profileUpdates = {
      quit_date: quitData.quitDate?.toISOString().split('T')[0],
      risk_level: quitData.personalizedPlan?.riskLevel,
      motivation: quitData.primaryMotivation,
      substance_type: quitData.substanceType,
      usage_amount: quitData.usageAmount,
      triggers: quitData.triggers,
      last_active: new Date().toISOString(),
    };
    
    await get().updateProfile(profileUpdates);
  },
}));