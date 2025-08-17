import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Button, Badge } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';
import Purchases from 'react-native-purchases';

export default function PaywallScreen() {
  const router = useRouter();
  const { quitData, markPaywallSeen, setPremium } = useQuitStore();
  const [offerings, setOfferings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOfferings();
    analytics.trackPaywallViewed(quitData.riskLevel);
  }, []);

  const loadOfferings = async () => {
    if (Platform.OS === 'web') {
      // Mock offerings for web development
      setOfferings({
        current: {
          monthly: { identifier: 'monthly', priceString: '$9.99' },
          annual: { identifier: 'annual', priceString: '$59.99' },
        }
      });
      return;
    }

    try {
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.error('Error loading offerings:', error);
      // Set mock offerings as fallback
      setOfferings({
        current: {
          monthly: { identifier: 'monthly', priceString: '$9.99' },
          annual: { identifier: 'annual', priceString: '$59.99' },
        }
      });
    }
  };

  const handlePurchase = async (productId: string) => {
    // Mock purchase for development (RevenueCat disabled)
    setPremium(true);
    analytics.trackPaywallPurchaseCompleted(productId, true);
    router.replace('/(app)/(tabs)/dashboard');
    return;
    
    // Original RevenueCat code (commented out for development)
    // if (Platform.OS === 'web') {
    //   setPremium(true);
    //   router.replace('/(app)/(tabs)/dashboard');
    //   return;
    // }
    // setLoading(true);
    // try {
    //   const purchaseResult = await Purchases.purchaseProduct(productId);
    //   if (purchaseResult.customerInfo.entitlements.active['premium']) {
    //     setPremium(true);
    //     analytics.trackPaywallPurchaseCompleted(productId, true);
    //     router.replace('/(app)/(tabs)/dashboard');
    //   }
    // } catch (error) {
    //   console.error('Purchase error:', error);
    //   analytics.track('purchase_error', { product_id: productId });
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleSkip = () => {
    markPaywallSeen();
    analytics.trackPaywallDismissed('try_free');
    router.replace('/(app)/(tabs)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Plan is Ready! 🎯</Text>
            <Text style={styles.subtitle}>
              Unlock premium tools and personalized support
            </Text>
          </View>

          {/* Risk Level Badge */}
          {quitData.riskLevel && (
            <Card style={styles.riskCard}>
              <Badge 
                variant={quitData.riskLevel === 'high' ? 'warning' : 'success'}
                style={styles.riskBadge}
              >
                {quitData.riskLevel.toUpperCase()} RISK PROFILE
              </Badge>
              <Text style={styles.riskDescription}>
                Based on your assessment, we've created a personalized plan for your specific needs.
              </Text>
            </Card>
          )}

          {/* Premium Features */}
          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Premium Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🚨</Text>
                <Text style={styles.featureText}>Unlimited panic mode access</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🤖</Text>
                <Text style={styles.featureText}>AI coaching and personalized support</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>Advanced progress tracking</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>👥</Text>
                <Text style={styles.featureText}>Community access and challenges</Text>
              </View>
            </View>
          </Card>

          {/* Pricing Options */}
          {offerings && (
            <View style={styles.pricingSection}>
              <Text style={styles.pricingTitle}>Choose Your Plan</Text>
              
              <TouchableOpacity 
                style={styles.pricingCard}
                onPress={() => handlePurchase('annual')}
                disabled={loading}
              >
                <Badge variant="primary" style={styles.popularBadge}>
                  MOST POPULAR
                </Badge>
                <Text style={styles.planName}>Annual Plan</Text>
                <Text style={styles.planPrice}>
                  {offerings.current?.annual?.priceString || '$59.99'}/year
                </Text>
                <Text style={styles.planSavings}>Save 50% vs monthly</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.pricingCard}
                onPress={() => handlePurchase('monthly')}
                disabled={loading}
              >
                <Text style={styles.planName}>Monthly Plan</Text>
                <Text style={styles.planPrice}>
                  {offerings.current?.monthly?.priceString || '$9.99'}/month
                </Text>
                <Text style={styles.planDescription}>7-day free trial</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Trust Signals */}
          <Card style={styles.trustCard}>
            <Text style={styles.trustTitle}>Why QuitHero Works</Text>
            <Text style={styles.trustText}>
              • 3x higher success rate with personalized plans{'\n'}
              • Based on clinical research and proven frameworks{'\n'}
              • Cancel anytime, no questions asked{'\n'}
              • Privacy-first approach to your data
            </Text>
          </Card>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={() => handlePurchase('annual')}
              loading={loading}
            >
              Start 7-Day Free Trial
            </Button>
            
            <Button 
              variant="ghost" 
              onPress={handleSkip}
              style={styles.skipButton}
            >
              Try free version first
            </Button>
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
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  riskCard: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  riskBadge: {
    marginBottom: Theme.spacing.md,
  },
  riskDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  featuresTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  featuresList: {
    gap: Theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Theme.spacing.md,
  },
  featureText: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  pricingSection: {
    marginBottom: Theme.spacing.xl,
  },
  pricingTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  pricingCard: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.dark.surface,
    borderWidth: 2,
    borderColor: Theme.colors.dark.border,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: Theme.spacing.md,
  },
  planName: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  planPrice: {
    ...Theme.typography.title2,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
  planSavings: {
    ...Theme.typography.footnote,
    color: Theme.colors.success.text,
  },
  planDescription: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
  },
  trustCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  trustTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  trustText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  ctaSection: {
    gap: Theme.spacing.md,
  },
  skipButton: {
    marginTop: Theme.spacing.sm,
  },
});