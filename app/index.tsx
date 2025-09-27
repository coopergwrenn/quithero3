import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground, StatusBar } from 'react-native';
import { Link } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Theme } from '@/src/design-system/theme';
import { Button, PillChoice, Card } from '@/src/design-system/components';
import { ComplianceModal } from '@/src/components/ComplianceModal';
import { analytics } from '@/src/services/analytics';

export default function LandingScreen() {
  const [showCompliance, setShowCompliance] = useState(false);
  const [complianceAccepted, setComplianceAccepted] = useState(false);

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

  const handleTryTool = () => {
    if (!complianceAccepted) {
      setShowCompliance(true);
      return;
    }
    analytics.trackHeroCTAClick('try_tool');
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

  return (
    <ImageBackground
      source={require('@/assets/images/backgrounds/tropical-night.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <ComplianceModal
          visible={showCompliance}
          onAccept={handleComplianceAccept}
          onDecline={handleComplianceDecline}
        />
        
        <View style={styles.content}>
        {/* Top Section - Hero + Social Proof */}
        <View style={styles.topSection}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.title}>
              Your personalized{'\n'}
              <Text style={styles.titleAccent}>quit plan</Text>
            </Text>
            
            <Text style={styles.subtitle}>
              Evidence-based tools and support for the hardest moments
            </Text>

            {/* Trust Signals */}
            <View style={styles.trustChips}>
              <PillChoice selected={false}>🔒 Private</PillChoice>
              <PillChoice selected={false}>⚡ Under 90s</PillChoice>
              <PillChoice selected={false}>✨ No account</PillChoice>
            </View>
          </View>

          {/* Social Proof */}
          <BlurView intensity={20} style={styles.proofCard}>
            <Text style={styles.proofStat}>3x</Text>
            <Text style={styles.proofLabel}>higher success rate with personalized plans</Text>
            <Text style={styles.proofSource}>Based on clinical research</Text>
          </BlurView>
        </View>

        {/* Middle Section - Value Props */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🚨</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Panic Mode</Text>
              <Text style={styles.featureDescription}>
                60-second emergency protocol for intense cravings
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🧠</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Science-Backed</Text>
              <Text style={styles.featureDescription}>
                Built on ACT/CBT frameworks proven in clinical trials
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Track Progress</Text>
              <Text style={styles.featureDescription}>
                Watch your health improve and money saved in real-time
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Section - CTAs */}
        <View style={styles.bottomSection}>
          <View style={styles.cta}>
            <Link href="/(onboarding)" asChild>
              <Button variant="primary" size="lg" fullWidth onPress={handleStartPlan}>
                Start Your Plan
              </Button>
            </Link>
            
            <Link href="/(app)/(tabs)/tools" asChild>
              <Button variant="ghost" size="md" style={styles.secondaryCta} onPress={handleTryTool}>
                Try a panic tool first
              </Button>
            </Link>
          </View>

          {/* Final Trust Signal */}
          <Text style={styles.disclaimer}>
            Free to start • No credit card • Complete privacy
          </Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 20, 38, 0.7)', // Dark overlay to ensure text readability
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg, // 24px - Rule of 4
    paddingTop: Theme.spacing.xl, // More top padding for better balance
    justifyContent: 'space-between', // Distribute content evenly
  },
  topSection: {
    // Top section with hero and social proof
  },
  bottomSection: {
    // Bottom section with CTA and disclaimer
  },
  hero: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl, // 32px - More space after hero
  },
  title: {
    ...Theme.typography.largeTitle, // Back to largest title size
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg, // 24px - More space since we removed a line
    lineHeight: 38, // Better line height for larger text
    fontWeight: '700',
  },
  titleAccent: {
    color: Theme.colors.purple[500],
    fontSize: 40, // Larger than the base largeTitle (34px)
    fontWeight: '800', // Even bolder for more impact
  },
  subtitle: {
    ...Theme.typography.title3, // Slightly larger since we have more space
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg, // 24px - More space
    lineHeight: 26,
    fontWeight: '400',
  },
  trustChips: {
    flexDirection: 'row',
    gap: Theme.spacing.sm, // 8px - Rule of 4
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  proofCard: {
    padding: Theme.spacing.lg, // 24px - Better padding for visual impact
    alignItems: 'center',
    marginBottom: Theme.spacing.xl, // 32px - More space after social proof
    backgroundColor: 'rgba(30, 42, 58, 0.3)', // Glassmorphism background
    backdropFilter: 'blur(20px)', // iOS blur effect
    borderRadius: Theme.borderRadius.lg, // 20px - Clean rounded corners
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle glass border
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8, // Android shadow
    overflow: 'hidden', // Ensures blur effect respects border radius
  },
  proofStat: {
    ...Theme.typography.title1, // Slightly smaller
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs, // 4px - Rule of 4
    fontWeight: '700',
  },
  proofLabel: {
    ...Theme.typography.subheadline, // Smaller text
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs, // 4px - Rule of 4
  },
  proofSource: {
    ...Theme.typography.caption1, // Even smaller
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  features: {
    gap: Theme.spacing.lg, // 24px - Better spacing between features
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 24, // Smaller icon
    marginRight: Theme.spacing.md, // 16px - Rule of 4
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Theme.typography.subheadline, // Smaller title
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs, // 4px - Rule of 4
    fontWeight: '600',
  },
  featureDescription: {
    ...Theme.typography.caption1, // Smaller description
    color: Theme.colors.text.secondary,
    lineHeight: 16,
  },
  cta: {
    gap: Theme.spacing.md, // 16px - Better gap between buttons
    alignItems: 'center',
    marginTop: Theme.spacing.xl, // 32px - Space above CTA section
  },
  secondaryCta: {
    marginTop: 0, // Remove extra margin
  },
  disclaimer: {
    ...Theme.typography.caption2, // Smallest text
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: Theme.spacing.md, // 16px top margin
  },
});