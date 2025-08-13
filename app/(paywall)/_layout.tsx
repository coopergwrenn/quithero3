import { Stack } from 'expo-router';
import { Theme } from '@/src/design-system/theme';

export default function PaywallLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Theme.colors.dark.background },
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="paywall" />
    </Stack>
  );
}