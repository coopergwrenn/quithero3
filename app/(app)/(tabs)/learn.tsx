import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { useAuthStore } from '@/src/stores/authStore';
import { analytics } from '@/src/services/analytics';
import { getContentCategories, type ContentCategory, type Article } from '@/src/data/educationalContent';

export default function LearnScreen() {
  const [selectedCategory, setSelectedCategory] = useState('foundation');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  
  const { quitData } = useQuitStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Calculate days since quit for content unlocking
  const daysSinceQuit = quitData.quitDate 
    ? Math.floor((new Date().getTime() - new Date(quitData.quitDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Get content categories with personalized unlocking
  const contentCategories = getContentCategories(daysSinceQuit, quitData);

  useEffect(() => {
    analytics.track('learn_tab_opened', {
      days_since_quit: daysSinceQuit,
      categories_unlocked: contentCategories.filter(cat => cat.unlocked).length
    });
    
    // Load saved progress from storage
    loadUserProgress();
  }, []);

  const loadUserProgress = () => {
    // In a real app, this would load from AsyncStorage or server
    // For demo, using some mock data
    const mockCompleted = ['why-quitting-hard', 'quit-timeline'];
    const mockBookmarked = ['understanding-cravings', 'nrt-options'];
    setCompletedModules(mockCompleted);
    setBookmarkedArticles(mockBookmarked);
  };

  const openArticle = (article: Article) => {
    if (!article.unlocked) {
      Alert.alert(
        'Content Locked',
        `This article will unlock after ${article.unlockDays || 0} days of being smoke-free.`,
        [{ text: 'OK' }]
      );
      return;
    }

    analytics.track('learn_article_opened', {
      article_id: article.id,
      category: selectedCategory,
      difficulty: article.difficulty
    });

    // In a real app, would navigate to article detail screen
    Alert.alert(
      article.title,
      `This would open the full article: "${article.description}"\n\nFeatures:\n• ${article.readTime} read\n• ${article.difficulty} level\n• ${article.sections.length} sections`,
      [
        { text: 'Bookmark', onPress: () => toggleBookmark(article.id) },
        { text: 'Mark Complete', onPress: () => markCompleted(article.id) },
        { text: 'Close' }
      ]
    );
  };

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
    
    analytics.track('learn_article_bookmarked', { article_id: articleId });
  };

  const markCompleted = (articleId: string) => {
    if (!completedModules.includes(articleId)) {
      setCompletedModules(prev => [...prev, articleId]);
      analytics.track('learn_article_completed', { article_id: articleId });
    }
  };

  const toggleCardExpansion = (articleId: string) => {
    setExpandedCards(prev => 
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const renderProgressOverview = () => {
    const totalArticles = contentCategories.reduce((sum, cat) => sum + cat.articles.length, 0);
    const unlockedArticles = contentCategories.reduce((sum, cat) => 
      sum + cat.articles.filter(article => article.unlocked).length, 0
    );

    return (
      <Card style={styles.progressCard}>
        <Text style={styles.progressTitle}>Your Learning Progress</Text>
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{completedModules.length}</Text>
            <Text style={styles.progressLabel}>Completed</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{bookmarkedArticles.length}</Text>
            <Text style={styles.progressLabel}>Bookmarked</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{unlockedArticles}</Text>
            <Text style={styles.progressLabel}>Available</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressNumber}>{totalArticles}</Text>
            <Text style={styles.progressLabel}>Total</Text>
          </View>
        </View>
        
        {daysSinceQuit > 0 && (
          <View style={styles.unlockProgress}>
            <Text style={styles.unlockProgressText}>
              🗓️ Day {daysSinceQuit} • Next unlock: {getNextUnlockInfo()}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const getNextUnlockInfo = () => {
    if (daysSinceQuit < 3) return `Behavioral Strategies in ${3 - daysSinceQuit} days`;
    if (daysSinceQuit < 7) return `Advanced Stress Management in ${7 - daysSinceQuit} days`;
    if (daysSinceQuit < 30) return `Long-term Success Guide in ${30 - daysSinceQuit} days`;
    return 'All content unlocked! 🎉';
  };

  const renderCategoryCard = (category: ContentCategory) => (
    <TouchableOpacity
      key={category.id}
      onPress={() => category.unlocked && setSelectedCategory(category.id)}
      style={[
        styles.categoryCard,
        selectedCategory === category.id && styles.selectedCategory,
        !category.unlocked && styles.lockedCategory
      ]}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <View style={styles.categoryContent}>
        <Text style={[
          styles.categoryTitle,
          !category.unlocked && styles.lockedText
        ]}>
          {category.title}
        </Text>
        <Text style={[
          styles.categoryDescription,
          !category.unlocked && styles.lockedText
        ]}>
          {category.description}
        </Text>
        {!category.unlocked && category.unlockDays && (
          <Badge variant="secondary" style={styles.unlockBadge}>
            Unlocks in {Math.max(0, category.unlockDays - daysSinceQuit)} days
          </Badge>
        )}
        {category.unlocked && (
          <View style={styles.categoryStats}>
            <Text style={styles.categoryStatsText}>
              {category.articles.filter(a => a.unlocked).length}/{category.articles.length} available
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderArticleCard = (article: Article) => {
    const isExpanded = expandedCards.includes(article.id);
    const isCompleted = completedModules.includes(article.id);
    const isBookmarked = bookmarkedArticles.includes(article.id);

    return (
      <TouchableOpacity
        key={article.id}
        onPress={() => openArticle(article)}
        style={[
          styles.articleCard,
          !article.unlocked && styles.lockedArticle,
          isCompleted && styles.completedArticle
        ]}
      >
        <View style={styles.articleHeader}>
          <View style={styles.articleMeta}>
            <Badge 
              variant={
                article.difficulty === 'Beginner' ? 'success' : 
                article.difficulty === 'Intermediate' ? 'warning' : 'error'
              }
            >
              {article.difficulty}
            </Badge>
            <Text style={styles.readTime}>{article.readTime}</Text>
            {article.personalized && (
              <Badge variant="primary">Personalized</Badge>
            )}
          </View>
          <View style={styles.articleActions}>
            {isBookmarked && (
              <Text style={styles.bookmarkIcon}>🔖</Text>
            )}
            {isCompleted && (
              <Text style={styles.completedIcon}>✅</Text>
            )}
          </View>
        </View>
        
        <Text style={[
          styles.articleTitle,
          !article.unlocked && styles.lockedText
        ]}>
          {article.title}
        </Text>
        
        <Text style={[
          styles.articleDescription,
          !article.unlocked && styles.lockedText
        ]}>
          {article.description}
        </Text>

        {article.unlocked && isExpanded && (
          <View style={styles.articlePreview}>
            <Text style={styles.previewTitle}>Key Topics:</Text>
            {article.sections.slice(0, 2).map((section, index) => (
              <Text key={index} style={styles.previewItem}>
                • {section.heading}
              </Text>
            ))}
            {article.keyTakeaways && (
              <Text style={styles.previewTakeaways}>
                {article.keyTakeaways.length} key takeaways included
              </Text>
            )}
          </View>
        )}

        {article.unlocked && (
          <TouchableOpacity
            onPress={() => toggleCardExpansion(article.id)}
            style={styles.expandButton}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Less Info' : 'More Info'} {isExpanded ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        )}

        {!article.unlocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockText}>
              Available after {article.unlockDays || 0} days smoke-free
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPersonalizedRecommendations = () => {
    if (!quitData.triggers || quitData.triggers.length === 0) return null;

    const recommendedArticles = [];
    
    if (quitData.triggers.includes('stress')) {
      recommendedArticles.push('stress-management');
    }
    if (quitData.triggers.includes('social')) {
      recommendedArticles.push('trigger-management');
    }
    if (quitData.usageAmount && quitData.usageAmount > 15) {
      recommendedArticles.push('nrt-options');
    }

    if (recommendedArticles.length === 0) return null;

    return (
      <Card style={styles.recommendationsCard}>
        <Text style={styles.recommendationsTitle}>
          📝 Recommended for You
        </Text>
        <Text style={styles.recommendationsText}>
          Based on your triggers: {quitData.triggers.join(', ')}
        </Text>
        <View style={styles.recommendationsList}>
          {recommendedArticles.map(articleId => {
            const category = contentCategories.find(cat => 
              cat.articles.some(article => article.id === articleId)
            );
            const article = category?.articles.find(a => a.id === articleId);
            
            if (!article) return null;
            
            return (
              <TouchableOpacity
                key={articleId}
                onPress={() => openArticle(article)}
                style={styles.recommendationItem}
              >
                <Text style={styles.recommendationTitle}>{article.title}</Text>
                <Text style={styles.recommendationDescription}>{article.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>
    );
  };

  const currentCategory = contentCategories.find(cat => cat.id === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.subtitle}>
            Evidence-based knowledge for your quit journey
          </Text>
        </View>

        {/* Progress Overview */}
        {renderProgressOverview()}

        {/* Personalized Recommendations */}
        {renderPersonalizedRecommendations()}

        {/* Category Selection */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {contentCategories.map(renderCategoryCard)}
          </ScrollView>
        </View>

        {/* Articles List */}
        <View style={styles.articlesSection}>
          <View style={styles.articlesSectionHeader}>
            <Text style={styles.sectionTitle}>
              {currentCategory?.title} Articles
            </Text>
            {currentCategory && !currentCategory.unlocked && (
              <Badge variant="secondary">
                Unlocks in {Math.max(0, (currentCategory.unlockDays || 0) - daysSinceQuit)} days
              </Badge>
            )}
          </View>
          
          {currentCategory?.unlocked ? (
            <>
              {currentCategory.articles.map(renderArticleCard)}
              
              {/* Coach Integration */}
              <Card style={styles.coachIntegrationCard}>
                <Text style={styles.coachIntegrationTitle}>💬 Need Help Understanding?</Text>
                <Text style={styles.coachIntegrationText}>
                  Ask your AI coach about any of these topics for personalized explanations
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    analytics.track('learn_coach_clicked', { category: selectedCategory });
                    router.push('/(app)/(tabs)/coach');
                  }}
                  style={styles.coachButton}
                >
                  Chat with AI Coach
                </Button>
              </Card>
            </>
          ) : (
            <Card style={styles.lockedSectionCard}>
              <Text style={styles.lockedSectionIcon}>🔒</Text>
              <Text style={styles.lockedSectionTitle}>Category Locked</Text>
              <Text style={styles.lockedSectionText}>
                This content will unlock after {Math.max(0, (currentCategory?.unlockDays || 0) - daysSinceQuit)} more days of being smoke-free
              </Text>
            </Card>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  
  // Progress Card
  progressCard: {
    margin: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  progressTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    ...Theme.typography.title1,
    color: Theme.colors.purple[500],
    fontWeight: 'bold',
  },
  progressLabel: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
  },
  unlockProgress: {
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  unlockProgressText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },

  // Categories Section
  categoriesSection: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  categoriesScroll: {
    paddingLeft: Theme.spacing.md,
  },
  categoriesScrollContent: {
    paddingRight: Theme.spacing.md,
  },
  categoryCard: {
    width: 180,
    padding: Theme.spacing.md,
    marginRight: Theme.spacing.md,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 120,
  },
  selectedCategory: {
    borderColor: Theme.colors.purple[500],
    backgroundColor: Theme.colors.purple[500] + '10',
  },
  lockedCategory: {
    opacity: 0.5,
  },
  categoryIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    ...Theme.typography.callout,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  categoryDescription: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: Theme.spacing.sm,
  },
  categoryStats: {
    marginTop: 'auto',
  },
  categoryStatsText: {
    ...Theme.typography.caption2,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
  },
  unlockBadge: {
    alignSelf: 'center',
    marginTop: Theme.spacing.xs,
  },
  lockedText: {
    opacity: 0.6,
  },

  // Articles Section
  articlesSection: {
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  articlesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  articleCard: {
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
    position: 'relative',
  },
  lockedArticle: {
    opacity: 0.6,
  },
  completedArticle: {
    borderColor: Theme.colors.success.text,
    backgroundColor: Theme.colors.success.text + '10',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  articleActions: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  readTime: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  completedIcon: {
    fontSize: 16,
  },
  articleTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  articleDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.sm,
  },
  
  // Article Preview
  articlePreview: {
    backgroundColor: Theme.colors.dark.background,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  previewTitle: {
    ...Theme.typography.callout,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  },
  previewItem: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    marginBottom: 2,
  },
  previewTakeaways: {
    ...Theme.typography.caption1,
    color: Theme.colors.purple[500],
    marginTop: Theme.spacing.xs,
    fontStyle: 'italic',
  },
  expandButton: {
    alignSelf: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
  },
  expandButtonText: {
    ...Theme.typography.caption1,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },

  // Lock Overlay
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.lg,
  },
  lockIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  lockText: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },

  // Locked Section
  lockedSectionCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  lockedSectionIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  lockedSectionTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  lockedSectionText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Recommendations
  recommendationsCard: {
    margin: Theme.spacing.md,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.purple[500] + '10',
    borderColor: Theme.colors.purple[500] + '30',
    borderWidth: 1,
  },
  recommendationsTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.purple[500],
    marginBottom: Theme.spacing.xs,
  },
  recommendationsText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.md,
  },
  recommendationsList: {
    gap: Theme.spacing.sm,
  },
  recommendationItem: {
    backgroundColor: Theme.colors.dark.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  recommendationTitle: {
    ...Theme.typography.callout,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  recommendationDescription: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
  },

  // Coach Integration
  coachIntegrationCard: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.purple[500] + '15',
    borderColor: Theme.colors.purple[500],
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  coachIntegrationTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  coachIntegrationText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  coachButton: {
    minWidth: 160,
  },

  // Bottom spacing
  bottomSpacing: {
    height: Theme.spacing.xl,
  },
});