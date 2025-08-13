import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, TextField, Badge } from '@/src/design-system/components';
import { useToolStore } from '@/src/stores/toolStore';
import { analytics } from '@/src/services/analytics';
import { notifications } from '@/src/services/notifications';

export default function PledgeScreen() {
  const router = useRouter();
  const { recordToolUse, getPledgeData, updatePledgeData } = useToolStore();
  const [customPledge, setCustomPledge] = useState('');
  const [selectedPledge, setSelectedPledge] = useState('');
  const [hasMadePledge, setHasMadePledge] = useState(false);

  const pledgeData = getPledgeData();

  useEffect(() => {
    // Check if user has made today's pledge
    const today = new Date().toDateString();
    setHasMadePledge(pledgeData.lastPledgeDate === today);
  }, [pledgeData]);

  const defaultPledges = [
    "Today, I choose my health over temporary relief",
    "I am stronger than any craving that comes my way",
    "Today, I invest in my future instead of burning it away",
    "I will honor my commitment to myself and my loved ones",
    "Every smoke-free hour is a victory I'm proud of",
  ];

  const makePledge = (pledgeText: string) => {
    const today = new Date().toDateString();
    updatePledgeData({
      lastPledgeDate: today,
      currentStreak: pledgeData.lastPledgeDate === yesterday() ? pledgeData.currentStreak + 1 : 1,
      totalPledges: pledgeData.totalPledges + 1,
      lastPledgeText: pledgeText,
    });
    
    // Track analytics and notifications
    analytics.trackDailyPledgeCompleted();
    notifications.markPledgeCompleted();
    recordToolUse('pledge');
    setHasMadePledge(true);
  };

  const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toDateString();
  };

  if (hasMadePledge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContent}>
          <Text style={styles.completionIcon}>✅</Text>
          <Text style={styles.completionTitle}>Pledge Made!</Text>
          <Text style={styles.completionMessage}>
            You've committed to staying smoke-free today. This public commitment to yourself 
            increases your likelihood of success by 65%.
          </Text>
          
          <Card style={styles.pledgeDisplay}>
            <Text style={styles.pledgeDisplayTitle}>Today's Pledge</Text>
            <Text style={styles.pledgeDisplayText}>
              "{pledgeData.lastPledgeText}"
            </Text>
          </Card>

          <Card style={styles.streakCard}>
            <Text style={styles.streakTitle}>Your Commitment Streak</Text>
            <Text style={styles.streakNumber}>🔥 {pledgeData.currentStreak}</Text>
            <Text style={styles.streakLabel}>
              {pledgeData.currentStreak === 1 ? 'day' : 'days'} of daily pledges
            </Text>
          </Card>
          
          <View style={styles.completionActions}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={() => router.back()}
            >
              Back to Tools
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.backButton} onPress={() => router.back()}>
              ← Back
            </Text>
            <Text style={styles.toolTitle}>🤝 Daily Pledge</Text>
            <Text style={styles.toolSubtitle}>
              Make a commitment to yourself for today
            </Text>
          </View>

          {pledgeData.currentStreak > 0 && (
            <Card style={styles.streakBanner}>
              <Text style={styles.streakBannerText}>
                🔥 {pledgeData.currentStreak} day commitment streak!
              </Text>
            </Card>
          )}

          <Card style={styles.scienceCard}>
            <Text style={styles.scienceTitle}>The Power of Commitment</Text>
            <Text style={styles.scienceText}>
              Research shows that making a daily commitment increases quit success rates by 65%. 
              When you pledge to yourself, you activate psychological consistency principles that 
              make you more likely to follow through.
            </Text>
          </Card>

          <Card style={styles.pledgeSelector}>
            <Text style={styles.selectorTitle}>Choose Your Pledge</Text>
            <View style={styles.pledgeOptions}>
              {defaultPledges.map((pledge, index) => (
                <Card 
                  key={index}
                  style={[
                    styles.pledgeOption,
                    selectedPledge === pledge && styles.selectedPledge
                  ]}
                  onTouchEnd={() => setSelectedPledge(pledge)}
                >
                  <Text style={styles.pledgeText}>"{pledge}"</Text>
                </Card>
              ))}
            </View>
            
            <View style={styles.customPledgeSection}>
              <Text style={styles.customPledgeTitle}>Or write your own:</Text>
              <TextField
                placeholder="I pledge to..."
                value={customPledge}
                onChangeText={setCustomPledge}
                multiline
                numberOfLines={3}
                style={styles.customPledgeInput}
              />
            </View>
          </Card>

          <View style={styles.commitSection}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={() => makePledge(customPledge || selectedPledge)}
              disabled={!customPledge && !selectedPledge}
            >
              Make My Pledge
            </Button>
            <Text style={styles.commitNote}>
              This commitment is just for today - you can do this!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}