import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';

export default function LearnLibraryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('quick-start');
  const [readArticles, setReadArticles] = useState(new Set());
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);
  const { quitData } = useQuitStore();

  useEffect(() => {
    analytics.track('learn_library_opened');
  }, []);

  const categories = [
    { id: 'quick-start', title: 'Quick Start', icon: '🚀' },
    { id: 'health', title: 'Health Recovery', icon: '🫁' },
    { id: 'nrt', title: 'NRT Guide', icon: '💊' },
    { id: 'science', title: 'Science', icon: '🧠' },
    { id: 'strategies', title: 'Strategies', icon: '🎯' }
  ];

  const quickStartContent = [
    {
      id: 'first-24-hours',
      title: 'Your First 24 Hours',
      readTime: '5 min read',
      preview: 'Essential survival guide for your first day smoke-free',
      content: `Your First 24 Hours Smoke-Free

Congratulations on taking the first step! The first 24 hours are crucial for setting the foundation of your quit journey.

What to Expect

Physical symptoms:
• Cravings every 15-30 minutes (lasting 3-5 minutes each)
• Slight anxiety or restlessness  
• Possible mild headache
• Increased appetite

Emotional symptoms:
• Mood swings
• Irritability
• Feeling of loss or grief
• Excitement about quitting

Hour-by-Hour Guide

Hours 1-4: The Decision Phase
• Cravings are manageable
• Focus on your reasons for quitting
• Remove all smoking materials from your environment

Hours 4-8: Peak Initial Withdrawal
• Cravings intensify
• Use your panic mode tool
• Stay busy with hands-on activities

Hours 8-16: Habit Disruption
• Strongest urges during usual smoking times
• Change your routine
• Avoid triggers when possible

Hours 16-24: First Milestone Approaching
• Physical symptoms peak then begin to fade
• Celebrate making it through the hardest part
• Plan rewards for completing day 1

Emergency Strategies

When cravings hit:
1. Use the 4-7-8 breathing technique
2. Drink cold water slowly
3. Go for a 5-minute walk
4. Call a supportive friend
5. Use your urge timer tool

Tips for Success

• Stay hydrated: Drink water every hour
• Keep hands busy: Stress ball, pen, toothpick
• Change environment: Avoid smoking areas
• Reward yourself: Plan something special for completing day 1

Remember: Every craving you overcome makes you stronger. You can do this!`
    },
    {
      id: 'week-1-survival',
      title: 'Week 1 Survival Guide', 
      readTime: '7 min read',
      preview: 'Navigate the most challenging week of your quit journey',
      content: `Week 1 Survival Guide

The first week is the most challenging but also the most important for long-term success.

Day 1-3: Peak Withdrawal
These are typically the hardest days as nicotine leaves your system.

What's happening in your body:
• Nicotine levels drop to zero
• Acetylcholine receptors are readjusting
• Dopamine production is irregular

Strategies:
• Use NRT if planned (patch, gum, lozenge)
• Stay extremely busy
• Avoid alcohol and caffeine late in day
• Go to bed early to avoid evening cravings

Day 4-7: Habit Reconstruction
Physical withdrawal eases, but psychological habits remain strong.

Focus areas:
• Breaking routine triggers
• Developing new coping mechanisms
• Building confidence in your quit

Daily activities:
• Morning: Set daily quit intention
• Afternoon: Practice breathing exercises
• Evening: Reflect on daily victories

Common Week 1 Challenges

"I can't concentrate"
• Normal - brain is readjusting to functioning without nicotine
• Try 10-minute focused work sessions
• Take frequent breaks
• Use peppermint tea or gum for mental clarity

"I'm incredibly irritable"
• Expected response to breaking addiction
• Warn family/friends in advance
• Practice patience with yourself
• Use physical exercise to release tension

Week 1 Milestones to Celebrate

• Day 1: You chose your health
• Day 2: Nicotine is leaving your system
• Day 3: You're through the hardest part
• Day 4: New habits are forming
• Day 5: You're proving you can do this
• Day 6: Almost at one week!
• Day 7: You're officially a non-smoker for a full week!

You're building the foundation for lifelong freedom. Every hour matters!`
    }
  ];

  const getAllContent = () => {
    switch(selectedCategory) {
      case 'quick-start':
        return quickStartContent;
      default:
        return quickStartContent;
    }
  };

  const openArticle = (article: any) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
    analytics.track('learn_article_opened', { 
      article_id: article.id,
      article_title: article.title 
    });
  };

  const markAsRead = (articleId: string) => {
    if (!articleId) return;
    const newReadArticles = new Set(readArticles);
    newReadArticles.add(articleId);
    setReadArticles(newReadArticles);
    analytics.track('learn_article_completed', { article_id: articleId });
  };

  const toggleBookmark = (articleId: string) => {
    if (!articleId) return;
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
    } else {
      newBookmarks.add(articleId);
    }
    setBookmarkedArticles(newBookmarks);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Learn Library</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)}
          style={[styles.headerButton, showSearch && styles.headerButtonActive]}
        >
          <Text style={styles.headerButtonText}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setShowBookmarks(!showBookmarks)}
          style={[styles.headerButton, showBookmarks && styles.headerButtonActive]}
        >
          <Text style={styles.headerButtonText}>📚</Text>
          {bookmarkedArticles.size > 0 && (
            <View style={styles.badgeIndicator}>
              <Text style={styles.badgeText}>{bookmarkedArticles.size}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    const content = getAllContent();
    return content.map(article => (
      <TouchableOpacity 
        key={article.id} 
        onPress={() => openArticle(article)}
        style={styles.articleCard}
      >
        <Card style={styles.articleCardInner}>
          <View style={styles.articleHeader}>
            <View style={styles.articleTitleContainer}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <View style={styles.articleBadges}>
                {readArticles.has(article.id) && (
                  <Badge variant="success" style={styles.readBadge}>✓ Read</Badge>
                )}
                {bookmarkedArticles.has(article.id) && (
                  <Badge variant="secondary" style={styles.bookmarkBadgeSmall}>📚</Badge>
                )}
              </View>
            </View>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                toggleBookmark(article.id);
              }}
              style={styles.bookmarkButton}
            >
              <Text style={[
                styles.bookmarkIcon,
                bookmarkedArticles.has(article.id) && styles.bookmarkIconActive
              ]}>
                {bookmarkedArticles.has(article.id) ? '📚' : '📖'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.articlePreview}>{article.preview}</Text>
          <View style={styles.articleMeta}>
            <Text style={styles.readTime}>{article.readTime}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    ));
  };

  const renderArticleModal = () => (
    <Modal
      visible={showArticleModal}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setShowArticleModal(false)}
            style={styles.modalBackButton}
          >
            <Text style={styles.modalBackText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Learn</Text>
          <TouchableOpacity 
            onPress={() => markAsRead(selectedArticle?.id)}
            style={styles.markReadButton}
          >
            <Text style={styles.markReadText}>
              {readArticles.has(selectedArticle?.id) ? '✓ Read' : 'Mark Read'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedArticle && (
            <View style={styles.articleContent}>
              <Text style={styles.articleFullTitle}>{selectedArticle.title}</Text>
              <Text style={styles.articleFullText}>{selectedArticle.content}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <Text style={styles.disclaimer}>
            This information is for educational purposes only. Consult your healthcare provider for medical advice.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor={Theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {!showSearch && !showBookmarks && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.contentSection}>
          {renderContent()}
        </View>
      </ScrollView>

      {renderArticleModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  backText: {
    ...Theme.typography.body,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  headerTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
    position: 'relative',
  },
  headerButtonActive: {
    backgroundColor: Theme.colors.purple[500] + '20',
    borderWidth: 1,
    borderColor: Theme.colors.purple[500],
  },
  headerButtonText: {
    fontSize: 18,
  },
  badgeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.dark.background,
  },
  badgeText: {
    ...Theme.typography.caption2,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  searchContainer: {
    padding: Theme.spacing.lg,
    paddingTop: 0,
  },
  searchInput: {
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    color: Theme.colors.text.primary,
    fontSize: 16,
    borderWidth: 2,
    borderColor: Theme.colors.dark.border,
  },
  categoryScroll: {
    paddingLeft: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  categoryScrollContent: {
    paddingRight: Theme.spacing.lg,
  },
  categoryButton: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: Theme.colors.purple[500] + '20',
    borderColor: Theme.colors.purple[500],
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  categoryText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  contentSection: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 120,
  },
  articleCard: {
    marginBottom: Theme.spacing.md,
  },
  articleCardInner: {
    padding: Theme.spacing.lg,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  articleTitleContainer: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  articleTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  articleBadges: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  readBadge: {
    flexShrink: 0,
  },
  bookmarkBadgeSmall: {
    marginLeft: Theme.spacing.xs,
  },
  bookmarkButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  bookmarkIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  bookmarkIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  articlePreview: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.md,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  modalBackButton: {
    padding: Theme.spacing.sm,
  },
  modalBackText: {
    ...Theme.typography.body,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  modalTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
  },
  markReadButton: {
    padding: Theme.spacing.sm,
  },
  markReadText: {
    ...Theme.typography.footnote,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  articleContent: {
    paddingBottom: Theme.spacing.xl,
  },
  articleFullTitle: {
    ...Theme.typography.title1,
    color: Theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.lg,
  },
  articleFullText: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    lineHeight: 26,
  },
  modalFooter: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  disclaimer: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
