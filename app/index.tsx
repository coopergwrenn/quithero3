import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
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
    <SafeAreaView style={styles.container}>
      <ComplianceModal
        visible={showCompliance}
        onAccept={handleComplianceAccept}
        onDecline={handleComplianceDecline}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.title}>
              Your personalized{'\n'}
              <Text style={styles.titleAccent}>quit plan</Text>{'\n'}
              in 90 seconds
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
          <Card style={styles.proofCard}>
            <Text style={styles.proofStat}>3x</Text>
            <Text style={styles.proofLabel}>higher success rate with personalized plans</Text>
            <Text style={styles.proofSource}>Based on clinical research</Text>
          </Card>

          {/* Value Props */}
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

          {/* CTAs */}
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
    paddingTop: Theme.spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxxl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 42,
  },
  titleAccent: {
    color: Theme.colors.purple[500],
  },
  subtitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 28,
    fontWeight: '400',
  },
  trustChips: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  proofCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xxxl,
    variant: 'elevated',
  },
  proofStat: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
    fontWeight: '700',
  },
  proofLabel: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  proofSource: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  features: {
    gap: Theme.spacing.xl,
    marginBottom: Theme.spacing.xxxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: Theme.spacing.lg,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  featureDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  cta: {
    gap: Theme.spacing.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  secondaryCta: {
    marginTop: Theme.spacing.xs,
  },
  disclaimer: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
});