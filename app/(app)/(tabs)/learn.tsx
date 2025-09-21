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
                {/* Background circle */}
                <View style={styles.ringBackground} />
                
                {/* Progress circle with glow - only show if there's progress */}
                {percentage > 0 && (
                  <>
                    <Animated.View
                      style={[
                        styles.ringProgress,
                        {
                          transform: [{
                            rotate: animatedValue.interpolate({
                              inputRange: [0, 100],
                              outputRange: ['-90deg', '270deg'], // Full circle progress (360deg - 90deg start)
                            })
                          }]
                        }
                      ]}
                    />
                    
                    {/* Progress glow effect */}
                    <Animated.View
                      style={[
                        styles.ringProgressGlow,
                        {
                          transform: [{
                            rotate: animatedValue.interpolate({
                              inputRange: [0, 100],
                              outputRange: ['-90deg', '270deg'], // Match the progress circle
                            })
                          }]
                        }
                      ]}
                    />
                    
                    {/* Green progress indicator dot */}
                    <Animated.View
                      style={[
                        styles.progressDot,
                        {
                          transform: [
                            {
                              rotate: animatedValue.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['-90deg', '270deg'], // Match progress exactly
                              })
                            },
                            { translateY: -112 } // Position on ring edge (120px radius - 8px dot radius)
                          ]
                        }
                      ]}
                    />
                  </>
                )}
                
                {/* Center content */}
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
          <View style={styles.premiumCard}>
            <View style={styles.premiumCardGlow} />
            <View style={styles.premiumCardContent}>
              <Text style={styles.goalText}>You're on track to quit by:</Text>
              <Text style={styles.goalDate}>Dec 19, 2025</Text>
            </View>
          </View>

          {/* Level Progress */}
          <View style={styles.premiumCard}>
            <View style={styles.premiumCardGlow} />
            <View style={styles.premiumCardContent}>
              <View style={styles.levelHeader}>
                <View style={styles.levelBadge}>
                  <View style={styles.levelBadgeGlow} />
                  <Text style={styles.levelIcon}>🥉</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelTitle}>Level {level}</Text>
                  <Text style={styles.levelProgress}>{Math.round(((daysSinceQuit % 30) / 30) * 100)}%</Text>
                </View>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground} />
                <View style={[styles.progressBar, { width: `${((daysSinceQuit % 30) / 30) * 100}%` }]} />
                <View style={[styles.progressBarGlow, { width: `${((daysSinceQuit % 30) / 30) * 100}%` }]} />
              </View>
              
              <Text style={styles.levelDescription}>
                You don't have urges anymore, mind is clear and physical form is almost at it's peak.
              </Text>
            </View>
          </View>

          {/* Bottom Stats Cards */}
          <View style={styles.bottomCards}>
            <View style={styles.premiumStatCard}>
              <View style={styles.premiumCardGlow} />
              <View style={styles.premiumCardContent}>
                <Text style={styles.statValue}>0d</Text>
              </View>
            </View>
            <View style={styles.premiumStatCard}>
              <View style={styles.premiumCardGlow} />
              <View style={styles.premiumCardContent}>
                <Text style={styles.statValue}>0d</Text>
              </View>
            </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 28,
    padding: 6,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 10,
    position: 'relative',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    shadowColor: Theme.colors.purple[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
    fontSize: 15,
  },
  toggleTextActive: {
    color: Theme.colors.purple[500],
    fontWeight: '700',
  },
  
  // Ring Styles
  ringContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
  },
  ring: {
    width: 240,
    height: 240,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringBackground: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 16,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ringProgress: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 16,
    borderColor: 'transparent',
    borderLeftColor: Theme.colors.purple[500],
  },
  ringProgressGlow: {
    position: 'absolute',
    width: 248,
    height: 248,
    borderRadius: 124,
    borderWidth: 20,
    borderColor: 'transparent',
    borderLeftColor: 'rgba(144, 213, 255, 0.3)',
  },
  progressDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ADE80', // Green dot like QUITTR
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  ringCenter: {
    alignItems: 'center',
    zIndex: 10,
  },
  recoveryTitle: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 8,
    fontSize: 12,
  },
  recoveryPercentage: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    fontWeight: '800',
    fontSize: 56,
    lineHeight: 60,
    textShadowColor: 'rgba(144, 213, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  recoveryStreak: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 8,
    fontSize: 11,
  },
  
  // Premium Card Styles
  premiumCard: {
    position: 'relative',
    marginBottom: Theme.spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  premiumCardContent: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  goalText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
    fontSize: 16,
  },
  goalDate: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    fontWeight: '800',
    fontSize: 24,
    textShadowColor: 'rgba(144, 213, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  // Level Card Styles
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#CD7F32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.lg,
    position: 'relative',
    shadowColor: '#CD7F32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  levelBadgeGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    backgroundColor: 'rgba(205, 127, 50, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(205, 127, 50, 0.3)',
  },
  levelIcon: {
    fontSize: 28,
    zIndex: 2,
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
    fontWeight: '700',
    fontSize: 20,
  },
  levelProgress: {
    ...Theme.typography.headline,
    color: Theme.colors.text.secondary,
    fontWeight: '700',
    fontSize: 20,
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 6,
    position: 'relative',
    zIndex: 2,
  },
  progressBarGlow: {
    position: 'absolute',
    top: -1,
    left: 0,
    height: 14,
    backgroundColor: 'rgba(144, 213, 255, 0.3)',
    borderRadius: 7,
    zIndex: 1,
  },
  levelDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
    fontSize: 15,
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
    marginTop: Theme.spacing.md,
  },
  premiumStatCard: {
    flex: 1,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  statValue: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    fontWeight: '800',
    fontSize: 22,
    textShadowColor: 'rgba(144, 213, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
