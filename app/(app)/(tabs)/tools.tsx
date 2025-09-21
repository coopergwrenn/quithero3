import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Button, Badge } from '@/src/design-system/components';
import { useToolStore } from '../../../src/stores/toolStore';
import { analytics } from '../../../src/services/analytics';
import { notifications } from '../../../src/services/notifications';

// StarField background component for premium feel
const StarField = () => {
  const stars = Array.from({ length: 50 }, (_, i) => ({
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

export default function ToolsScreen() {
  const router = useRouter();
  const { getToolStats } = useToolStore();

  const handleToolPress = (tool: any) => {
    analytics.trackToolOpened(tool.id, 'tools_tab');
    notifications.markToolUsed();
    
    // Handle special routing for learn library
    if (tool.id === 'learn') {
      router.push('/learn-library' as any);
    } else {
      router.push(tool.route as any);
    }
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
    {
      id: 'learn',
      title: 'Learn Library',
      description: 'Educational articles, guides, and science-backed strategies',
      icon: '📚',
      color: Theme.colors.purple[500],
      route: '/learn-library', // We'll create this route
      category: 'Education',
    },
  ];

  return (
    <View style={styles.container}>
      <StarField />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Premium Header */}
            <View style={styles.premiumHeader}>
              <Text style={styles.premiumTitle}>Quit Tools</Text>
              <Text style={styles.premiumSubtitle}>
                Evidence-based tools for high-friction moments
              </Text>
            </View>

            {/* Crisis Mode - Dramatic Red Card */}
            <View style={styles.crisisContainer}>
              <View style={styles.crisisGlow} />
              <View style={styles.crisisCard}>
                <View style={styles.crisisHeader}>
                  <View style={styles.crisisIconContainer}>
                    <Text style={styles.crisisIcon}>🚨</Text>
                  </View>
                  <Text style={styles.crisisTitle}>Crisis Mode</Text>
                </View>
                <Text style={styles.crisisDescription}>
                  Having an intense craving right now?
                </Text>
                <TouchableOpacity 
                  style={styles.crisisButton}
                  onPress={handleEmergencyPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.crisisButtonGlow} />
                  <Text style={styles.crisisButtonText}>Start Panic Protocol</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Premium Tools Grid */}
            <View style={styles.premiumToolsGrid}>
              {tools.map((tool) => {
                const stats = getToolStats(tool.id);
                return (
                  <TouchableOpacity
                    key={tool.id}
                    style={styles.premiumToolCard}
                    onPress={() => handleToolPress(tool)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.premiumToolGlow} />
                    <View style={styles.premiumToolContent}>
                      <View style={styles.premiumToolHeader}>
                        <View style={styles.premiumToolIconContainer}>
                          <Text style={styles.premiumToolIcon}>{tool.icon}</Text>
                        </View>
                        <View style={styles.premiumToolBadge}>
                          <Text style={styles.premiumToolCategory}>{tool.category}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.premiumToolTitle}>{tool.title}</Text>
                      <Text style={styles.premiumToolDescription}>{tool.description}</Text>
                      
                      {stats.totalUses > 0 && (
                        <View style={styles.premiumToolStats}>
                          <View style={styles.premiumToolStatItem}>
                            <Text style={styles.premiumToolStatValue}>{stats.totalUses}</Text>
                            <Text style={styles.premiumToolStatLabel}>Uses</Text>
                          </View>
                          {stats.currentStreak > 0 && (
                            <View style={styles.premiumToolStatItem}>
                              <Text style={styles.premiumToolStatValue}>🔥 {stats.currentStreak}</Text>
                              <Text style={styles.premiumToolStatLabel}>Streak</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Premium Stats Section */}
            <View style={styles.premiumStatsContainer}>
              <View style={styles.premiumStatsGlow} />
              <View style={styles.premiumStatsContent}>
                <Text style={styles.premiumStatsTitle}>Your Progress</Text>
                <View style={styles.premiumStatsGrid}>
                  <View style={styles.premiumStatCard}>
                    <View style={styles.premiumStatGlow} />
                    <Text style={styles.premiumStatValue}>
                      {Object.values(getToolStats('all')).reduce((sum: number, stat: any) => sum + stat.totalUses, 0)}
                    </Text>
                    <Text style={styles.premiumStatLabel}>Total Uses</Text>
                  </View>
                  <View style={styles.premiumStatCard}>
                    <View style={styles.premiumStatGlow} />
                    <Text style={styles.premiumStatValue}>
                      {Math.max(...Object.values(getToolStats('all')).map((stat: any) => stat.currentStreak))}
                    </Text>
                    <Text style={styles.premiumStatLabel}>Best Streak</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Premium Support Message */}
            <View style={styles.premiumSupportContainer}>
              <View style={styles.premiumSupportGlow} />
              <View style={styles.premiumSupportContent}>
                <View style={styles.premiumSupportIconContainer}>
                  <Text style={styles.premiumSupportIcon}>💪</Text>
                </View>
                <Text style={styles.premiumSupportTitle}>You've Got This</Text>
                <Text style={styles.premiumSupportMessage}>
                  Every craving you overcome makes you stronger. These tools are here whenever you need them - no judgment, just support.
                </Text>
              </View>
            </View>
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
    backgroundColor: 'rgba(144, 213, 255, 0.6)',
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
    paddingTop: 32,
  },

  // Premium Header
  premiumHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Crisis Mode - Dramatic Red Styling
  crisisContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  crisisGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 28,
    zIndex: 0,
  },
  crisisCard: {
    backgroundColor: 'rgba(139, 69, 19, 0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1,
  },
  crisisHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  crisisIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  crisisIcon: {
    fontSize: 32,
  },
  crisisTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(239, 68, 68, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  crisisDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  crisisButton: {
    position: 'relative',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.6)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  crisisButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 18,
    zIndex: 0,
  },
  crisisButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    zIndex: 1,
  },

  // Premium Tools Grid
  premiumToolsGrid: {
    gap: 16,
    marginBottom: 32,
  },
  premiumToolCard: {
    position: 'relative',
  },
  premiumToolGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 22,
    zIndex: 0,
  },
  premiumToolContent: {
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
  premiumToolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumToolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumToolIcon: {
    fontSize: 24,
  },
  premiumToolBadge: {
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  premiumToolCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.purple[500],
  },
  premiumToolTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(144, 213, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  premiumToolDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
    marginBottom: 16,
  },
  premiumToolStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  premiumToolStatItem: {
    alignItems: 'center',
  },
  premiumToolStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.purple[500],
    marginBottom: 4,
  },
  premiumToolStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
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
  premiumStatsContent: {
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
  premiumStatsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  premiumStatsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  premiumStatCard: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    alignItems: 'center',
  },
  premiumStatGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    backgroundColor: 'rgba(144, 213, 255, 0.05)',
    borderRadius: 17,
    zIndex: 0,
  },
  premiumStatValue: {
    fontSize: 28,
    fontWeight: '900',
    color: Theme.colors.purple[500],
    marginBottom: 8,
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    zIndex: 1,
  },
  premiumStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    zIndex: 1,
  },

  // Premium Support Section
  premiumSupportContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  premiumSupportGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 22,
    zIndex: 0,
  },
  premiumSupportContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  premiumSupportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  premiumSupportIcon: {
    fontSize: 28,
  },
  premiumSupportTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(144, 213, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  premiumSupportMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
});