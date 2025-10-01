import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { Theme } from '@/src/design-system/theme';
import { Button, Card } from '@/src/design-system/components';

interface ComplianceModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ComplianceModal({ visible, onAccept, onDecline }: ComplianceModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  
  // Auto-enable after 3 seconds as fallback for scroll detection issues
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setHasScrolledToBottom(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // More generous threshold for detecting bottom scroll
    const threshold = 50;
    const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold;
    setHasScrolledToBottom(isScrolledToBottom);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Important Information</Text>
          <Text style={styles.subtitle}>Please read before continuing</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
          bounces={false}
        >
          {/* Age Verification */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🔞 Age Verification</Text>
            <Text style={styles.sectionText}>
              You must be at least 16 years old to use QuitHero. This app is designed for individuals 
              who are currently using tobacco or nicotine products and want to quit.
            </Text>
          </Card>

          {/* Medical Disclaimer */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>⚕️ Medical Disclaimer</Text>
            <Text style={styles.sectionText}>
              QuitHero is not a medical device or treatment. This app provides educational information 
              and behavioral support tools only. It is not intended to diagnose, treat, cure, or prevent 
              any disease.
              {'\n\n'}
              <Text style={styles.bold}>Nicotine Replacement Therapy (NRT):</Text> Any information about 
              NRT products is for educational purposes only. Always consult with a healthcare provider 
              before starting any NRT regimen. NRT products may have side effects and contraindications.
              {'\n\n'}
              <Text style={styles.bold}>Medical Consultation:</Text> If you have underlying health conditions, 
              are pregnant, breastfeeding, or taking medications, consult your doctor before quitting smoking 
              or using this app.
            </Text>
          </Card>

          {/* Crisis Resources */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🆘 Crisis Resources</Text>
            <Text style={styles.sectionText}>
              If you're experiencing a mental health crisis or having thoughts of self-harm:
              {'\n\n'}
              • <Text style={styles.bold}>US:</Text> Call 988 (Suicide & Crisis Lifeline)
              {'\n'}• <Text style={styles.bold}>US:</Text> Text HOME to 741741 (Crisis Text Line)
              {'\n'}• <Text style={styles.bold}>Quitline:</Text> 1-800-QUIT-NOW (1-800-784-8669)
              {'\n\n'}
              QuitHero's tools are for smoking cessation support only and are not substitutes for 
              professional mental health care.
            </Text>
          </Card>

          {/* Privacy & Data */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Privacy & Data</Text>
            <Text style={styles.sectionText}>
              QuitHero follows a privacy-first approach:
              {'\n\n'}
              • Your quit data is stored locally on your device
              {'\n'}• We collect minimal analytics to improve the app
              {'\n'}• You can opt out of data collection at any time
              {'\n'}• We never sell your personal information
              {'\n\n'}
              By continuing, you agree to our Privacy Policy and Terms of Service.
            </Text>
          </Card>

          {/* Subscription Terms */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Subscription Terms</Text>
            <Text style={styles.sectionText}>
              • Free trial periods are clearly disclosed before purchase
              {'\n'}• Subscriptions auto-renew unless cancelled 24 hours before renewal
              {'\n'}• Cancel anytime through your device's subscription settings
              {'\n'}• Refunds are handled according to App Store/Google Play policies
              {'\n'}• Premium features require an active subscription
            </Text>
          </Card>

          {/* Effectiveness Disclaimer */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Effectiveness Disclaimer</Text>
            <Text style={styles.sectionText}>
              While QuitHero is based on evidence-based behavioral science techniques, individual 
              results may vary. Success in quitting smoking depends on many personal factors.
              {'\n\n'}
              QuitHero does not guarantee that you will successfully quit smoking. The app is a 
              support tool designed to increase your chances of success when combined with personal 
              commitment and, when appropriate, professional medical guidance.
            </Text>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          {!hasScrolledToBottom && (
            <Text style={styles.scrollPrompt}>
              Please scroll to read all terms before continuing
            </Text>
          )}
          
          <View style={styles.buttons}>
            <Button 
              variant="ghost" 
              size="md"
              onPress={onDecline}
              style={styles.declineButton}
            >
              I Don't Agree
            </Button>
            
            <Button 
              variant="primary" 
              size="md"
              onPress={onAccept}
              disabled={!hasScrolledToBottom}
              style={styles.acceptButton}
            >
              I Agree & Continue
            </Button>
          </View>
          
          <Text style={styles.ageConfirmation}>
            By continuing, you confirm you are at least 16 years old
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.xl, // Extra padding at bottom for better scroll experience
  },
  section: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  sectionText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  footer: {
    padding: Theme.layout.screenPadding,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  scrollPrompt: {
    ...Theme.typography.footnote,
    color: Theme.colors.warning.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 2,
  },
  ageConfirmation: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
});