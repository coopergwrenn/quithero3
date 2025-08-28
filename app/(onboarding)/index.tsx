import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, ProgressBar } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { generatePersonalizedPlan, assignUserBadge } from '@/src/utils/personalization';
import { analytics } from '@/src/services/analytics';

interface OnboardingStep {
  id: string;
  question: string;
  description?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    icon?: string;
  }>;
  multiSelect?: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'motivation',
    question: 'What\'s your main reason for quitting?',
    description: 'Understanding your motivation helps us personalize your support',
    options: [
      { value: 'health', label: 'Health concerns', description: 'Breathing, fitness, long-term health', icon: '🫁' },
      { value: 'money', label: 'Save money', description: 'Stop spending on cigarettes/vapes', icon: '💰' },
      { value: 'family', label: 'Family & relationships', description: 'Set a good example, protect loved ones', icon: '👨‍👩‍👧‍👦' },
      { value: 'control', label: 'Take back control', description: 'Break free from addiction', icon: '💪' },
    ],
  },
  {
    id: 'substanceType',
    question: 'What type of vape has control over you right now?',
    description: 'Understanding your device helps us personalize your quit plan',
    options: [
      { value: 'disposable', label: 'Disposable vapes', description: 'Elf Bar, Puff Bar, etc.', icon: '🔋' },
      { value: 'pod_system', label: 'Pod system', description: 'Juul, Vuse, Caliburn', icon: '📱' },
      { value: 'box_mod', label: 'Box mod/tank system', description: 'Refillable with e-liquid', icon: '⚙️' },
      { value: 'multiple', label: 'Multiple types', description: 'I switch between different devices', icon: '🔄' },
    ],
  },
  {
    id: 'usageAmount',
    question: 'How often do you find yourself reaching for your vape?',
    description: 'Be honest - this helps us understand your dependency level',
    options: [
      { value: 'every_5_min', label: 'Every 5 minutes', description: 'It never leaves my hand', icon: '🔴' },
      { value: 'every_30_min', label: 'Every 30 minutes', description: 'Throughout the day', icon: '🟠' },
      { value: 'every_hour', label: 'Every hour', description: 'Regular intervals', icon: '🟡' },
      { value: 'few_times_day', label: 'Few times a day', description: 'Mainly during breaks', icon: '🟢' },
    ],
  },
  {
    id: 'firstUseTime',
    question: 'When do you take your first hit after waking up?',
    description: 'This reveals how deep the physical dependency runs',
    options: [
      { value: 'within_5_min', label: 'Before my feet hit the floor', description: 'Within 5 minutes', icon: '🛏️' },
      { value: 'within_30_min', label: 'While getting ready', description: 'Within 30 minutes', icon: '🚿' },
      { value: 'within_1_hour', label: 'After breakfast', description: 'Within 1 hour', icon: '🍳' },
      { value: 'after_1_hour', label: 'Later in the day', description: 'After 1 hour', icon: '☀️' },
    ],
  },
  {
    id: 'choiceVsNeed',
    question: 'When did vaping stop being a choice and become a need?',
    description: 'This is where we face the truth about dependency',
    options: [
      { value: 'gradually_months', label: 'It happened gradually over months', description: 'Slow but steady dependency', icon: '📈' },
      { value: 'within_weeks', label: 'I noticed it within weeks of starting', description: 'Fast dependency development', icon: '⚡' },
      { value: 'within_days', label: 'Pretty quickly - within days', description: 'Rapid dependency formation', icon: '🚨' },
      { value: 'still_choice', label: 'It still feels like a choice to me', description: 'Early stage dependency', icon: '🤔' },
    ],
  },
  {
    id: 'triggers',
    question: 'What triggers your urge to smoke/vape?',
    description: 'Select all that apply',
    multiSelect: true,
    options: [
      { value: 'stress', label: 'Stress or anxiety', icon: '😰' },
      { value: 'boredom', label: 'Boredom or downtime', icon: '😴' },
      { value: 'social', label: 'Social situations', icon: '👥' },
      { value: 'routines', label: 'Daily routines', description: 'Coffee, driving, work breaks', icon: '☕' },
      { value: 'alcohol', label: 'Drinking alcohol', icon: '🍺' },
      { value: 'screen_time', label: 'Screen time', description: 'Scrolling, gaming', icon: '📱' },
      { value: 'bedtime', label: 'Before bed', icon: '🌙' },
    ],
  },
  {
    id: 'socialContext',
    question: 'How often are you around other smokers?',
    options: [
      { value: 'daily', label: 'Daily', description: 'Family, friends, or coworkers smoke' },
      { value: 'sometimes', label: 'Sometimes', description: 'Occasional social situations' },
      { value: 'rarely', label: 'Rarely', description: 'Very few people in my circle smoke' },
      { value: 'never', label: 'Never', description: 'No one around me smokes' },
    ],
  },
  {
    id: 'stressLevel',
    question: 'How would you rate your current stress level?',
    options: [
      { value: 'high', label: 'High stress', description: 'Feeling overwhelmed most days' },
      { value: 'medium', label: 'Moderate stress', description: 'Some stressful days' },
      { value: 'low', label: 'Low stress', description: 'Generally calm and relaxed' },
    ],
  },
  {
    id: 'sleepQuality',
    question: 'How is your sleep quality?',
    options: [
      { value: 'poor', label: 'Poor', description: 'Trouble falling asleep or staying asleep' },
      { value: 'fair', label: 'Fair', description: 'Some sleep issues' },
      { value: 'good', label: 'Good', description: 'Sleep well most nights' },
    ],
  },
  {
    id: 'previousAttempts',
    question: 'Have you tried to quit before?',
    options: [
      { value: 'never', label: 'This is my first attempt', icon: '🆕' },
      { value: 'once', label: 'I\'ve tried once before', icon: '🔄' },
      { value: 'multiple', label: 'I\'ve tried multiple times', icon: '💪' },
    ],
  },
  {
    id: 'quitTimeline',
    question: 'When do you want to quit?',
    options: [
      { value: 'today', label: 'Today', description: 'I\'m ready to quit right now', icon: '🚀' },
      { value: 'this-week', label: 'This week', description: 'Within the next 7 days', icon: '📅' },
      { value: 'next-week', label: 'Next week', description: 'I need a bit more time to prepare', icon: '⏰' },
      { value: 'this-month', label: 'This month', description: 'Within the next 30 days', icon: '📆' },
    ],
  },
  {
    id: 'nrtInterest',
    question: 'Are you interested in nicotine replacement therapy?',
    description: 'Patches, gum, lozenges can help with withdrawal',
    options: [
      { value: 'yes', label: 'Yes, I want to learn more', icon: '💊' },
      { value: 'maybe', label: 'Maybe, I\'m unsure', icon: '🤔' },
      { value: 'no', label: 'No, I want to quit without NRT', icon: '🚫' },
      { value: 'already-using', label: 'I\'m already using NRT', icon: '✅' },
    ],
  },
  {
    id: 'support',
    question: 'What kind of support do you need most?',
    options: [
      { value: 'crisis', label: 'Crisis support for intense cravings', icon: '🚨' },
      { value: 'daily', label: 'Daily motivation and check-ins', icon: '📱' },
      { value: 'community', label: 'Community and peer support', icon: '👥' },
      { value: 'education', label: 'Educational content and tips', icon: '📚' },
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateQuitData, completeOnboarding } = useQuitStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    analytics.trackOnboardingStarted();
  }, []);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = (currentStep + 1) / ONBOARDING_STEPS.length;

  const handleOptionSelect = (value: string) => {
    if (currentStepData.multiSelect) {
      const newSelection = selectedOptions.includes(value)
        ? selectedOptions.filter(option => option !== value)
        : [...selectedOptions, value];
      setSelectedOptions(newSelection);
    } else {
      setSelectedOptions([value]);
    }
  };

  const handleNext = () => {
    const stepResponse = currentStepData.multiSelect ? selectedOptions : selectedOptions[0];
    const newResponses = { ...responses, [currentStepData.id]: stepResponse };
    setResponses(newResponses);

    analytics.trackOnboardingStepCompleted(currentStep + 1, {
      step_id: currentStepData.id,
      response: stepResponse,
    });

    if (isLastStep) {
      // Generate personalized plan
      const personalizedPlan = generatePersonalizedPlan(newResponses);
      
      // Update quit store with all data
      updateQuitData({
        ...newResponses,
        personalizedPlan,
        usageAmount: parseInt(newResponses.usageAmount) || 0,
      });

      analytics.trackOnboardingCompleted(
        personalizedPlan.riskLevel,
        newResponses.quitTimeline === 'today' ? new Date() : undefined
      );

      completeOnboarding();
      router.push('/(paywall)/paywall');
    } else {
      setCurrentStep(currentStep + 1);
      setSelectedOptions([]);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Restore previous selection
      const previousResponse = responses[ONBOARDING_STEPS[currentStep - 1].id];
      if (Array.isArray(previousResponse)) {
        setSelectedOptions(previousResponse);
      } else if (previousResponse) {
        setSelectedOptions([previousResponse]);
      } else {
        setSelectedOptions([]);
      }
    }
  };

  const canContinue = selectedOptions.length > 0;

  // Show badge assignment screen after motivation selection
  if (currentStep === 1 && responses.motivation) {
    const userBadge = assignUserBadge(responses.motivation);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.badgeAssignmentContainer}>
          <View style={styles.badgeContent}>
            <Text style={styles.badgeTitle}>Welcome, {userBadge.displayName}!</Text>
            <Text style={styles.badgeEmoji}>🎖️</Text>
            <Text style={styles.badgeDescription}>{userBadge.description}</Text>
            <Text style={styles.badgeMessage}>
              This badge represents your new identity. You're not just someone trying to quit - 
              you're a {userBadge.displayName} on a mission to break free.
            </Text>
            <Button
              variant="primary"
              size="lg"
              onPress={() => {
                setResponses(prev => ({ ...prev, userBadge }));
                setCurrentStep(2);
                setSelectedOptions([]);
              }}
              style={styles.continueButton}
            >
              Continue Your Assessment
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressBar progress={progress} height={4} style={styles.progressBar} />
        <Text style={styles.stepCounter}>
          {currentStep + 1} of {ONBOARDING_STEPS.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.questionSection}>
            <Text style={styles.question}>{currentStepData.question}</Text>
            {currentStepData.description && (
              <Text style={styles.description}>{currentStepData.description}</Text>
            )}
          </View>

          <View style={styles.optionsContainer}>
            {currentStepData.options.map((option) => {
              const isSelected = selectedOptions.includes(option.value);
              
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleOptionSelect(option.value)}
                  style={[
                    styles.optionCard,
                    isSelected && styles.selectedOption
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionContent}>
                    {option.icon && (
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                    )}
                    <View style={styles.optionText}>
                      <Text style={[
                        styles.optionLabel,
                        isSelected && styles.selectedOptionLabel
                      ]}>
                        {option.label}
                      </Text>
                      {option.description && (
                        <Text style={[
                          styles.optionDescription,
                          isSelected && styles.selectedOptionDescription
                        ]}>
                          {option.description}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="md"
              onPress={handleBack}
              style={styles.backButton}
            >
              Back
            </Button>
          )}
          
          <Button
            variant="primary"
            size="lg"
            onPress={handleNext}
            disabled={!canContinue}
            style={styles.nextButton}
          >
            {isLastStep ? 'Create My Plan' : 'Continue'}
          </Button>
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
  header: {
    padding: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.md,
  },
  progressBar: {
    marginBottom: Theme.spacing.md,
  },
  stepCounter: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Theme.layout.screenPadding,
    paddingTop: 0,
  },
  questionSection: {
    marginBottom: Theme.spacing.xl,
  },
  question: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    lineHeight: 42,
  },
  description: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: Theme.spacing.md,
  },
  optionCard: {
    backgroundColor: Theme.colors.dark.surface,
    borderWidth: 2,
    borderColor: Theme.colors.dark.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    minHeight: 72,
  },
  selectedOption: {
    backgroundColor: Theme.colors.purple[500] + '15',
    borderColor: Theme.colors.purple[500],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 28,
    marginRight: Theme.spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  selectedOptionLabel: {
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  optionDescription: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
  },
  selectedOptionDescription: {
    color: Theme.colors.text.primary,
  },
  footer: {
    padding: Theme.layout.screenPadding,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    alignItems: 'center',
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  badgeAssignmentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.layout.screenPadding,
  },
  badgeContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  badgeTitle: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    fontWeight: '700',
  },
  badgeEmoji: {
    fontSize: 80,
    marginBottom: Theme.spacing.lg,
  },
  badgeDescription: {
    ...Theme.typography.title1,
    color: Theme.colors.purple[500],
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    fontWeight: '600',
  },
  badgeMessage: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xl * 2,
  },
  continueButton: {
    width: '100%',
  },
});