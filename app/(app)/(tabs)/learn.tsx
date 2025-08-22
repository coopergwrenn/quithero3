import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';

const { width } = Dimensions.get('window');

export default function LearnScreen() {
  const [selectedCategory, setSelectedCategory] = useState('quick-start');
  const [readArticles, setReadArticles] = useState(new Set());
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const { quitData } = useQuitStore();

  useEffect(() => {
    analytics.track('learn_tab_opened');
  }, []);

  const categories = [
    { id: 'quick-start', title: 'Quick Start', icon: '🚀' },
    { id: 'health', title: 'Health Recovery', icon: '🫁' },
    { id: 'nrt', title: 'NRT Guide', icon: '💊' },
    { id: 'science', title: 'Science', icon: '🧠' },
    { id: 'strategies', title: 'Strategies', icon: '🎯' }
  ];

  // Health Recovery Timeline Milestones with Personalization
  const getRecoveryMilestones = () => {
    const quitDate = quitData?.quitDate;
    const now = new Date();
    
    const timeSinceQuit = quitDate ? now.getTime() - new Date(quitDate).getTime() : 0;
    const minutesSinceQuit = Math.floor(timeSinceQuit / (1000 * 60));
    const hoursSinceQuit = Math.floor(timeSinceQuit / (1000 * 60 * 60));
    const daysSinceQuit = Math.floor(timeSinceQuit / (1000 * 60 * 60 * 24));
    const yearsSinceQuit = daysSinceQuit / 365;

    return [
      { 
        time: '20 minutes', 
        title: 'Heart Rate Normalizes', 
        description: 'Heart rate and blood pressure drop to normal levels',
        achieved: minutesSinceQuit >= 20,
        timeframe: 20 * 60 * 1000, // 20 minutes in milliseconds
        emoji: '❤️'
      },
      { 
        time: '12 hours', 
        title: 'Carbon Monoxide Clears', 
        description: 'CO levels drop, oxygen levels increase to normal',
        achieved: hoursSinceQuit >= 12,
        timeframe: 12 * 60 * 60 * 1000, // 12 hours
        emoji: '🫁'
      },
      { 
        time: '2 weeks', 
        title: 'Circulation Improves', 
        description: 'Circulation improves, lung function increases up to 30%',
        achieved: daysSinceQuit >= 14,
        timeframe: 14 * 24 * 60 * 60 * 1000, // 2 weeks
        emoji: '🩸'
      },
      { 
        time: '1 month', 
        title: 'Lung Function Boost', 
        description: 'Coughing and shortness of breath decrease significantly',
        achieved: daysSinceQuit >= 30,
        timeframe: 30 * 24 * 60 * 60 * 1000, // 1 month
        emoji: '💨'
      },
      { 
        time: '3 months', 
        title: 'Major Recovery', 
        description: 'Circulation dramatically improves, lung function increases',
        achieved: daysSinceQuit >= 90,
        timeframe: 90 * 24 * 60 * 60 * 1000, // 3 months
        emoji: '⚡'
      },
      { 
        time: '1 year', 
        title: 'Heart Disease Risk Halved', 
        description: 'Risk of coronary heart disease is cut in half',
        achieved: yearsSinceQuit >= 1,
        timeframe: 365 * 24 * 60 * 60 * 1000, // 1 year
        emoji: '💪'
      },
      { 
        time: '5 years', 
        title: 'Stroke Risk Normalized', 
        description: 'Stroke risk reduced to that of a non-smoker',
        achieved: yearsSinceQuit >= 5,
        timeframe: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
        emoji: '🧠'
      },
      { 
        time: '10 years', 
        title: 'Lung Cancer Risk Halved', 
        description: 'Lung cancer death rate is half that of a smoker',
        achieved: yearsSinceQuit >= 10,
        timeframe: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
        emoji: '🏆'
      },
      { 
        time: '15 years', 
        title: 'Full Recovery', 
        description: 'Heart disease risk is the same as a non-smoker',
        achieved: yearsSinceQuit >= 15,
        timeframe: 15 * 365 * 24 * 60 * 60 * 1000, // 15 years
        emoji: '👑'
      }
    ];
  };

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

  const healthContent = [
    {
      id: 'recovery-timeline',
      title: 'Health Recovery Timeline',
      readTime: '6 min read', 
      preview: 'Discover how your body heals after quitting smoking',
      content: `Your Body's Amazing Recovery Timeline

Your body begins healing within minutes of your last cigarette. Here's the science-backed timeline:

Immediate Recovery (0-72 Hours)

20 Minutes:
• Heart rate drops to normal levels
• Blood pressure begins to decrease
• Circulation to hands and feet improves
• Body temperature of hands and feet increases

12 Hours:
• Carbon monoxide level drops to normal
• Blood oxygen level increases to normal
• Risk of heart attack begins to decrease

24 Hours:
• Anxiety peaks and then begins to decrease
• Chance of heart attack decreases significantly

48 Hours:
• Nerve endings begin to regenerate
• Sense of smell and taste start to improve
• Ability to smell and taste is enhanced

72 Hours:
• Bronchial tubes relax, breathing becomes easier
• Lung capacity increases
• Nicotine is completely eliminated from the body

Short-term Recovery (1 Week - 3 Months)

1 Week:
• Risk of relapse decreases significantly
• Confidence in quit ability increases
• Sleep patterns normalize

2 Weeks:
• Circulation continues to improve
• Walking becomes easier
• Lung function increases up to 30%
• Withdrawal symptoms largely subside

1 Month:
• Coughing and shortness of breath decrease
• Energy levels increase noticeably
• Immune system function improves
• Risk of infection decreases

3 Months:
• Circulation improves significantly
• Lung function increases by up to 30%
• Cough and breathing problems continue to improve
• Overall physical fitness improves

Long-term Recovery (1+ Years)

1 Year:
• Risk of coronary heart disease is cut in half
• Risk of stroke decreases significantly
• Lung function and circulation improve dramatically
• Cancer risk begins to decrease

5 Years:
• Risk of stroke reduces to that of non-smokers
• Risk of mouth, throat, esophagus, and bladder cancer is cut in half
• Cervical cancer risk falls to that of non-smokers

10 Years:
• Risk of lung cancer falls to half that of smokers
• Risk of pancreatic and kidney cancer decreases significantly
• Pre-cancerous cells are replaced with healthy cells

15 Years:
• Risk of coronary heart disease equals that of non-smokers
• Risk of death returns to nearly the level of people who have never smoked
• Life expectancy approaches that of non-smokers

What You Can Do to Accelerate Healing

Nutrition:
• Eat antioxidant-rich foods (berries, leafy greens)
• Increase vitamin C intake
• Stay hydrated with 8+ glasses of water daily
• Reduce inflammatory foods

Exercise:
• Start with light cardio (walking, swimming)
• Focus on breathing exercises
• Gradually increase intensity as lung function improves
• Include strength training after first month

Environment:
• Avoid secondhand smoke completely
• Use air purifiers if possible
• Spend time in clean, outdoor air
• Avoid other pollutants when possible

Your body is incredibly resilient and wants to heal. Every day smoke-free is a gift to your future self!`
    }
  ];

  const nrtContent = [
    {
      id: 'nrt-guide',
      title: 'Complete NRT Guide',
      readTime: '10 min read',
      preview: 'Everything you need to know about nicotine replacement therapy',
      content: `Complete Guide to Nicotine Replacement Therapy (NRT)

MEDICAL DISCLAIMER: This information is for educational purposes only. Always consult your healthcare provider before starting any NRT. This is not a substitute for professional medical advice.

What is NRT?

Nicotine Replacement Therapy provides controlled doses of nicotine without the harmful chemicals found in cigarettes. It helps manage withdrawal symptoms while you break behavioral habits.

Types of NRT

Nicotine Patches
• Deliver steady nicotine through skin over 16-24 hours
• Reduce overall withdrawal symptoms
• Most convenient option - apply once daily

Dosing guidelines:
• 21mg patch: For heavy smokers (20+ cigarettes/day)
• 14mg patch: For moderate smokers (10-19 cigarettes/day)
• 7mg patch: For light smokers (<10 cigarettes/day) or step-down

Step-down protocol:
• Start with appropriate dose for 6-8 weeks
• Step down to next lower dose for 2-4 weeks
• Step down to lowest dose for 2-4 weeks
• Total treatment: 10-16 weeks

Nicotine Gum
• Fast-acting nicotine absorption through mouth lining
• User controls timing and amount
• Helps with hand-to-mouth habit

Dosing:
• 4mg gum: For heavy smokers or strong cravings
• 2mg gum: For light-moderate smokers

Proper technique:
• Chew slowly until peppery taste appears
• "Park" between cheek and gum for 20-30 minutes
• Do NOT continuously chew like regular gum
• Avoid eating/drinking 15 minutes before and during use

Nicotine Lozenges
• Dissolve slowly in mouth for steady nicotine release
• No chewing required
• Discrete and convenient

Dosing:
• 4mg lozenge: If you smoke within 30 minutes of waking
• 2mg lozenge: If you smoke more than 30 minutes after waking

Combination Therapy

Patch + Fast-Acting NRT:
• Patch provides steady baseline nicotine
• Gum/lozenge handles breakthrough cravings
• Studies show 15-25% higher success rates
• Always consult healthcare provider first

Choosing the Right NRT

Consider patches if you:
• Want convenience (once daily)
• Have steady cravings throughout day
• Don't want to think about timing
• Have jaw problems preventing gum use

Consider gum/lozenges if you:
• Have irregular smoking patterns
• Want control over timing and dose
• Have skin sensitivity to patches
• Need help with hand-to-mouth habit

Success Tips

• Start on quit day: Don't wait for cravings to begin
• Use full recommended duration: Don't stop early
• Combine with behavioral support: Apps, counseling, support groups
• Be patient: NRT reduces but doesn't eliminate all cravings
• Step down gradually: Sudden stopping may trigger relapse

Remember: NRT is a tool, not a magic cure. Success rates double when NRT is used properly compared to willpower alone!`
    }
  ];

  const getAllContent = () => {
    switch(selectedCategory) {
      case 'quick-start':
        return quickStartContent;
      case 'health':
        return healthContent;
      case 'nrt':
        return nrtContent;
      case 'science':
        return quickStartContent; // Placeholder
      case 'strategies':
        return quickStartContent; // Placeholder
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

  // Interactive Health Recovery Timeline Component
  const renderHealthTimeline = () => {
    const milestones = getRecoveryMilestones();
    const quitDate = quitData?.quitDate;
    
    if (!quitDate) {
      return (
        <Card style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>🫁 Your Recovery Timeline</Text>
            <Text style={styles.timelineSubtitle}>Set your quit date to see your personalized progress</Text>
          </View>
        </Card>
      );
    }

    const achievedCount = milestones.filter(m => m.achieved).length;
    const nextMilestone = milestones.find(m => !m.achieved);

    return (
      <Card style={styles.timelineCard}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>🫁 Your Recovery Timeline</Text>
          <Text style={styles.timelineSubtitle}>
            {achievedCount} of {milestones.length} milestones achieved!
          </Text>
          {nextMilestone && (
            <Text style={styles.nextMilestone}>
              Next: {nextMilestone.title} in {nextMilestone.time}
            </Text>
          )}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
          {milestones.map((milestone, index) => (
            <View key={index} style={styles.milestoneContainer}>
              <View style={[
                styles.milestoneNode,
                milestone.achieved ? styles.milestoneAchieved : styles.milestonePending
              ]}>
                <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
              </View>
              
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneTime}>{milestone.time}</Text>
                <Text style={[
                  styles.milestoneTitle,
                  milestone.achieved ? styles.achievedText : styles.pendingText
                ]}>
                  {milestone.title}
                </Text>
                <Text style={styles.milestoneDescription}>
                  {milestone.description}
                </Text>
              </View>
              
              {index < milestones.length - 1 && (
                <View style={[
                  styles.timelineConnector,
                  milestone.achieved ? styles.connectorAchieved : styles.connectorPending
                ]} />
              )}
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.timelineFooter}>
          <Text style={styles.disclaimer}>
            ⚠️ Medical Disclaimer: This timeline is for educational purposes only. 
            Individual recovery varies. Consult your healthcare provider for personalized advice.
          </Text>
        </View>
      </Card>
    );
  };

  const renderContent = () => {
    // Show interactive timeline for health category
    if (selectedCategory === 'health') {
      return (
        <View>
          {renderHealthTimeline()}
          <View style={styles.sectionSpacer} />
          {healthContent.map(article => (
            <TouchableOpacity 
              key={article.id} 
              onPress={() => openArticle(article)}
              style={styles.articleCard}
            >
              <Card style={styles.articleCardInner}>
                <View style={styles.articleHeader}>
                  <Text style={styles.articleTitle}>{article.title || 'Untitled'}</Text>
                  {article.id && readArticles.has(article.id) && (
                    <Badge variant="success" style={styles.readBadge}>
                      ✓ Read
                    </Badge>
                  )}
                </View>
                <Text style={styles.articlePreview}>{article.preview || 'No preview available'}</Text>
                <View style={styles.articleMeta}>
                  <Text style={styles.readTime}>{article.readTime || '5 min read'}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Default content for other categories
    const content = getAllContent();
    
    return content.map(article => (
      <TouchableOpacity 
        key={article.id} 
        onPress={() => openArticle(article)}
        style={styles.articleCard}
      >
        <Card style={styles.articleCardInner}>
          <View style={styles.articleHeader}>
            <Text style={styles.articleTitle}>{article.title || 'Untitled'}</Text>
            {article.id && readArticles.has(article.id) && (
              <Badge variant="success" style={styles.readBadge}>
                ✓ Read
              </Badge>
            )}
          </View>
          <Text style={styles.articlePreview}>{article.preview || 'No preview available'}</Text>
          <View style={styles.articleMeta}>
            <Text style={styles.readTime}>{article.readTime || '5 min read'}</Text>
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Learn & Grow</Text>
          <Text style={styles.subtitle}>Evidence-based education for your quit journey</Text>
              </View>

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
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
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
    paddingBottom: Theme.spacing.xl,
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
  articleTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  readBadge: {
    flexShrink: 0,
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
  
  // Timeline styles
  timelineCard: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
  },
  timelineHeader: {
    marginBottom: Theme.spacing.lg,
  },
  timelineTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  timelineSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  nextMilestone: {
    ...Theme.typography.footnote,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  timelineScroll: {
    marginBottom: Theme.spacing.lg,
  },
  milestoneContainer: {
    alignItems: 'center',
    marginRight: Theme.spacing.lg,
    width: 120,
  },
  milestoneNode: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: Theme.spacing.sm,
  },
  milestoneAchieved: {
    backgroundColor: Theme.colors.success.background,
    borderColor: Theme.colors.success.text,
  },
  milestonePending: {
    backgroundColor: Theme.colors.dark.surfaceElevated,
    borderColor: Theme.colors.dark.border,
  },
  milestoneEmoji: {
    fontSize: 24,
  },
  milestoneContent: {
    alignItems: 'center',
    width: '100%',
  },
  milestoneTime: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  milestoneTitle: {
    ...Theme.typography.footnote,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievedText: {
    color: Theme.colors.success.text,
  },
  pendingText: {
    color: Theme.colors.text.secondary,
  },
  milestoneDescription: {
    ...Theme.typography.caption2,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 14,
  },
  timelineConnector: {
    position: 'absolute',
    top: 30,
    right: -Theme.spacing.lg,
    width: Theme.spacing.lg,
    height: 3,
    borderRadius: 1.5,
  },
  connectorAchieved: {
    backgroundColor: Theme.colors.success.text,
  },
  connectorPending: {
    backgroundColor: Theme.colors.dark.border,
  },
  timelineFooter: {
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  sectionSpacer: {
    height: Theme.spacing.lg,
  },
});