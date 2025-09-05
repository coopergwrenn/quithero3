import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { useAuthStore } from '@/src/stores/authStore';
import { analytics } from '@/src/services/analytics';
import { notifications } from '@/src/services/notifications';
import { supabase } from '@/src/lib/supabase';

export default function AppLayout() {
  const [appDataLoaded, setAppDataLoaded] = useState(false);
  const [hasUserProfile, setHasUserProfile] = useState<boolean | null>(null);
  const { loadFromStorage, isOnboardingComplete } = useQuitStore();
  const { loadFromStorage: loadToolData } = useToolStore();
  const { initialize, loading: authLoading, user } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load synchronous data first
        await loadFromStorage();
        await loadToolData();
        
        // Initialize auth (async)
        await initialize();
        
        // Initialize services
        await initializeServices();
        
        // Mark app as fully loaded
        setAppDataLoaded(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still mark as loaded to prevent infinite loading
        setAppDataLoaded(true);
      }
    };

    initializeApp();
  }, []);

  // Check if authenticated user has a complete profile
  useEffect(() => {
    const checkProfile = async () => {
      if (user?.id) {
        const profileExists = await checkUserProfile(user.id);
        setHasUserProfile(profileExists);
      } else {
        setHasUserProfile(null);
      }
    };

    checkProfile();
  }, [user]);

  const checkUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user profile:', error);
        return false;
      }
      
      return !!data; // Returns true if profile exists, false if not
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  };

  const initializeServices = async () => {
    try {
      // Check notification permissions
      await notifications.checkPermissions();
      
      // Schedule habit formation notifications
      await notifications.scheduleMorningPledge();
      await notifications.scheduleEveningReflection();
      
      // Track app launch
      analytics.track('app_launched');
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  };

  // Show loading state until app is fully initialized
  if (!appDataLoaded || authLoading || (user && hasUserProfile === null)) {
    return null; // or a loading component
  }

  // Routing logic:
  // 1. No user + no local onboarding = go to onboarding
  // 2. User exists but no profile in DB = go to onboarding (complete their profile)
  // 3. User exists with profile = go to dashboard
  // 4. No user but local onboarding complete = go to dashboard (offline mode)
  
  if (!user && !isOnboardingComplete) {
    // Case 1: New user, needs onboarding
    return <Redirect href="/(onboarding)" />;
  }
  
  if (user && hasUserProfile === false) {
    // Case 2: Authenticated but incomplete profile - rare edge case
    console.log('Authenticated user without complete profile, redirecting to onboarding');
    return <Redirect href="/(onboarding)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}