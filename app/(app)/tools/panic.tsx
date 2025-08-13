import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Vibration, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, ProgressBar } from '@/src/design-system/components';
import { useToolStore } from '@/src/stores/toolStore';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';

const PANIC_PHASES = [
  {
    id: 'grounding',
    duration: 15,
    title: 'Ground Yourself',
    instruction: 'You\'re safe. This feeling will pass.',
    detail: 'Name 5 things you can see around you right now',
    breathingPattern: null,
  },
  {
    id: 'breathing',
    duration: 30,
    title: 'Breathe With Me',
    instruction: 'Follow the breathing rhythm',
    detail: 'In for 4... Hold for 4... Out for 4... Hold for 4',
    breathingPattern: [4, 4, 4, 4], // inhale, hold, exhale, hold
  },
  {
    id: 'values',
    duration: 15,
    title: 'Remember Your Why',
    instruction: 'Connect with your deeper motivation',
    detail: 'This craving will pass. Your commitment is stronger.',
    breathingPattern: null,
  },
];

const BREATHING_PHASES = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];

export default function PanicModeScreen() {
  const router = useRouter();
  const { recordToolUse } = useToolStore();
  const { quitData } = useQuitStore();
  
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Breathing animation state
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [breathingTime, setBreathingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Move to next phase or complete
            if (currentPhase < PANIC_PHASES.length - 1) {
              const nextPhase = currentPhase + 1;
              setCurrentPhase(nextPhase);
              setBreathingPhase(0);
              setBreathingTime(0);
              return PANIC_PHASES[nextPhase].duration;
            } else {
              // Complete the session
              setIsActive(false);
              setIsComplete(true);
              
              // Track completion
              const duration = startTime ? (Date.now() - startTime.getTime()) / 1000 : 60;
              analytics.trackToolCompleted('panic', duration);
              recordToolUse('panic');
              
              // Success haptic feedback
              if (Platform.OS !== 'web') {
                Vibration.vibrate([100, 50, 100, 50, 100]);
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

  // Breathing animation for phase 2
  useEffect(() => {
    let breathingInterval: NodeJS.Timeout;
    
    if (isActive && currentPhase === 1 && PANIC_PHASES[1].breathingPattern) {
      const pattern = PANIC_PHASES[1].breathingPattern!;
      
      breathingInterval = setInterval(() => {
        setBreathingTime(prev => {
          const currentPhaseDuration = pattern[breathingPhase];
          
          if (prev >= currentPhaseDuration) {
            // Move to next breathing phase
            const nextBreathingPhase = (breathingPhase + 1) % pattern.length;
            setBreathingPhase(nextBreathingPhase);
            
            // Haptic feedback for breathing transitions
            if (Platform.OS !== 'web') {
              Vibration.vibrate(50);
            }
            
            return 0;
          }
          
          return prev + 0.1;
        });
      }, 100);
    }

    return () => clearInterval(breathingInterval);
  }, [isActive, currentPhase, breathingPhase]);

  const startPanicMode = () => {
    setStartTime(new Date());
    setIsActive(true);
    setCurrentPhase(0);
    setTimeRemaining(PANIC_PHASES[0].duration);
    setIsComplete(false);
    setBreathingPhase(0);
    setBreathingTime(0);
    
    analytics.trackToolOpened('panic', 'panic_button');
  };

  const stopPanicMode = () => {
    // Track abandonment
    if (startTime) {
      const duration = (Date.now() - startTime.getTime()) / 1000;
      const totalDuration = PANIC_PHASES.reduce((sum, phase) => sum + phase.duration, 0);
      const completionPercentage = (duration / totalDuration) * 100;
      analytics.trackToolAbandoned('panic', completionPercentage);
    }
    
    setIsActive(false);
    setTimeRemaining(0);
    setCurrentPhase(0);
    setBreathingPhase(0);
    setBreathingTime(0);
  };

  const resetPanicMode = () => {
    setIsActive(false);
    setCurrentPhase(0);
    setTimeRemaining(0);
    setIsComplete(false);
    setBreathingPhase(0);
    setBreathingTime(0);
  };

  const getUserMotivation = () => {
    const motivationMap = {
      health: 'your health and breathing better',
      money: 'saving money for what matters',
      family: 'your family and loved ones',
      control: 'taking back control of your life',
    };
    
    return motivationMap[quitData.primaryMotivation as keyof typeof motivationMap] || 'your freedom from addiction';
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContent}>
          <Text style={styles.completionIcon}>🎉</Text>
          <Text style={styles.completionTitle}>You Did It!</Text>
          <Text style={styles.completionMessage}>
            You successfully worked through that craving using proven techniques. 
            Every time you use these tools instead of smoking, you're rewiring your brain for freedom.
          </Text>
          
          <Card style={styles.completionStats}>
            <Text style={styles.completionStatsTitle}>What Just Happened</Text>
            <Text style={styles.completionStatsText}>
              • You practiced mindful awareness{'\n'}
              • You activated your body's relaxation response{'\n'}
              • You reconnected with your deeper values{'\n'}
              • You proved cravings are temporary and manageable
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
    const currentPanicPhase = PANIC_PHASES[currentPhase];
    const totalDuration = PANIC_PHASES.reduce((sum, phase) => sum + phase.duration, 0);
    const elapsed = PANIC_PHASES.slice(0, currentPhase).reduce((sum, phase) => sum + phase.duration, 0) + 
                   (currentPanicPhase.duration - timeRemaining);
    const progress = elapsed / totalDuration;

    // Breathing animation scale for phase 2
    let breathingScale = 1;
    if (currentPhase === 1 && currentPanicPhase.breathingPattern) {
      const pattern = currentPanicPhase.breathingPattern;
      const phaseDuration = pattern[breathingPhase];
      const phaseProgress = breathingTime / phaseDuration;
      
      if (breathingPhase === 0) { // Inhale
        breathingScale = 0.8 + (phaseProgress * 0.4);
      } else if (breathingPhase === 2) { // Exhale
        breathingScale = 1.2 - (phaseProgress * 0.4);
      } else { // Hold phases
        breathingScale = breathingPhase === 1 ? 1.2 : 0.8;
      }
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeContent}>
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <Text style={styles.phaseCounter}>
              Phase {currentPhase + 1} of {PANIC_PHASES.length}
            </Text>
            <ProgressBar 
              progress={progress}
              height={6}
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.phaseContent}>
            <Text style={styles.phaseTitle}>{currentPanicPhase.title}</Text>
            <Text style={styles.phaseInstruction}>{currentPanicPhase.instruction}</Text>
            
            {/* Breathing Circle for Phase 2 */}
            {currentPhase === 1 ? (
              <View style={styles.breathingContainer}>
                <View style={[
                  styles.breathingCircle,
                  { transform: [{ scale: breathingScale }] }
                ]}>
                  <Text style={styles.breathingPhaseText}>
                    {BREATHING_PHASES[breathingPhase]}
                  </Text>
                  <Text style={styles.breathingCountText}>
                    {Math.ceil(currentPanicPhase.breathingPattern![breathingPhase] - breathingTime)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.phaseDetail}>{currentPanicPhase.detail}</Text>
            )}
            
            {/* Values Phase - Show User's Motivation */}
            {currentPhase === 2 && (
              <Card style={styles.motivationCard}>
                <Text style={styles.motivationText}>
                  You're quitting for {getUserMotivation()}
                </Text>
              </Card>
            )}
            
            <View style={styles.timer}>
              <Text style={styles.timerText}>{timeRemaining}</Text>
              <Text style={styles.timerLabel}>seconds remaining</Text>
            </View>
          </View>

          <Button 
            variant="ghost" 
            onPress={stopPanicMode}
            style={styles.stopButton}
          >
            I'm Feeling Better
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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

        <Card style={styles.crisisCard}>
          <Text style={styles.crisisIcon}>🆘</Text>
          <Text style={styles.crisisTitle}>Having an Intense Craving?</Text>
          <Text style={styles.crisisDescription}>
            This 60-second guided sequence will help you work through the urge using proven techniques.
          </Text>
        </Card>

        <Card style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          <View style={styles.phasesList}>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseNumber}>1</Text>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseItemTitle}>Ground Yourself (15s)</Text>
                <Text style={styles.phaseItemDescription}>
                  Mindful awareness to interrupt automatic behavior
                </Text>
              </View>
            </View>
            
            <View style={styles.phaseItem}>
              <Text style={styles.phaseNumber}>2</Text>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseItemTitle}>Box Breathing (30s)</Text>
                <Text style={styles.phaseItemDescription}>
                  Activate your body's natural relaxation response
                </Text>
              </View>
            </View>
            
            <View style={styles.phaseItem}>
              <Text style={styles.phaseNumber}>3</Text>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseItemTitle}>Remember Your Why (15s)</Text>
                <Text style={styles.phaseItemDescription}>
                  Reconnect with your deeper motivation to quit
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.scienceCard}>
          <Text style={styles.scienceTitle}>The Science</Text>
          <Text style={styles.scienceText}>
            This protocol combines ACT mindfulness techniques with controlled breathing. 
            Research shows that cravings peak within 3-5 minutes and then naturally fade. 
            By riding out the wave with structured support, you build resilience and confidence.
          </Text>
        </Card>

        <View style={styles.startSection}>
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth
            onPress={startPanicMode}
            style={styles.startButton}
          >
            Start Panic Protocol
          </Button>
          <Text style={styles.startNote}>
            Find a quiet space where you can focus for 60 seconds
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  content: {
    flex: 1,
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
  
  // Crisis Card
  crisisCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: Theme.colors.error.background,
    borderColor: Theme.colors.error.border,
  },
  crisisIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  crisisTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  crisisDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // How It Works
  howItWorksCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  howItWorksTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  phasesList: {
    gap: Theme.spacing.lg,
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  phaseNumber: {
    ...Theme.typography.title3,
    color: Theme.colors.purple[500],
    fontWeight: '700',
    marginRight: Theme.spacing.md,
    marginTop: 2,
    minWidth: 24,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseItemTitle: {
    ...Theme.typography.callout,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  phaseItemDescription: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
  },
  
  // Science Card
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
  
  // Start Section
  startSection: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: Theme.colors.error.text,
    borderColor: Theme.colors.error.text,
  },
  startNote: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
  
  // Active Session Styles
  activeContent: {
    flex: 1,
    padding: Theme.layout.screenPadding,
    justifyContent: 'space-between',
  },
  progressSection: {
    marginBottom: Theme.spacing.xl,
  },
  phaseCounter: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  progressBar: {
    marginBottom: Theme.spacing.sm,
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
    marginBottom: Theme.spacing.xl,
    lineHeight: 32,
  },
  phaseDetail: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxxl,
    lineHeight: 24,
  },
  
  // Breathing Animation
  breathingContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxxl,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Theme.colors.purple[500] + '20',
    borderWidth: 3,
    borderColor: Theme.colors.purple[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingPhaseText: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  breathingCountText: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.purple[500],
    fontWeight: '300',
  },
  
  // Motivation Card
  motivationCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.purple[500] + '15',
    borderColor: Theme.colors.purple[500] + '50',
  },
  motivationText: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Timer
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
  
  // Completion Styles
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
    marginBottom: Theme.spacing.xl,
  },
  completionStats: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    width: '100%',
  },
  completionStatsTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  completionStatsText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
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