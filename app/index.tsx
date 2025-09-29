import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground, StatusBar, Image } from 'react-native';
import { Link } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { Theme } from '@/src/design-system/theme';
import { Button, PillChoice, Card } from '@/src/design-system/components';
import { ComplianceModal } from '@/src/components/ComplianceModal';
import { analytics } from '@/src/services/analytics';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function LandingScreen() {
  const [showCompliance, setShowCompliance] = useState(false);
  const [complianceAccepted, setComplianceAccepted] = useState(false);

  // Load Poppins fonts properly
  let [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-ExtraBold': Poppins_800ExtraBold,
  });

  useEffect(() => {
    analytics.trackLandingView();
    
    // Check if user has already accepted compliance
    // In a real app, you'd check AsyncStorage or similar
    const hasAcceptedCompliance = false; // This would be loaded from storage
    if (!hasAcceptedCompliance) {
      setShowCompliance(true);
    } else {
      setComplianceAccepted(true);
    }
  }, []);

  const handleStartPlan = () => {
    if (!complianceAccepted) {
      setShowCompliance(true);
      return;
    }
    analytics.trackHeroCTAClick('start_plan');
  };


  const handleComplianceAccept = () => {
    setComplianceAccepted(true);
    setShowCompliance(false);
    // In a real app, you'd save this to AsyncStorage
    analytics.track('compliance_accepted');
  };

  const handleComplianceDecline = () => {
    setShowCompliance(false);
    analytics.track('compliance_declined');
    // Could show a message about needing to accept to continue
  };

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground
        source={require('@/assets/images/backgrounds/tropical-night-v2.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <ComplianceModal
          visible={showCompliance}
          onAccept={handleComplianceAccept}
          onDecline={handleComplianceDecline}
        />
        
        <View style={styles.content}>
          {/* Logo/Brand at top */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>QUITHERO</Text>
          </View>
          
          {/* Center Content with Emblem */}
          <View style={styles.centerContentWrapper}>
            <View style={styles.centerContent}>
              <Text style={styles.welcome}>Welcome!</Text>
              
              <Text style={styles.mainMessage}>
                Let's start by creating your{'\n'}
                personalized <Text style={styles.accent}>quit plan</Text>
              </Text>
            </View>

            {/* Star Rating with Laurels - Positioned directly under subtitle */}
            <Image 
              source={require('@/assets/images/emblems/star-rating-laurels.png')}
              style={styles.starRatingImage}
              resizeMode="contain"
            />
          </View>

          {/* Bottom CTA Section */}
          <View style={styles.bottomSection}>
            <Link href="/(onboarding)" asChild>
              <Button variant="primary" size="lg" fullWidth onPress={handleStartPlan}>
                Start Quiz
              </Button>
            </Link>
            
            <Link href="/(auth)/signin" asChild>
              <Text style={styles.secondaryLink}>Already have an account?</Text>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Make container transparent so background shows through
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 0, // No top padding to move logo to the very top
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 10, // Much less padding to move logo way up
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Poppins-ExtraBold',
    color: Theme.colors.text.primary,
    letterSpacing: 2,
  },
  centerContentWrapper: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  centerContent: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    width: '100%',
  },
  welcome: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: Theme.colors.text.primary,
    textAlign: 'left',
    marginBottom: 8, // Even tighter spacing (rule of 4: 8px = 2 × 4px)
  },
  mainMessage: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: Theme.colors.text.primary,
    textAlign: 'left',
    lineHeight: 28,
    marginBottom: 0, // Remove bottom margin so emblem sits directly under text
  },
  accent: {
    color: Theme.colors.purple[500],
    fontFamily: 'Poppins-SemiBold',
  },
  starRatingImage: {
    width: 280, // Much larger like QUITTR
    height: 80, // Taller like QUITTR
    alignSelf: 'flex-start', // Left align
    marginLeft: -80, // Much more aggressive negative margin to reach true left edge
    marginTop: 16, // Tight spacing after subtitle text like QUITTR
    marginBottom: 0, // No bottom margin
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  secondaryLink: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 24,
    textDecorationLine: 'underline',
  },
});