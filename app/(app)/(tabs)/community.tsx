import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, Button, TextField } from '@/src/design-system/components';
import { useCommunityStore } from '@/src/stores/communityStore';
import { useAuthStore } from '@/src/stores/authStore';
import { Heart } from 'lucide-react-native';
import { useState, useEffect } from 'react';

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { posts, loading, userLikes, loadPosts, createPost, likePost, unlikePost, loadUserLikes } = useCommunityStore();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostType, setSelectedPostType] = useState<'milestone' | 'struggle' | 'tip' | 'celebration'>('tip');

  useEffect(() => {
    loadPosts();
    if (user) {
      loadUserLikes(user.id);
    }
  }, [user]);

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to share with the community', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/signin') }
      ]);
      return;
    }

    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    try {
      // Get user's current streak (mock for now)
      const streakDays = 5; // This would come from user profile
      
      await createPost(newPostContent.trim(), selectedPostType, streakDays);
      setNewPostContent('');
      setShowCreatePost(false);
      Alert.alert('Success', 'Your post has been shared with the community!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const handleLikeToggle = async (postId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to like posts', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/signin') }
      ]);
      return;
    }

    try {
      if (userLikes.has(postId)) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const getPostTypeEmoji = (type: string) => {
    switch (type) {
      case 'milestone': return '🎉';
      case 'struggle': return '💪';
      case 'tip': return '💡';
      case 'celebration': return '🌟';
      default: return '💬';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>
              {user ? 'Share your journey with others' : 'Connect with others on their quit journey'}
            </Text>
          </View>

          {/* Success Stories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Success Stories</Text>
            
            <Card style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Text style={styles.userName}>Alex M.</Text>
                <Badge variant="success" size="sm">6 months</Badge>
          {/* Create Post Modal */}
          {showCreatePost && (
            <Card style={styles.createPostCard}>
              <Text style={styles.createPostTitle}>Share with the Community</Text>
              
              <View style={styles.postTypeSelector}>
                {(['milestone', 'struggle', 'tip', 'celebration'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.postTypeOption,
                      selectedPostType === type && styles.selectedPostType
                    ]}
                    onPress={() => setSelectedPostType(type)}
                  >
                    <Text style={styles.postTypeEmoji}>{getPostTypeEmoji(type)}</Text>
                    <Text style={styles.postTypeLabel}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextField
                placeholder="Share your experience, tip, or milestone..."
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                numberOfLines={4}
                style={styles.postInput}
              />
              
              <View style={styles.createPostActions}>
                <Button
                  variant="ghost"
                  onPress={() => setShowCreatePost(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={handleCreatePost}
                  disabled={!newPostContent.trim()}
                >
                  Share
                </Button>
              </View>
            </Card>
          )}

          {/* Community Posts */}
          {loading ? (
            <Card style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading community posts...</Text>
            </Card>
          ) : posts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyDescription}>
                Be the first to share your quit journey with the community!
              </Text>
            </Card>
          ) : (
            <View style={styles.postsContainer}>
              {posts.map((post) => (
                <Card key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.postAuthor}>
                      <Text style={styles.postTypeEmoji}>
                        {getPostTypeEmoji(post.post_type)}
                      </Text>
                      <View>
                        <Text style={styles.authorName}>{post.anonymous_name}</Text>
                        <View style={styles.postMeta}>
                          <Badge variant="success" size="sm">
                            {post.streak_days} days
                          </Badge>
                          <Text style={styles.postTime}>
                            {formatTimeAgo(post.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.postContent}>{post.content}</Text>
                  
                  <View style={styles.postActions}>
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => handleLikeToggle(post.id)}
                    >
                      <Heart
                        size={16}
                        color={userLikes.has(post.id) ? Theme.colors.error.text : Theme.colors.text.tertiary}
                        fill={userLikes.has(post.id) ? Theme.colors.error.text : 'none'}
                      />
                      <Text style={[
                        styles.likeCount,
                        userLikes.has(post.id) && styles.likedText
                      ]}>
                        {post.likes_count}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {!user && (
            <Card style={styles.signInPrompt}>
              <Text style={styles.signInTitle}>Join the Community</Text>
              <Text style={styles.signInDescription}>
                Sign in to share your story and connect with others
              </Text>
              <Button
                variant="primary"
                size="md"
                onPress={() => router.push('/(auth)/signin')}
              >
                Sign In
              </Button>
            </Card>
          )}
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
    marginBottom: Theme.spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  createPostCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  createPostTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  postTypeSelector: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
    flexWrap: 'wrap',
  },
  postTypeOption: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  selectedPostType: {
    borderColor: Theme.colors.purple[500],
    backgroundColor: Theme.colors.purple[500] + '10',
  },
  postTypeEmoji: {
    fontSize: 20,
    marginBottom: Theme.spacing.xs,
  },
  postTypeLabel: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  postInput: {
    marginBottom: Theme.spacing.lg,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  loadingCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
  },
  emptyCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  emptyDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  postsContainer: {
    gap: Theme.spacing.md,
  },
  postCard: {
    padding: Theme.spacing.lg,
  },
  postHeader: {
    marginBottom: Theme.spacing.md,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  authorName: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  postTime: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
  },
  postContent: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: Theme.spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
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
  likedText: {
    color: Theme.colors.error.text,
  },
  signInPrompt: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  signInTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  signInDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
});