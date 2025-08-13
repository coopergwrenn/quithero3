import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge } from '@/src/design-system/components';

export default function LearnScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Learn</Text>
            <Text style={styles.subtitle}>
              Science-backed insights and strategies for your quit journey
            </Text>
          </View>

          {/* Featured Article */}
          <Card style={styles.featuredCard}>
            <Badge variant="primary" style={styles.featuredBadge}>Featured</Badge>
            <Text style={styles.featuredTitle}>
              Why the First Week is Crucial
            </Text>
            <Text style={styles.featuredDescription}>
              Understanding nicotine withdrawal and how to navigate the most challenging phase of quitting.
            </Text>
            <Text style={styles.readTime}>5 min read</Text>
          </Card>

          {/* Categories */}
          <View style={styles.categories}>
            <Text style={styles.sectionTitle}>Browse Topics</Text>
            
            <Card style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🧠</Text>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>Understanding Addiction</Text>
                <Text style={styles.categoryDescription}>
                  Learn how nicotine affects your brain and body
                </Text>
              </View>
            </Card>

            <Card style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>💊</Text>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>Nicotine Replacement</Text>
                <Text style={styles.categoryDescription}>
                  Evidence-based guide to patches, gum, and lozenges
                </Text>
              </View>
            </Card>

            <Card style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🎯</Text>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>Trigger Management</Text>
                <Text style={styles.categoryDescription}>
                  Strategies to handle stress, social, and routine triggers
                </Text>
              </View>
            </Card>

            <Card style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>💪</Text>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>Building New Habits</Text>
                <Text style={styles.categoryDescription}>
                  Replace smoking routines with healthier alternatives
                </Text>
              </View>
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
  featuredCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
  },
  featuredTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  featuredDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: Theme.spacing.md,
  },
  readTime: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
  },
  categories: {
    gap: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Theme.spacing.lg,
  },
  categoryIcon: {
    fontSize: 28,
    marginRight: Theme.spacing.md,
    marginTop: 2,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  categoryDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
  },
});