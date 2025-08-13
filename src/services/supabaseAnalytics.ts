/**
 * Supabase Analytics Service
 * Cloud-synced analytics with privacy controls
 */

import { supabase } from '@/src/lib/supabase';
import { Database } from '@/types/database';

type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Insert'];

class SupabaseAnalyticsService {
  private isEnabled = true;
  private eventQueue: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.startBatchProcessor();
  }

  // Core event tracking
  async track(eventName: string, eventData?: Record<string, any>) {
    if (!this.isEnabled) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Only track for authenticated users

      const event: AnalyticsEvent = {
        user_id: user.id,
        event_name: eventName,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
          platform: 'mobile',
        },
      };

      this.eventQueue.push(event);

      // Flush if batch size reached
      if (this.eventQueue.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Tool usage tracking
  async trackToolUsage(toolType: string, duration?: number, completed: boolean = true) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Track in analytics
      await this.track('tool_used', {
        tool_type: toolType,
        duration,
        completed,
      });

      // Track in dedicated tool_usage table
      const { error } = await supabase
        .from('tool_usage')
        .insert([{
          user_id: user.id,
          tool_type: toolType,
          duration,
          completed,
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Tool usage tracking error:', error);
    }
  }

  // Streak tracking
  async updateStreak(streakType: 'quit' | 'pledge' | 'tool_usage', currentStreak: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_streaks')
        .upsert([{
          user_id: user.id,
          streak_type: streakType,
          current_streak: currentStreak,
          best_streak: currentStreak, // Will be handled by database logic
          last_activity: new Date().toISOString(),
        }], {
          onConflict: 'user_id,streak_type'
        })
        .select()
        .single();

      if (error) throw error;

      // Track milestone achievements
      if (currentStreak > 0 && [1, 3, 7, 14, 30, 90, 365].includes(currentStreak)) {
        await this.track('streak_milestone_reached', {
          streak_type: streakType,
          days: currentStreak,
        });
      }

      return data;
    } catch (error) {
      console.error('Streak tracking error:', error);
    }
  }

  // User progress analytics
  async getUserAnalytics(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return [];
    }
  }

  // Tool usage statistics
  async getToolUsageStats(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('tool_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process statistics
      const stats = data?.reduce((acc, usage) => {
        const toolType = usage.tool_type;
        if (!acc[toolType]) {
          acc[toolType] = {
            total_uses: 0,
            completed_uses: 0,
            total_duration: 0,
            completion_rate: 0,
          };
        }

        acc[toolType].total_uses++;
        if (usage.completed) acc[toolType].completed_uses++;
        if (usage.duration) acc[toolType].total_duration += usage.duration;
        acc[toolType].completion_rate = acc[toolType].completed_uses / acc[toolType].total_uses;

        return acc;
      }, {} as Record<string, any>) || {};

      return stats;
    } catch (error) {
      console.error('Error fetching tool usage stats:', error);
      return {};
    }
  }

  // Cohort analysis
  async getCohortAnalytics(riskLevel?: string, motivation?: string) {
    try {
      let query = supabase
        .from('users')
        .select(`
          id,
          risk_level,
          motivation,
          streak_days,
          created_at,
          quit_date
        `);

      if (riskLevel) {
        query = query.eq('risk_level', riskLevel);
      }

      if (motivation) {
        query = query.eq('motivation', motivation);
      }

      const { data, error } = await query.limit(1000);
      if (error) throw error;

      // Calculate cohort metrics
      const now = new Date();
      const cohortMetrics = {
        total_users: data?.length || 0,
        active_users: data?.filter(user => {
          const lastActive = new Date(user.created_at);
          const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceActive <= 7;
        }).length || 0,
        average_streak: data?.reduce((sum, user) => sum + (user.streak_days || 0), 0) / (data?.length || 1) || 0,
        success_rate: data?.filter(user => (user.streak_days || 0) >= 7).length / (data?.length || 1) || 0,
      };

      return cohortMetrics;
    } catch (error) {
      console.error('Error fetching cohort analytics:', error);
      return null;
    }
  }

  // Privacy controls
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.eventQueue = [];
    }
  }

  async clearUserData(userId: string) {
    try {
      // Clear analytics events
      await supabase
        .from('analytics_events')
        .delete()
        .eq('user_id', userId);

      // Clear tool usage
      await supabase
        .from('tool_usage')
        .delete()
        .eq('user_id', userId);

      // Clear streaks
      await supabase
        .from('user_streaks')
        .delete()
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  // Private methods
  private async flush() {
    if (this.eventQueue.length === 0) return;

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(this.eventQueue);

      if (error) throw error;

      this.eventQueue = [];
    } catch (error) {
      console.error('Analytics flush error:', error);
    }
  }

  private startBatchProcessor() {
    setInterval(async () => {
      if (this.eventQueue.length > 0) {
        await this.flush();
      }
    }, this.flushInterval);
  }
}

// Export singleton instance
export const supabaseAnalytics = new SupabaseAnalyticsService();