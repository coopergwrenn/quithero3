import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Theme } from '@/src/design-system/theme';
import { useCommunityStore } from '@/src/stores/communityStore';

interface PostComment {
  id: string;
  user_id: string;
  post_id: string;
  parent_comment_id: string | null;
  content: string;
  anonymous_name: string;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postAuthor: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  postId,
  postAuthor,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const { 
    comments, 
    loadingComments, 
    loadComments, 
    createComment 
  } = useCommunityStore();

  const postComments = comments[postId] || [];

  useEffect(() => {
    if (visible && postId) {
      loadComments(postId);
    }
  }, [visible, postId, loadComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment(postId, newComment.trim(), replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      Alert.alert('Error', 'Could not post comment. Please try again.');
    }
  };

  const generateAvatar = (name: string) => {
    const avatars = ['👤', '👨', '👩', '🧑', '👱‍♀️', '👱‍♂️', '🧔', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👨‍🦱', '👩‍🦳', '👨‍🦳'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatars.length;
    return avatars[index];
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const renderComment = (comment: PostComment, isReply = false) => {
    const avatar = generateAvatar(comment.anonymous_name);
    
    return (
      <View key={comment.id} style={[styles.commentContainer, isReply && styles.replyContainer]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserSection}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarEmoji}>{avatar}</Text>
            </View>
            <View style={styles.commentUserInfo}>
              <Text style={styles.commentUserName}>{comment.anonymous_name}</Text>
              <View style={styles.commentMeta}>
                <Text style={styles.commentStreak}>
                  {comment.streak_days > 0 ? `🔥 ${comment.streak_days} days` : '🌱 Starting'}
                </Text>
                <Text style={styles.commentTimeSeparator}>•</Text>
                <Text style={styles.commentTime}>{getTimeAgo(comment.created_at)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.commentContent}>{comment.content}</Text>
        
        {!isReply && (
          <TouchableOpacity 
            style={styles.replyButton}
            onPress={() => setReplyingTo(comment.id)}
          >
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Organize comments into threads
  const topLevelComments = postComments.filter(comment => !comment.parent_comment_id);
  const replies = postComments.filter(comment => comment.parent_comment_id);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.commentsScroll} showsVerticalScrollIndicator={false}>
            {loadingComments ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading comments...</Text>
              </View>
            ) : postComments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>💬</Text>
                <Text style={styles.emptyTitle}>No comments yet</Text>
                <Text style={styles.emptySubtitle}>Be the first to comment and show your support!</Text>
              </View>
            ) : (
              <View style={styles.commentsContainer}>
                {topLevelComments.map(comment => (
                  <View key={comment.id}>
                    {renderComment(comment)}
                    {/* Render replies */}
                    {replies
                      .filter(reply => reply.parent_comment_id === comment.id)
                      .map(reply => renderComment(reply, true))
                    }
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Comment Input */}
          <View style={styles.inputContainer}>
            {replyingTo && (
              <View style={styles.replyingIndicator}>
                <Text style={styles.replyingText}>
                  Replying to {postComments.find(c => c.id === replyingTo)?.anonymous_name}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Text style={styles.cancelReply}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.inputRow}>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  commentsScroll: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  commentsContainer: {
    padding: 16,
  },
  commentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyContainer: {
    marginLeft: 20,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  commentHeader: {
    marginBottom: 12,
  },
  commentUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(144, 213, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(144, 213, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarEmoji: {
    fontSize: 16,
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentStreak: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.purple[500],
  },
  commentTimeSeparator: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 6,
  },
  commentTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  replyButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.purple[500],
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(144, 213, 255, 0.1)',
    borderRadius: 8,
  },
  replyingText: {
    fontSize: 12,
    color: Theme.colors.purple[500],
    fontWeight: '500',
  },
  cancelReply: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(144, 213, 255, 0.3)',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CommentsModal;
