import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { analytics } from '@/src/services/analytics';

// Default pledge options based on common quit motivations
const DEFAULT_PLEDGES = [
  {
    id: 'health',
    text: 'Today I choose my health over vaping',
    icon: '❤️',
    description: 'Prioritize your physical wellbeing'
  },
  {
    id: 'future',
    text: "Today I'm building a vape-free future",
    icon: '🌅',
    description: 'Focus on long-term goals'
  },
  {
    id: 'strength',
    text: "Today I'm stronger than my cravings",
    icon: '💪',
    description: 'Build mental resilience'
  },
  {
    id: 'savings',
    text: "Today I'm saving money and my lungs",
    icon: '💰',
    description: 'Double the benefits'
  },
  {
    id: 'promise',
    text: "Today I'm keeping my promise to myself",
    icon: '🤝',
    description: 'Honor your commitment'
  }
];

export default function DailyPledgeScreen() {
  const router = useRouter();
  const { quitData } = useQuitStore();
  const { recordToolUse } = useToolStore();
  const insets = useSafeAreaInsets();
  
  const [selectedPledge, setSelectedPledge] = useState<string>('');
  const [customPledge, setCustomPledge] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [todaysPledge, setTodaysPledge] = useState<any>(null);
  const [streakCount, setStreakCount] = useState(7); // Mock streak for demo
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    analytics.track('daily_pledge_opened');
  }, []);

  const handleMakePledge = async () => {
    const pledgeText = isCustomMode ? customPledge.trim() : selectedPledge;
    
    if (!pledgeText) {
      Alert.alert('Pledge Required', 'Please select or write your pledge for today.');
      return;
    }

    if (isCustomMode && customPledge.length > 150) {
      Alert.alert('Pledge Too Long', 'Please keep your pledge under 150 characters.');
      return;
    }

    try {
      const newPledge = {
        text: pledgeText,
        type: isCustomMode ? 'custom' : 'default',
        createdAt: new Date().toISOString(),
      };

      setTodaysPledge(newPledge);
      
      // Track completion
      recordToolUse('daily-pledge');
      analytics.track('daily_pledge_completed', {
        pledge_type: isCustomMode ? 'custom' : 'default',
        character_count: pledgeText.length
      });

      // Show success message
      Alert.alert(
        'Pledge Made! 🎯',
        'Your commitment strengthens your quit journey. See you tomorrow!',
        [{ text: 'Done', style: 'default' }]
      );

    } catch (error) {
      console.error('Error saving pledge:', error);
      Alert.alert('Error', 'Could not save your pledge. Please try again.');
    }
  };

  const handleSelectDefaultPledge = (pledge: any) => {
    setSelectedPledge(pledge.text);
    setIsCustomMode(false);
    setCustomPledge('');
  };

  const handleCustomModeToggle = () => {
    setIsCustomMode(!isCustomMode);
    setSelectedPledge('');
    setCustomPledge('');
  };

  const getMotivationalMessage = () => {
    return "Your commitment today builds a stronger tomorrow";
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your pledge data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If already pledged today, show completion screen
  if (todaysPledge) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.completedHeader}>
              <Text style={styles.completedTitle}>Today's Pledge Complete! ✅</Text>
              <Text style={styles.completedSubtitle}>Your commitment strengthens your quit journey</Text>
            </View>

            <Card style={styles.pledgeDisplayCard}>
              <Text style={styles.pledgeDisplayText}>"{todaysPledge.text}"</Text>
              <Text style={styles.pledgeDisplayDate}>Made today at {new Date(todaysPledge.createdAt).toLocaleTimeString()}</Text>
            </Card>

            <View style={styles.streakSection}>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <View style={styles.streakDisplay}>
                <Text style={styles.streakNumber}>{streakCount}</Text>
                <Text style={styles.streakEmoji}>🔥</Text>
              </View>
              <Text style={styles.streakDays}>
                {streakCount === 1 ? 'day' : 'days'} of daily commitment
              </Text>
            </View>

            <Card style={styles.motivationCard}>
              <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
            </Card>

            <View style={styles.completedActions}>
              <Button
                onPress={() => router.back()}
                style={styles.doneButton}
              >
                See You Tomorrow!
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main pledge selection screen
  return (
    <View style={styles.container}>
      <StarField />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => {
            // Try to go back, but if there's no screen to go back to, navigate to tools
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(app)/(tabs)/tools');
            }
          }} activeOpacity={0.7}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.premiumHeader}>
            <View style={styles.premiumTitleContainer}>
              <View style={styles.premiumPledgeIconContainer}>
                <Text style={styles.premiumPledgeIcon}>🤝</Text>
              </View>
              <Text style={styles.premiumTitle}>Daily Pledge</Text>
            </View>
            <Text style={styles.premiumSubtitle}>Start your day with intention. What's your commitment?</Text>
          </View>

          {streakCount > 0 && (
            <View style={styles.premiumStreakContainer}>
              <View style={styles.premiumStreakGlow} />
              <View style={styles.premiumStreakCard}>
                <Text style={styles.premiumStreakIcon}>🔥</Text>
                <Text style={styles.premiumStreakText}>{streakCount} day streak</Text>
              </View>
            </View>
          )}

          <View style={styles.premiumPledgeContainer}>
            <View style={styles.premiumPledgeGlow} />
            <View style={styles.premiumPledgeCard}>
              <View style={styles.premiumPledgeHeader}>
                <View style={styles.premiumChooseIconContainer}>
                  <Text style={styles.premiumChooseIcon}>🎯</Text>
                </View>
                <Text style={styles.premiumSectionTitle}>Choose Your Pledge</Text>
              </View>
            
            {!isCustomMode ? (
              <>
                {DEFAULT_PLEDGES.map((pledge) => (
                  <TouchableOpacity
                    key={pledge.id}
                    style={[
                      styles.premiumPledgeOption,
                      selectedPledge === pledge.text && styles.premiumPledgeOptionSelected
                    ]}
                    onPress={() => handleSelectDefaultPledge(pledge)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.premiumPledgeOptionGlow,
                      selectedPledge === pledge.text && styles.premiumPledgeOptionSelectedGlow
                    ]} />
                    <View style={styles.premiumPledgeOptionContent}>
                      <View style={styles.premiumPledgeEmojiContainer}>
                        <Text style={styles.premiumPledgeEmoji}>{pledge.icon}</Text>
                      </View>
                      <View style={styles.premiumPledgeTextContainer}>
                        <Text style={[
                          styles.premiumPledgeText,
                          selectedPledge === pledge.text && styles.premiumPledgeTextSelected
                        ]}>
                          "{pledge.text}"
                        </Text>
                        <Text style={styles.premiumPledgeDescription}>{pledge.description}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={styles.premiumCustomModeButton}
                  onPress={handleCustomModeToggle}
                  activeOpacity={0.8}
                >
                  <View style={styles.premiumCustomModeGlow} />
                  <View style={styles.premiumCustomModeContent}>
                    <View style={styles.premiumCustomIconContainer}>
                      <Text style={styles.premiumCustomIcon}>✏️</Text>
                    </View>
                    <Text style={styles.premiumCustomModeText}>Write My Own Pledge</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.premiumCustomInputContainer}>
                <TouchableOpacity
                  style={styles.premiumBackToOptionsButton}
                  onPress={handleCustomModeToggle}
                  activeOpacity={0.7}
                >
                  <Text style={styles.premiumBackToOptionsText}>← Back to Options</Text>
                </TouchableOpacity>
                
                <Text style={styles.premiumCustomInputLabel}>Your Personal Pledge</Text>
                <View style={styles.premiumCustomInputField}>
                  <TextInput
                    style={styles.premiumCustomTextInput}
                    value={customPledge}
                    onChangeText={setCustomPledge}
                    placeholder="Today I commit to..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    multiline
                    maxLength={150}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={styles.premiumCharacterCount}>
                  {customPledge.length}/150 characters
                </Text>
              </View>
            )}
            </View>
          </View>

          <View style={styles.premiumMotivationContainer}>
            <View style={styles.premiumMotivationGlow} />
            <View style={styles.premiumMotivationCard}>
              <View style={styles.premiumMotivationHeader}>
                <View style={styles.premiumMotivationIconContainer}>
                  <Text style={styles.premiumMotivationIcon}>💪</Text>
                </View>
                <Text style={styles.premiumMotivationTitle}>Remember</Text>
              </View>
              <Text style={styles.premiumMotivationText}>{getMotivationalMessage()}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleMakePledge}
            disabled={!selectedPledge && !customPledge.trim()}
            style={[
              styles.premiumPledgeButton,
              (!selectedPledge && !customPledge.trim()) && styles.premiumPledgeButtonDisabled
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.premiumPledgeButtonGlow} />
            <View style={styles.premiumPledgeButtonContent}>
              <View style={styles.premiumPledgeButtonIconContainer}>
                <Text style={styles.premiumPledgeButtonIcon}>🤝</Text>
              </View>
              <Text style={styles.premiumPledgeButtonText}>Make My Pledge</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#B3B3B3',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
    lineHeight: 24,
  },
  completedHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
    textAlign: 'center',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  pledgeDisplayCard: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: '#4C1D95',
    borderColor: '#7C3AED',
    borderWidth: 1,
  },
  pledgeDisplayText: {
    fontSize: 18,
    color: Theme.colors.text.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  pledgeDisplayDate: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  streakBanner: {
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 24,
  },
  streakBannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
  },
  streakSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  streakLabel: {
    fontSize: 18,
    color: '#B3B3B3',
    marginBottom: 16,
  },
  streakDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginRight: 8,
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakDays: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 8,
  },
  pledgeOptions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  pledgeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pledgeOptionSelected: {
    backgroundColor: '#4C1D95',
    borderColor: '#8B5CF6',
  },
  pledgeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  pledgeTextContainer: {
    flex: 1,
  },
  pledgeText: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 4,
    lineHeight: 22,
  },
  pledgeTextSelected: {
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  pledgeDescription: {
    fontSize: 14,
    color: '#808080',
  },
  customModeButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderStyle: 'dashed',
  },
  customModeText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  customPledgeContainer: {
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
  },
  customPledgeLabel: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  customPledgeInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Theme.colors.text.primary,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  characterCount: {
    fontSize: 12,
    color: '#808080',
    textAlign: 'right',
    marginTop: 4,
  },
  motivationCard: {
    padding: 20,
    marginBottom: 32,
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#60A5FA',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: '#B3B3B3',
    lineHeight: 24,
    textAlign: 'left',
  },
  pledgeButton: {
    marginBottom: 32,
  },
  completedActions: {
    gap: 16,
  },
  doneButton: {
    backgroundColor: '#22C55E',
  },

  // Premium StarField Styles
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
    borderRadius: 50,
  },

  // Premium Back Button
  backButton: {
    ...Theme.typography.body,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.lg,
  },

  // Premium Header Styles
  premiumHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  premiumTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumPledgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(144, 213, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: Theme.colors.purple[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumPledgeIcon: {
    fontSize: 28,
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(144, 213, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Premium Streak Styles
  premiumStreakContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  premiumStreakGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.2)',
  },
  premiumStreakCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumStreakIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  premiumStreakText: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.purple[500],
    textShadowColor: 'rgba(144, 213, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Premium Pledge Container Styles
  premiumPledgeContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  premiumPledgeGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.08)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.15)',
  },
  premiumPledgeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumPledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumChooseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(144, 213, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  premiumChooseIcon: {
    fontSize: 24,
  },
  premiumSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(144, 213, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Premium Pledge Option Styles
  premiumPledgeOption: {
    position: 'relative',
    marginBottom: 16,
  },
  premiumPledgeOptionGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  premiumPledgeOptionSelectedGlow: {
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderColor: 'rgba(144, 213, 255, 0.3)',
  },
  premiumPledgeOptionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumPledgeOptionSelected: {
    backgroundColor: 'rgba(144, 213, 255, 0.08)',
    borderColor: 'rgba(144, 213, 255, 0.2)',
  },
  premiumPledgeEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  premiumPledgeEmoji: {
    fontSize: 20,
  },
  premiumPledgeTextContainer: {
    flex: 1,
  },
  premiumPledgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 22,
  },
  premiumPledgeTextSelected: {
    color: Theme.colors.purple[500],
    textShadowColor: 'rgba(144, 213, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  premiumPledgeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },

  // Premium Custom Mode Button
  premiumCustomModeButton: {
    position: 'relative',
    marginTop: 16,
  },
  premiumCustomModeGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    backgroundColor: 'rgba(144, 213, 255, 0.08)',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.2)',
  },
  premiumCustomModeContent: {
    backgroundColor: 'rgba(30, 42, 58, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.15)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.purple[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumCustomIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(144, 213, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumCustomIcon: {
    fontSize: 16,
  },
  premiumCustomModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.purple[500],
    textShadowColor: 'rgba(144, 213, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Premium Custom Input Styles
  premiumCustomInputContainer: {
    marginTop: 16,
  },
  premiumBackToOptionsButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  premiumBackToOptionsText: {
    fontSize: 16,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  premiumCustomInputLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(144, 213, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  premiumCustomInputField: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumCustomTextInput: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  premiumCharacterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'right',
    marginTop: 8,
  },

  // Premium Motivation Styles
  premiumMotivationContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  premiumMotivationGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.15)',
  },
  premiumMotivationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumMotivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumMotivationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(144, 213, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumMotivationIcon: {
    fontSize: 20,
  },
  premiumMotivationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(144, 213, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  premiumMotivationText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
    textAlign: 'center',
  },

  // Premium Pledge Button
  premiumPledgeButton: {
    position: 'relative',
    marginBottom: 32,
  },
  premiumPledgeButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
  },
  premiumPledgeButtonContent: {
    backgroundColor: 'rgba(30, 42, 58, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.4)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.purple[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumPledgeButtonDisabled: {
    opacity: 0.5,
  },
  premiumPledgeButtonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumPledgeButtonIcon: {
    fontSize: 16,
  },
  premiumPledgeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.purple[500],
    textShadowColor: 'rgba(144, 213, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});