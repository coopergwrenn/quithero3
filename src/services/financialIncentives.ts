/**
 * Financial Incentives Service
 * Deposit contracts, savings challenges, and ROI tracking
 */

import { supabase } from '@/src/lib/supabase';
import { analytics } from './analytics';

export interface DepositContract {
  id: string;
  userId: string;
  amount: number;
  commitmentDays: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'failed' | 'refunded';
  penaltyAmount: number;
  createdAt: Date;
}

export interface SavingsChallenge {
  id: string;
  userId: string;
  challengeType: 'daily' | 'weekly' | 'monthly';
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  createdAt: Date;
}

export interface ROIAnalysis {
  totalSaved: number;
  appCost: number;
  netSavings: number;
  roi: number; // Return on investment percentage
  breakEvenDays: number;
  projectedYearlySavings: number;
}

class FinancialIncentivesService {
  async createDepositContract(
    amount: number, 
    commitmentDays: number
  ): Promise<DepositContract> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + commitmentDays);

    const { data, error } = await supabase
      .from('deposit_contracts')
      .insert([{
        user_id: user.id,
        amount,
        commitment_days: commitmentDays,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        penalty_amount: 0,
      }])
      .select()
      .single();

    if (error) throw error;

    const contract = this.mapToDepositContract(data);

    analytics.track('deposit_contract_created', {
      amount,
      commitment_days: commitmentDays,
      contract_id: contract.id,
    });

    return contract;
  }

  async createSavingsChallenge(
    challengeType: 'daily' | 'weekly' | 'monthly',
    targetAmount: number,
    durationDays: number
  ): Promise<SavingsChallenge> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    const { data, error } = await supabase
      .from('savings_challenges')
      .insert([{
        user_id: user.id,
        challenge_type: challengeType,
        target_amount: targetAmount,
        current_amount: 0,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        completed: false,
      }])
      .select()
      .single();

    if (error) throw error;

    const challenge = this.mapToSavingsChallenge(data);

    analytics.track('savings_challenge_created', {
      challenge_type: challengeType,
      target_amount: targetAmount,
      duration_days: durationDays,
    });

    return challenge;
  }

  async updateSavingsProgress(challengeId: string, newAmount: number): Promise<void> {
    const { data, error } = await supabase
      .from('savings_challenges')
      .update({ 
        current_amount: newAmount,
        completed: newAmount >= (await this.getSavingsChallenge(challengeId))?.targetAmount || false
      })
      .eq('id', challengeId);

    if (error) throw error;

    analytics.track('savings_progress_updated', {
      challenge_id: challengeId,
      new_amount: newAmount,
    });
  }

  async checkDepositContractStatus(contractId: string): Promise<void> {
    const contract = await this.getDepositContract(contractId);
    if (!contract || contract.status !== 'active') return;

    const now = new Date();
    const endDate = new Date(contract.endDate);

    if (now > endDate) {
      // Check if user maintained their streak
      const userProfile = await this.getUserProfile();
      const streakDays = userProfile?.streak_days || 0;

      if (streakDays >= contract.commitmentDays) {
        // Success - refund deposit
        await this.updateContractStatus(contractId, 'completed');
        analytics.track('deposit_contract_completed', {
          contract_id: contractId,
          amount: contract.amount,
        });
      } else {
        // Failed - forfeit deposit
        await this.updateContractStatus(contractId, 'failed');
        analytics.track('deposit_contract_failed', {
          contract_id: contractId,
          amount: contract.amount,
          streak_days: streakDays,
        });
      }
    }
  }

  async calculateROI(userId?: string): Promise<ROIAnalysis> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) throw new Error('User not authenticated');

    // Get user's quit data
    const userProfile = await this.getUserProfile();
    if (!userProfile) {
      return {
        totalSaved: 0,
        appCost: 0,
        netSavings: 0,
        roi: 0,
        breakEvenDays: 0,
        projectedYearlySavings: 0,
      };
    }

    const totalSaved = userProfile.total_saved || 0;
    const appCost = 9.99; // Monthly subscription cost
    const netSavings = totalSaved - appCost;
    const roi = appCost > 0 ? ((netSavings / appCost) * 100) : 0;

    // Calculate daily savings rate
    const quitDate = userProfile.quit_date ? new Date(userProfile.quit_date) : new Date();
    const daysSinceQuit = Math.max(1, Math.floor((Date.now() - quitDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailySavingsRate = totalSaved / daysSinceQuit;

    const breakEvenDays = dailySavingsRate > 0 ? Math.ceil(appCost / dailySavingsRate) : 0;
    const projectedYearlySavings = dailySavingsRate * 365;

    return {
      totalSaved,
      appCost,
      netSavings,
      roi,
      breakEvenDays,
      projectedYearlySavings,
    };
  }

  async getUserContracts(): Promise<DepositContract[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('deposit_contracts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deposit contracts:', error);
      return [];
    }

    return data.map(this.mapToDepositContract);
  }

  async getUserChallenges(): Promise<SavingsChallenge[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('savings_challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching savings challenges:', error);
      return [];
    }

    return data.map(this.mapToSavingsChallenge);
  }

  private async getDepositContract(contractId: string): Promise<DepositContract | null> {
    const { data, error } = await supabase
      .from('deposit_contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) return null;
    return this.mapToDepositContract(data);
  }

  private async getSavingsChallenge(challengeId: string): Promise<SavingsChallenge | null> {
    const { data, error } = await supabase
      .from('savings_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error) return null;
    return this.mapToSavingsChallenge(data);
  }

  private async updateContractStatus(contractId: string, status: DepositContract['status']): Promise<void> {
    const { error } = await supabase
      .from('deposit_contracts')
      .update({ status })
      .eq('id', contractId);

    if (error) throw error;
  }

  private async getUserProfile(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;
    return data;
  }

  private mapToDepositContract(data: any): DepositContract {
    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      commitmentDays: data.commitment_days,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      status: data.status,
      penaltyAmount: parseFloat(data.penalty_amount || 0),
      createdAt: new Date(data.created_at),
    };
  }

  private mapToSavingsChallenge(data: any): SavingsChallenge {
    return {
      id: data.id,
      userId: data.user_id,
      challengeType: data.challenge_type,
      targetAmount: parseFloat(data.target_amount),
      currentAmount: parseFloat(data.current_amount),
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      completed: data.completed,
      createdAt: new Date(data.created_at),
    };
  }
}

export const financialIncentives = new FinancialIncentivesService();