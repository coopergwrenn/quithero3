import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, ProgressBar, PillChoice } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { generatePersonalizedPlan } from '../../src/utils/personalization';
import { analytics } from '@/src/services/analytics';

const TOTAL_STEPS = 12;

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateQuitData, completeOnboarding } = useQuitStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<Record<string, any>>({});

  useEffect(() => {
    analytics.trackOnboardingStarted();
  }, []);

  const progress = currentStep / TOTAL_STEPS;

  const updateResponse = (key: string, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    // Track step completion
    analytics.trackOnboardingStepCompleted(currentStep, {
      [getQuestionConfig(currentStep).key]: responses[getQuestionConfig(currentStep).key]
    });

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate personalized plan and complete onboarding
      const personalizedPlan = generatePersonalizedPlan(responses);
      
      // Track completion
      analytics.trackOnboardingCompleted(
        personalizedPlan.riskLevel,
        responses.quitTimeline === 'today' ? new Date() : undefined
      );
      
      updateQuitData({ 
        ...responses, 
        personalizedPlan,
        quitDate: responses.quitTimeline === 'today' ? new Date() : undefined
      });
      completeOnboarding();
      router.push('/(paywall)/paywall');
    }
  };

  const handleSkip = () => {
    // Track abandonment if they skip required questions
    if (getQuestionConfig(currentStep).required) {
      analytics.trackOnboardingAbandoned(currentStep);
    }
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/(paywall)/paywall');
    }
  };

  const canProceed = () => {
    const currentQuestion = getQuestionConfig(currentStep);
    if (currentQuestion.required) {
      return responses[currentQuestion.key] !== undefined;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <MotivationStep 
            value={responses.primaryMotivation}
            onChange={(value) => updateResponse('primaryMotivation', value)}
          />
        );
      case 2:
        return (
          <SubstanceTypeStep 
            value={responses.substanceType}
            onChange={(value) => updateResponse('substanceType', value)}
          />
        );
      case 3:
        return (
          <UsageAmountStep 
            substanceType={responses.substanceType}
            value={responses.usageAmount}
            onChange={(value) => updateResponse('usageAmount', value)}
          />
        );
      case 4:
        return (
          <FirstUseTimeStep 
            value={responses.firstUseTime}
            onChange={(value) => updateResponse('firstUseTime', value)}
          />
        );
      case 5:
        return (
          <TriggersStep 
            value={responses.triggers}
            onChange={(value) => updateResponse('triggers', value)}
          />
        );
      case 6:
        return (
          <SocialContextStep 
            value={responses.socialContext}
            onChange={(value) => updateResponse('socialContext', value)}
          />
        );
      case 7:
        return (
          <StressLevelStep 
            value={responses.stressLevel}
            onChange={(value) => updateResponse('stressLevel', value)}
          />
        );
      case 8:
        return (
          <SleepQualityStep 
            value={responses.sleepQuality}
            onChange={(value) => updateResponse('sleepQuality', value)}
          />
        );
      case 9:
        return (
          <PreviousAttemptsStep 
            value={responses.previousAttempts}
            onChange={(value) => updateResponse('previousAttempts', value)}
          />
        );
      case 10:
        return (
          <QuitTimelineStep 
            value={responses.quitTimeline}
            onChange={(value) => updateResponse('quitTimeline', value)}
          />
        );
      case 11:
        return (
          <NRTInterestStep 
            value={responses.nrtInterest}
            onChange={(value) => updateResponse('nrtInterest', value)}
          />
        );
      case 12:
        return (
          <FinalStep />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressBar 
          progress={progress} 
          height={4}
          style={styles.progressBar}
        />
        <Text style={styles.stepCounter}>
          {currentStep} of {TOTAL_STEPS}
        </Text>
        {currentStep > 6 && (
          <Text style={styles.encouragement}>
            {getEncouragementMessage(currentStep)}
          </Text>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth
          onPress={handleNext}
          disabled={!canProceed()}
        >
          {currentStep === TOTAL_STEPS ? 'Create My Plan' : 'Continue'}
        </Button>
        
        {!getQuestionConfig(currentStep).required && (
          <Button 
            variant="ghost" 
            onPress={handleSkip}
            style={styles.skipButton}
          >
            Skip this question
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

// Step Components
function MotivationStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>What's your main reason for quitting?</Text>
      <Text style={styles.description}>
        Understanding your motivation helps us personalize your support
      </Text>
      
      <View style={styles.optionsGrid}>
        {[
          { key: 'health', label: '🫁 Health concerns', desc: 'Breathing, fitness, long-term health' },
          { key: 'money', label: '💰 Save money', desc: 'Stop spending on cigarettes/vapes' },
          { key: 'family', label: '👨‍👩‍👧‍👦 Family/loved ones', desc: 'Set a good example, protect others' },
          { key: 'control', label: '🎯 Take back control', desc: 'Break free from addiction' },
        ].map((option) => (
          <Card 
            key={option.key}
            style={[
              styles.optionCard,
              value === option.key && styles.selectedOption
            ]}
            onTouchEnd={() => onChange(option.key)}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionDesc}>{option.desc}</Text>
          </Card>
        ))}
      </View>
    </Card>
  );
}

function SubstanceTypeStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>What do you currently use?</Text>
      <Text style={styles.description}>
        This helps us provide the right strategies for your situation
      </Text>
      
      <View style={styles.pillOptions}>
        {[
          { key: 'cigarettes', label: '🚬 Cigarettes' },
          { key: 'vape', label: '💨 Vape/E-cigarettes' },
          { key: 'both', label: '🔄 Both' },
        ].map((option) => (
          <PillChoice
            key={option.key}
            selected={value === option.key}
            onPress={() => onChange(option.key)}
            style={styles.pillOption}
          >
            {option.label}
          </PillChoice>
        ))}
      </View>
    </Card>
  );
}

function UsageAmountStep({ substanceType, value, onChange }: { 
  substanceType?: string; 
  value?: number; 
  onChange: (value: number) => void 
}) {
  const getLabel = () => {
    if (substanceType === 'vape') return 'How many pods/cartridges per day?';
    if (substanceType === 'cigarettes') return 'How many cigarettes per day?';
    return 'How much do you use per day?';
  };

  const getOptions = () => {
    if (substanceType === 'vape') {
      return [
        { key: 0.5, label: 'Half pod or less' },
        { key: 1, label: '1 pod' },
        { key: 2, label: '2 pods' },
        { key: 3, label: '3+ pods' },
      ];
    }
    return [
      { key: 5, label: '1-5 cigarettes' },
      { key: 10, label: '6-10 cigarettes' },
      { key: 20, label: '11-20 cigarettes' },
      { key: 30, label: '20+ cigarettes' },
    ];
  };

  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>{getLabel()}</Text>
      <Text style={styles.description}>
        This helps us calculate your potential savings and health improvements
      </Text>
      
      <View style={styles.optionsGrid}>
        {getOptions().map((option) => (
          <Card 
            key={option.key}
            style={[
              styles.optionCard,
              value === option.key && styles.selectedOption
            ]}
            onTouchEnd={() => onChange(option.key)}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
          </Card>
        ))}
      </View>
    </Card>
  );
}

function FirstUseTimeStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>When do you first smoke/vape after waking up?</Text>
      <Text style={styles.description}>
        This helps us understand your dependency level
      </Text>
      
      <View style={styles.optionsGrid}>
        {[
          { key: 'within-5min', label: 'Within 5 minutes', risk: 'High dependency' },
          { key: 'within-30min', label: '5-30 minutes', risk: 'Moderate dependency' },
          { key: 'within-1hour', label: '30 minutes - 1 hour', risk: 'Lower dependency' },
          { key: 'later', label: 'After 1 hour', risk: 'Lowest dependency' },
        ].map((option) => (
          <Card 
            key={option.key}
            style={[
              styles.optionCard,
              value === option.key && styles.selectedOption
            ]}
            onTouchEnd={() => onChange(option.key)}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionRisk}>{option.risk}</Text>
          </Card>
        ))}
      </View>
    </Card>
  );
}

function TriggersStep({ value, onChange }: { value?: string[]; onChange: (value: string[]) => void }) {
  const toggleTrigger = (trigger: string) => {
    const current = value || [];
    if (current.includes(trigger)) {
      onChange(current.filter(t => t !== trigger));
    } else {
      onChange([...current, trigger]);
    }
  };

  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>What makes you want to smoke/vape?</Text>
      <Text style={styles.description}>
        Select all that apply - we'll build strategies for each trigger
      </Text>
      
      <View style={styles.pillOptions}>
        {[
          { key: 'stress', label: '😰 Stress' },
          { key: 'boredom', label: '😴 Boredom' },
          { key: 'social', label: '👥 Social situations' },
          { key: 'routine', label: '🔄 Daily routines' },
          { key: 'anger', label: '😠 Anger/frustration' },
          { key: 'alcohol', label: '🍺 Drinking' },
        ].map((option) => (
          <PillChoice
            key={option.key}
            selected={(value || []).includes(option.key)}
            onPress={() => toggleTrigger(option.key)}
            style={styles.pillOption}
          >
            {option.label}
          </PillChoice>
        ))}
      </View>
    </Card>
  );
}

function SocialContextStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>Do people around you smoke/vape?</Text>
      <Text style={styles.description}>
        Social environment affects quit success - we'll plan accordingly
      </Text>
      
      <View style={styles.pillOptions}>
        {[
          { key: 'daily', label: 'Yes, daily' },
          { key: 'sometimes', label: 'Sometimes' },
          { key: 'rarely', label: 'Rarely' },
          { key: 'never', label: 'Never' },
        ].map((option) => (
          <PillChoice
            key={option.key}
            selected={value === option.key}
            onPress={() => onChange(option.key)}
            style={styles.pillOption}
          >
            {option.label}
          </PillChoice>
        ))}
      </View>
    </Card>
  );
}

function StressLevelStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>How would you rate your stress level?</Text>
      <Text style={styles.description}>
        High stress can make quitting harder - we'll include extra support
      </Text>
      
      <View style={styles.pillOptions}>
        {[
          { key: 'high', label: '🔴 High stress' },
          { key: 'medium', label: '🟡 Moderate stress' },
          { key: 'low', label: '🟢 Low stress' },
        ].map((option) => (
          <PillChoice
            key={option.key}
            selected={value === option.key}
            onPress={() => onChange(option.key)}
            style={styles.pillOption}
          >
            {option.label}
          </PillChoice>
        ))}
      </View>
    </Card>
  );
}

function SleepQualityStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>How's your sleep quality?</Text>
      <Text style={styles.description}>
        Poor sleep can trigger cravings - we'll address this in your plan
      </Text>
      
      <View style={styles.pillOptions}>
        {[
          { key: 'poor', label: '😴 Poor sleep' },
          { key: 'fair', label: '😐 Fair sleep' },
          { key: 'good', label: '😊 Good sleep' },
        ].map((option) => (
          <PillChoice
            key={option.key}
            selected={value === option.key}
            onPress={() => onChange(option.key)}
            style={styles.pillOption}
          >
            {option.label}
          </PillChoice>
        ))}
      </View>
    </Card>
  );
}

function PreviousAttemptsStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>Have you tried quitting before?</Text>
      <Text style={styles.description}>
        Previous attempts teach us what works and what doesn't
      </Text>
      
      <View style={styles.pillOptions}>
        {[
          { key: 'never', label: 'Never tried' },
          { key: 'once', label: 'Tried once' },
          { key: 'multiple', label: 'Multiple attempts' },
        ].map((option) => (
          <PillChoice
            key={option.key}
            selected={value === option.key}
            onPress={() => onChange(option.key)}
            style={styles.pillOption}
          >
            {option.label}
          </PillChoice>
        ))}
      </View>
    </Card>
  );
}

function QuitTimelineStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>When do you want to quit?</Text>
      <Text style={styles.description}>
        Setting a specific date increases your chances of success
      </Text>
      
      <View style={styles.pillOptions}>
        {[
          { key: 'today', label: '🎯 Today' },
          { key: 'this-week', label: '📅 This week' },
          { key: 'next-week', label: '⏭️ Next week' },
          { key: 'this-month', label: '📆 This month' },
        ].map((option) => (
          <PillChoice
            key={option.key}
            selected={value === option.key}
            onPress={() => onChange(option.key)}
            style={styles.pillOption}
          >
            {option.label}
          </PillChoice>
        ))}
      </View>
    </Card>
  );
}

function NRTInterestStep({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.question}>Interested in nicotine replacement therapy?</Text>
      <Text style={styles.description}>
        NRT (patches, gum, lozenges) can double your success rate
      </Text>
      
      <View style={styles.pillOptions}>
        {[
          { key: 'yes', label: '✅ Yes, tell me more' },
          { key: 'maybe', label: '🤔 Maybe' },
          { key: 'no', label: '❌ No thanks' },
          { key: 'already-using', label: '💊 Already using' },
        ].map((option) => (
          <PillChoice
            key={option.key}
            selected={value === option.key}
            onPress={() => onChange(option.key)}
            style={styles.pillOption}
          >
            {option.label}
          </PillChoice>
        ))}
      </View>
    </Card>
  );
}

function FinalStep() {
  return (
    <Card style={styles.questionCard}>
      <Text style={styles.finalIcon}>🎉</Text>
      <Text style={styles.question}>Perfect! Your plan is ready</Text>
      <Text style={styles.description}>
        We're creating a personalized quit plan based on your responses. 
        This includes your risk assessment, day-0 checklist, and recommended tools.
      </Text>
      
      <View style={styles.finalStats}>
        <Text style={styles.finalStat}>✨ Personalized strategies</Text>
        <Text style={styles.finalStat}>🛠️ Custom tool recommendations</Text>
        <Text style={styles.finalStat}>📋 Day-0 action plan</Text>
        <Text style={styles.finalStat}>💊 NRT guidance (if interested)</Text>
      </View>
    </Card>
  );
}

// Helper functions
function getQuestionConfig(step: number) {
  const configs = {
    1: { key: 'primaryMotivation', required: true },
    2: { key: 'substanceType', required: true },
    3: { key: 'usageAmount', required: true },
    4: { key: 'firstUseTime', required: true },
    5: { key: 'triggers', required: false },
    6: { key: 'socialContext', required: false },
    7: { key: 'stressLevel', required: false },
    8: { key: 'sleepQuality', required: false },
    9: { key: 'previousAttempts', required: false },
    10: { key: 'quitTimeline', required: true },
    11: { key: 'nrtInterest', required: false },
    12: { key: 'final', required: false },
  };
  return configs[step as keyof typeof configs] || { key: '', required: false };
}

function getEncouragementMessage(step: number): string {
  const messages = [
    '', '', '', '', '', '',
    "You're doing great! 🌟",
    "Almost halfway there! 💪",
    "Great progress! 🚀",
    "You're almost done! ⭐",
    "Final questions! 🎯",
    "Perfect! 🎉"
  ];
  return messages[step] || '';
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
    marginBottom: Theme.spacing.sm,
  },
  stepCounter: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  encouragement: {
    ...Theme.typography.callout,
    color: Theme.colors.purple[500],
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Theme.layout.screenPadding,
  },
  questionCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  question: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  description: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xl,
  },
  optionsGrid: {
    gap: Theme.spacing.md,
  },
  optionCard: {
    padding: Theme.spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: Theme.colors.purple[500],
    backgroundColor: Theme.colors.purple[500] + '10',
  },
  optionLabel: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  optionDesc: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
  },
  optionRisk: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  pillOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    justifyContent: 'center',
  },
  pillOption: {
    marginBottom: Theme.spacing.sm,
  },
  finalIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  finalStats: {
    gap: Theme.spacing.md,
    alignItems: 'center',
  },
  finalStat: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
  },
  footer: {
    padding: Theme.layout.screenPadding,
    gap: Theme.spacing.md,
  },
  skipButton: {
    marginTop: Theme.spacing.xs,
  },
});