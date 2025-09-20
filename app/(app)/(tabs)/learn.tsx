import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Card } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';
import { BarChart3, PieChart } from 'lucide-react-native';

export default function AnalyticsScreen() {
  const [viewMode, setViewMode] = useState<'ring' | 'radar'>('ring');
  const { quitData } = useQuitStore();

  useEffect(() => {
    analytics.track('analytics_tab_opened');
  }, []);

  // Calculate recovery metrics
  const calculateRecoveryMetrics = () => {
    const quitDate = quitData?.quitDate;
    if (!quitDate) return { percentage: 0, daysSinceQuit: 0, level: 0 };
    
    const now = new Date();
    const quitTime = new Date(quitDate).getTime();
    const daysSinceQuit = Math.floor((now.getTime() - quitTime) / (1000 * 60 * 60 * 24));
    
    // Recovery percentage calculation
    let percentage = 0;
    if (daysSinceQuit >= 1) percentage = Math.min(10, percentage + 10);
    if (daysSinceQuit >= 3) percentage = Math.min(25, percentage + 15);
    if (daysSinceQuit >= 7) percentage = Math.min(40, percentage + 15);
    if (daysSinceQuit >= 30) percentage = Math.min(60, percentage + 20);
    if (daysSinceQuit >= 90) percentage = Math.min(80, percentage + 20);
    if (daysSinceQuit >= 365) percentage = 100;
    
    const level = Math.floor(daysSinceQuit / 30);
    
    return { percentage, daysSinceQuit, level };
  };

  const { percentage, daysSinceQuit, level } = calculateRecoveryMetrics();

  // Animated ring progress
  const animatedValue = new Animated.Value(0);
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>
              Track your recovery progress and celebrate milestones
            </Text>
          </View>

          {/* View Mode Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'ring' && styles.toggleButtonActive]}
              onPress={() => setViewMode('ring')}
            >
              <PieChart size={16} color={viewMode === 'ring' ? '#FFFFFF' : Theme.colors.text.secondary} />
              <Text style={[styles.toggleText, viewMode === 'ring' && styles.toggleTextActive]}>Ring</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'radar' && styles.toggleButtonActive]}
              onPress={() => setViewMode('radar')}
            >
              <BarChart3 size={16} color={viewMode === 'radar' ? '#FFFFFF' : Theme.colors.text.secondary} />
              <Text style={[styles.toggleText, viewMode === 'radar' && styles.toggleTextActive]}>Radar</Text>
            </TouchableOpacity>
          </View>

          {/* Recovery Ring */}
          {viewMode === 'ring' && (
            <View style={styles.ringContainer}>
              <View style={styles.ring}>
                <View style={styles.ringBackground} />
                <Animated.View
                  style={[
                    styles.ringProgress,
                    {
                      transform: [{
                        rotate: animatedValue.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['-90deg', '270deg'],
                        })
                      }]
                    }
                  ]}
                />
                <View style={styles.ringCenter}>
                  <Text style={styles.recoveryTitle}>RECOVERY</Text>
                  <Text style={styles.recoveryPercentage}>{percentage}%</Text>
                  <Text style={styles.recoveryStreak}>{daysSinceQuit} D STREAK</Text>
                </View>
              </View>
            </View>
          )}

          {/* Radar View Placeholder */}
          {viewMode === 'radar' && (
            <Card style={styles.radarCard}>
              <Text style={styles.radarTitle}>📊 Radar View</Text>
              <Text style={styles.radarSubtitle}>Coming Soon</Text>
              <Text style={styles.radarDescription}>
                Advanced analytics and detailed progress tracking will be available in this view.
              </Text>
            </Card>
          )}

          {/* Quit Goal Card */}
          <Card style={styles.goalCard}>
            <Text style={styles.goalText}>You're on track to quit by:</Text>
            <Text style={styles.goalDate}>Dec 19, 2025</Text>
          </Card>

          {/* Level Progress */}
          <Card style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelIcon}>🥉</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level {level}</Text>
                <Text style={styles.levelProgress}>{Math.round(((daysSinceQuit % 30) / 30) * 100)}%</Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${((daysSinceQuit % 30) / 30) * 100}%` }]} />
            </View>
            
            <Text style={styles.levelDescription}>
              You don't have urges anymore, mind is clear and physical form is almost at it's peak.
            </Text>
          </Card>

          {/* Bottom Stats Cards */}
          <View style={styles.bottomCards}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>0d</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>0d</Text>
            </Card>
          </View>
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
  content: {
    padding: Theme.spacing.lg,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  
  // Toggle Styles
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 25,
    padding: 4,
    marginBottom: Theme.spacing.xl,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 21,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: Theme.colors.purple[500],
  },
  toggleText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  
  // Ring Styles
  ringContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  ring: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: Theme.colors.dark.surface,
  },
  ringProgress: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: Theme.colors.purple[500],
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    alignItems: 'center',
    zIndex: 10,
  },
  recoveryTitle: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  recoveryPercentage: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    fontSize: 48,
    lineHeight: 52,
  },
  recoveryStreak: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 4,
  },
  
  // Goal Card Styles
  goalCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  goalText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  goalDate: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    fontWeight: '700',
  },
  
  // Level Card Styles
  levelCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CD7F32', // Bronze color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  levelIcon: {
    fontSize: 24,
  },
  levelInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  levelProgress: {
    ...Theme.typography.headline,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 4,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 4,
  },
  levelDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },
  
  // Radar View Styles
  radarCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  radarTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: Theme.spacing.sm,
  },
  radarSubtitle: {
    ...Theme.typography.headline,
    color: Theme.colors.purple[500],
    fontWeight: '600',
    marginBottom: Theme.spacing.md,
  },
  radarDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Bottom Cards
  bottomCards: {
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
    fontWeight: '700',
  },
});
