import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { Theme } from '../src/design-system/theme';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize RevenueCat only on native platforms
    // TODO: Add real RevenueCat API keys when ready for production
    // if (Platform.OS === 'ios' || Platform.OS === 'android') {
    //   Purchases.configure({
    //     apiKey: Platform.OS === 'ios' 
    //       ? 'your-ios-api-key' 
    //       : 'your-android-api-key',
    //   });
    // }
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.dark.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(paywall)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}