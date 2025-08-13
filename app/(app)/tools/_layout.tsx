import { Stack } from 'expo-router';
import { Theme } from '@/src/design-system/theme';

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Theme.colors.dark.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="panic" />
      <Stack.Screen name="urge-timer" />
      <Stack.Screen name="breathwork" />
      <Stack.Screen name="pledge" />
    </Stack>
  );
}