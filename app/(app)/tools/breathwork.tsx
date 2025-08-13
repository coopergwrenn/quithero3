import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Vibration, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, PillChoice } from '@/src/design-system/components';
import { useToolStore } from '@/src/stores/toolStore';

const BREATHING_PATTERNS = {
  'box': {
    name: 'Box Breathing',
    description: 'Equal counts for calm focus',
    pattern: [4, 4, 4, 4], // inhale, hold, exhale, hold
    cycles: 8,
    icon: '📦',
  },
  '478': {
    name: '4-7-8 Relaxation',
    description: 'Longer exhale for deep calm',
    pattern: [4, 7, 8, 0],
    cycles: 6,
    icon: '😴',
  },
  'quick': {
    name: 'Quick Reset',
    description: '2-minute focused breathing',
    pattern: [3, 2, 4, 1],
    cycles: 12,
    icon: '⚡',
  },
};

const BREATHING_PHASES = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];

export default function BreathworkScreen() {
  const router = useRouter();
  const { recordToolUse } = useToolStore();
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof BREATHING_PATTERNS>('box');
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const pattern = BREATHING_PATTERNS[selectedPattern];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeInPhase(prev => {
          const currentPhaseDuration = pattern.pattern[currentPhase];
          
          if (prev >= currentPhaseDuration) {
            // Move to next phase
            const nextPhase = (currentPhase + 1) % pattern.pattern.length;
            
            if (nextPhase === 0) {
              // Completed a full cycle
              const nextCycle = currentCycle + 1;
              if (nextCycle >= pattern.cycles) {
                // Completed all cycles
                setIsActive(false);
                setIsComplete(true);
                recordToolUse('breathwork');
                return 0;
              }
              setCurrentCycle(nextCycle);
            }
            
            setCurrentPhase(nextPhase);
            
            // Haptic feedback for phase transitions
            if (Platform.OS !== 'web') {
              Vibration.vibrate(50);
            }
            
            return 0;
          }
          
          return prev + 0.1;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isActive, currentPhase, currentCycle, pattern]);

  const startBreathing = () => {
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setTimeInPhase(0);
    setIsComplete(false);
  };

  const stopBreathing = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setTimeInPhase(0);
  };

  const resetBreathing = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setTimeInPhase(0);
    setIsComplete(false);
  };

  const getCurrentPhaseProgress = () => {
    const phaseDuration = pattern.pattern[currentPhase];
    return phaseDuration > 0 ? timeInPhase / phaseDuration : 0;
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContent}>
          <Text style={styles.completionIcon}>🌟</Text>
          <Text style={styles.completionTitle}>Breathing Complete</Text>
          <Text style={styles.completionMessage}>
            You've activated your parasympathetic nervous system and reduced stress hormones. 
            Your body is now in a calmer state, making it easier to resist cravings.
          </Text>
          
          <Card style={styles.completionBenefits}>
            <Text style={styles.benefitsTitle}>What You Just Did</Text>
            <Text style={styles.benefitsText}>
              • Lowered cortisol (stress hormone){'\n'}
              • Activated vagus nerve for calm{'\n'}
              • Increased oxygen to your brain{'\n'}
              • Strengthened mindful awareness
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
              onPress={resetBreathing}
              style={styles.againButton}
            >
              Practice Again
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isActive) {
    const currentPhaseName = BREATHING_PHASES[currentPhase];
    const phaseProgress = getCurrentPhaseProgress();
    const overallProgress = (currentCycle * pattern.pattern.length + currentPhase + phaseProgress) / 
                           (pattern.cycles * pattern.pattern.length);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeContent}>
          <View style={styles.progressSection}>
            <Text style={styles.cycleCounter}>
              Cycle {currentCycle + 1} of {pattern.cycles}
            </Text>
            <ProgressBar 
              progress={overallProgress}
              height={6}
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.breathingContent}>
            <View style={[
              styles.breathingCircle,
              { transform: [{ scale: 0.8 + (phaseProgress * 0.4) }] }
            ]}>
              <Text style={styles.phaseText}>{currentPhaseName}</Text>
              <Text style={styles.countText}>
                {Math.ceil(pattern.pattern[currentPhase] - timeInPhase)}
              </Text>
            </View>
            
            <Text style={styles.patternName}>{pattern.name}</Text>
            <Text style={styles.breathingInstruction}>
              Follow the circle and breathe naturally
            </Text>
          </View>

          <Button 
            variant="ghost" 
            onPress={stopBreathing}
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
            <Text style={styles.toolTitle}>🫁 Breathwork</Text>
            <Text style={styles.toolSubtitle}>
              Guided breathing to calm cravings and anxiety
            </Text>
          </View>

          <Card style={styles.patternSelector}>
            <Text style={styles.selectorTitle}>Choose Your Pattern</Text>
            <View style={styles.patternOptions}>
              {Object.entries(BREATHING_PATTERNS).map(([key, patternData]) => (
                <PillChoice
                  key={key}
                  selected={selectedPattern === key}
                  onPress={() => setSelectedPattern(key as keyof typeof BREATHING_PATTERNS)}
                  style={styles.patternPill}
                >
                  {patternData.icon} {patternData.name}
                </PillChoice>
              ))}
            </View>
          </Card>

          <Card style={styles.patternInfo}>
            <Text style={styles.patternTitle}>
              {pattern.icon} {pattern.name}
            </Text>
            <Text style={styles.patternDescription}>
              {pattern.description}
            </Text>
            <View style={styles.patternDetails}>
              <Text style={styles.patternDetail}>
                Pattern: {pattern.pattern.join('-')} seconds
              </Text>
              <Text style={styles.patternDetail}>
                Duration: ~{Math.ceil((pattern.cycles * pattern.pattern.reduce((a, b) => a + b, 0)) / 60)} minutes
              </Text>
            </View>
          </Card>

          <Card style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Benefits</Text>
            <Text style={styles.benefitsText}>
              • Activates your body's relaxation response{'\n'}
              • Reduces cortisol and stress hormones{'\n'}
              • Improves focus and emotional regulation{'\n'}
              • Provides healthy coping mechanism
            </Text>
          </Card>

          <View style={styles.startSection}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={startBreathing}
            >
              Start {pattern.name}
            </Button>
            <Text style={styles.startNote}>
              Find a comfortable position and breathe naturally
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
  patternSelector: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  selectorTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  patternOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    justifyContent: 'center',
  },
  patternPill: {
    marginBottom: Theme.spacing.sm,
  },
  patternInfo: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
  },
  patternTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  patternDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  patternDetails: {
    gap: Theme.spacing.xs,
    alignItems: 'center',
  },
  patternDetail: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
  },
  benefitsCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  benefitsTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  benefitsText: {
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
  progressSection: {
    marginBottom: Theme.spacing.xl,
  },
  cycleCounter: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  progressBar: {
    marginBottom: Theme.spacing.sm,
  },
  breathingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    textAlign: 'center',
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
    marginBottom: Theme.spacing.xl,
  },
  phaseText: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  countText: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.purple[500],
    fontWeight: '300',
  },
  patternName: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  breathingInstruction: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  activeActions: {
    alignItems: 'center',
  },
  stopButton: {
    marginTop: Theme.spacing.lg,
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
    marginBottom: Theme.spacing.xl,
  },
  completionBenefits: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    width: '100%',
  },
  benefitsTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  completionActions: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  againButton: {
    marginTop: Theme.spacing.sm,
  },
  // Urge timer specific styles
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
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  factText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
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
    gap: Theme.spacing.sm,
  },
  instructionStep: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },
  startPrompt: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  // Timer active styles
  timerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxxl,
  },
  timerText: {
    ...Theme.typography.largeTitle,
    fontSize: 64,
    color: Theme.colors.purple[500],
    fontWeight: '300',
    marginBottom: Theme.spacing.xs,
  },
  timerSubtext: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
  },
  encouragementText: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    fontStyle: 'italic',
  },
  tipCard: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.info.background,
    borderColor: Theme.colors.info.border,
  },
  tipText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
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
});