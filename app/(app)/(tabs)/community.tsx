import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge } from '@/src/design-system/components';

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>
              Connect with others on their quit journey
            </Text>
          </View>

          {/* Success Stories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Success Stories</Text>
            
            <Card style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Text style={styles.userName}>Alex M.</Text>
                <Badge variant="success" size="sm">6 months</Badge>
              </View>
              <Text style={styles.storyText}>
                "The panic mode feature saved me countless times during week 1. Now I can't imagine going back."
              </Text>
              <Text style={styles.storyStats}>
                Saved $1,200 • 3,600 cigarettes avoided
              </Text>
            </Card>

            <Card style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Text style={styles.userName}>Jamie L.</Text>
                <Badge variant="success" size="sm">3 weeks</Badge>
              </View>
              <Text style={styles.storyText}>
                "The personalized plan made all the difference. Having specific strategies for my triggers was game-changing."
              </Text>
              <Text style={styles.storyStats}>
                Saved $60 • 210 cigarettes avoided
              </Text>
            </Card>
          </View>

          {/* Daily Challenges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Challenge</Text>
            
            <Card style={styles.challengeCard}>
              <Text style={styles.challengeIcon}>🎯</Text>
              <Text style={styles.challengeTitle}>Replace One Trigger</Text>
              <Text style={styles.challengeDescription}>
                Identify one smoking trigger today and practice your replacement activity when it happens.
              </Text>
              <View style={styles.challengeStats}>
                <Text style={styles.challengeParticipants}>
                  847 people participating today
                </Text>
              </View>
            </Card>
          </View>

          {/* Support Groups */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support Groups</Text>
            
            <Card style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>First Week Warriors</Text>
                <Badge variant="warning" size="sm">127 members</Badge>
              </View>
              <Text style={styles.groupDescription}>
                Support for those in their crucial first week of quitting
              </Text>
            </Card>

            <Card style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>Vaping to Freedom</Text>
                <Badge variant="primary" size="sm">89 members</Badge>
              </View>
              <Text style={styles.groupDescription}>
                Specialized support for those quitting vaping and e-cigarettes
              </Text>
            </Card>

            <Card style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>Long-term Success</Text>
                <Badge variant="success" size="sm">234 members</Badge>
              </View>
              <Text style={styles.groupDescription}>
                Celebrating and maintaining long-term quit success
              </Text>
            </Card>
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
  section: {
    marginBottom: Theme.spacing.xxxl,
  },
  sectionTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  storyCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  userName: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
  },
  storyText: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: Theme.spacing.md,
    fontStyle: 'italic',
  },
  storyStats: {
    ...Theme.typography.footnote,
    color: Theme.colors.success.text,
  },
  challengeCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  challengeTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  challengeDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  challengeStats: {
    alignItems: 'center',
  },
  challengeParticipants: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
  },
  groupCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  groupName: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
  },
  groupDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },
});