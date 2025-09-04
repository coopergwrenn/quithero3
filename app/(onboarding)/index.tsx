import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, ProgressBar } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { generatePersonalizedPlan, assignUserBadge, calculateVapingDependency } from '@/src/utils/personalization';
import { analytics } from '@/src/services/analytics';
import { profileService } from '@/src/services/profileService';
import { supabase } from '@/src/lib/supabase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure WebBrowser for better UX
WebBrowser.maybeCompleteAuthSession();

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
  
  const [showAuth, setShowAuth] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [authMethod, setAuthMethod] = useState<string | null>(null);
  
  console.log('🔍 Debug - showAuth:', showAuth, 'authMethod:', authMethod);
  const [otpCode, setOtpCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({ code: '+1', flag: '🇺🇸', name: 'United States' });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Comprehensive countries list for global reach
  const countries = [
    // North America
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+1', flag: '🇨🇦', name: 'Canada' },
    
    // Europe (Major Markets)
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: '+34', flag: '🇪🇸', name: 'Spain' },
    { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
    { code: '+46', flag: '🇸🇪', name: 'Sweden' },
    { code: '+47', flag: '🇳🇴', name: 'Norway' },
    { code: '+45', flag: '🇩🇰', name: 'Denmark' },
    { code: '+358', flag: '🇫🇮', name: 'Finland' },
    { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
    { code: '+43', flag: '🇦🇹', name: 'Austria' },
    { code: '+32', flag: '🇧🇪', name: 'Belgium' },
    { code: '+48', flag: '🇵🇱', name: 'Poland' },
    { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
    { code: '+353', flag: '🇮🇪', name: 'Ireland' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal' },
    
    // Asia Pacific
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
    { code: '+81', flag: '🇯🇵', name: 'Japan' },
    { code: '+82', flag: '🇰🇷', name: 'South Korea' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore' },
    { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
    { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
    
    // Major Emerging Markets
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+86', flag: '🇨🇳', name: 'China' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil' },
    { code: '+52', flag: '🇲🇽', name: 'Mexico' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    
    // Middle East & Africa
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+972', flag: '🇮🇱', name: 'Israel' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+20', flag: '🇪🇬', name: 'Egypt' },
    
    // Additional European
    { code: '+7', flag: '🇷🇺', name: 'Russia' },
    { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
    { code: '+90', flag: '🇹🇷', name: 'Turkey' },
    { code: '+30', flag: '🇬🇷', name: 'Greece' },
    
    // Southeast Asia
    { code: '+66', flag: '🇹🇭', name: 'Thailand' },
    { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
    { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
    { code: '+63', flag: '🇵🇭', name: 'Philippines' },
    { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  ];

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  );
  
  // Debug logging
  console.log('Search term:', countrySearch);
  console.log('Filtered results:', filteredCountries.length);

  // Format phone number with selected country code
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Return country code + digits (no additional formatting)
    if (digits.length > 0) {
      return `${selectedCountry.code}${digits}`;
    }
    
    return selectedCountry.code; // Show country code even when empty
  };
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [dependencyResults, setDependencyResults] = useState<any>(null);

  useEffect(() => {
    analytics.trackOnboardingStarted();
    
    // Listen for auth state changes (for Google OAuth completion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in:', session.user.email);
          
          // Store user info locally
          await AsyncStorage.setItem('userInfo', JSON.stringify({
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email
          }));
          
          // Close auth modal and proceed to onboarding
          setShowAuth(false);
          Alert.alert('Success', 'Successfully signed in with Google!');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = (currentStep + 1) / ONBOARDING_STEPS.length;

  const signInWithGoogle = async () => {
    console.log('🔵 Google button tapped!');
    setAuthLoading(true);
    
    try {
      // Create redirect URI for OAuth flow
      const redirectTo = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      console.log('Starting Google OAuth with redirect URI:', redirectTo);

      // Use Supabase's built-in OAuth method
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log('✅ Google OAuth initiated successfully');
      console.log('OAuth data:', data);
      
      if (data?.url) {
        console.log('🌐 Opening OAuth URL:', data.url);
        
        // Open the OAuth URL using WebBrowser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        console.log('OAuth result:', result);

        if (result.type === 'success') {
          console.log('✅ OAuth completed successfully');
        } else if (result.type === 'cancel') {
          console.log('❌ OAuth was cancelled by user');
        }
      } else {
        console.log('❌ No OAuth URL received in data');
        throw new Error('No OAuth URL received');
      }
      
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert('Error', 'Failed to start Google sign-in. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithEmail = async () => {
    if (!userInfo.email || !userInfo.name) return;
    setAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: userInfo.email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: userInfo.name
          }
        }
      });
      
      if (error) throw error;
      
      // Store user info locally for immediate use
      await AsyncStorage.setItem('userInfo', JSON.stringify({
        name: userInfo.name,
        email: userInfo.email
      }));
      
      console.log('✅ Email OTP sent (should be 6-digit code)');
      setAuthMethod('email_otp');
      Alert.alert('6-Digit Code Sent', 'Check your email for a 6-digit verification code (not a link).');
      
    } catch (error) {
      console.error('Email auth error:', error);
      
      // Handle rate limiting
      if (error.message?.includes('3 seconds')) {
        Alert.alert('Please Wait', 'For security, please wait a few seconds before trying again.');
      } else if (error.message?.includes('rate')) {
        Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.');
      } else {
        Alert.alert('Error', 'Email sign-up failed. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!otpCode || otpCode.length !== 6) return;
    setAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: userInfo.email,
        token: otpCode,
        type: 'email'
      });
      
      if (error) throw error;
      
      console.log('✅ Email verification successful');
      setShowAuth(false);
      Alert.alert('Success', 'Email verified successfully!');
      
    } catch (error) {
      console.error('Email verification error:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!otpCode || otpCode.length !== 6) return;
    setAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: userInfo.phone,
        token: otpCode,
        type: 'sms'
      });
      
      if (error) throw error;
      
      console.log('✅ SMS verification successful');
      setShowAuth(false);
      Alert.alert('Success', 'Phone verified successfully!');
      
    } catch (error) {
      console.error('SMS verification error:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithPhone = async () => {
    if (!userInfo.phone || !userInfo.name) return;
    setAuthLoading(true);
    
    try {
      // Phone is already formatted in real-time by formatPhoneNumber
      const formattedPhone = userInfo.phone;
      console.log('Using pre-formatted phone:', formattedPhone);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            name: userInfo.name
          }
        }
      });
      
      if (error) throw error;
      
      // Store user info locally for immediate use
      await AsyncStorage.setItem('userInfo', JSON.stringify({
        name: userInfo.name,
        phone: userInfo.phone
      }));
      
      console.log('✅ SMS verification sent');
      setAuthMethod('phone_otp');
      Alert.alert('6-Digit Code Sent', 'Check your phone for a 6-digit verification code.');
      
    } catch (error) {
      console.error('Phone auth error:', error);
      
      // Handle rate limiting
      if (error.message?.includes('3 seconds')) {
        Alert.alert('Please Wait', 'For security, please wait a few seconds before trying again.');
      } else if (error.message?.includes('rate')) {
        Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.');
      } else {
        Alert.alert('Error', 'Phone sign-up failed. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

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

  const handleOnboardingComplete = async (responses: Record<string, any>) => {
    // Calculate dependency score using responses
    const results = calculateVapingDependency(responses);
    setDependencyResults(results);
    
    // Include user registration info in responses
    const completeResponses = {
      ...responses,
      userInfo,
    };
    
    // TODO: Add authentication and Supabase saving later
    // For now, just do analytics and local storage
    analytics.track('Onboarding_Completed', {
      dependencyScore: results.total,
      riskLevel: results.riskLevel,
      badgeType: responses.userBadge?.type,
      userName: userInfo.name,
      userEmail: userInfo.email,
    });

    // Generate personalized plan
    const personalizedPlan = generatePersonalizedPlan(responses);
    
    // Update quit store with all data
    updateQuitData({
      ...completeResponses,
      personalizedPlan,
      dependencyResults: results,
      usageAmount: parseInt(responses.usageAmount) || 0,
    });

    completeOnboarding();
    setShowResults(true);
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
      handleOnboardingComplete(newResponses);
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

  // Render authentication screen
  const renderAuthScreen = () => (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authHeader}>
        <Text style={styles.authTitle}>Let's create your personalized quit plan</Text>
        <Text style={styles.authSubtitle}>Join thousands who've quit vaping with QuitHero</Text>
      </View>

      {authMethod === null && (
        <View style={styles.authButtons}>
          <TouchableOpacity 
            style={[styles.googleButton, authLoading && styles.disabledButton]}
            onPress={() => {
              console.log('🔵 Google button tapped! authLoading:', authLoading);
              signInWithGoogle();
            }}
            disabled={authLoading}
          >
            {authLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#1a1a2e" style={{ marginRight: 8 }} />
                <Text style={styles.googleButtonText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.googleButtonText}>📱 Continue with Google</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.emailButton}
            onPress={() => setAuthMethod('email')}
          >
            <Text style={styles.emailButtonText}>✉️ Continue with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.phoneButton}
            onPress={() => setAuthMethod('phone')}
          >
            <Text style={styles.phoneButtonText}>📞 Continue with Phone</Text>
          </TouchableOpacity>
        </View>
      )}

      {authMethod === 'email' && (
        <View style={styles.emailForm}>
          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor="#9ca3af"
            value={userInfo.name}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, name: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#9ca3af"
            value={userInfo.email}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={[styles.continueButton, (!userInfo.name || !userInfo.email || authLoading) && styles.disabledButton]}
            onPress={signInWithEmail}
            disabled={!userInfo.name || !userInfo.email || authLoading}
          >
            <Text style={styles.continueButtonText}>
              {authLoading ? 'Sending Code...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAuthMethod(null)}>
            <Text style={styles.backText}>← Back to options</Text>
          </TouchableOpacity>
        </View>
      )}

      {authMethod === 'email_otp' && (
        <View style={styles.emailForm}>
          <Text style={styles.otpTitle}>Enter Verification Code</Text>
          <Text style={styles.otpSubtitle}>We sent a 6-digit code to {userInfo.email}</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            placeholderTextColor="#9ca3af"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />
          <TouchableOpacity 
            style={[styles.continueButton, (otpCode.length !== 6 || authLoading) && styles.disabledButton]}
            onPress={verifyEmailOtp}
            disabled={otpCode.length !== 6 || authLoading}
          >
            <Text style={styles.continueButtonText}>
              {authLoading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setAuthMethod('email');
            setOtpCode('');
          }}>
            <Text style={styles.backText}>← Back to email</Text>
          </TouchableOpacity>
        </View>
      )}

      {authMethod === 'phone_otp' && (
        <View style={styles.emailForm}>
          <Text style={styles.otpTitle}>Enter Verification Code</Text>
          <Text style={styles.otpSubtitle}>We sent a 6-digit code to {userInfo.phone}</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            placeholderTextColor="#9ca3af"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />
          <TouchableOpacity 
            style={[styles.continueButton, (otpCode.length !== 6 || authLoading) && styles.disabledButton]}
            onPress={verifyPhoneOtp}
            disabled={otpCode.length !== 6 || authLoading}
          >
            <Text style={styles.continueButtonText}>
              {authLoading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setAuthMethod('phone');
            setOtpCode('');
          }}>
            <Text style={styles.backText}>← Back to phone</Text>
          </TouchableOpacity>
        </View>
      )}

      {authMethod === 'phone' && (
        <View style={styles.phoneForm}>
          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor="#9ca3af"
            value={userInfo.name}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, name: text }))}
          />
          {/* Phone Number with Country Picker */}
          <View style={styles.phoneContainer}>
            <TouchableOpacity 
              style={styles.countryButton}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.flagText}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.phoneInput}
              placeholder="503 354 4840"
              placeholderTextColor="#9ca3af"
              value={userInfo.phone.replace(selectedCountry.code, '')}
              onChangeText={(text) => {
                // Format with selected country code
                const formatted = formatPhoneNumber(text);
                setUserInfo(prev => ({ ...prev, phone: formatted }));
              }}
              keyboardType="phone-pad"
            />
          </View>

          {/* Country Picker Modal */}
          {showCountryPicker && (
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Country</Text>
                  <TouchableOpacity onPress={() => {
                    setShowCountryPicker(false);
                    setCountrySearch(''); // Reset search when closing
                  }}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search countries..."
                    placeholderTextColor="#9CA3AF"
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                    autoCapitalize="none"
                  />
                </View>
                
                <ScrollView style={styles.countryList} showsVerticalScrollIndicator={true}>
                  {filteredCountries.map((country) => (
                    <TouchableOpacity
                      key={`${country.code}-${country.name}`}
                      style={styles.countryOption}
                      onPress={() => {
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                        setCountrySearch(''); // Reset search
                        // Update phone number with new country code
                        const digits = userInfo.phone.replace(/\D/g, '');
                        setUserInfo(prev => ({ ...prev, phone: `${country.code}${digits}` }));
                      }}
                    >
                      <Text style={styles.flagText}>{country.flag}</Text>
                      <Text style={styles.countryName}>{country.name}</Text>
                      <Text style={styles.countryCodeOption}>{country.code}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredCountries.length === 0 && (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No countries found</Text>
                      <Text style={styles.noResultsSubtext}>Try adjusting your search</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.continueButton, (!userInfo.name || !userInfo.phone || authLoading) && styles.disabledButton]}
            onPress={signInWithPhone}
            disabled={!userInfo.name || !userInfo.phone || authLoading}
          >
            <Text style={styles.continueButtonText}>
              {authLoading ? 'Sending SMS...' : 'Send Verification Code'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAuthMethod(null)}>
            <Text style={styles.backText}>← Back to options</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.privacyText}>
        Your data is private and secure. We never share personal information.
      </Text>
    </SafeAreaView>
  );

  // Show authentication first
  if (showAuth) {
    return renderAuthScreen();
  }

  // Render the dependency results screen
  const renderResultsScreen = () => {
    if (!dependencyResults || !responses.userBadge) return null;
    
    const { total, riskLevel, riskDescription, breakdown } = dependencyResults;
    const { displayName, description } = responses.userBadge;
    
    return (
      <ScrollView style={styles.container}>
        {/* Header with badge identity */}
        <View style={styles.headerSection}>
          <Text style={styles.badgeTitle}>Your Results, {displayName}</Text>
          <Text style={styles.badgeDescription}>{description}</Text>
        </View>

        {/* Dependency Score - The QUITTR Hook */}
        <View style={[styles.scoreCard, { 
          backgroundColor: riskLevel === 'Critical' ? '#dc2626' : 
                          riskLevel === 'High' ? '#ea580c' : 
                          riskLevel === 'Moderate' ? '#f59e0b' : '#16a34a' 
        }]}>
          <Text style={styles.scoreTitle}>Your Vaping Dependency Score</Text>
          <Text style={styles.scoreNumber}>{total}%</Text>
          <Text style={styles.scoreComparison}>vs 31% average</Text>
          <Text style={styles.riskLevel}>Risk Level: {riskLevel}</Text>
        </View>

        {/* Risk Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.riskDescription}>{riskDescription}</Text>
          <Text style={styles.riskSubtext}>
            But that also means you have the most to gain from breaking free.
          </Text>
        </View>

        {/* Personalized Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Your Biggest Challenges:</Text>
          <View style={styles.challengeList}>
            {breakdown.morningDependency >= 20 && (
              <Text style={styles.challengeItem}>• Morning dependency - You need immediate support upon waking</Text>
            )}
            {breakdown.usageFrequency >= 20 && (
              <Text style={styles.challengeItem}>• Frequent urges - You'll need crisis tools throughout the day</Text>
            )}
            {breakdown.behavioralCompulsion >= 15 && (
              <Text style={styles.challengeItem}>• Compulsive use - This isn't about willpower, it's about rewiring habits</Text>
            )}
            {breakdown.struggleCount >= 10 && (
              <Text style={styles.challengeItem}>• Multiple impact areas - Comprehensive support is essential</Text>
            )}
          </View>
        </View>

        {/* Social Proof */}
        <View style={styles.socialProofSection}>
          <Text style={styles.sectionTitle}>Other {displayName}s with {riskLevel} dependency report:</Text>
          <Text style={styles.testimonial}>
            "I haven't craved my vape in 3 months" - Sarah, VapeBreaker
          </Text>
          <Text style={styles.testimonial}>
            "My breathing improved so much faster than expected" - Mike, CloudWarrior
          </Text>
        </View>

        {/* Your Personalized Plan Preview */}
        <View style={styles.planPreviewSection}>
          <Text style={styles.sectionTitle}>Your {displayName} Success Plan:</Text>
          <View style={styles.planItems}>
            <Text style={styles.planItem}>🎯 Recommended quit date: 3-7 days (based on your readiness)</Text>
            <Text style={styles.planItem}>🚨 Priority tools: Panic mode, breathing exercises, urge timer</Text>
            <Text style={styles.planItem}>💪 {riskLevel} risk support: 24/7 community + crisis intervention</Text>
            <Text style={styles.planItem}>📈 Expected timeline: Cravings peak day 3-5, major improvement week 2</Text>
          </View>
        </View>

        {/* CTA to paywall */}
        <TouchableOpacity 
          style={styles.resultsButton}
          onPress={() => router.push('/(paywall)/paywall')}
        >
          <Text style={styles.resultsButtonText}>
            Get Your {displayName} Plan - Less Than Weekly Vape Cost
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Show results screen if completed
  if (showResults) {
    return renderResultsScreen();
  }

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
  headerSection: {
    padding: Theme.layout.screenPadding,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  scoreCard: {
    backgroundColor: '#dc2626',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreNumber: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreComparison: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  riskLevel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  descriptionCard: {
    backgroundColor: Theme.colors.dark.surface,
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  riskDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  riskSubtext: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  insightsSection: {
    padding: 16,
    margin: 16,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 12,
  },
  challengeList: {
    gap: 8,
  },
  challengeItem: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  socialProofSection: {
    padding: 16,
    margin: 16,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 8,
  },
  testimonial: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 8,
    paddingLeft: 16,
  },
  planPreviewSection: {
    padding: 16,
    margin: 16,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 8,
  },
  planItems: {
    gap: 8,
  },
  planItem: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    lineHeight: 20,
  },
  resultsButton: {
    backgroundColor: Theme.colors.purple[500],
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  authButtons: {
    marginBottom: 32,
  },
  googleButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  emailButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  phoneButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  phoneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  emailForm: {
    marginBottom: 32,
  },
  phoneForm: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#1a1a2e',
  },
  continueButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#6b7280',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  backText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  privacyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  // Country Picker Styles
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 1,
    borderRightColor: '#4B5563',
  },
  flagText: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCode: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  dropdownArrow: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#374151',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    width: '90%',
    height: 500,
    margin: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  pickerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  searchInput: {
    backgroundColor: '#374151',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  countryList: {
    flex: 1,
    minHeight: 200,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  countryName: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  countryCodeOption: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  noResultsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  noResultsSubtext: {
    color: '#6B7280',
    fontSize: 14,
  },
});