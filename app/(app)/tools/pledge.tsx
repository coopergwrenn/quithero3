import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    text: 'Today I choose my health over cigarettes',
    icon: '❤️',
    description: 'Prioritize your physical wellbeing'
  },
  {
    id: 'future',
    text: "Today I'm building a smoke-free future",
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Commitment Today</Text>
            <Text style={styles.subtitle}>Start your day with intention. What's your pledge?</Text>
          </View>

          {streakCount > 0 && (
            <View style={styles.streakBanner}>
              <Text style={styles.streakBannerText}>🔥 {streakCount} day streak</Text>
            </View>
          )}

          <View style={styles.pledgeOptions}>
            <Text style={styles.sectionTitle}>Choose Your Pledge</Text>
            
            {!isCustomMode ? (
              <>
                {DEFAULT_PLEDGES.map((pledge) => (
                  <TouchableOpacity
                    key={pledge.id}
                    style={[
                      styles.pledgeOption,
                      selectedPledge === pledge.text && styles.pledgeOptionSelected
                    ]}
                    onPress={() => handleSelectDefaultPledge(pledge)}
                  >
                    <Text style={styles.pledgeIcon}>{pledge.icon}</Text>
                    <View style={styles.pledgeTextContainer}>
                      <Text style={[
                        styles.pledgeText,
                        selectedPledge === pledge.text && styles.pledgeTextSelected
                      ]}>
                        "{pledge.text}"
                      </Text>
                      <Text style={styles.pledgeDescription}>{pledge.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={styles.customModeButton}
                  onPress={handleCustomModeToggle}
                >
                  <Text style={styles.customModeText}>✏️ Write My Own Pledge</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.customPledgeContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleCustomModeToggle}
                >
                  <Text style={styles.backButtonText}>← Back to Options</Text>
                </TouchableOpacity>
                
                <Text style={styles.customPledgeLabel}>Your Personal Pledge</Text>
                <TextInput
                  style={styles.customPledgeInput}
                  value={customPledge}
                  onChangeText={setCustomPledge}
                  placeholder="Today I commit to..."
                  placeholderTextColor="#808080"
                  multiline
                  maxLength={150}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {customPledge.length}/150 characters
                </Text>
              </View>
            )}
          </View>

          <Card style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>Remember</Text>
            <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
          </Card>

          <Button
            onPress={handleMakePledge}
            disabled={!selectedPledge && !customPledge.trim()}
            style={styles.pledgeButton}
          >
            Make My Pledge
          </Button>
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
});