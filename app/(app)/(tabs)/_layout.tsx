import { Tabs } from 'expo-router';
import { 
  LayoutDashboard, 
  Wrench, 
  BarChart3, 
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
          backgroundColor: '#0F0F0F', // Dark background to match the premium card
          borderTopWidth: 0,
          paddingTop: Theme.spacing.xs,
          paddingBottom: Theme.spacing.sm,
          height: 88,
          borderRadius: 0,
        },
        tabBarActiveTintColor: Theme.colors.purple[500],
        tabBarInactiveTintColor: '#888888', // Lighter gray for better contrast on dark background
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
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} strokeWidth={2} />
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