import { Tabs } from 'expo-router';
import { 
  LayoutDashboard, 
  Wrench, 
  BarChart3, 
  Users, 
  MessageCircle 
} from 'lucide-react-native';
import { Theme } from '@/src/design-system/theme';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 12,
          right: 12,
          height: 84,
          borderRadius: 25,
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 28,
          marginBottom: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground} />
        ),
        tabBarActiveTintColor: '#60A5FA',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 1,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Wrench color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={24} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 25,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});