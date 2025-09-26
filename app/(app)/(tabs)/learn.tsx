import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Card } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';
import { BarChart3, PieChart } from 'lucide-react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
// Reverted - no complex radar chart

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
    
    // Recovery percentage calculation - Based on realistic addiction recovery science
    let percentage = 0;
    if (daysSinceQuit >= 1) percentage = 2;   // Day 1: Nicotine withdrawal begins
    if (daysSinceQuit >= 3) percentage = 5;   // Day 3: Nicotine fully out of system
    if (daysSinceQuit >= 7) percentage = 8;   // Week 1: Initial brain healing
    if (daysSinceQuit >= 14) percentage = 12; // Week 2: Circulation improves
    if (daysSinceQuit >= 30) percentage = 18; // Month 1: Lung function improving
    if (daysSinceQuit >= 60) percentage = 25; // Month 2: Cravings reducing
    if (daysSinceQuit >= 90) percentage = 35; // Month 3: Major brain healing
    if (daysSinceQuit >= 180) percentage = 60; // Month 6: Significant lifestyle changes
    if (daysSinceQuit >= 365) percentage = 100; // Year 1: Full recovery milestone
    
    const level = Math.floor(daysSinceQuit / 30);
    
    return { percentage, daysSinceQuit, level };
  };

  const { percentage, daysSinceQuit, level } = calculateRecoveryMetrics();

  // Simple radar data for card-based view
  const radarData = [
    {
      label: 'Physical',
      value: Math.min(100, Math.max(0, percentage + 10)),
    },
    {
      label: 'Mental',
      value: Math.min(100, Math.max(0, percentage - 5)),
    },
    {
      label: 'Intellect',
      value: Math.min(100, Math.max(0, percentage + 5)),
    },
    {
      label: 'Discipline',
      value: Math.min(100, Math.max(0, percentage + 15)),
    },
    {
      label: 'Relationship',
      value: Math.min(100, Math.max(0, percentage - 10)),
    },
    {
      label: 'Ambition',
      value: Math.min(100, Math.max(0, percentage + 20)),
    },
  ];


  // Recovery benefits data - vape-specific and original to QuitHero
  const recoveryBenefits = [
    {
      id: 'lung_capacity',
      icon: '🫁',
      title: 'Lung Capacity Restored',
      description: 'Breathing becomes easier, lung function improves',
      unlockDay: 3,
      category: 'Physical'
    },
    {
      id: 'throat_recovery',
      icon: '🗣️',
      title: 'Throat & Voice Recovery',
      description: 'No more sore throat, voice clarity returns',
      unlockDay: 7,
      category: 'Physical'
    },
    {
      id: 'taste_smell',
      icon: '👃',
      title: 'Taste & Smell Return',
      description: 'Food tastes better, scents become vivid again',
      unlockDay: 14,
      category: 'Physical'
    },
    {
      id: 'mental_clarity',
      icon: '🧠',
      title: 'Mental Clarity',
      description: 'Brain fog lifts, focus and memory improve',
      unlockDay: 21,
      category: 'Mental'
    },
    {
      id: 'reduced_anxiety',
      icon: '😌',
      title: 'Reduced Anxiety',
      description: 'Less nicotine-induced anxiety and mood swings',
      unlockDay: 30,
      category: 'Mental'
    },
    {
      id: 'financial_freedom',
      icon: '💰',
      title: 'Financial Freedom',
      description: 'Money saved from not buying vapes and pods',
      unlockDay: 45,
      category: 'Lifestyle'
    },
    {
      id: 'social_confidence',
      icon: '👥',
      title: 'Social Confidence',
      description: 'No more hiding vaping, fresh breath confidence',
      unlockDay: 60,
      category: 'Social'
    },
    {
      id: 'better_sleep',
      icon: '😴',
      title: 'Better Sleep Quality',
      description: 'Deeper, more restful sleep without nicotine',
      unlockDay: 90,
      category: 'Physical'
    }
  ];

  const renderRecoveryBenefits = () => {
    return recoveryBenefits.map((benefit) => {
      const isUnlocked = daysSinceQuit >= benefit.unlockDay;
      const progress = isUnlocked ? 100 : Math.min(95, (daysSinceQuit / benefit.unlockDay) * 100);
      
      return (
        <View key={benefit.id} style={styles.benefitCard}>
          <View style={styles.benefitCardGlow} />
          <View style={styles.benefitHeader}>
            <View style={[styles.benefitIcon, isUnlocked && styles.benefitIconUnlocked]}>
              {isUnlocked && <View style={styles.benefitIconGlow} />}
              <Text style={styles.benefitEmoji}>{benefit.icon}</Text>
          </View>
            <View style={styles.benefitInfo}>
              <Text style={[styles.benefitTitle, isUnlocked && styles.benefitTitleUnlocked]}>
                {benefit.title}
          </Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
        </View>
            <View style={styles.benefitStatus}>
              <Text style={[styles.benefitProgress, isUnlocked && styles.benefitProgressUnlocked]}>
                {Math.round(progress)}%
                </Text>
              </View>
            </View>
          <View style={styles.benefitProgressContainer}>
            <View style={styles.progressBarBackground} />
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progress}%` },
                isUnlocked && styles.progressBarFillUnlocked
              ]} 
            />
            {isUnlocked && <View style={[styles.progressBarGlow, { width: `${progress}%` }]} />}
        </View>
        </View>
      );
    });
  };


  return (
    <View style={styles.container}>
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
              <AnimatedCircularProgress
                size={240}
                width={16}
                fill={percentage}
                tintColor={Theme.colors.purple[500]}
                backgroundColor="rgba(255, 255, 255, 0.08)"
                rotation={0}
                lineCap="round"
                duration={1000}
              >
                {() => (
                  <View style={styles.ringCenter}>
                    <Text style={styles.recoveryTitle}>RECOVERY</Text>
                    <Text style={styles.recoveryPercentage}>{percentage}%</Text>
                    <Text style={styles.recoveryStreak}>{daysSinceQuit} D STREAK</Text>
        </View>
      )}
              </AnimatedCircularProgress>
    </View>
          )}

          {/* Radar View - Simple Card-Based Approach */}
          {viewMode === 'radar' && (
            <View style={styles.radarContainer}>
              {/* Overall Progress Circle */}
              <View style={styles.radarOverallCard}>
                <Text style={styles.radarOverallTitle}>Overall Recovery</Text>
                <View style={styles.percentageContainer}>
                  <Text style={styles.radarOverallPercentage}>{percentage}%</Text>
                </View>
                <Text style={styles.radarOverallSubtitle}>{daysSinceQuit} Day Streak</Text>
              </View>
              
              {/* Category Grid */}
              <View style={styles.radarGrid}>
                {radarData.map((item, index) => (
                  <View key={index} style={styles.radarCategoryCard}>
                    <Text style={styles.radarCategoryLabel}>{item.label}</Text>
                    <Text style={styles.radarCategoryValue}>{item.value}%</Text>
                    <View style={styles.radarProgressBar}>
                      <View 
                        style={[
                          styles.radarProgressFill, 
                          { width: `${item.value}%` }
                        ]} 
                      />
        </View>
                  </View>
                ))}
      </View>
        </View>
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

          {/* Premium Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{daysSinceQuit}d</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
              </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{daysSinceQuit}d</Text>
              <Text style={styles.statLabel}>Highest Streak</Text>
            </View>
          </View>

          {/* Premium Daily Activities */}
          <View style={styles.activitiesCard}>
            <Text style={styles.activitiesCount}>0/6</Text>
            <Text style={styles.activitiesLabel}>Daily activities completed</Text>
              </View>

          {/* Recovery Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Your Recovery Journey</Text>
            <Text style={styles.benefitsSubtitle}>Track your vape-free transformation</Text>
            
            {renderRecoveryBenefits()}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B1A', // Deep space background like dashboard
  },
  content: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 120,
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
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  statCardContent: {
    padding: 20, // Compact padding for streak cards
    alignItems: 'center',
    justifyContent: 'center',
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
  
  // Level Card Styles - Compact
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CD7F32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelIcon: {
    fontSize: 20,
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
    fontSize: 16,
  },
  levelProgress: {
    ...Theme.typography.headline,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 8,
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
    lineHeight: 16,
    fontSize: 12,
    marginTop: 4,
  },
  
  // Radar View Styles - Simple Card-Based Approach
  radarContainer: {
    marginBottom: Theme.spacing.xl,
    paddingVertical: 10,
  },
  radarOverallCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 32,
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'visible',
  },
  radarOverallTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 20,
  },
  percentageContainer: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 10,
  },
  radarOverallPercentage: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.purple[500],
    fontWeight: '900',
    fontSize: 48,
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    zIndex: 10,
    position: 'relative',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  radarOverallSubtitle: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  radarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  radarCategoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  radarCategoryLabel: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 8,
  },
  radarCategoryValue: {
    ...Theme.typography.title3,
    color: Theme.colors.purple[500],
    fontWeight: '800',
    fontSize: 24,
    marginBottom: 8,
  },
  radarProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  radarProgressFill: {
    height: '100%',
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 3,
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
    fontWeight: '900',
    fontSize: 28,
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  
  // Premium Analytics Styles - Glass Morphism
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Match top cards exactly
    borderRadius: 20, // Match top cards border radius
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  statLabel: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
    fontSize: 12,
  },
  activitiesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Match top cards exactly
    borderRadius: 20, // Match top cards border radius
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  activitiesCount: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    fontWeight: '900',
    fontSize: 40,
    textAlign: 'center',
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  activitiesLabel: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
    fontSize: 14,
  },
  benefitsSection: {
    marginBottom: 20,
  },
  benefitsTitle: {
    ...Theme.typography.title1,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
    fontSize: 20,
  },
  benefitsSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    marginBottom: 16,
    fontSize: 14,
  },
  benefitCard: {
    backgroundColor: '#0F0F0F', // Deep premium background
    borderRadius: 24,
    padding: 24,
    borderWidth: 0.5,
    borderColor: '#333333',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  benefitIconUnlocked: {
    backgroundColor: 'rgba(144, 213, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(144, 213, 255, 0.4)',
    shadowColor: Theme.colors.purple[500],
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  benefitEmoji: {
    fontSize: 20,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 16,
  },
  benefitTitleUnlocked: {
    color: Theme.colors.text.primary,
    textShadowColor: 'rgba(144, 213, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  benefitDescription: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
    fontSize: 13,
    opacity: 0.9,
  },
  benefitStatus: {
    alignItems: 'flex-end',
  },
  benefitProgress: {
    ...Theme.typography.headline,
    color: Theme.colors.text.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  benefitProgressUnlocked: {
    color: Theme.colors.purple[500],
  },
  benefitProgressContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
  },
  
  // Premium Glow Effects
  statCardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    backgroundColor: 'rgba(144, 213, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.1)',
    zIndex: -1,
  },
  activitiesCardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    backgroundColor: 'rgba(144, 213, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.1)',
    zIndex: -1,
  },
  benefitCardGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: -1,
  },
  benefitIconGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    zIndex: -1,
  },
  progressBarGlow: {
    position: 'absolute',
    top: -1,
    left: 0,
    height: 10,
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    borderRadius: 5,
    zIndex: 1,
  },
});
