import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Vibration, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, ProgressBar } from '@/src/design-system/components';
import { useToolStore } from '@/src/stores/toolStore';
import { analytics } from '@/src/services/analytics';

const PANIC_SCRIPT = [
  {
    phase: 'grounding',
    duration: 15,
    title: 'Ground Yourself',
    instruction: 'Look around and name 5 things you can see',
    detail: 'Take your time. Really focus on each object.',
  },
  {
    phase: 'breathing',
    duration: 30,
    title: 'Box Breathing',
    instruction: 'Breathe in for 4, hold for 4, out for 4, hold for 4',
    detail: 'Follow the rhythm. Let your body relax.',
  },
  {
    phase: 'values',
    duration: 15,
    title: 'Remember Your Why',
    instruction: 'Think about why you want to be smoke-free',
    detail: 'This craving will pass. Your commitment is stronger.',
  },
];

export default function PanicModeScreen() {
  const router = useRouter();
  const { recordToolUse } = useToolStore();
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Move to next phase or complete
            if (currentPhase < PANIC_SCRIPT.length - 1) {
              setCurrentPhase(currentPhase + 1);
              return PANIC_SCRIPT[currentPhase + 1].duration;
            } else {
              setIsActive(false);
              setIsComplete(true);
              
              // Track completion
              const duration = startTime ? (Date.now() - startTime.getTime()) / 1000 : 60;
              analytics.trackToolCompleted('panic', duration);
              recordToolUse('panic');
              
              // Haptic feedback on completion
              if (Platform.OS !== 'web') {
                Vibration.vibrate([100, 50, 100]);
              }
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, currentPhase]);

  const startPanicMode = () => {
    setStartTime(new Date());
    setIsActive(true);
    setCurrentPhase(0);
    setTimeRemaining(PANIC_SCRIPT[0].duration);
    setIsComplete(false);
  };

  const stopPanicMode = () => {
    // Track abandonment
    if (startTime) {
      const duration = (Date.now() - startTime.getTime()) / 1000;
      const totalDuration = PANIC_SCRIPT.reduce((sum, phase) => sum + phase.duration, 0);
      const completionPercentage = (duration / totalDuration) * 100;
      analytics.trackToolAbandoned('panic', completionPercentage);
    }
    
    setIsActive(false);
    setTimeRemaining(0);
  };

  const resetPanicMode = () => {
    setIsActive(false);
    setCurrentPhase(0);
    setTimeRemaining(0);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContent}>
          <Text style={styles.completionIcon}>🎉</Text>
          <Text style={styles.completionTitle}>You Did It!</Text>
          <Text style={styles.completionMessage}>
            You successfully worked through that craving. Every time you use these tools instead of smoking, you're rewiring your brain for freedom.
          </Text>
          
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
              onPress={resetPanicMode}
              style={styles.againButton}
            >
              Use Again
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isActive) {
    const currentScript = PANIC_SCRIPT[currentPhase];
    const totalDuration = PANIC_SCRIPT.reduce((sum, phase) => sum + phase.duration, 0);
    const elapsed = PANIC_SCRIPT.slice(0, currentPhase).reduce((sum, phase) => sum + phase.duration, 0) + 
                   (currentScript.duration - timeRemaining);
    const progress = elapsed / totalDuration;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeContent}>
          <ProgressBar 
            progress={progress}
            height={6}
            style={styles.progressBar}
          />
          
          <View style={styles.phaseContent}>
            <Text style={styles.phaseTitle}>{currentScript.title}</Text>
            <Text style={styles.phaseInstruction}>{currentScript.instruction}</Text>
            <Text style={styles.phaseDetail}>{currentScript.detail}</Text>
            
            <View style={styles.timer}>
              <Text style={styles.timerText}>{timeRemaining}</Text>
              <Text style={styles.timerLabel}>seconds</Text>
            </View>
          </View>

          <Button 
            variant="ghost" 
            onPress={stopPanicMode}
            style={styles.stopButton}
          >
            Stop Session
          </Button>
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
            <Text style={styles.toolTitle}>🚨 Panic Mode</Text>
            <Text style={styles.toolSubtitle}>
              60-second emergency protocol for intense cravings
            </Text>
          </View>

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <View style={styles.infoSteps}>
              <Text style={styles.infoStep}>
                <Text style={styles.stepNumber}>1.</Text> Ground yourself by focusing on your environment
              </Text>
              <Text style={styles.infoStep}>
                <Text style={styles.stepNumber}>2.</Text> Use box breathing to calm your nervous system
              </Text>
              <Text style={styles.infoStep}>
                <Text style={styles.stepNumber}>3.</Text> Reconnect with your values and motivation
              </Text>
            </View>
          </Card>

          <Card style={styles.scienceCard}>
            <Text style={styles.scienceTitle}>The Science</Text>
            <Text style={styles.scienceText}>
              This protocol combines ACT grounding techniques with controlled breathing. 
              Research shows that cravings peak within 3-5 minutes and then naturally fade. 
              By riding out the wave with structured support, you build resilience.
            </Text>
          </Card>

          <View style={styles.startSection}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={startPanicMode}
            >
              Start Panic Protocol
            </Button>
            <Text style={styles.startNote}>
              Find a quiet space where you can focus for 60 seconds
            </Text>
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
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  emergencyCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.error.background,
    borderColor: Theme.colors.error.border,
    alignItems: 'center',
  },
  emergencyTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  emergencyDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emergencyButton: {
    backgroundColor: Theme.colors.error.text,
  },
  toolsGrid: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  toolCard: {
    width: '100%',
  },
  toolCardInner: {
    padding: Theme.spacing.lg,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  toolIcon: {
    fontSize: 32,
  },
  toolTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  toolDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.md,
  },
  toolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  toolStatsText: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
  },
  statsCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  statsTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Theme.typography.title2,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
  },
  supportCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  supportTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  supportMessage: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Individual tool screen styles
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
  infoCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  infoTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  infoSteps: {
    gap: Theme.spacing.md,
  },
  infoStep: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },
  stepNumber: {
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  scienceCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  scienceTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  scienceText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  startSection: {
    alignItems: 'center',
  },
  startNote: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
  // Active session styles
  activeContent: {
    flex: 1,
    padding: Theme.layout.screenPadding,
    justifyContent: 'space-between',
  },
  progressBar: {
    marginBottom: Theme.spacing.xl,
  },
  phaseContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseTitle: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  phaseInstruction: {
    ...Theme.typography.title2,
    color: Theme.colors.purple[500],
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    lineHeight: 32,
  },
  phaseDetail: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxxl,
    lineHeight: 24,
  },
  timer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxxl,
  },
  timerText: {
    ...Theme.typography.largeTitle,
    fontSize: 48,
    color: Theme.colors.text.primary,
    fontWeight: '300',
  },
  timerLabel: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
  },
  stopButton: {
    alignSelf: 'center',
  },
  // Completion styles
  completionContent: {
    flex: 1,
    padding: Theme.layout.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.xl,
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
    marginBottom: Theme.spacing.xxxl,
  },
  completionActions: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  againButton: {
    marginTop: Theme.spacing.sm,
  },
});