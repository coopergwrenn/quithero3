import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { analytics } from '@/src/services/analytics';

// StarField background component for premium feel
const StarField = () => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.8 + 0.2,
  }));

  return (
    <View style={styles.starField}>
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Immediate crisis strategies
const CRISIS_STRATEGIES = [
  {
    id: 'breathing',
    title: '4-7-8 Breathing',
    description: 'Inhale for 4, hold for 7, exhale for 8',
    icon: '🫁',
    duration: '2 minutes',
    action: 'Start Breathing Exercise'
  },
  {
    id: 'distraction',
    title: 'Immediate Distraction',
    description: 'Call someone, go for a walk, drink water',
    icon: '🚶‍♂️',
    duration: '5-10 minutes',
    action: 'Get Ideas'
  },
  {
    id: 'countdown',
    title: 'Urge Countdown',
    description: 'Cravings peak at 3-5 minutes then fade',
    icon: '⏰',
    duration: '5 minutes',
    action: 'Start Timer'
  },
  {
    id: 'why',
    title: 'Remember Your Why',
    description: 'Recall your reasons for quitting',
    icon: '🎯',
    duration: '1 minute',
    action: 'Review Goals'
  }
];

// Emergency mantras
const EMERGENCY_MANTRAS = [
  "This craving will pass in just a few minutes",
  "I am stronger than this urge",
  "Every craving I resist makes me stronger",
  "I choose my health over cigarettes",
  "This feeling is temporary, my quit is forever",
  "I've survived cravings before, I can do this again"
];

export default function PanicModeScreen() {
  const router = useRouter();
  const { quitData } = useQuitStore();
  const { recordToolUse } = useToolStore();
  
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [currentMantra, setCurrentMantra] = useState(0);
  const [isInSession, setIsInSession] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    analytics.track('panic_mode_opened');
    
    // Cycle through mantras every 5 seconds
    const mantraInterval = setInterval(() => {
      setCurrentMantra((prev) => (prev + 1) % EMERGENCY_MANTRAS.length);
    }, 5000);

    return () => clearInterval(mantraInterval);
  }, []);

  const handleStrategySelect = (strategyId: string) => {
    const strategy = CRISIS_STRATEGIES.find(s => s.id === strategyId);
    if (!strategy) return;

    setSelectedStrategy(strategyId);
    setIsInSession(true);
    setSessionStartTime(new Date());

    analytics.track('panic_strategy_selected', { 
      strategy: strategyId,
      strategy_name: strategy.title 
    });

    // Navigate to specific tools
    switch (strategyId) {
      case 'breathing':
        router.push('/(app)/tools/breathwork');
        break;
      case 'countdown':
        router.push('/(app)/tools/urge-timer');
        break;
      case 'why':
        // Navigate to dashboard to review quit reasons and goals
        router.push('/(app)/(tabs)/dashboard');
        break;
      default:
        // Stay in panic mode for other strategies
        break;
    }
  };

  const handleSessionComplete = () => {
    if (sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      recordToolUse('panic-mode', duration);
      
      analytics.track('panic_session_completed', {
        strategy: selectedStrategy,
        duration_seconds: duration
      });

      Alert.alert(
        'Crisis Survived! 💪',
        'You made it through a tough moment. Every time you resist, you get stronger.',
        [
          { text: 'Continue', style: 'default' },
          { 
            text: 'Talk to Coach', 
            style: 'default',
            onPress: () => router.push('/(app)/(tabs)/coach')
          }
        ]
      );
    }

    setIsInSession(false);
    setSelectedStrategy(null);
    setSessionStartTime(null);
  };

  const handleEmergencyCoach = () => {
    analytics.track('panic_coach_requested');
    router.push('/(app)/(tabs)/coach');
  };

  const handleCommunityHelp = () => {
    analytics.track('panic_community_requested');
    router.push('/(app)/(tabs)/community');
  };

  const renderEmergencyHeader = () => (
    <View style={styles.premiumEmergencyHeader}>
      <View style={styles.premiumTitleContainer}>
        <View style={styles.premiumCrisisIconContainer}>
          <Text style={styles.premiumCrisisIcon}>🚨</Text>
        </View>
        <Text style={styles.premiumEmergencyTitle}>Crisis Mode</Text>
      </View>
      <Text style={styles.premiumEmergencySubtitle}>
        You're having a tough moment. Let's get through this together.
      </Text>
      
      <View style={styles.premiumMantraContainer}>
        <View style={styles.premiumMantraGlow} />
        <View style={styles.premiumMantraCard}>
          <Text style={styles.premiumMantraText}>
            {EMERGENCY_MANTRAS[currentMantra]}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.premiumQuickActionsContainer}>
      <View style={styles.premiumQuickActionsGlow} />
      <View style={styles.premiumQuickActionsCard}>
        <View style={styles.premiumQuickActionsHeader}>
          <View style={styles.premiumHelpIconContainer}>
            <Text style={styles.premiumHelpIcon}>🆘</Text>
          </View>
          <Text style={styles.premiumQuickActionsTitle}>Immediate Help</Text>
        </View>
        
        <View style={styles.premiumQuickActionButtons}>
          <TouchableOpacity 
            style={styles.premiumCoachButton}
            onPress={handleEmergencyCoach}
            activeOpacity={0.8}
          >
            <View style={styles.premiumCoachButtonGlow} />
            <View style={styles.premiumCoachButtonContent}>
              <View style={styles.premiumCoachIconContainer}>
                <Text style={styles.premiumCoachIcon}>🤖</Text>
              </View>
              <Text style={styles.premiumCoachButtonText}>Talk to AI Coach</Text>
              <Text style={styles.premiumCoachButtonSubtext}>Instant crisis support</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.premiumCommunityButton}
            onPress={handleCommunityHelp}
            activeOpacity={0.8}
          >
            <View style={styles.premiumCommunityButtonGlow} />
            <View style={styles.premiumCommunityButtonContent}>
              <View style={styles.premiumCommunityIconContainer}>
                <Text style={styles.premiumCommunityIcon}>💬</Text>
              </View>
              <Text style={styles.premiumCommunityButtonText}>Ask Community</Text>
              <Text style={styles.premiumCommunityButtonSubtext}>Post for peer support</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStrategies = () => (
    <View style={styles.premiumStrategiesContainer}>
      <View style={styles.premiumStrategiesGlow} />
      <View style={styles.premiumStrategiesCard}>
        <View style={styles.premiumStrategiesHeader}>
          <View style={styles.premiumStrategiesIconContainer}>
            <Text style={styles.premiumStrategiesIcon}>💪</Text>
          </View>
          <Text style={styles.premiumStrategiesTitle}>Crisis Strategies</Text>
        </View>
        <Text style={styles.premiumStrategiesSubtitle}>
          Choose what feels right for you right now
        </Text>
        
        <View style={styles.premiumStrategiesList}>
          {CRISIS_STRATEGIES.map((strategy) => (
            <TouchableOpacity
              key={strategy.id}
              style={[
                styles.premiumStrategyCard,
                selectedStrategy === strategy.id && styles.premiumSelectedStrategyCard
              ]}
              onPress={() => handleStrategySelect(strategy.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.premiumStrategyGlow,
                selectedStrategy === strategy.id && styles.premiumSelectedStrategyGlow
              ]} />
              <View style={styles.premiumStrategyContent}>
                <View style={styles.premiumStrategyIconContainer}>
                  <Text style={styles.premiumStrategyIcon}>{strategy.icon}</Text>
                </View>
                <View style={styles.premiumStrategyInfo}>
                  <Text style={styles.premiumStrategyTitle}>{strategy.title}</Text>
                  <Text style={styles.premiumStrategyDescription}>{strategy.description}</Text>
                  <View style={styles.premiumStrategyMeta}>
                    <Text style={styles.premiumStrategyDuration}>⏱️ {strategy.duration}</Text>
                    <View style={styles.premiumStrategyActionContainer}>
                      <Text style={styles.premiumStrategyActionText}>{strategy.action}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderSessionProgress = () => {
    if (!isInSession || !selectedStrategy) return null;

    const strategy = CRISIS_STRATEGIES.find(s => s.id === selectedStrategy);
    if (!strategy) return null;

    return (
      <Card style={styles.sessionCard}>
        <Text style={styles.sessionTitle}>🎯 Active Session</Text>
        <Text style={styles.sessionStrategy}>{strategy.title}</Text>
        <Text style={styles.sessionDescription}>{strategy.description}</Text>
        
        <Button
          onPress={handleSessionComplete}
          style={styles.completeButton}
        >
          I Feel Better Now
        </Button>
      </Card>
    );
  };

  const renderSuccessStats = () => {
    // Mock some encouraging stats
    const stats = {
      crisesHandled: 12,
      successRate: 94,
      avgRecoveryTime: 4.2
    };

    return (
      <View style={styles.premiumStatsContainer}>
        <View style={styles.premiumStatsGlow} />
        <View style={styles.premiumStatsCard}>
          <View style={styles.premiumStatsHeader}>
            <View style={styles.premiumStatsIconContainer}>
              <Text style={styles.premiumStatsIcon}>🏆</Text>
            </View>
            <Text style={styles.premiumStatsTitle}>Your Crisis Stats</Text>
          </View>
          
          <View style={styles.premiumStatsGrid}>
            <View style={styles.premiumStatItem}>
              <View style={styles.premiumStatItemGlow} />
              <View style={styles.premiumStatItemContent}>
                <Text style={styles.premiumStatNumber}>{stats.crisesHandled}</Text>
                <Text style={styles.premiumStatLabel}>Crises Handled</Text>
              </View>
            </View>
            
            <View style={styles.premiumStatItem}>
              <View style={styles.premiumStatItemGlow} />
              <View style={styles.premiumStatItemContent}>
                <Text style={styles.premiumStatNumber}>{stats.successRate}%</Text>
                <Text style={styles.premiumStatLabel}>Success Rate</Text>
              </View>
            </View>
            
            <View style={styles.premiumStatItem}>
              <View style={styles.premiumStatItemGlow} />
              <View style={styles.premiumStatItemContent}>
                <Text style={styles.premiumStatNumber}>{stats.avgRecoveryTime}m</Text>
                <Text style={styles.premiumStatLabel}>Avg Recovery</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.premiumStatsEncouragement}>
            You're getting stronger with every crisis you overcome! 💪
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StarField />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.premiumBackButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.premiumBackButtonText}>← Back</Text>
            </TouchableOpacity>

            {renderEmergencyHeader()}
            {renderQuickActions()}
            {renderSessionProgress()}
            {renderStrategies()}
            {renderSuccessStats()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base Layout
  container: {
    flex: 1,
    backgroundColor: '#0B0B1A',
  },
  starField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(144, 213, 255, 0.4)',
    borderRadius: 1,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  premiumBackButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  premiumBackButtonText: {
    fontSize: 16,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },

  // Premium Emergency Header
  premiumEmergencyHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  premiumTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumCrisisIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#90D5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumCrisisIcon: {
    fontSize: 28,
  },
  premiumEmergencyTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  premiumEmergencySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  premiumMantraContainer: {
    position: 'relative',
    width: '100%',
  },
  premiumMantraGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    borderRadius: 22,
    zIndex: 0,
  },
  premiumMantraCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#90D5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  premiumMantraText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
    fontWeight: '500',
  },

  // Premium Quick Actions
  premiumQuickActionsContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  premiumQuickActionsGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 27,
    zIndex: 0,
  },
  premiumQuickActionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 1,
  },
  premiumQuickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  premiumHelpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumHelpIcon: {
    fontSize: 20,
  },
  premiumQuickActionsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  premiumQuickActionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  premiumCoachButton: {
    flex: 1,
    position: 'relative',
  },
  premiumCoachButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 18,
    zIndex: 0,
  },
  premiumCoachButtonContent: {
    backgroundColor: 'rgba(30, 42, 58, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.4)',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#90D5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  premiumCoachIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  premiumCoachIcon: {
    fontSize: 20,
  },
  premiumCoachButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  premiumCoachButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  premiumCommunityButton: {
    flex: 1,
    position: 'relative',
  },
  premiumCommunityButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 18,
    zIndex: 0,
  },
  premiumCommunityButtonContent: {
    backgroundColor: 'rgba(30, 42, 58, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.4)',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#90D5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  premiumCommunityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  premiumCommunityIcon: {
    fontSize: 20,
  },
  premiumCommunityButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  premiumCommunityButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Premium Strategies
  premiumStrategiesContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  premiumStrategiesGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 22,
    zIndex: 0,
  },
  premiumStrategiesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  premiumStrategiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumStrategiesIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumStrategiesIcon: {
    fontSize: 20,
  },
  premiumStrategiesTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  premiumStrategiesSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  premiumStrategiesList: {
    gap: 16,
  },
  premiumStrategyCard: {
    position: 'relative',
  },
  premiumStrategyGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 17,
    zIndex: 0,
  },
  premiumSelectedStrategyGlow: {
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
  },
  premiumStrategyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    zIndex: 1,
  },
  premiumSelectedStrategyCard: {
    // Selected state handled by glow
  },
  premiumStrategyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  premiumStrategyIcon: {
    fontSize: 24,
  },
  premiumStrategyInfo: {
    flex: 1,
  },
  premiumStrategyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(144, 213, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  premiumStrategyDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    lineHeight: 20,
  },
  premiumStrategyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumStrategyDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  premiumStrategyActionContainer: {
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  premiumStrategyActionText: {
    fontSize: 12,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },

  // Session Progress (keeping original for now)
  sessionCard: {
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
    borderWidth: 1,
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#60A5FA',
    marginBottom: 8,
  },
  sessionStrategy: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sessionDescription: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#22C55E',
    minWidth: 200,
  },

  // Premium Stats Section
  premiumStatsContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  premiumStatsGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 22,
    zIndex: 0,
  },
  premiumStatsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  premiumStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  premiumStatsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumStatsIcon: {
    fontSize: 20,
  },
  premiumStatsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  premiumStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  premiumStatItem: {
    flex: 1,
    position: 'relative',
  },
  premiumStatItemGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    backgroundColor: 'rgba(144, 213, 255, 0.05)',
    borderRadius: 17,
    zIndex: 0,
  },
  premiumStatItemContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    alignItems: 'center',
    zIndex: 1,
  },
  premiumStatNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: Theme.colors.purple[500],
    marginBottom: 6,
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  premiumStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    textAlign: 'center',
  },
  premiumStatsEncouragement: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});