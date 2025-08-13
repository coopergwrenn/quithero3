import { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { useAuthStore } from '@/src/stores/authStore';
import { analytics } from '@/src/services/analytics';
import { notifications } from '@/src/services/notifications';

export default function AppLayout() {
  const [appDataLoaded, setAppDataLoaded] = useState(false);
  const { loadFromStorage, isOnboardingComplete } = useQuitStore();
  const { loadFromStorage: loadToolData } = useToolStore();
  const { initialize, loading: authLoading } = useAuthStore();

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
  if (!appDataLoaded || authLoading) {
    return null; // or a loading component
  }

  // Redirect to onboarding if not completed
  if (!isOnboardingComplete) {
    return <Redirect href="/(onboarding)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}