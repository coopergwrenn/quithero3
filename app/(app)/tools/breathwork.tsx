import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Vibration, Platform, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, PillChoice } from '@/src/design-system/components';
import { useToolStore } from '@/src/stores/toolStore';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

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

const BREATHING_PATTERNS = {
  'box': {
    name: 'Box Breathing',
    description: 'Equal counts for calm focus - best for general anxiety',
    pattern: [4, 4, 4, 4], // inhale, hold, exhale, hold
    icon: '📦',
    benefits: 'Perfect for moments of stress and anxiety. Balances your nervous system.',
    whenToUse: 'Use when feeling anxious, before important meetings, or for general stress relief.',
  },
  '478': {
    name: '4-7-8 Relaxation',
    description: 'Inhale 4, hold 7, exhale 8 - best for deep calm and sleep',
    pattern: [4, 7, 8, 0],
    icon: '😴',
    benefits: 'Activates your parasympathetic nervous system for deep relaxation.',
    whenToUse: 'Great before bed, after high stress, or when you need immediate calm.',
  },
  'quick': {
    name: 'Quick Reset',
    description: '2-minute focused breathing for immediate relief',
    pattern: [2, 2, 4, 2],
    icon: '⚡',
    benefits: 'Rapid nervous system reset in just 2 minutes.',
    whenToUse: 'When you need immediate relief from cravings or sudden stress.',
  },
};

const BREATHING_PHASES = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
const DURATION_OPTIONS = [1, 3, 5, 10]; // minutes

export default function BreathworkScreen() {
  const router = useRouter();
  const { recordToolUse, getToolStats } = useToolStore();
  const { quitData } = useQuitStore();
  const insets = useSafeAreaInsets();
  const [selectedPattern, setSelectedPattern] = useState<keyof typeof BREATHING_PATTERNS>('box');
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Animation values
  const breathingScale = new Animated.Value(0.8);
  const breathingOpacity = new Animated.Value(1);
  const glowScale = new Animated.Value(1);
  
  // Circular progress for breathing phases
  const [circularProgress, setCircularProgress] = useState(0);

  const pattern = BREATHING_PATTERNS[selectedPattern];
  const breathworkStats = getToolStats('breathwork');
  const totalSessions = breathworkStats?.totalUses || 0;
  const totalMinutes = Math.round(((breathworkStats as any)?.totalDuration || 0) / 60);

  // Calculate total cycles needed for selected duration
  const cycleTime = pattern.pattern.reduce((sum, time) => sum + time, 0);
  const totalCycles = Math.ceil((selectedDuration * 60) / cycleTime);

  useEffect(() => {
    let interval: any;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeInPhase(prev => {
          const currentPhaseDuration = pattern.pattern[currentPhase];
          const newTimeInPhase = prev + 1; // Changed from 0.1 to 1 for actual second intervals
          
          // Update total time
          setTotalTime(prevTotal => prevTotal + 1);
          
          // Update circular progress based on phase
          const phaseProgress = newTimeInPhase / currentPhaseDuration;
          const currentPhaseName = BREATHING_PHASES[currentPhase];
          
          if (currentPhaseName === 'Breathe In') {
            // Progress fills during inhale (0 to 100%)
            setCircularProgress(phaseProgress * 100);
          } else if (currentPhaseName === 'Hold') {
            // Progress stays at 100% during hold
            setCircularProgress(100);
          } else if (currentPhaseName === 'Breathe Out') {
            // Progress empties during exhale (100% to 0%)
            setCircularProgress(100 - (phaseProgress * 100));
          } else {
            // Second hold phase, stay at 0%
            setCircularProgress(0);
          }
          
          if (newTimeInPhase >= currentPhaseDuration) {
            // Move to next phase
            const nextPhase = (currentPhase + 1) % pattern.pattern.length;
            
            if (nextPhase === 0) {
              // Completed a full cycle
              const nextCycle = currentCycle + 1;
              if (nextCycle >= totalCycles) {
                // Completed all cycles
                completeSession();
                return 0;
              }
              setCurrentCycle(nextCycle);
            }
            
            setCurrentPhase(nextPhase);
            
            // Haptic feedback for phase transitions
            if (Platform.OS !== 'web') {
              if (nextPhase === 0) {
                // Stronger vibration for cycle completion
                Vibration.vibrate([100, 50, 100]);
              } else {
                // Gentle vibration for phase transition
                Vibration.vibrate(50);
              }
            }
            
            // Trigger breathing animation
            animateBreathing(nextPhase);
            
            return 0;
          }
          
          return newTimeInPhase;
        });
      }, 1000); // Changed from 100ms to 1000ms for actual 1-second intervals
    }

    return () => clearInterval(interval);
  }, [isActive, currentPhase, currentCycle, pattern, totalCycles]);

  const animateBreathing = (phase: number) => {
    const phaseName = BREATHING_PHASES[phase];
    
    if (phaseName === 'Breathe In') {
      // Inhale animation - dramatic expansion
      Animated.parallel([
        Animated.timing(breathingScale, {
          toValue: 1.6,
          duration: pattern.pattern[phase] * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingOpacity, {
          toValue: 1,
          duration: pattern.pattern[phase] * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1.3,
          duration: pattern.pattern[phase] * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phaseName === 'Breathe Out') {
      // Exhale animation - dramatic contraction
      Animated.parallel([
        Animated.timing(breathingScale, {
          toValue: 0.6,
          duration: pattern.pattern[phase] * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingOpacity, {
          toValue: 1,
          duration: pattern.pattern[phase] * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 0.8,
          duration: pattern.pattern[phase] * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // Hold phases maintain current scale
  };

  const completeSession = () => {
    setIsActive(false);
    setIsComplete(true);
    
    // Track completion
    const duration = totalTime;
    analytics.trackToolCompleted('breathwork', duration);
    recordToolUse('breathwork');
    
    // Celebration haptic
    if (Platform.OS !== 'web') {
      Vibration.vibrate([200, 100, 200, 100, 300]);
    }
  };

  const startBreathing = () => {
    setStartTime(new Date());
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setTimeInPhase(0);
    setTotalTime(0);
    setIsComplete(false);
    
    // Reset animations and progress
    setCircularProgress(0);
    breathingScale.setValue(0.8);
    breathingOpacity.setValue(1);
    glowScale.setValue(1);
    
    // Start first phase animation
    animateBreathing(0);
    
    analytics.track('tool_started', { tool: 'breathwork', pattern: selectedPattern, duration: selectedDuration });
    
    // Initial haptic
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
  };

  const stopBreathing = () => {
    // Track early completion
    if (startTime) {
      const duration = (Date.now() - startTime.getTime()) / 1000;
      const completionPercentage = (currentCycle / totalCycles) * 100;
      analytics.track('tool_early_completion', { 
        tool: 'breathwork', 
        pattern: selectedPattern,
        duration,
        completion_percentage: completionPercentage 
      });
    }
    
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setTimeInPhase(0);
    setTotalTime(0);
  };

  const resetBreathing = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setTimeInPhase(0);
    setTotalTime(0);
    setIsComplete(false);
    setCircularProgress(0);
    breathingScale.setValue(0.8);
    breathingOpacity.setValue(0.3);
    glowScale.setValue(1);
  };

  const getCurrentPhaseProgress = () => {
    const phaseDuration = pattern.pattern[currentPhase];
    return phaseDuration > 0 ? timeInPhase / phaseDuration : 0;
  };

  const getOverallProgress = () => {
    const phaseProgress = getCurrentPhaseProgress();
    return (currentCycle * pattern.pattern.length + currentPhase + phaseProgress) / 
           (totalCycles * pattern.pattern.length);
  };

  const getMotivationalMessage = () => {
    if (quitData?.motivation) {
      return `Remember: ${quitData.motivation}`;
    }
    const messages = [
      "Each breath makes you stronger",
      "You're building resilience with every cycle",
      "This is your moment of peace",
      "Breathe in strength, breathe out stress"
    ];
    return messages[currentCycle % messages.length];
  };

  if (isComplete) {
    const sessionMinutes = Math.round(totalTime / 60);
    
    return (
      <View style={styles.container}>
        <StarField />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.completionContent}>
          <Animated.View style={[styles.completionIconContainer, { transform: [{ scale: glowScale }] }]}>
            <Text style={styles.completionIcon}>🌟</Text>
          </Animated.View>
          <Text style={styles.completionTitle}>Breathing Complete</Text>
          <Text style={styles.completionMessage}>
            Well done! You've just activated your body's natural relaxation response. 
            Your nervous system is now in a calmer state, making it easier to resist cravings.
          </Text>
          
          <Card style={styles.sessionStats}>
            <Text style={styles.sessionStatsTitle}>Your Session</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{sessionMinutes}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentCycle}</Text>
                <Text style={styles.statLabel}>Cycles</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalSessions + 1}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
            </View>
          </Card>
          
          <Card style={styles.completionBenefits}>
            <Text style={styles.benefitsTitle}>What You Just Accomplished</Text>
            <Text style={styles.benefitsText}>
              • Activated your parasympathetic nervous system{'\n'}
              • Reduced cortisol and stress hormones{'\n'}
              • Increased oxygen to your brain{'\n'}
              • Strengthened mindful awareness{'\n'}
              • Built resilience against cravings
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
      </View>
    );
  }

  if (isActive) {
    const currentPhaseName = BREATHING_PHASES[currentPhase];
    const overallProgress = getOverallProgress();
    const remainingTime = Math.max(0, (selectedDuration * 60) - totalTime);
    const remainingMinutes = Math.floor(remainingTime / 60);
    const remainingSeconds = Math.floor(remainingTime % 60);

    return (
      <View style={styles.container}>
        <StarField />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.activeContent}>
          <View style={styles.progressSection}>
            <Text style={styles.sessionInfo}>
              {pattern.name} • {remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')} remaining
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${overallProgress * 100}%` }]} />
            </View>
          </View>
          
          <View style={styles.breathingContent}>
            <Text style={styles.motivationalText}>
              {getMotivationalMessage()}
            </Text>
            
            <View style={styles.breathingVisual}>
              {/* Animated Circular Progress with Pulsing */}
              <Animated.View
                style={[
                  { transform: [{ scale: breathingScale }] },
                  styles.circularProgressContainer
                ]}
              >
                <AnimatedCircularProgress
                  size={240}
                  width={16}
                  fill={circularProgress}
                  tintColor={Theme.colors.purple[500]}
                  backgroundColor="rgba(255, 255, 255, 0.08)"
                  rotation={0}
                  lineCap="round"
                  duration={1000} // 1-second updates to match breathing timing
                >
                  {() => (
                    <View style={styles.breathingCenter}>
                      <Text style={styles.phaseText}>{currentPhaseName}</Text>
                      <Text style={styles.countText}>
                        {Math.ceil(pattern.pattern[currentPhase] - timeInPhase)}
                      </Text>
                    </View>
                  )}
                </AnimatedCircularProgress>
              </Animated.View>
              
              {/* Outer glow ring for additional pulsing effect */}
              <Animated.View 
                style={[
                  styles.glowRing,
                  { 
                    transform: [{ scale: glowScale }],
                    opacity: breathingOpacity,
                  }
                ]} 
              />
            </View>
            
            <Text style={styles.breathingInstruction}>
              {currentPhaseName === 'Breathe In' && 'Slowly fill your lungs'}
              {currentPhaseName === 'Hold' && 'Hold gently, stay relaxed'}
              {currentPhaseName === 'Breathe Out' && 'Release slowly and completely'}
            </Text>
            
            <View style={styles.cycleIndicator}>
              <Text style={styles.cycleText}>
                Cycle {currentCycle + 1} of {totalCycles}
              </Text>
              <View style={styles.cycleDotsContainer}>
                {Array.from({ length: Math.min(totalCycles, 10) }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.cycleDot,
                      index <= currentCycle && styles.cycleDotActive
                    ]}
                  />
                ))}
                {totalCycles > 10 && <Text style={styles.cycleDotOverflow}>...</Text>}
              </View>
            </View>
          </View>

          <View style={styles.activeActions}>
            <Button 
              variant="ghost" 
              onPress={stopBreathing}
              style={styles.stopButton}
            >
              End Session
            </Button>
          </View>
        </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StarField />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
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

          {totalSessions > 0 && (
            <Card style={styles.progressCard}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressNumber}>{totalSessions}</Text>
                  <Text style={styles.progressLabel}>Sessions Completed</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={styles.progressNumber}>{totalMinutes}</Text>
                  <Text style={styles.progressLabel}>Minutes Practiced</Text>
                </View>
              </View>
            </Card>
          )}

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

          <Card style={styles.durationSelector}>
            <Text style={styles.selectorTitle}>Session Duration</Text>
            <View style={styles.durationOptions}>
              {DURATION_OPTIONS.map((duration) => (
                <PillChoice
                  key={duration}
                  selected={selectedDuration === duration}
                  onPress={() => setSelectedDuration(duration)}
                  style={styles.durationPill}
                >
                  {duration} min
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
            <Text style={styles.patternBenefits}>
              {pattern.benefits}
            </Text>
            <View style={styles.patternDetails}>
              <Text style={styles.patternDetail}>
                Pattern: {pattern.pattern.join('-')} seconds
              </Text>
              <Text style={styles.patternDetail}>
                Duration: {selectedDuration} minute{selectedDuration > 1 ? 's' : ''}
              </Text>
              <Text style={styles.patternWhenToUse}>
                {pattern.whenToUse}
              </Text>
            </View>
          </Card>

          <View style={styles.startSection}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={startBreathing}
            >
              Start {pattern.name} ({selectedDuration} min)
            </Button>
            <Text style={styles.startNote}>
              Find a comfortable position and breathe naturally
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
    backgroundColor: '#0B0B1A',
  },
  starField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(144, 213, 255, 0.6)',
    borderRadius: 1,
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
    paddingBottom: 0, // Remove extra bottom padding
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
  durationSelector: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    justifyContent: 'center',
  },
  durationPill: {
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
  patternBenefits: {
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
  patternWhenToUse: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
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
  sessionInfo: {
    ...Theme.typography.body,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Theme.colors.purple[500] + '10',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 3,
  },
  breathingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationalText: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  breathingVisual: {
    position: 'relative',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  circularProgressContainer: {
    position: 'relative',
    zIndex: 2,
  },
  breathingCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: Theme.colors.purple[500] + '30',
    opacity: 0.6,
    zIndex: 1,
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
  breathingInstruction: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  cycleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  cycleText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    marginRight: Theme.spacing.xs,
  },
  cycleDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cycleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.purple[500] + '30',
    marginHorizontal: 2,
  },
  cycleDotActive: {
    backgroundColor: Theme.colors.purple[500],
  },
  cycleDotOverflow: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
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
  completionIconContainer: {
    marginBottom: Theme.spacing.xl,
  },
  completionIcon: {
    fontSize: 64,
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
  sessionStats: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    width: '100%',
  },
  sessionStatsTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Theme.typography.title2,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
  },
  progressCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  progressTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Theme.spacing.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    ...Theme.typography.title2,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
     progressLabel: {
     ...Theme.typography.footnote,
     color: Theme.colors.text.tertiary,
   },
});