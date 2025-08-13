import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Theme } from '@/src/design-system/theme';
import { Button, Card, Badge } from '@/src/design-system/components';
import { useQuitStore } from '../../src/stores/quitStore';
import { formatCurrency } from '../../src/utils/calculations';
import { analytics } from '../../src/services/analytics';

export default function PaywallScreen() {
  const router = useRouter();
  const { quitData, setPremium } = useQuitStore();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOfferings();
    
    // Track paywall view with personalization data
    analytics.trackPaywallViewed(
      quitData.personalizedPlan?.riskLevel,
      getPersonalizationType()
    );
  }, []);

  const getPersonalizationType = () => {
    if (quitData.personalizedPlan?.riskLevel === 'high') return 'high_risk';
    if (quitData.primaryMotivation === 'money') return 'financial';
    if (quitData.quitTimeline === 'today') return 'urgent';
    return 'standard';
  };

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
        // Default to annual package if available
        const annualPackage = offerings.current.availablePackages.find(
          pkg => pkg.identifier === 'annual'
        );
        setSelectedPackage(annualPackage || offerings.current.availablePackages[0]);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    analytics.trackPaywallPurchaseAttempted(selectedPackage.identifier);
    
    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      
      if (customerInfo.entitlements.active['premium']) {
        analytics.trackPaywallPurchaseCompleted(
          selectedPackage.identifier,
          !selectedPackage.product.title.includes('Lifetime')
        );
        setPremium(true);
        router.push('/(app)/(tabs)/dashboard');
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Error', 'Unable to complete purchase. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryFree = () => {
    analytics.trackPaywallDismissed('try_free');
    router.push('/(app)/(tabs)/dashboard');
  };

  const handleRestorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['premium']) {
        setPremium(true);
        router.push('/(app)/(tabs)/dashboard');
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions found to restore.');
      }
    } catch (error) {
      Alert.alert('Restore Error', 'Unable to restore purchases. Please try again.');
    }
  };

  // Personalization based on behavioral data
  const getPersonalizedHeadline = () => {
    const riskLevel = quitData.personalizedPlan?.riskLevel;
    const motivation = quitData.primaryMotivation;
    
    if (riskLevel === 'high') {
      return "Your High-Risk Profile Needs Extra Support";
    } else if (motivation === 'money') {
      return "Turn Your Quit Into Serious Savings";
    } else if (motivation === 'health') {
      return "Accelerate Your Health Recovery";
    } else if (motivation === 'family') {
      return "Protect Your Family's Future";
    }
    return "Your Personalized Quit Plan is Ready";
  };

  const getPersonalizedSubheadline = () => {
    const riskLevel = quitData.personalizedPlan?.riskLevel;
    const quitTimeline = quitData.quitTimeline;
    
    if (riskLevel === 'high') {
      return "Heavy users need 3x more support to succeed. Get the tools that work.";
    } else if (quitTimeline === 'today') {
      return "You're quitting today! Get immediate access to crisis support tools.";
    } else if (quitTimeline === 'this-week') {
      return "This week is your moment. Get prepared with proven strategies.";
    }
    return "Evidence-based tools and support for your specific quit profile.";
  };

  const calculateSavings = () => {
    if (!quitData.usageAmount || !quitData.substanceType) return null;
    
    let dailyCost = 0;
    if (quitData.substanceType === 'cigarettes') {
      // Assume $8 per pack, 20 cigarettes per pack
      dailyCost = (quitData.usageAmount / 20) * 8;
    } else if (quitData.substanceType === 'vape') {
      // Assume $15 per pod
      dailyCost = quitData.usageAmount * 15;
    }
    
    return {
      daily: dailyCost,
      monthly: dailyCost * 30,
      yearly: dailyCost * 365,
    };
  };

  const savings = calculateSavings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Personalized Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {getPersonalizedHeadline()}
            </Text>
            
            <Text style={styles.subtitle}>
              {getPersonalizedSubheadline()}
            </Text>
          </View>

          {/* Savings Calculator (if financial motivation) */}
          {savings && quitData.primaryMotivation === 'money' && (
            <Card style={styles.savingsCard}>
              <Text style={styles.savingsTitle}>Your Savings Potential</Text>
              <View style={styles.savingsGrid}>
                <View style={styles.savingItem}>
                  <Text style={styles.savingAmount}>{formatCurrency(savings.monthly)}</Text>
                  <Text style={styles.savingPeriod}>per month</Text>
                </View>
                <View style={styles.savingItem}>
                  <Text style={styles.savingAmount}>{formatCurrency(savings.yearly)}</Text>
                  <Text style={styles.savingPeriod}>per year</Text>
                </View>
              </View>
              <Text style={styles.savingsNote}>
                Premium costs {formatCurrency(9.99)}/month - you'll save {Math.round(savings.monthly / 9.99)}x more than it costs!
              </Text>
            </Card>
          )}

          {/* Risk-Based Urgency */}
          {quitData.personalizedPlan?.riskLevel === 'high' && (
            <Card style={styles.urgencyCard}>
              <Text style={styles.urgencyIcon}>⚠️</Text>
              <Text style={styles.urgencyTitle}>High-Risk Quit Profile</Text>
              <Text style={styles.urgencyText}>
                Your usage pattern and dependency level put you at higher risk for relapse. 
                Users with your profile are 3x more successful with premium support tools.
              </Text>
            </Card>
          )}

          {/* Timeline Urgency */}
          {(quitData.quitTimeline === 'today' || quitData.quitTimeline === 'this-week') && (
            <Card style={styles.timelineCard}>
              <Text style={styles.timelineIcon}>⏰</Text>
              <Text style={styles.timelineTitle}>
                {quitData.quitTimeline === 'today' ? 'Quitting Today!' : 'Quitting This Week!'}
              </Text>
              <Text style={styles.timelineText}>
                The first 72 hours are critical. Get immediate access to panic protocols 
                and 24/7 support tools designed for your quit timeline.
              </Text>
            </Card>
          )}

          {/* Value Props */}
          <View style={styles.features}>
            <Card style={styles.featureCard}>
              <Text style={styles.featureIcon}>🚨</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Panic Mode Protocol</Text>
                <Text style={styles.featureDescription}>
                  60-second emergency support for intense cravings
                </Text>
              </View>
            </Card>

            <Card style={styles.featureCard}>
              <Text style={styles.featureIcon}>🧠</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Personalized Coaching</Text>
                <Text style={styles.featureDescription}>
                  AI coach trained on your specific triggers and patterns
                </Text>
              </View>
            </Card>

            <Card style={styles.featureCard}>
              <Text style={styles.featureIcon}>👥</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Support Community</Text>
                <Text style={styles.featureDescription}>
                  Connect with others who share your quit timeline
                </Text>
              </View>
            </Card>

            <Card style={styles.featureCard}>
              <Text style={styles.featureIcon}>📊</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Advanced Analytics</Text>
                <Text style={styles.featureDescription}>
                  Track patterns, predict challenges, optimize success
                </Text>
              </View>
            </Card>
          </View>

          {/* Social Proof */}
          <Card style={styles.socialProofCard}>
            <Text style={styles.socialProofStat}>50,000+</Text>
            <Text style={styles.socialProofLabel}>people have quit with QuitHero</Text>
            <Text style={styles.socialProofSource}>
              Based on research from JAMA Network and NIH studies
            </Text>
          </Card>

          {/* Pricing */}
          {offerings && (
            <View style={styles.pricing}>
              <Text style={styles.pricingTitle}>Choose Your Plan</Text>
              
              <View style={styles.packages}>
                {offerings.availablePackages.map((pkg) => {
                  const isSelected = selectedPackage?.identifier === pkg.identifier;
                  const isAnnual = pkg.identifier === 'annual';
                  const isLifetime = pkg.identifier === 'lifetime';
                  
                  return (
                    <Card 
                      key={pkg.identifier}
                      style={[
                        styles.packageCard,
                        isSelected && styles.selectedPackage
                      ]}
                      onTouchEnd={() => setSelectedPackage(pkg)}
                    >
                      {isAnnual && (
                        <Badge variant="primary" style={styles.popularBadge}>
                          Most Popular
                        </Badge>
                      )}
                      
                      <Text style={styles.packageTitle}>
                        {pkg.product.title}
                      </Text>
                      
                      <Text style={styles.packagePrice}>
                        {pkg.product.priceString}
                        {!isLifetime && (
                          <Text style={styles.packagePeriod}>
                            /{pkg.identifier === 'monthly' ? 'month' : 'year'}
                          </Text>
                        )}
                      </Text>
                      
                      {isAnnual && (
                        <Text style={styles.packageSavings}>Save 50%</Text>
                      )}
                      
                      {!isLifetime && (
                        <Text style={styles.packageTrial}>7-day free trial</Text>
                      )}
                    </Card>
                  );
                })}
              </View>
            </View>
          )}

          {/* CTAs */}
          <View style={styles.actions}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={handlePurchase}
              loading={isLoading}
              disabled={!selectedPackage}
            >
              {selectedPackage?.product.title.includes('Lifetime') 
                ? 'Get Lifetime Access' 
                : 'Start Free Trial'
              }
            </Button>
            
            <Button 
              variant="ghost" 
              onPress={handleTryFree}
              style={styles.tryFreeButton}
            >
              Continue with Limited Features
            </Button>
            
            <Button 
              variant="ghost" 
              onPress={handleRestorePurchases}
              style={styles.restoreButton}
            >
              Restore Purchases
            </Button>
          </View>

          <Text style={styles.terms}>
            {selectedPackage?.product.title.includes('Lifetime') 
              ? 'One-time payment • No subscription • Lifetime updates'
              : '7-day free trial • Cancel anytime • No commitment'
            }
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
    marginBottom: Theme.spacing.lg,
    lineHeight: 42,
  },
  subtitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '400',
  },
  savingsCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.success.background,
    borderColor: Theme.colors.success.border,
  },
  savingsTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  savingsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  savingItem: {
    alignItems: 'center',
  },
  savingAmount: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.success.text,
    marginBottom: Theme.spacing.xs,
  },
  savingPeriod: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
  },
  savingsNote: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  urgencyCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.warning.background,
    borderColor: Theme.colors.warning.border,
  },
  urgencyIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  urgencyTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  urgencyText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  timelineCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.info.background,
    borderColor: Theme.colors.info.border,
  },
  timelineIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  timelineTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  timelineText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Theme.spacing.lg,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: Theme.spacing.md,
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
    lineHeight: 22,
  },
  socialProofCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  socialProofStat: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
    fontWeight: '700',
  },
  socialProofLabel: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  socialProofSource: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  pricing: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  pricingTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  packages: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  packageCard: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPackage: {
    borderColor: Theme.colors.purple[500],
    backgroundColor: Theme.colors.purple[500] + '10',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
  },
  packageTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  packagePrice: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
  packagePeriod: {
    ...Theme.typography.title3,
    color: Theme.colors.text.secondary,
  },
  packageSavings: {
    ...Theme.typography.footnote,
    color: Theme.colors.success.text,
    marginBottom: Theme.spacing.xs,
  },
  packageTrial: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
  },
  actions: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  tryFreeButton: {
    marginTop: Theme.spacing.xs,
  },
  restoreButton: {
    marginTop: Theme.spacing.xs,
  },
  terms: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
});