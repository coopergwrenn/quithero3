import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Vibration, Platform, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, ProgressBar } from '@/src/design-system/components';
import { useToolStore } from '@/src/stores/toolStore';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const URGE_DURATION = 300; // 5 minutes in seconds
const ENCOURAGEMENT_MESSAGES = [
  "The urge feels strong now, but it WILL pass. Let's ride this wave together.",
  "Urges are like waves - they build up, peak, then crash down",
  "Your brain is literally rewiring itself right now",
  "Every second you wait, the craving gets weaker",
  "You've survived 100% of your urges so far",
  "This feeling is temporary. Your quit is permanent.",
  "Notice how the intensity is already changing",
  "You're proving to yourself that you're in control",
  "Each moment of resistance makes you stronger",
  "The peak is behind you - it's getting easier now"
];

const DISTRACTION_TIPS = [
  "💧 Drink a large glass of cold water slowly",
  "🫁 Take 5 deep breaths through your nose",
  "🚶 Walk around the block or do jumping jacks",
  "🧊 Hold an ice cube in your mouth",
  "📱 Call or text a supportive friend",
  "🎵 Listen to your favorite upbeat song",
  "🪥 Brush your teeth or chew gum",
  "✋ Make a fist and count to 10 slowly"
];

export default function UrgeTimerScreen() {
  const router = useRouter();
  const { recordToolUse, getToolStats } = useToolStore();
  const { quitData } = useQuitStore();
  const insets = useSafeAreaInsets();
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(URGE_DURATION);
  const [isComplete, setIsComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Animation for circular progress
  const progressAnimation = new Animated.Value(0);
  const scaleAnimation = new Animated.Value(1);

  // Get user stats
  const timerStats = getToolStats('urge-timer');
  const totalUrgesManaged = timerStats?.totalUses || 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Update progress animation (starts full, empties as time goes down)
          const progress = 1 - (newTime / URGE_DURATION); // 0 at start (full circle), 1 at end (empty circle)
          progressAnimation.setValue(progress);
          
          // Haptic feedback at key moments
          if (Platform.OS !== 'web') {
            if (newTime === 240) { // 4 minutes left - peak time
              Vibration.vibrate(100);
            } else if (newTime === 180) { // 3 minutes left - should be easier
              Vibration.vibrate([50, 50, 50]);
            } else if (newTime === 60) { // 1 minute left
              Vibration.vibrate([100, 50, 100]);
            }
          }
          
          if (newTime <= 0) {
            setIsActive(false);
            setIsComplete(true);
            
            // Completion tracking and analytics
            const duration = startTime ? (Date.now() - startTime.getTime()) / 1000 : URGE_DURATION;
            analytics.trackToolCompleted('urge-timer', duration);
            recordToolUse('urge-timer');
            
            // Celebration haptic
            if (Platform.OS !== 'web') {
              Vibration.vibrate([200, 100, 200, 100, 300]);
            }
            
            // Celebration animation
            Animated.sequence([
              Animated.timing(scaleAnimation, {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnimation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
            
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, progressAnimation, scaleAnimation, startTime]);

  // Change encouragement message every 30 seconds
  useEffect(() => {
    if (isActive) {
      const messageInterval = setInterval(() => {
        setCurrentMessage(prev => (prev + 1) % ENCOURAGEMENT_MESSAGES.length);
        setCurrentTip(prev => (prev + 1) % DISTRACTION_TIPS.length);
      }, 30000);
      return () => clearInterval(messageInterval);
    }
  }, [isActive]);

  const startTimer = () => {
    setStartTime(new Date());
    setIsActive(true);
    setTimeRemaining(URGE_DURATION);
    setIsComplete(false);
    setCurrentMessage(0);
    setCurrentTip(0);
    
    // Reset animations (start full - no mask)
    progressAnimation.setValue(0);
    scaleAnimation.setValue(1);
    
    analytics.track('tool_started', { tool: 'urge-timer' });
    
    // Start haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
  };

  const stopTimer = () => {
    // Track early completion
    if (startTime) {
      const duration = (Date.now() - startTime.getTime()) / 1000;
      const completionPercentage = ((URGE_DURATION - timeRemaining) / URGE_DURATION) * 100;
      analytics.track('tool_early_completion', { 
        tool: 'urge-timer', 
        duration,
        completion_percentage: completionPercentage 
      });
    }
    
    setIsActive(false);
    setIsComplete(true);
    recordToolUse('urge-timer');
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(URGE_DURATION);
    setIsComplete(false);
    setCurrentMessage(0);
    setCurrentTip(0);
    progressAnimation.setValue(0);
    scaleAnimation.setValue(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseMessage = () => {
    const elapsed = URGE_DURATION - timeRemaining;
    if (elapsed < 60) {
      return "Just started - stay strong!";
    } else if (elapsed < 180) {
      return "Building to peak - you're doing great!";
    } else if (elapsed < 240) {
      return "Peak time - notice it starting to ease!";
    } else {
      return "Almost there - the wave is crashing down!";
    }
  };

  const getMotivation = () => {
    if (quitData?.motivation) {
      return `Remember: ${quitData.motivation}`;
    }
    return "Remember why you started this journey.";
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContent}>
          <Animated.View style={[styles.completionIconContainer, { transform: [{ scale: scaleAnimation }] }]}>
            <Text style={styles.completionIcon}>🎉</Text>
          </Animated.View>
          <Text style={styles.completionTitle}>Urge Conquered!</Text>
          <Text style={styles.completionMessage}>
            You just proved that cravings are temporary and you have the power to overcome them. 
            That urge just got weaker. Your brain is learning new patterns.
          </Text>
          
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalUrgesManaged + 1}</Text>
                <Text style={styles.statLabel}>Urges Managed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5:00</Text>
                <Text style={styles.statLabel}>Minutes Stronger</Text>
              </View>
            </View>
          </Card>
          
          <Card style={styles.neuroplasticityCard}>
            <Text style={styles.neuroplasticityTitle}>What Just Happened in Your Brain</Text>
            <Text style={styles.neuroplasticityText}>
              • Neural pathways for craving responses got weaker{'\n'}
              • Self-control circuits became stronger{'\n'}
              • You built evidence that you can overcome urges{'\n'}
              • Your confidence in quitting increased
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
    const progress = 1 - (timeRemaining / URGE_DURATION);
    const progressDegrees = progress * 360;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeContent}>
          <View style={styles.timerSection}>
            <Text style={styles.activeTitle}>Riding the Wave</Text>
            <Text style={styles.phaseMessage}>{getPhaseMessage()}</Text>
            
            {/* Animated Circular Progress Timer */}
            <View style={styles.circularTimer}>
              <AnimatedCircularProgress
                size={240}
                width={16}
                fill={100 - (progress * 100)} // Start at 100%, decrease as time passes
                tintColor={Theme.colors.purple[500]}
                backgroundColor="rgba(255, 255, 255, 0.08)"
                rotation={0}
                lineCap="round"
                duration={1000}
              >
                {() => (
                  <View style={styles.timerInner}>
                    <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                    <Text style={styles.timerSubtext}>until urge fades</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
            
            <Text style={styles.encouragementText}>
              {ENCOURAGEMENT_MESSAGES[currentMessage]}
            </Text>
          </View>
          
          <View style={styles.distractionSection}>
            <Text style={styles.distractionTitle}>Need a distraction?</Text>
            <Card style={styles.tipCard}>
              <Text style={styles.tipText}>
                {DISTRACTION_TIPS[currentTip]}
              </Text>
            </Card>
            
            <Card style={styles.motivationCardSmall}>
              <Text style={styles.motivationTextSmall}>
                {getMotivation()}
              </Text>
            </Card>
          </View>

          <View style={styles.activeActions}>
            <Button 
              variant="ghost" 
              onPress={stopTimer}
              style={styles.earlyExitButton}
            >
              I'm Feeling Better
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text style={styles.toolTitle}>⏱️ Urge Timer</Text>
            <Text style={styles.toolSubtitle}>
              Ride the wave - watch cravings peak and fade
            </Text>
          </View>

          <Card style={styles.factCard}>
            <Text style={styles.factIcon}>🌊</Text>
            <Text style={styles.factTitle}>The Science of Urge Surfing</Text>
            <Text style={styles.factText}>
              Cravings follow a predictable pattern - they build up, peak within 3-5 minutes, 
              then naturally fade. By "surfing" the urge instead of fighting it, you learn 
              that cravings are temporary and manageable.
            </Text>
          </Card>

          {totalUrgesManaged > 0 && (
            <Card style={styles.progressCard}>
              <Text style={styles.progressTitle}>Your Track Record</Text>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressNumber}>{totalUrgesManaged}</Text>
                  <Text style={styles.progressLabel}>Urges Successfully Managed</Text>
                </View>
                <Text style={styles.progressEncouragement}>
                  You've proven {totalUrgesManaged} times that urges pass!
                </Text>
              </View>
            </Card>
          )}

          <Card style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>How to Surf the Urge</Text>
            <View style={styles.instructionSteps}>
              <Text style={styles.instructionStep}>
                1. When you feel a craving, start the timer immediately
              </Text>
              <Text style={styles.instructionStep}>
                2. Watch the visual progress and breathe deeply
              </Text>
              <Text style={styles.instructionStep}>
                3. Use the distraction tips if needed
              </Text>
              <Text style={styles.instructionStep}>
                4. Notice how the intensity naturally decreases
              </Text>
              <Text style={styles.instructionStep}>
                5. Celebrate when you ride out the wave!
              </Text>
            </View>
          </Card>

          <View style={styles.startSection}>
            <Text style={styles.startPrompt}>
              Feeling an urge right now?
            </Text>
            <Text style={styles.startSubPrompt}>
              Let's prove it will pass in 5 minutes or less
            </Text>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={startTimer}
            >
              Start Urge Timer
            </Button>
            <Text style={styles.startNote}>
              Most urges peak and fade within this time
            </Text>
          </View>
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
    padding: Theme.layout.screenPadding,
    paddingTop: Theme.spacing.xl,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  backButton: {
    ...Theme.typography.body,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.lg,
  },
  toolTitle: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  toolSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  factCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  factIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  factTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  factText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  progressCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.success.background,
    borderColor: Theme.colors.success.border,
  },
  progressTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.success.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  progressStats: {
    alignItems: 'center',
  },
  progressStat: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  progressNumber: {
    ...Theme.typography.largeTitle,
    fontSize: 36,
    color: Theme.colors.success.text,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  progressLabel: {
    ...Theme.typography.body,
    color: Theme.colors.success.text,
    textAlign: 'center',
  },
  progressEncouragement: {
    ...Theme.typography.body,
    color: Theme.colors.success.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  instructionTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  instructionSteps: {
    gap: Theme.spacing.md,
  },
  instructionStep: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },
  startSection: {
    alignItems: 'center',
  },
  startPrompt: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  startSubPrompt: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  startNote: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
  // Active timer styles
  activeContent: {
    flex: 1,
    padding: Theme.layout.screenPadding,
    justifyContent: 'space-between',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTitle: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  phaseMessage: {
    ...Theme.typography.body,
    color: Theme.colors.purple[400],
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    fontStyle: 'italic',
  },
  circularTimer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  timerInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    ...Theme.typography.largeTitle,
    fontSize: 36,
    color: Theme.colors.text.primary,
    fontWeight: '300',
    marginBottom: Theme.spacing.xs,
  },
  timerSubtext: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  encouragementText: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
  },
  distractionSection: {
    marginBottom: Theme.spacing.xl,
  },
  distractionTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  tipCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.dark.surface,
    borderColor: Theme.colors.purple[500],
    borderWidth: 1,
  },
  tipText: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  motivationCardSmall: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.dark.surface,
    borderColor: Theme.colors.purple[400],
    borderWidth: 1,
  },
  motivationTextSmall: {
    ...Theme.typography.body,
    color: Theme.colors.purple[400],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  activeActions: {
    alignItems: 'center',
  },
  earlyExitButton: {
    paddingHorizontal: Theme.spacing.xl,
  },
  // Completion styles
  completionContent: {
    flex: 1,
    padding: Theme.layout.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionIconContainer: {
    marginBottom: Theme.spacing.lg,
  },
  completionIcon: {
    fontSize: 72,
  },
  completionTitle: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  completionMessage: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Theme.spacing.xl,
  },
  statsCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    width: '100%',
  },
  statsTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Theme.typography.largeTitle,
    fontSize: 32,
    color: Theme.colors.purple[500],
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  neuroplasticityCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.success.background,
    borderColor: Theme.colors.success.border,
  },
  neuroplasticityTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.success.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  neuroplasticityText: {
    ...Theme.typography.body,
    color: Theme.colors.success.text,
    lineHeight: 24,
  },
  completionActions: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  againButton: {
    marginTop: Theme.spacing.sm,
  },
});