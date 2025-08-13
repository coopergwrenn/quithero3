import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { useAuthStore } from '@/src/stores/authStore';
import { calculateQuitStats, formatDuration, formatCurrency } from '@/src/utils/calculations';
import { socialCompetition } from '@/src/services/socialCompetition';
import { financialIncentives } from '@/src/services/financialIncentives';
import { useState } from 'react';
import { socialCompetition } from '@/src/services/socialCompetition';
import { financialIncentives } from '@/src/services/financialIncentives';
import { useState } from 'react';
import { socialCompetition } from '@/src/services/socialCompetition';
import { financialIncentives } from '@/src/services/financialIncentives';
import { useState } from 'react';
import { socialCompetition } from '@/src/services/socialCompetition';
import { financialIncentives } from '@/src/services/financialIncentives';
import { useState } from 'react';
import { socialCompetition } from '@/src/services/socialCompetition';
import { financialIncentives } from '@/src/services/financialIncentives';
import { useState } from 'react';
import { analytics } from '@/src/services/analytics';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { quitData } = useQuitStore();
  const [userRank, setUserRank] = useState<any>(null);
  const [roiAnalysis, setROIAnalysis] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [roiAnalysis, setROIAnalysis] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [roiAnalysis, setROIAnalysis] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [roiAnalysis, setROIAnalysis] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [roiAnalysis, setROIAnalysis] = useState<any>(null);
  const { getToolStats } = useToolStore();
  const { user } = useAuthStore();
  
  const [quitStats, setQuitStats] = useState<any>(null);
  const [toolStats, setToolStats] = useState<any>({});

  useEffect(() => {
    loadDashboardData();
    trackDashboardView();
    
    loadAdditionalData();
    
    loadAdditionalData();
    
    loadAdditionalData();
    
    loadAdditionalData();
    
    loadAdditionalData();
  }, [quitData]);

  const loadAdditionalData = async () => {
    try {
      // Load user's leaderboard rank
      const rank = await socialCompetition.getUserRank('streak');
      setUserRank(rank);
      
      // Load ROI analysis
      const roi = await financialIncentives.getROIAnalysis();
      setROIAnalysis(roi);
    } catch (error) {
      console.error('Failed to load additional data:', error);
    }
  };
  
  const loadAdditionalData = async () => {
    try {
      // Load user's leaderboard rank
      const rank = await socialCompetition.getUserRank('streak');
      setUserRank(rank);
      
      // Load ROI analysis
      const roi = await financialIncentives.getROIAnalysis();
      setROIAnalysis(roi);
    } catch (error) {
      console.error('Failed to load additional data:', error);
    }
  };
  
  const loadAdditionalData = async () => {
    try {
      // Load user's leaderboard rank
      const rank = await socialCompetition.getUserRank('streak');
      setUserRank(rank);
      
      // Load ROI analysis
      const roi = await financialIncentives.getROIAnalysis();
      setROIAnalysis(roi);
    } catch (error) {
      console.error('Failed to load additional data:', error);
    }
  };
  
  const loadAdditionalData = async () => {
    try {
      // Load user's leaderboard rank
      const rank = await socialCompetition.getUserRank('streak');
      setUserRank(rank);
      
      // Load ROI analysis
      const roi = await financialIncentives.getROIAnalysis();
      setROIAnalysis(roi);
    } catch (error) {
      console.error('Failed to load additional data:', error);
    }
  };
  
  const loadAdditionalData = async () => {
    try {
      // Load user's leaderboard rank
      const rank = await socialCompetition.getUserRank('streak');
      setUserRank(rank);
      
      // Load ROI analysis
      const roi = await financialIncentives.getROIAnalysis();
      setROIAnalysis(roi);
    } catch (error) {
      console.error('Failed to load additional data:', error);
    }
  };
  
  const loadDashboardData = () => {
    // Calculate quit statistics if we have the necessary data
    if (quitData.quitDate && quitData.usageAmount && quitData.substanceType) {
      const dailyCost = calculateDailyCost();
      const stats = calculateQuitStats(
        quitData.quitDate,
        quitData.usageAmount,
        dailyCost / quitData.usageAmount * 20 // Approximate cost per pack
      );
      setQuitStats(stats);
    }

    // Load tool usage statistics
    const allToolStats = getToolStats('all');
    setToolStats(allToolStats);
  };

  const calculateDailyCost = () => {
    if (!quitData.usageAmount || !quitData.substanceType) return 0;
    
    if (quitData.substanceType === 'cigarettes') {
      // Assume $8 per pack, 20 cigarettes per pack
      return (quitData.usageAmount / 20) * 8;
    } else if (quitData.substanceType === 'vape') {
      // Assume $15 per pod/cartridge
      return quitData.usageAmount * 15;
    }
    return 0;
  };

  const trackDashboardView = () => {
    analytics.track('dashboard_viewed', {
      has_quit_data: !!quitData.quitDate,
      days_since_quit: quitStats?.daysSinceQuit || 0,
      user_type: user ? 'authenticated' : 'anonymous',
    });
  };

  const handleToolPress = (toolRoute: string, toolName: string) => {
    analytics.track('dashboard_tool_clicked', { tool_name: toolName });
    router.push(toolRoute as any);
  };

  const renderMainStats = () => {
    if (!quitStats) {
      return (
        <Card style={styles.setupCard}>
          <Text style={styles.setupIcon}>🎯</Text>
          <Text style={styles.setupTitle}>Complete Your Quit Setup</Text>
          <Text style={styles.setupDescription}>
            Set your quit date and usage details to see your progress and savings
          </Text>
          <Button 
            variant="primary" 
            size="md"
            onPress={() => router.push('/(onboarding)')}
            style={styles.setupButton}
          >
            Complete Setup
          </Button>
        </Card>
      );
    }

    return (
      <View style={styles.statsSection}>
        {/* Primary Stat - Days Smoke Free */}
        <Card style={styles.primaryStatCard}>
          <Text style={styles.primaryStatValue}>
            {formatDuration(quitStats.daysSinceQuit)}
          </Text>
          <Text style={styles.primaryStatLabel}>Smoke-Free</Text>
          {quitStats.daysSinceQuit > 0 && (
            <Badge variant="success" style={styles.streakBadge}>
              🔥 {quitStats.daysSinceQuit} day streak
            </Badge>
          )}
        </Card>

        {/* Secondary Stats */}
        <View style={styles.secondaryStats}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatCurrency(quitStats.moneySaved)}
            </Text>
            <Text style={styles.statLabel}>Money Saved</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {quitStats.cigarettesNotSmoked.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>
              {quitData.substanceType === 'cigarettes' ? 'Cigarettes' : 'Puffs'} Avoided
            </Text>
          </Card>
        </View>
      </View>
    );
  };

  const renderHealthMilestones = () => {
    if (!quitStats?.healthMilestones) return null;

    const visibleMilestones = quitStats.healthMilestones.slice(0, 4);

    return (
      <Card style={styles.healthCard}>
        <Text style={styles.sectionTitle}>🫁 Health Recovery</Text>
        <View style={styles.milestonesContainer}>
          {visibleMilestones.map((milestone: any) => (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={[
                styles.milestoneIndicator,
                milestone.achieved && styles.milestoneAchieved
              ]} />
              <View style={styles.milestoneContent}>
                <Text style={[
                  styles.milestoneTitle,
                  milestone.achieved && styles.milestoneAchievedText
                ]}>
                  {milestone.title}
                </Text>
                <Text style={styles.milestoneDescription}>
                  {milestone.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderQuickTools = () => {
    const tools = [
      {
        id: 'panic',
        name: 'Panic Mode',
        icon: '🚨',
        route: '/(app)/tools/panic',
        color: Theme.colors.error.text,
      },
      {
        id: 'urge-timer',
        name: 'Urge Timer',
        icon: '⏱️',
        route: '/(app)/tools/urge-timer',
        color: Theme.colors.warning.text,
      },
      {
        id: 'breathwork',
        name: 'Breathwork',
        icon: '🫁',
        route: '/(app)/tools/breathwork',
        color: Theme.colors.info.text,
      },
      {
        id: 'pledge',
        name: 'Daily Pledge',
        icon: '🤝',
        route: '/(app)/tools/pledge',
        color: Theme.colors.success.text,
      },
    ];

    return (
      <Card style={styles.toolsCard}>
        <Text style={styles.sectionTitle}>⚡ Quick Tools</Text>
        <View style={styles.toolsGrid}>
          {tools.map((tool) => {
            const stats = toolStats[tool.id] || { totalUses: 0, currentStreak: 0 };
            return (
              <Card 
                key={tool.id}
                style={styles.toolCard}
                onTouchEnd={() => handleToolPress(tool.route, tool.name)}
              >
                <Text style={[styles.toolIcon, { color: tool.color }]}>
                  {tool.icon}
                </Text>
                <Text style={styles.toolName}>{tool.name}</Text>
                {stats.totalUses > 0 && (
                  <Text style={styles.toolUsage}>
                    Used {stats.totalUses}x
                  </Text>
                )}
              </Card>
            );
          })}
        </View>
      </Card>
    );
  };

  const renderMotivationalMessage = () => {
    const messages = [
      "Every smoke-free moment is a victory! 🏆",
      "You're building a healthier future, one day at a time. 💪",
      "Your lungs are thanking you right now. 🫁",
      "Stay strong - you've got this! ⭐",
      "Each craving you overcome makes you stronger. 🔥",
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    return (
      <Card style={styles.motivationCard}>
        <Text style={styles.motivationMessage}>{message}</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {user ? `Welcome back!` : 'Welcome to QuitHero!'}
          </Text>
          <Text style={styles.title}>Your Quit Journey</Text>
        </View>

        {/* Main Stats */}
        {renderMainStats()}

        {/* Health Milestones */}
        {renderHealthMilestones()}

        {/* Quick Tools */}
        {renderQuickTools()}

        {/* Motivational Message */}
        {renderMotivationalMessage()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
  scrollContent: {
    paddingHorizontal: Theme.layout.screenPadding,
  },
  header: {
    paddingTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  greeting: {
    ...Theme.typography.headline,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
  },
  
  // Setup Card Styles
  setupCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  setupIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.lg,
  },
  setupTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  setupDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  setupButton: {
    minWidth: 200,
  },

  // Stats Section Styles
  statsSection: {
    marginBottom: Theme.spacing.xl,
  },
  primaryStatCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  primaryStatValue: {
    ...Theme.typography.largeTitle,
    fontSize: 36,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  primaryStatLabel: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  streakBadge: {
    marginTop: Theme.spacing.sm,
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },

  // Health Milestones Styles
  healthCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  milestonesContainer: {
    gap: Theme.spacing.md,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.dark.border,
    marginRight: Theme.spacing.md,
    marginTop: 6,
  },
  milestoneAchieved: {
    backgroundColor: Theme.colors.success.text,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    ...Theme.typography.callout,
    color: Theme.colors.text.secondary,
    marginBottom: 2,
  },
  milestoneAchievedText: {
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  milestoneDescription: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    lineHeight: 18,
  },

  // Tools Section Styles
  toolsCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  toolCard: {
    flex: 1,
    minWidth: '45%',
    padding: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  toolIcon: {
    fontSize: 28,
    marginBottom: Theme.spacing.xs,
  },
  toolName: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
    fontWeight: '500',
  },
  toolUsage: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },

  // Motivation Card Styles
  motivationCard: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: Theme.colors.purple[500] + '10',
    borderColor: Theme.colors.purple[500] + '30',
    marginBottom: Theme.spacing.xl,
  },
  motivationMessage: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // Spacing
  bottomSpacing: {
    height: Theme.spacing.xl,
  },
});