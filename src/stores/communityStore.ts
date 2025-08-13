import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import { Database } from '@/types/database';

type CommunityPost = Database['public']['Tables']['community_posts']['Row'];
type PostLike = Database['public']['Tables']['post_likes']['Row'];

interface CommunityStore {
  posts: CommunityPost[];
  loading: boolean;
  userLikes: Set<string>;
  
  // Actions
  loadPosts: () => Promise<void>;
  createPost: (content: string, postType: CommunityPost['post_type'], streakDays: number) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  loadUserLikes: (userId: string) => Promise<void>;
  subscribeToUpdates: () => () => void;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  posts: [],
  loading: false,
  userLikes: new Set(),

  loadPosts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      set({ posts: data || [] });
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (content: string, postType: CommunityPost['post_type'], streakDays: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Generate anonymous name
      const anonymousNames = [
        'Smoke-Free Warrior', 'Quit Champion', 'Freedom Fighter', 'Clean Air Seeker',
        'Health Hero', 'Nicotine Ninja', 'Breath of Fresh Air', 'Smoke-Free Soul',
        'Quit Quest', 'Liberation Leader', 'Smoke-Free Sage', 'Quit Crusader'
      ];
      const anonymousName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: user.id,
          content,
          post_type: postType,
          streak_days: streakDays,
          anonymous_name: anonymousName,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local state
      set(state => ({
        posts: [data, ...state.posts]
      }));
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  likePost: async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('post_likes')
        .insert([{
          user_id: user.id,
          post_id: postId,
        }]);
      
      if (error) throw error;
      
      // Update local state
      set(state => ({
        userLikes: new Set([...state.userLikes, postId]),
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        )
      }));
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  unlikePost: async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);
      
      if (error) throw error;
      
      // Update local state
      set(state => {
        const newLikes = new Set(state.userLikes);
        newLikes.delete(postId);
        
        return {
          userLikes: newLikes,
          posts: state.posts.map(post => 
            post.id === postId 
              ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
              : post
          )
        };
      });
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  loadUserLikes: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const likedPostIds = new Set(data?.map(like => like.post_id) || []);
      set({ userLikes: likedPostIds });
    } catch (error) {
      console.error('Error loading user likes:', error);
    }
  },

  subscribeToUpdates: () => {
    const subscription = supabase
      .channel('community_posts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        (payload) => {
          set(state => ({
            posts: [payload.new as CommunityPost, ...state.posts]
          }));
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload) => {
          set(state => ({
            posts: state.posts.map(post => 
              post.id === payload.new.id ? payload.new as CommunityPost : post
            )
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
}));