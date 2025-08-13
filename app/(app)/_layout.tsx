import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { useAuthStore } from '@/src/stores/authStore';
import { analytics } from '@/src/services/analytics';
import { notifications } from '@/src/services/notifications';

export default function AppLayout() {
  const { loadFromStorage, isOnboardingComplete } = useQuitStore();
  const { loadFromStorage: loadToolData } = useToolStore();
  const { initialize } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
    loadToolData();
    initialize();
    
    // Initialize services
    initializeServices();
  }, []);

  const initializeServices = async () => {
    // Check notification permissions
    await notifications.checkPermissions();
    
    // Schedule habit formation notifications
    await notifications.scheduleMorningPledge();
    await notifications.scheduleEveningReflection();
    
    // Track app launch
    analytics.track('app_launched');
  };

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