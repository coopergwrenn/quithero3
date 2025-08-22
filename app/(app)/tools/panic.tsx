import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { analytics } from '@/src/services/analytics';

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
    <View style={styles.emergencyHeader}>
      <Text style={styles.emergencyTitle}>🚨 Crisis Mode</Text>
      <Text style={styles.emergencySubtitle}>
        You're having a tough moment. Let's get through this together.
      </Text>
      
      <Card style={styles.mantraCard}>
        <Text style={styles.mantraText}>
          {EMERGENCY_MANTRAS[currentMantra]}
        </Text>
      </Card>
    </View>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Text style={styles.quickActionsTitle}>🆘 Immediate Help</Text>
      <View style={styles.quickActionButtons}>
        <TouchableOpacity 
          style={styles.coachButton}
          onPress={handleEmergencyCoach}
        >
          <Text style={styles.coachButtonIcon}>🤖</Text>
          <Text style={styles.coachButtonText}>Talk to AI Coach</Text>
          <Text style={styles.coachButtonSubtext}>Instant crisis support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.communityButton}
          onPress={handleCommunityHelp}
        >
          <Text style={styles.communityButtonIcon}>💬</Text>
          <Text style={styles.communityButtonText}>Ask Community</Text>
          <Text style={styles.communityButtonSubtext}>Post for peer support</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderStrategies = () => (
    <Card style={styles.strategiesCard}>
      <Text style={styles.strategiesTitle}>💪 Crisis Strategies</Text>
      <Text style={styles.strategiesSubtitle}>
        Choose what feels right for you right now
      </Text>
      
      <View style={styles.strategiesList}>
        {CRISIS_STRATEGIES.map((strategy) => (
          <TouchableOpacity
            key={strategy.id}
            style={[
              styles.strategyCard,
              selectedStrategy === strategy.id && styles.selectedStrategyCard
            ]}
            onPress={() => handleStrategySelect(strategy.id)}
          >
            <Text style={styles.strategyIcon}>{strategy.icon}</Text>
            <View style={styles.strategyContent}>
              <Text style={styles.strategyTitle}>{strategy.title}</Text>
              <Text style={styles.strategyDescription}>{strategy.description}</Text>
              <Text style={styles.strategyDuration}>⏱️ {strategy.duration}</Text>
            </View>
            <View style={styles.strategyAction}>
              <Text style={styles.strategyActionText}>{strategy.action}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
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
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>🏆 Your Crisis Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.crisesHandled}</Text>
            <Text style={styles.statLabel}>Crises Handled</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.avgRecoveryTime}m</Text>
            <Text style={styles.statLabel}>Avg Recovery</Text>
          </View>
        </View>
        <Text style={styles.statsEncouragement}>
          You're getting stronger with every crisis you overcome! 💪
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {renderEmergencyHeader()}
          {renderQuickActions()}
          {renderSessionProgress()}
          {renderStrategies()}
          {renderSuccessStats()}
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
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  
  // Emergency Header
  emergencyHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emergencyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  emergencySubtitle: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  mantraCard: {
    width: '100%',
    padding: 20,
    backgroundColor: '#4C1D95',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    alignItems: 'center',
  },
  mantraText: {
    fontSize: 18,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
  },

  // Quick Actions
  quickActionsCard: {
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FEF2F2',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  coachButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  coachButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  coachButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  coachButtonSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  communityButton: {
    flex: 1,
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  communityButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  communityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  communityButtonSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
  },

  // Strategies
  strategiesCard: {
    padding: 20,
    marginBottom: 24,
  },
  strategiesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  strategiesSubtitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: 16,
  },
  strategiesList: {
    gap: 12,
  },
  strategyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStrategyCard: {
    backgroundColor: '#4C1D95',
    borderColor: '#8B5CF6',
  },
  strategyIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  strategyDescription: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  strategyDuration: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
  },
  strategyAction: {
    marginLeft: 12,
  },
  strategyActionText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // Session Progress
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

  // Stats
  statsCard: {
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  statsEncouragement: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});