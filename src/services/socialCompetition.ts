/**
 * Social Competition Service
 * Leaderboards, peer challenges, and social features
 */

import { supabase } from '@/src/lib/supabase';
import { analytics } from './analytics';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  anonymousName: string;
  leaderboardType: 'streak' | 'savings' | 'tools';
  score: number;
  rank: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  createdAt: Date;
  updatedAt: Date;
}

export interface PeerChallenge {
  id: string;
  challengerId: string;
  challengedId: string;
  challengeType: 'streak' | 'savings' | 'tools';
  targetValue: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'completed' | 'declined';
  winnerId?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'savings' | 'tools' | 'social';
  requirement: number;
  unlockedAt?: Date;
}

class SocialCompetitionService {
  async updateLeaderboard(
    type: 'streak' | 'savings' | 'tools',
    score: number,
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time'
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate anonymous name
    const anonymousName = await this.generateAnonymousName();

    const { error } = await supabase
      .from('leaderboard_entries')
      .upsert([{
        user_id: user.id,
        anonymous_name: anonymousName,
        leaderboard_type: type,
        score,
        period,
        updated_at: new Date().toISOString(),
      }], {
        onConflict: 'user_id,leaderboard_type,period'
      });

    if (error) {
      console.error('Error updating leaderboard:', error);
      return;
    }

    // Recalculate ranks for this leaderboard
    await this.recalculateRanks(type, period);

    analytics.track('leaderboard_updated', {
      type,
      score,
      period,
    });
  }

  async getLeaderboard(
    type: 'streak' | 'savings' | 'tools',
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time',
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('leaderboard_type', type)
      .eq('period', period)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data.map(this.mapToLeaderboardEntry);
  }

  async getUserRank(
    type: 'streak' | 'savings' | 'tools',
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time'
  ): Promise<LeaderboardEntry | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('leaderboard_type', type)
      .eq('period', period)
      .single();

    if (error) return null;
    return this.mapToLeaderboardEntry(data);
  }

  async createPeerChallenge(
    challengedUserId: string,
    challengeType: 'streak' | 'savings' | 'tools',
    targetValue: number,
    durationDays: number
  ): Promise<PeerChallenge> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    const { data, error } = await supabase
      .from('peer_challenges')
      .insert([{
        challenger_id: user.id,
        challenged_id: challengedUserId,
        challenge_type: challengeType,
        target_value: targetValue,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;

    const challenge = this.mapToPeerChallenge(data);

    analytics.track('peer_challenge_created', {
      challenge_type: challengeType,
      target_value: targetValue,
      duration_days: durationDays,
    });

    return challenge;
  }

  async respondToPeerChallenge(
    challengeId: string,
    accept: boolean
  ): Promise<void> {
    const status = accept ? 'active' : 'declined';

    const { error } = await supabase
      .from('peer_challenges')
      .update({ status })
      .eq('id', challengeId);

    if (error) throw error;

    analytics.track('peer_challenge_responded', {
      challenge_id: challengeId,
      accepted: accept,
    });
  }

  async getUserChallenges(): Promise<PeerChallenge[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('peer_challenges')
      .select('*')
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching peer challenges:', error);
      return [];
    }

    return data.map(this.mapToPeerChallenge);
  }

  async checkAchievements(userId?: string): Promise<Achievement[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return [];

    // Get user's current stats
    const userProfile = await this.getUserProfile(targetUserId);
    if (!userProfile) return [];

    const achievements: Achievement[] = [];
    const streakDays = userProfile.streak_days || 0;
    const totalSaved = userProfile.total_saved || 0;

    // Streak achievements
    const streakMilestones = [1, 3, 7, 14, 30, 90, 365];
    for (const milestone of streakMilestones) {
      if (streakDays >= milestone) {
        achievements.push({
          id: `streak_${milestone}`,
          name: `${milestone} Day${milestone > 1 ? 's' : ''} Strong`,
          description: `Maintained a ${milestone}-day smoke-free streak`,
          icon: '🔥',
          category: 'streak',
          requirement: milestone,
          unlockedAt: new Date(),
        });
      }
    }

    // Savings achievements
    const savingsMilestones = [50, 100, 500, 1000, 5000];
    for (const milestone of savingsMilestones) {
      if (totalSaved >= milestone) {
        achievements.push({
          id: `savings_${milestone}`,
          name: `$${milestone} Saved`,
          description: `Saved $${milestone} by not smoking`,
          icon: '💰',
          category: 'savings',
          requirement: milestone,
          unlockedAt: new Date(),
        });
      }
    }

    return achievements;
  }

  private async recalculateRanks(
    type: 'streak' | 'savings' | 'tools',
    period: 'daily' | 'weekly' | 'monthly' | 'all-time'
  ): Promise<void> {
    // Get all entries for this leaderboard, ordered by score
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('id, score')
      .eq('leaderboard_type', type)
      .eq('period', period)
      .order('score', { ascending: false });

    if (error || !data) return;

    // Update ranks
    const updates = data.map((entry, index) => ({
      id: entry.id,
      rank: index + 1,
    }));

    for (const update of updates) {
      await supabase
        .from('leaderboard_entries')
        .update({ rank: update.rank })
        .eq('id', update.id);
    }
  }

  private async generateAnonymousName(): Promise<string> {
    const adjectives = [
      'Determined', 'Strong', 'Brave', 'Focused', 'Resilient', 'Mighty', 'Bold', 'Fierce',
      'Unstoppable', 'Courageous', 'Persistent', 'Dedicated', 'Committed', 'Powerful'
    ];
    
    const nouns = [
      'Warrior', 'Champion', 'Fighter', 'Hero', 'Conqueror', 'Victor', 'Achiever', 'Winner',
      'Survivor', 'Guardian', 'Defender', 'Crusader', 'Pioneer', 'Trailblazer'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    return `${adjective}${noun}${number}`;
  }

  private async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  }

  private mapToLeaderboardEntry(data: any): LeaderboardEntry {
    return {
      id: data.id,
      userId: data.user_id,
      anonymousName: data.anonymous_name,
      leaderboardType: data.leaderboard_type,
      score: data.score,
      rank: data.rank,
      period: data.period,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToPeerChallenge(data: any): PeerChallenge {
    return {
      id: data.id,
      challengerId: data.challenger_id,
      challengedId: data.challenged_id,
      challengeType: data.challenge_type,
      targetValue: data.target_value,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      status: data.status,
      winnerId: data.winner_id,
      createdAt: new Date(data.created_at),
    };
  }
}

export const socialCompetition = new SocialCompetitionService();