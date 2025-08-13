import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, ProgressBar } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { calculateQuitStats, formatDuration, formatCurrency } from '@/src/utils/calculations';
import { socialCompetition } from '@/src/services/socialCompetition';
import { financialIncentives } from '@/src/services/financialIncentives';
import { useState } from 'react';
import { socialCompetition } from '@/src/services/socialCompetition';
import { financialIncentives } from '@/src/services/financialIncentives';
import { useState } from 'react';

export default function DashboardScreen() {
  const { quitData } = useQuitStore();
  const [stats, setStats] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [roiAnalysis, setROIAnalysis] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [roiAnalysis, setROIAnalysis] = useState<any>(null);

  useEffect(() => {
    if (quitData.quitDate && quitData.cigarettesPerDay && quitData.costPerPack) {
      const quitStats = calculateQuitStats(
        quitData.quitDate,
        quitData.cigarettesPerDay,
        quitData.costPerPack
      );
      setStats(quitStats);
    }
    
    loadAdditionalData();
    
    loadAdditionalData();
  }, [quitData]);

  const loadAdditionalData = async () => {
    try {
      // Load user's leaderboard rank
      const rank = await socialCompetition.getUserRank('streak');
      setUserRank(rank);
      
      // Load ROI analysis
  const loadAdditionalData = async () => {
    try {
      // Load user's leaderboard rank
      const rank = await socialCompetition.getUserRank('streak');
      setUserRank(rank);
      
      // Load ROI analysis
      const roi = await financialIncentives.calculateROI();
      setROIAnalysis(roi);
      
      // Update leaderboard with current streak
      if (stats?.daysSinceQuit) {
        await socialCompetition.updateLeaderboard('streak', stats.daysSinceQuit);
      }
    } catch (error) {
      console.error('Error loading additional data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.title}>Your Quit Journey</Text>
          </View>

          {/* Main Stats */}
          {stats ? (
            <>
              <View style={styles.mainStats}>
                <Card style={styles.primaryCard}>
                  <Text style={styles.primaryStat}>
                    {formatDuration(stats.daysSinceQuit)}
                  </Text>
                  <Text style={styles.primaryLabel}>Smoke-Free</Text>
                  <Badge variant="success" style={styles.streakBadge}>
                    🔥 {stats.daysSinceQuit} day streak
                  </Badge>
                </Card>

                <View style={styles.secondaryStats}>
                  <Card style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {formatCurrency(stats.moneySaved)}
                    </Text>
                    <Text style={styles.statLabel}>Saved</Text>
                  </Card>
                  
                  <Card style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {stats.cigarettesNotSmoked}
                    </Text>
                    <Text style={styles.statLabel}>Not Smoked</Text>
                  </Card>
                </View>
              </View>

              {/* Health Progress */}
              <Card style={styles.healthCard}>
                <Text style={styles.sectionTitle}>Health Recovery</Text>
                <View style={styles.healthMilestones}>
                  {stats.healthMilestones.slice(0, 3).map((milestone: any) => (
                    <View key={milestone.id} style={styles.milestone}>
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
            </>
          ) : (
            /* Placeholder for no quit data */
            <Card style={styles.setupCard}>
              <Text style={styles.setupTitle}>Complete Your Setup</Text>
              <Text style={styles.setupDescription}>
                Finish your personalized assessment to see your progress and savings
              </Text>
            </Card>
          )}

          {/* Leaderboard Rank */}
          {userRank && (
            <Card style={styles.rankCard}>
              <Text style={styles.rankTitle}>🏆 Your Rank</Text>
              <Text style={styles.rankPosition}>#{userRank.rank}</Text>
              <Text style={styles.rankDescription}>
                out of all users with {stats?.daysSinceQuit || 0} day streaks
              </Text>
            </Card>
          )}

          {/* ROI Analysis */}
          {roiAnalysis && roiAnalysis.totalSaved > 0 && (
            <Card style={styles.roiCard}>
              <Text style={styles.roiTitle}>💰 Return on Investment</Text>
              <Text style={styles.roiValue}>{roiAnalysis.roi.toFixed(0)}%</Text>
              <Text style={styles.roiDescription}>
                You've saved {formatCurrency(roiAnalysis.netSavings)} more than the app costs
              </Text>
            </Card>
          )}

          {/* Quick Actions */}
          <Card style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Tools</Text>
            <View style={styles.toolsGrid}>
              <View style={styles.toolCard}>
                <Text style={styles.toolIcon}>🚨</Text>
                <Text style={styles.toolName}>Panic Mode</Text>
              </View>
              <View style={styles.toolCard}>
                <Text style={styles.toolIcon}>⏱️</Text>
                <Text style={styles.toolName}>Urge Timer</Text>
              </View>
              <View style={styles.toolCard}>
                <Text style={styles.toolIcon}>🫁</Text>
                <Text style={styles.toolName}>Breathwork</Text>
              </View>
              <View style={styles.toolCard}>
                <Text style={styles.toolIcon}>🤝</Text>
                <Text style={styles.toolName}>Pledge</Text>
              </View>
            </View>
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
  greeting: {
    ...Theme.typography.headline,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
  },
  mainStats: {
    marginBottom: Theme.spacing.xl,
  },
  primaryCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  primaryStat: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
  primaryLabel: {
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
  },
  statLabel: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
  },
  healthCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  healthMilestones: {
    gap: Theme.spacing.md,
  },
  milestone: {
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
  },
  setupCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  setupTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  setupDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  quickActions: {
    padding: Theme.spacing.lg,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  toolCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Theme.colors.dark.surfaceElevated,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  toolName: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  rankCard: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  rankTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  rankPosition: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
  rankDescription: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  roiCard: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.success.background,
    borderColor: Theme.colors.success.border,
  },
  roiTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  roiValue: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.success.text,
    marginBottom: Theme.spacing.xs,
  },
  roiDescription: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
});