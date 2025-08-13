import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Button, Badge } from '@/src/design-system/components';
import { useToolStore } from '../../../src/stores/toolStore';
import { analytics } from '../../../src/services/analytics';
import { notifications } from '../../../src/services/notifications';

export default function ToolsScreen() {
  const router = useRouter();
  const { getToolStats } = useToolStore();

  const handleToolPress = (tool: any) => {
    analytics.trackToolOpened(tool.id, 'tools_tab');
    notifications.markToolUsed();
    router.push(tool.route as any);
  };

  const handleEmergencyPress = () => {
    analytics.trackToolOpened('panic', 'emergency_button');
    notifications.markToolUsed();
    router.push('/(app)/tools/panic');
  };

  const tools = [
    {
      id: 'panic',
      title: 'Panic Mode',
      description: '60-second emergency protocol for intense cravings',
      icon: '🚨',
      color: Theme.colors.error.text,
      route: '/(app)/tools/panic',
      category: 'Emergency',
    },
    {
      id: 'urge-timer',
      title: 'Urge Timer',
      description: 'Track cravings - most last only 3-5 minutes',
      icon: '⏱️',
      color: Theme.colors.warning.text,
      route: '/(app)/tools/urge-timer',
      category: 'Tracking',
    },
    {
      id: 'breathwork',
      title: 'Breathwork',
      description: 'Guided breathing exercises to calm your nervous system',
      icon: '🫁',
      color: Theme.colors.info.text,
      route: '/(app)/tools/breathwork',
      category: 'Calming',
    },
    {
      id: 'pledge',
      title: 'Daily Pledge',
      description: 'Commit to staying smoke-free today',
      icon: '🤝',
      color: Theme.colors.success.text,
      route: '/(app)/tools/pledge',
      category: 'Commitment',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Quit Tools</Text>
            <Text style={styles.subtitle}>
              Evidence-based tools for high-friction moments
            </Text>
          </View>

          {/* Emergency Access */}
          <Card style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>🚨 Crisis Mode</Text>
            <Text style={styles.emergencyDescription}>
              Having an intense craving right now?
            </Text>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={handleEmergencyPress}
              style={styles.emergencyButton}
            >
              Start Panic Protocol
            </Button>
          </Card>

          {/* Tools Grid */}
          <View style={styles.toolsGrid}>
            {tools.map((tool) => {
              const stats = getToolStats(tool.id);
              return (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.toolCard}
                  onPress={() => handleToolPress(tool)}
                  activeOpacity={0.8}
                >
                  <Card style={styles.toolCardInner}>
                    <View style={styles.toolHeader}>
                      <Text style={[styles.toolIcon, { color: tool.color }]}>
                        {tool.icon}
                      </Text>
                      <Badge variant="secondary" size="sm">
                        {tool.category}
                      </Badge>
                    </View>
                    
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    <Text style={styles.toolDescription}>{tool.description}</Text>
                    
                    {stats.totalUses > 0 && (
                      <View style={styles.toolStats}>
                        <Text style={styles.toolStatsText}>
                          Used {stats.totalUses} times
                        </Text>
                        {stats.currentStreak > 0 && (
                          <Text style={styles.toolStatsText}>
                            🔥 {stats.currentStreak} day streak
                          </Text>
                        )}
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Stats */}
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Tool Usage</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Object.values(getToolStats('all')).reduce((sum: number, stat: any) => sum + stat.totalUses, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Uses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.max(...Object.values(getToolStats('all')).map((stat: any) => stat.currentStreak))}
                </Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
            </View>
          </Card>

          {/* Support Message */}
          <Card style={styles.supportCard}>
            <Text style={styles.supportTitle}>Remember</Text>
            <Text style={styles.supportMessage}>
              Every craving you overcome makes you stronger. These tools are here whenever you need them - no judgment, just support.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Theme.layout.screenPadding,
    paddingTop: Theme.spacing.xl,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  emergencyCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.error.background,
    borderColor: Theme.colors.error.border,
    alignItems: 'center',
  },
  emergencyTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emergencyDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emergencyButton: {
    backgroundColor: Theme.colors.error.text,
  },
  toolsGrid: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  toolCard: {
    width: '100%',
  },
  toolCardInner: {
    padding: Theme.spacing.lg,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  toolIcon: {
    fontSize: 32,
  },
  toolTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  toolDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.md,
  },
  toolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  toolStatsText: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
  },
  statsCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  statsTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Theme.typography.title2,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
  },
  supportCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  supportTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  supportMessage: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});