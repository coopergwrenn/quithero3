import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../../../src/design-system/theme';
import { Card, Badge, Button } from '../../../src/design-system/components';
import { useCommunityStore } from '../../../src/stores/communityStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { useQuitStore } from '../../../src/stores/quitStore';
import { analytics } from '../../../src/services/analytics';
import { Heart, MessageCircle, Users, TrendingUp } from 'lucide-react-native';

export default function CommunityScreen() {
  const router = useRouter();
  const { posts, loading, loadPosts, createPost, likePost, unlikePost, userLikes } = useCommunityStore();
  const { user } = useAuthStore();
  const { quitData } = useQuitStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'milestone' | 'struggle' | 'tip' | 'celebration'>('all');

  useEffect(() => {
    loadPosts();
    analytics.track('community_viewed');
  }, []);

  const filteredPosts = selectedFilter === 'all' 
    ? posts 
    : posts.filter(post => post.post_type === selectedFilter);

  const handleLike = async (postId: string) => {
    if (!user) {
      router.push('/(auth)/signin');
      return;
    }

    try {
      if (userLikes.has(postId)) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleCreatePost = () => {
    if (!user) {
      router.push('/(auth)/signin');
      return;
    }
    // Navigate to create post screen
    analytics.track('community_create_post_clicked');
  };

  const renderPost = (post: any) => (
    <Card key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
          <Text style={styles.authorName}>{post.anonymous_name}</Text>
          <Badge 
            variant={post.streak_days >= 30 ? 'success' : 'secondary'} 
            size="sm"
            style={styles.streakBadge}
          >
            🔥 {post.streak_days}d
          </Badge>
        </View>
        <Badge 
          variant={post.post_type === 'milestone' ? 'primary' : 'secondary'}
          size="sm"
        >
          {post.post_type}
        </Badge>
      </View>
      
      <Text style={styles.postContent}>{post.content}</Text>
      
      <View style={styles.postFooter}>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => handleLike(post.id)}
        >
          <Heart 
            size={16} 
            color={userLikes.has(post.id) ? Theme.colors.error.text : Theme.colors.text.tertiary}
            fill={userLikes.has(post.id) ? Theme.colors.error.text : 'none'}
          />
          <Text style={styles.likeCount}>{post.likes_count}</Text>
        </TouchableOpacity>
        
        <Text style={styles.postTime}>
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>
          Connect with others on their quit journey
        </Text>
      </View>

      {/* Community Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Users size={24} color={Theme.colors.purple[500]} />
            <Text style={styles.statValue}>50K+</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <TrendingUp size={24} color={Theme.colors.success.text} />
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={24} color={Theme.colors.info.text} />
            <Text style={styles.statValue}>1M+</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
      </Card>

      {/* Create Post Button */}
      <Button 
        variant="primary" 
        size="md" 
        fullWidth
        onPress={handleCreatePost}
        style={styles.createButton}
      >
        Share Your Journey
      </Button>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'All Posts' },
          { key: 'milestone', label: '🏆 Milestones' },
          { key: 'struggle', label: '💪 Struggles' },
          { key: 'tip', label: '💡 Tips' },
          { key: 'celebration', label: '🎉 Wins' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.activeFilterTab
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts Feed */}
      <ScrollView 
        style={styles.postsContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadPosts}
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map(renderPost)
        ) : (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💬</Text>
            <Text style={styles.emptyStateTitle}>No posts yet</Text>
            <Text style={styles.emptyStateText}>
              Be the first to share your journey with the community!
            </Text>
          </Card>
        )}
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
    padding: Theme.layout.screenPadding,
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
  statsCard: {
    margin: Theme.layout.screenPadding,
    marginTop: 0,
    padding: Theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statValue: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
  },
  createButton: {
    marginHorizontal: Theme.layout.screenPadding,
    marginBottom: Theme.spacing.lg,
  },
  filterContainer: {
    marginBottom: Theme.spacing.md,
  },
  filterContent: {
    paddingHorizontal: Theme.layout.screenPadding,
    gap: Theme.spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.dark.surface,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  activeFilterTab: {
    backgroundColor: Theme.colors.purple[500],
    borderColor: Theme.colors.purple[500],
  },
  filterText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Theme.colors.text.primary,
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: Theme.layout.screenPadding,
  },
  postCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  authorName: {
    ...Theme.typography.callout,
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  streakBadge: {
    marginLeft: Theme.spacing.xs,
  },
  postContent: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: Theme.spacing.md,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    padding: Theme.spacing.xs,
  },
  likeCount: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
  },
  postTime: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
  },
  emptyState: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.lg,
  },
  emptyStateTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});