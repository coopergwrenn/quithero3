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
      
      // Create user profile in database
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
        });
      }
      
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
      // Check if user exists in our users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        // Create user profile if it doesn't exist
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
        });
      }

      // Update last active timestamp
      await supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', user.id);
    } catch (error) {
      console.error('User sync error:', error);
    }
  },
}));