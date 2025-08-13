import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Theme } from '@/src/design-system/theme';
import { Card, Button } from '@/src/design-system/components';

export default function CoachScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Coach</Text>
            <Text style={styles.subtitle}>
              Personalized guidance and just-in-time support
            </Text>
          </View>

          {/* Daily Check-in */}
          <Card style={styles.checkinCard}>
            <Text style={styles.checkinTitle}>Daily Check-in</Text>
            <Text style={styles.checkinQuestion}>
              How are you feeling about your quit journey today?
            </Text>
            <View style={styles.moodOptions}>
              <Text style={styles.placeholder}>
                [Mood selection UI will be built in next phase]
              </Text>
            </View>
          </Card>

          {/* Today's Coaching */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Coaching</Text>
            
            <Card style={styles.coachingCard}>
              <Text style={styles.coachingIcon}>💡</Text>
              <Text style={styles.coachingTitle}>Tip of the Day</Text>
              <Text style={styles.coachingText}>
                When a craving hits, remember the 4 D's: Delay, Deep breathe, Drink water, Do something else. This simple strategy can help you ride out any urge.
              </Text>
            </Card>

            <Card style={styles.coachingCard}>
              <Text style={styles.coachingIcon}>🎯</Text>
              <Text style={styles.coachingTitle}>Today's Focus</Text>
              <Text style={styles.coachingText}>
                Practice your trigger replacement strategy. Each time you successfully avoid smoking in a trigger situation, you're rewiring your brain.
              </Text>
            </Card>
          </View>

          {/* Plan Review */}
          <Card style={styles.planCard}>
            <Text style={styles.planTitle}>Your Quit Plan</Text>
            <Text style={styles.planDescription}>
              Review and adjust your personalized strategy
            </Text>
            <Button variant="secondary" size="md" fullWidth style={styles.planButton}>
              Review My Plan
            </Button>
          </Card>

          {/* Emergency Support */}
          <Card style={styles.supportCard}>
            <Text style={styles.supportTitle}>Need Extra Support?</Text>
            <Text style={styles.supportDescription}>
              Connect with a quit coach for personalized guidance
            </Text>
            <Button variant="primary" size="md" fullWidth>
              Chat with Coach
            </Button>
          </Card>
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
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  checkinCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  checkinTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  checkinQuestion: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  moodOptions: {
    alignItems: 'center',
  },
  placeholder: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Theme.spacing.xxxl,
  },
  sectionTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  coachingCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  coachingIcon: {
    fontSize: 32,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  coachingTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  coachingText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  planCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  planTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  planDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  planButton: {
    marginTop: Theme.spacing.sm,
  },
  supportCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: Theme.colors.purple[500],
    borderColor: Theme.colors.purple[500],
  },
  supportTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  supportDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    opacity: 0.9,
  },
});