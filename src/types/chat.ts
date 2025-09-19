// Chat types for the AI coaching chatbot

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isTyping?: boolean;
  metadata?: {
    messageType?: 'crisis' | 'encouragement' | 'question' | 'general';
    sentiment?: 'positive' | 'negative' | 'neutral';
    urgencyLevel?: 'low' | 'medium' | 'high' | 'crisis';
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  startedAt: Date;
  lastActivity: Date;
  sessionType: 'coaching' | 'crisis' | 'checkin' | 'general';
  context?: {
    quitDay?: number;
    currentMood?: string;
    lastUrge?: Date;
    recentTriggers?: string[];
  };
}

export interface ChatbotConfig {
  personalityMode: 'supportive' | 'motivational' | 'clinical' | 'friendly';
  responseSpeed: 'instant' | 'realistic' | 'slow';
  maxTokens: number;
  temperature: number;
}

export interface QuickReply {
  id: string;
  text: string;
  action?: 'crisis_mode' | 'urge_timer' | 'breathing_exercise' | 'community';
  category: 'crisis' | 'support' | 'tools' | 'general' | 'ai_generated';
  voiceflowRequest?: any; // For AI-generated quick replies from Voiceflow
}
