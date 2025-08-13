import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, ProgressBar } from '@/src/design-system/components';
import { useToolStore } from '@/src/stores/toolStore';

const URGE_DURATION = 300; // 5 minutes in seconds
const ENCOURAGEMENT_MESSAGES = [
  "You're stronger than this urge",
  "This feeling will pass",
  "Every second you resist builds strength",
  "You're in control, not the addiction",
  "Breathe through this moment",
  "Your future self will thank you",
  "This craving is temporary",
  "You've got this!",
];

export default function UrgeTimerScreen() {
  const router = useRouter();
  const { recordToolUse } = useToolStore();
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(URGE_DURATION);
  const [isComplete, setIsComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsComplete(true);
            recordToolUse('urge-timer');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Change encouragement message every 30 seconds
  useEffect(() => {
    if (isActive) {
      const messageInterval = setInterval(() => {
        setCurrentMessage(prev => (prev + 1) % ENCOURAGEMENT_MESSAGES.length);
      }, 30000);
      return () => clearInterval(messageInterval);
    }
  }, [isActive]);

  const startTimer = () => {
    setIsActive(true);
    setTimeRemaining(URGE_DURATION);
    setIsComplete(false);
    setCurrentMessage(0);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeRemaining(URGE_DURATION);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(URGE_DURATION);
    setIsComplete(false);
    setCurrentMessage(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeRemaining / URGE_DURATION);

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContent}>
          <Text style={styles.completionIcon}>🏆</Text>
          <Text style={styles.completionTitle}>Urge Conquered!</Text>
          <Text style={styles.completionMessage}>
            You just proved that cravings are temporary and you have the power to overcome them. 
            This victory builds neural pathways for future success.
          </Text>
          
          <Card style={styles.completionStats}>
            <Text style={styles.completionStatsTitle}>What Just Happened</Text>
            <Text style={styles.completionStatsText}>
              • Your brain released natural endorphins{'\n'}
              • You strengthened your willpower muscle{'\n'}
              • You proved addiction doesn't control you
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
            <Button 
              variant="ghost" 
              onPress={resetTimer}
              style={styles.againButton}
            >
              Time Another Urge
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isActive) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeContent}>
          <ProgressBar 
            progress={progress}
            height={8}
            style={styles.progressBar}
          />
          
          <View style={styles.timerContent}>
            <Text style={styles.activeTitle}>Riding the Wave</Text>
            
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.timerSubtext}>until this urge fades</Text>
            </View>
            
            <Text style={styles.encouragementText}>
              {ENCOURAGEMENT_MESSAGES[currentMessage]}
            </Text>
            
            <Card style={styles.tipCard}>
              <Text style={styles.tipText}>
                💡 Try: Deep breathing, drink water, or step outside for fresh air
              </Text>
            </Card>
          </View>

          <View style={styles.activeActions}>
            <Button 
              variant="ghost" 
              onPress={stopTimer}
            >
              I'm Feeling Better
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
            <Text style={styles.toolTitle}>⏱️ Urge Timer</Text>
            <Text style={styles.toolSubtitle}>
              Track your cravings and watch them fade
            </Text>
          </View>

          <Card style={styles.factCard}>
            <Text style={styles.factIcon}>🧠</Text>
            <Text style={styles.factTitle}>Scientific Fact</Text>
            <Text style={styles.factText}>
              Most cravings peak within 3-5 minutes and then naturally fade. 
              By timing your urges, you'll see this pattern and build confidence.
            </Text>
          </Card>

          <Card style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>How to Use</Text>
            <View style={styles.instructionSteps}>
              <Text style={styles.instructionStep}>
                1. When you feel a craving, start the timer immediately
              </Text>
              <Text style={styles.instructionStep}>
                2. Focus on the countdown and breathing
              </Text>
              <Text style={styles.instructionStep}>
                3. Notice how the intensity naturally decreases
              </Text>
              <Text style={styles.instructionStep}>
                4. Celebrate when the timer completes!
              </Text>
            </View>
          </Card>

          <View style={styles.startSection}>
            <Text style={styles.startPrompt}>Feeling an urge right now?</Text>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={startTimer}
            >
              Start 5-Minute Timer
            </Button>
            <Text style={styles.startNote}>
              Most urges fade within this time
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}