import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  RefreshControl,
  Alert,
  Modal,
  FlatList,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, Button } from '@/src/design-system/components';
import { useCommunityStore } from '@/src/stores/communityStore';
import { useQuitStore } from '@/src/stores/quitStore';
import { useAuthStore } from '@/src/stores/authStore';
import { analytics } from '@/src/services/analytics';

const { width } = Dimensions.get('window');

// Post types with enhanced crisis support
const POST_TYPES = [
  { id: 'crisis', label: '🆘 Crisis/Temptation', urgent: true, color: '#EF4444' },
  { id: 'success', label: '🎉 Success Story', urgent: false, color: '#22C55E' },
  { id: 'checkin', label: '✅ Daily Check-in', urgent: false, color: '#3B82F6' },
  { id: 'tip', label: '💡 Tips & Strategies', urgent: false, color: '#F59E0B' },
  { id: 'milestone', label: '🏆 Milestone Celebration', urgent: false, color: '#8B5CF6' },
  { id: 'question', label: '❓ Questions', urgent: false, color: '#06B6D4' },
];

// Quick response templates for crisis support
const CRISIS_RESPONSES = [
  "💪 You've got this! The craving will pass!",
  "🔥 Stay strong! You're stronger than this urge!",
  "⏰ This feeling is temporary - breathe through it!",
  "🌟 You've come so far, don't give up now!",
  "🤝 We're here for you! You're not alone!",
  "🎯 Remember why you started this journey!",
];

// Achievement definitions
const ACHIEVEMENTS = {
  milestones: [
    { id: 'week_warrior', days: 7, title: 'Week Warrior', emoji: '🔥', description: '7 days vape-free' },
    { id: 'month_master', days: 30, title: 'Month Master', emoji: '⭐', description: '30 days vape-free' },
    { id: 'quarter_champion', days: 90, title: 'Quarter Champion', emoji: '💎', description: '90 days vape-free' },
    { id: 'year_legend', days: 365, title: 'Year Legend', emoji: '👑', description: '365 days vape-free' },
    { id: 'lifetime_hero', days: 1000, title: 'Lifetime Hero', emoji: '🏆', description: '1000+ days vape-free' },
  ],
  community: [
    { id: 'wise_advisor', posts: 50, title: 'Wise Advisor', emoji: '💬', description: '50+ helpful tips posted' },
    { id: 'crisis_angel', responses: 100, title: 'Crisis Angel', emoji: '🤗', description: '100+ crisis responses' },
    { id: 'inspiration_engine', likes: 500, title: 'Inspiration Engine', emoji: '📢', description: '500+ total post likes' },
    { id: 'daily_supporter', streak: 30, title: 'Daily Supporter', emoji: '🎯', description: '30-day community streak' },
  ]
};

type TabType = 'feed' | 'leaderboards' | 'achievements';

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState(POST_TYPES[0]);
  const [postContent, setPostContent] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [onlineUsers] = useState(Math.floor(Math.random() * 50) + 10);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('streak');
  
  const { posts, loading, loadPosts, createPost, likePost } = useCommunityStore();
  const { quitData } = useQuitStore();
  const { user } = useAuthStore();
  
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPosts();
    analytics.track('community_opened', { tab: activeTab });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    try {
      const streakDays = quitData.quitDate ? 
        Math.floor((Date.now() - new Date(quitData.quitDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      await createPost(postContent, selectedPostType.id as any, streakDays);
      
      // If crisis post, trigger community alert
      if (selectedPostType.id === 'crisis') {
        analytics.track('crisis_post_created', { streak_days: streakDays });
        Alert.alert(
          'Crisis Alert Sent! 🚨',
          'Active community members have been notified. Help is on the way!',
          [{ text: 'OK', style: 'default' }]
        );
      }
      
      setPostContent('');
      setShowCreatePost(false);
      analytics.track('community_post_created', { type: selectedPostType.id });
    } catch (error) {
      Alert.alert('Error', 'Could not create post. Please try again.');
    }
  };

  const handleCrisisResponse = (postId: string, response: string) => {
    // In a real app, this would add a response/comment
    Alert.alert('Response Sent!', 'Your support message has been sent.');
    analytics.track('crisis_response_sent', { post_id: postId });
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { id: 'feed', label: 'Feed', icon: '💬' },
        { id: 'leaderboards', label: 'Rankings', icon: '🏆' },
        { id: 'achievements', label: 'Badges', icon: '⭐' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => setActiveTab(tab.id as TabType)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFeedHeader = () => (
    <View style={styles.feedHeader}>
      <View style={styles.communityStats}>
        <Text style={styles.onlineCount}>🟢 {onlineUsers} online now</Text>
        <Text style={styles.supportText}>24/7 peer support available</Text>
      </View>
      
      <View style={styles.createPostSection}>
        <TouchableOpacity
          style={[styles.createButton, styles.crisisButton]}
          onPress={() => {
            setSelectedPostType(POST_TYPES[0]); // Crisis type
            setShowCreatePost(true);
          }}
        >
          <Text style={styles.crisisButtonText}>🆘 Need Support Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Text style={styles.createButtonText}>💬 Share with Community</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: any }) => {
    const postType = POST_TYPES.find(type => type.id === item.post_type) || POST_TYPES[0];
    const timeAgo = getTimeAgo(item.created_at);
    
    return (
                           <Card style={StyleSheet.flatten([
         styles.postCard,
         item.post_type === 'crisis' && styles.crisisPost
       ])}>
         {item.post_type === 'crisis' && (
           <View style={styles.urgentBanner}>
             <Text style={styles.urgentText}>🆘 URGENT - NEEDS SUPPORT</Text>
           </View>
         )}
         
         <View style={styles.postHeader}>
           <View style={styles.userInfo}>
             <Text style={styles.anonymousName}>{item.anonymous_name}</Text>
             <Text style={styles.streakInfo}>
               {item.streak_days > 0 ? `🔥 ${item.streak_days} day streak` : 'Starting journey'}
             </Text>
           </View>
           <Text style={styles.timeAgo}>{timeAgo}</Text>
         </View>
         
         <View style={styles.postContent}>
           <View style={styles.postTypeTag}>
             <Text style={StyleSheet.flatten([styles.postTypeText, { color: postType.color }])}>
               {postType.label}
             </Text>
           </View>
           <Text style={styles.postText}>{item.content}</Text>
         </View>
         
         <View style={styles.postActions}>
           <TouchableOpacity
             style={styles.likeButton}
             onPress={() => likePost(item.id)}
           >
             <Text style={styles.likeIcon}>❤️</Text>
             <Text style={styles.likeCount}>{item.likes_count || 0}</Text>
           </TouchableOpacity>
           
           {item.post_type === 'crisis' && (
             <View style={styles.crisisResponses}>
               {CRISIS_RESPONSES.slice(0, 2).map((response, index) => (
                 <TouchableOpacity
                   key={index}
                   style={styles.quickResponse}
                   onPress={() => handleCrisisResponse(item.id, response)}
                 >
                   <Text style={styles.quickResponseText}>{response}</Text>
                 </TouchableOpacity>
               ))}
             </View>
           )}
         </View>
       </Card>
    );
  };

  const renderLeaderboards = () => {
    const mockLeaderboards = {
      streak: [
        { rank: 1, name: 'VapeFreeHero', value: '847 days', badge: '🥇' },
        { rank: 2, name: 'QuitChampion92', value: '623 days', badge: '🥈' },
        { rank: 3, name: 'FreshAirFighter', value: '445 days', badge: '🥉' },
        { rank: 4, name: 'NicotineNinja', value: '387 days', badge: '4' },
        { rank: 5, name: 'BreathEasy', value: '342 days', badge: '5' },
      ],
      savings: [
        { rank: 1, name: 'MoneyMaster', value: '$8,247', badge: '🥇' },
        { rank: 2, name: 'SaverSupreme', value: '$6,891', badge: '🥈' },
        { rank: 3, name: 'BudgetBoss', value: '$5,432', badge: '🥉' },
        { rank: 4, name: 'CashKeeper', value: '$4,567', badge: '4' },
        { rank: 5, name: 'FrugalFighter', value: '$3,890', badge: '5' },
      ],
      helper: [
        { rank: 1, name: 'CrisisAngel', value: '234 responses', badge: '🥇' },
        { rank: 2, name: 'SupportStar', value: '189 responses', badge: '🥈' },
        { rank: 3, name: 'HelpingHero', value: '156 responses', badge: '🥉' },
        { rank: 4, name: 'CareChampion', value: '134 responses', badge: '4' },
        { rank: 5, name: 'KindnessKing', value: '98 responses', badge: '5' },
      ]
    };

    return (
      <View style={styles.leaderboardContainer}>
        <View style={styles.leaderboardTabs}>
          {[
            { id: 'streak', label: 'Streaks', icon: '🔥' },
            { id: 'savings', label: 'Savings', icon: '💰' },
            { id: 'helper', label: 'Helpers', icon: '🤗' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.leaderboardTab, leaderboardTab === tab.id && styles.activeLeaderboardTab]}
              onPress={() => setLeaderboardTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, leaderboardTab === tab.id && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>
            {leaderboardTab === 'streak' && '🏆 Current Streak Champions'}
            {leaderboardTab === 'savings' && '💰 Money Saved Leaders'}
            {leaderboardTab === 'helper' && '🤗 Community Heroes'}
          </Text>
          
          {mockLeaderboards[leaderboardTab as keyof typeof mockLeaderboards].map((entry, index) => (
            <View key={entry.rank} style={styles.leaderboardEntry}>
              <View style={styles.rankSection}>
                <Text style={[
                  styles.rankBadge,
                  entry.rank <= 3 && styles.topRankBadge
                ]}>
                  {entry.badge}
                </Text>
                <Text style={styles.rankNumber}>#{entry.rank}</Text>
              </View>
              
              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>{entry.name}</Text>
                <Text style={styles.entryValue}>{entry.value}</Text>
              </View>
              
              {entry.rank <= 3 && (
                <Text style={styles.crownEmoji}>👑</Text>
              )}
            </View>
          ))}
          
          <View style={styles.userPosition}>
            <Text style={styles.userPositionText}>
              You're #47 in Current Streaks! Keep climbing! 📈
            </Text>
          </View>
        </Card>
      </View>
    );
  };

  const renderAchievements = () => {
    const userDays = quitData.quitDate ? 
      Math.floor((Date.now() - new Date(quitData.quitDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
      <ScrollView style={styles.achievementsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.achievementSectionTitle}>🏆 Quit Milestones</Text>
        <View style={styles.badgeGrid}>
          {ACHIEVEMENTS.milestones.map((achievement) => {
            const earned = userDays >= achievement.days;
            const progress = Math.min(userDays / achievement.days, 1);
            
            return (
              <Card key={achievement.id} style={[styles.badgeCard, earned && styles.earnedBadge]}>
                <Text style={[styles.badgeEmoji, !earned && styles.lockedBadge]}>
                  {achievement.emoji}
                </Text>
                <Text style={[styles.badgeTitle, earned && styles.earnedBadgeTitle]}>
                  {achievement.title}
                </Text>
                <Text style={styles.badgeDescription}>{achievement.description}</Text>
                
                {!earned && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.max(0, achievement.days - userDays)} days to go
                    </Text>
                  </View>
                )}
                
                {earned && (
                  <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>📱 Share Achievement</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })}
        </View>

        <Text style={styles.achievementSectionTitle}>🤝 Community Impact</Text>
        <View style={styles.badgeGrid}>
          {ACHIEVEMENTS.community.map((achievement) => {
            // Mock progress for demo
            const earned = Math.random() > 0.7;
            
            return (
              <Card key={achievement.id} style={[styles.badgeCard, earned && styles.earnedBadge]}>
                <Text style={[styles.badgeEmoji, !earned && styles.lockedBadge]}>
                  {achievement.emoji}
                </Text>
                <Text style={[styles.badgeTitle, earned && styles.earnedBadgeTitle]}>
                  {achievement.title}
                </Text>
                <Text style={styles.badgeDescription}>{achievement.description}</Text>
                
                {earned && (
                  <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>📱 Share Achievement</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderCreatePostModal = () => (
    <Modal
      visible={showCreatePost}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreatePost(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Share with Community</Text>
          <TouchableOpacity 
            onPress={handleCreatePost}
            disabled={!postContent.trim()}
          >
            <Text style={[styles.modalPost, !postContent.trim() && styles.modalPostDisabled]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.postTypeLabel}>Post Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postTypeScroll}>
            {POST_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.postTypeOption,
                  selectedPostType.id === type.id && styles.selectedPostType,
                  type.urgent && styles.urgentPostType
                ]}
                onPress={() => setSelectedPostType(type)}
              >
                <Text style={styles.postTypeOptionText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.contentLabel}>Your Message</Text>
          <TextInput
            style={styles.contentInput}
            value={postContent}
            onChangeText={setPostContent}
            placeholder={getPlaceholderText(selectedPostType.id)}
            placeholderTextColor="#666"
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{postContent.length}/500</Text>

          {selectedPostType.id === 'crisis' && (
            <Card style={styles.crisisInfo}>
              <Text style={styles.crisisInfoTitle}>🚨 Crisis Support</Text>
              <Text style={styles.crisisInfoText}>
                Your post will be marked as urgent and active community members will be notified immediately. 
                Help is on the way!
              </Text>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderTabBar()}
      
      {activeTab === 'feed' && (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderFeedHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.feedContainer}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      )}
      
      {activeTab === 'leaderboards' && renderLeaderboards()}
      {activeTab === 'achievements' && renderAchievements()}
      
      {renderCreatePostModal()}
    </SafeAreaView>
  );
}

// Helper functions
const getTimeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
};

const getPlaceholderText = (postType: string) => {
  switch (postType) {
    case 'crisis': return "I'm having a tough moment and need support...";
    case 'success': return "Share your success story and what worked for you...";
    case 'checkin': return "How are you feeling today? Share your daily check-in...";
    case 'tip': return "Share a helpful tip or strategy that worked for you...";
    case 'milestone': return "Celebrate your milestone achievement...";
    case 'question': return "Ask the community a question...";
    default: return "Share with the community...";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.surface, // Match tab bar color for cohesive look
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.purple[500],
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: Theme.colors.purple[500],
  },
  feedContainer: {
    padding: 16,
    paddingBottom: 120, // Ensure content flows cleanly behind tabs
  },
  feedHeader: {
    marginBottom: 16,
  },
  communityStats: {
    backgroundColor: Theme.colors.dark.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  onlineCount: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  createPostSection: {
    gap: 8,
  },
  createButton: {
    backgroundColor: 'rgba(30, 42, 58, 0.8)', // Dark navy glass-morphism
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.purple[500] + '60',
    shadowColor: Theme.colors.purple[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  crisisButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red glass-morphism for crisis
    borderColor: '#EF4444' + '60',
    shadowColor: '#EF4444',
  },
  createButtonText: {
    color: Theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  crisisButtonText: {
    color: Theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  postCard: {
    padding: 16,
    marginBottom: 12,
  },
  crisisPost: {
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
  },
  urgentBanner: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  urgentText: {
    color: Theme.colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  anonymousName: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  streakInfo: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  timeAgo: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
  },
  postContent: {
    marginBottom: 12,
  },
  postTypeTag: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postText: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    lineHeight: 24,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 8,
  },
  likeIcon: {
    fontSize: 16,
  },
  likeCount: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  crisisResponses: {
    flex: 1,
    gap: 4,
  },
  quickResponse: {
    backgroundColor: '#22C55E20',
    padding: 8,
    borderRadius: 8,
  },
  quickResponseText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  leaderboardContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 120, // Ensure content flows cleanly behind tabs
  },
  leaderboardTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 12,
    padding: 4,
  },
  leaderboardTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeLeaderboardTab: {
    backgroundColor: Theme.colors.purple[500],
  },
  leaderboardCard: {
    padding: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  rankBadge: {
    fontSize: 18,
    marginRight: 8,
  },
  topRankBadge: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  entryValue: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  crownEmoji: {
    fontSize: 20,
  },
  userPosition: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Theme.colors.purple[500] + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  userPositionText: {
    fontSize: 14,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  achievementsContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 120, // Ensure content flows cleanly behind tabs
  },
  achievementSectionTitle: {
    fontSize: 20,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  badgeCard: {
    width: (width - 44) / 2,
    padding: 16,
    alignItems: 'center',
  },
  earnedBadge: {
    backgroundColor: Theme.colors.purple[500] + '20',
    borderColor: Theme.colors.purple[500],
    borderWidth: 1,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockedBadge: {
    opacity: 0.3,
  },
  badgeTitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  earnedBadgeTitle: {
    color: Theme.colors.text.primary,
  },
  badgeDescription: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Theme.colors.dark.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: Theme.colors.text.tertiary,
  },
  shareButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 6,
  },
  shareButtonText: {
    fontSize: 10,
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  modalCancel: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
  },
  modalTitle: {
    fontSize: 18,
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  modalPost: {
    fontSize: 16,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  modalPostDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  postTypeLabel: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  postTypeScroll: {
    marginBottom: 24,
  },
  postTypeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedPostType: {
    backgroundColor: Theme.colors.purple[500],
  },
  urgentPostType: {
    backgroundColor: '#EF4444',
  },
  postTypeOptionText: {
    fontSize: 12,
    color: Theme.colors.text.primary,
    fontWeight: '500',
  },
  contentLabel: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  contentInput: {
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Theme.colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  crisisInfo: {
    padding: 16,
    backgroundColor: '#EF444420',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  crisisInfoTitle: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
    marginBottom: 8,
  },
  crisisInfoText: {
    fontSize: 14,
    color: Theme.colors.text.primary,
    lineHeight: 20,
  },
});