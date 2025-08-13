/**
 * AI Coaching Service with OpenAI GPT-4 Integration
 * Context-aware coaching based on user's quit journey
 */

import OpenAI from 'openai';
import { supabase } from '@/src/lib/supabase';
import { analytics } from './analytics';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for development
});

export interface AIMessage {
  id: string;
  sessionId: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  contextData?: Record<string, any>;
}

export interface UserContext {
  quitDate?: Date;
  streakDays: number;
  riskLevel: 'high' | 'medium' | 'low';
  triggers: string[];
  recentStruggles: string[];
  toolUsage: Record<string, number>;
  substanceType: 'cigarettes' | 'vape' | 'both';
}

class AICoachingService {
  private sessionId: string | null = null;

  async startNewSession(): Promise<string> {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return this.sessionId;
  }

  async sendMessage(
    message: string, 
    userContext: UserContext,
    isEmergency: boolean = false
  ): Promise<AIMessage> {
    if (!this.sessionId) {
      await this.startNewSession();
    }

    try {
      // Save user message
      await this.saveMessage('user', message, userContext);

      // Generate AI response
      const aiResponse = await this.generateResponse(message, userContext, isEmergency);

      // Save AI response
      const aiMessage = await this.saveMessage('assistant', aiResponse, userContext);

      // Track usage
      analytics.track('ai_coaching_interaction', {
        session_id: this.sessionId,
        is_emergency: isEmergency,
        user_streak_days: userContext.streakDays,
        risk_level: userContext.riskLevel,
      });

      return aiMessage;
    } catch (error) {
      console.error('AI Coaching error:', error);
      
      // Fallback response for errors
      const fallbackResponse = this.getFallbackResponse(isEmergency);
      return await this.saveMessage('assistant', fallbackResponse, userContext);
    }
  }

  private async generateResponse(
    message: string, 
    context: UserContext, 
    isEmergency: boolean
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context, isEmergency);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || this.getFallbackResponse(isEmergency);
  }

  private buildSystemPrompt(context: UserContext, isEmergency: boolean): string {
    const basePrompt = `You are an expert smoking cessation coach trained in ACT/CBT techniques. You provide supportive, evidence-based guidance to help people quit smoking/vaping.

User Context:
- Quit streak: ${context.streakDays} days
- Risk level: ${context.riskLevel}
- Substance: ${context.substanceType}
- Main triggers: ${context.triggers.join(', ')}
- Recent tool usage: ${Object.entries(context.toolUsage).map(([tool, count]) => `${tool}: ${count}x`).join(', ')}

Guidelines:
- Be empathetic and non-judgmental
- Use evidence-based techniques (ACT, CBT, motivational interviewing)
- Keep responses under 200 words
- Focus on practical, actionable advice
- Acknowledge their progress and struggles
- Never provide medical advice - refer to healthcare providers for medical questions`;

    if (isEmergency) {
      return basePrompt + `

EMERGENCY MODE: The user is experiencing an intense craving or crisis moment. Provide immediate, practical support:
- Acknowledge the difficulty of the moment
- Remind them cravings are temporary (3-5 minutes)
- Suggest immediate coping strategies
- Encourage use of panic tools
- Reinforce their strength and progress`;
    }

    return basePrompt;
  }

  private async saveMessage(
    type: 'user' | 'assistant', 
    content: string, 
    contextData: UserContext
  ): Promise<AIMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert([{
        user_id: user.id,
        session_id: this.sessionId!,
        message_type: type,
        content,
        context_data: contextData,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      sessionId: data.session_id,
      type: data.message_type as 'user' | 'assistant',
      content: data.content,
      timestamp: new Date(data.created_at),
      contextData: data.context_data,
    };
  }

  private getFallbackResponse(isEmergency: boolean): string {
    if (isEmergency) {
      return "I understand you're going through a tough moment right now. Remember that cravings are temporary - they typically peak and fade within 3-5 minutes. Try using the panic protocol or breathing exercises. You've made it this far, and you have the strength to get through this moment. Consider reaching out to your support network or using the crisis resources if you need immediate help.";
    }

    return "I'm here to support you on your quit journey. Every day smoke-free is an achievement worth celebrating. What specific challenge are you facing today? I can help you work through it with proven strategies.";
  }

  async getConversationHistory(limit: number = 20): Promise<AIMessage[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }

    return data.map(msg => ({
      id: msg.id,
      sessionId: msg.session_id,
      type: msg.message_type as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.created_at),
      contextData: msg.context_data,
    })).reverse();
  }

  async clearHistory(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing conversation history:', error);
    }
  }
}

export const aiCoaching = new AICoachingService();