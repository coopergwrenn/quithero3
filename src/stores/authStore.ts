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
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  syncUserData: () => Promise<void>;
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      set({ user: data.user, loading: false });
      await get().syncUserData();
      return {};
    } catch (error) {
      set({ loading: false });
      return { error: 'An unexpected error occurred' };
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
}));