import { Tabs } from 'expo-router';
import { 
  LayoutDashboard, 
  Wrench, 
  BookOpen, 
  Users, 
  MessageCircle 
} from 'lucide-react-native';
import { Theme } from '@/src/design-system/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Theme.colors.dark.surface,
          borderTopWidth: 0, // Remove the dark blue border/container
          paddingTop: Theme.spacing.xs,
          paddingBottom: Theme.spacing.sm,
          height: 88,
          borderRadius: 0, // Keep bottom tabs square
        },
        tabBarActiveTintColor: Theme.colors.purple[500],
        tabBarInactiveTintColor: Theme.colors.text.tertiary,
        tabBarLabelStyle: {
          ...Theme.typography.caption1,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size }) => (
            <Wrench color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => (
            <BookOpen color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}