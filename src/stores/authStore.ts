import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithOTP: (email: string) => Promise<{ error?: string }>;
  verifyOTP: (email: string, token: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  syncUserData: () => Promise<void>;
  debugCheckUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user || null, initialized: true });
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ user: session?.user || null });
        
        if (event === 'SIGNED_IN' && session?.user) {
          await get().syncUserData();
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      console.log('🔍 Attempting sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        set({ loading: false });
        return { error: error.message };
      }

      console.log('✅ Sign in successful:', data.user?.email);
      set({ user: data.user, loading: false });
      await get().syncUserData();
      return {};
    } catch (error) {
      console.error('❌ Sign in exception:', error);
      set({ loading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signInWithOTP: async (email: string) => {
    set({ loading: true });
    try {
      console.log('🔍 Sending OTP to:', email);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new user, only sign in existing
        }
      });

      if (error) {
        console.error('❌ OTP send error:', error);
        set({ loading: false });
        return { error: error.message };
      }

      console.log('✅ OTP sent successfully');
      set({ loading: false });
      return {};
    } catch (error) {
      console.error('❌ OTP send exception:', error);
      set({ loading: false });
      return { error: 'Failed to send verification code' };
    }
  },

  verifyOTP: async (email: string, token: string) => {
    set({ loading: true });
    try {
      console.log('🔍 Verifying OTP for:', email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.error('❌ OTP verify error:', error);
        set({ loading: false });
        return { error: error.message };
      }

      console.log('✅ OTP verified successfully:', data.user?.email);
      set({ user: data.user, loading: false });
      await get().syncUserData();
      return {};
    } catch (error) {
      console.error('❌ OTP verify exception:', error);
      set({ loading: false });
      return { error: 'Failed to verify code' };
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      set({ user: data.user, loading: false });
      
      // Note: We don't create user_profiles record here
      // That will be done when they complete onboarding via completeOnboarding()
      console.log('User signed up successfully:', data.user?.email);
      
      return {};
    } catch (error) {
      set({ loading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const redirectTo = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      if (data?.url) {
        // Open the OAuth URL using WebBrowser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        console.log('Google OAuth result:', result);

        if (result.type === 'success') {
          console.log('Google OAuth completed successfully');
          // Auth state change will be handled by the listener in initialize()
          return {};
        } else if (result.type === 'cancel') {
          set({ loading: false });
          return { error: 'Sign-in was cancelled' };
        } else {
          set({ loading: false });
          return { error: 'Sign-in failed' };
        }
      } else {
        set({ loading: false });
        return { error: 'No OAuth URL received' };
      }
    } catch (error) {
      set({ loading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  syncUserData: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Check if user has completed their profile in user_profiles table
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('id, created_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user profile:', error);
      }

      // Note: We don't create a user_profiles record here
      // That's only done when onboarding is completed via completeOnboarding()
      console.log('User sync complete:', { 
        userId: user.id, 
        email: user.email, 
        hasProfile: !!userProfile 
      });
    } catch (error) {
      console.error('User sync error:', error);
    }
  },

  debugCheckUsers: async () => {
    try {
      console.log('🔍 Checking Supabase connection and users...');
      
      // Check if we can connect to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📡 Supabase connection:', { connected: true, currentSession: !!session });
      
      // Try to get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('👤 Current user:', { user: user?.email || 'none', error: userError?.message });
      
      // Check user_profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, created_at')
        .limit(5);
        
      console.log('📊 User profiles in database:', { 
        count: profiles?.length || 0, 
        error: profilesError?.message,
        profiles: profiles?.map(p => ({ userId: p.user_id, created: p.created_at }))
      });
      
    } catch (error) {
      console.error('❌ Debug check failed:', error);
    }
  },
}));