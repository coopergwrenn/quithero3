import { analytics } from './analytics';
import { getVoiceflowAPIKey } from './apiKeyService';

interface VoiceflowConfig {
  projectID: string;
  baseURL: string;
  versionID: string;
}

interface VoiceflowMessage {
  type: 'text' | 'choice' | 'card' | 'carousel';
  payload: {
    message?: string;
    choices?: Array<{ name: string; request: any }>;
    [key: string]: any;
  };
}

interface VoiceflowResponse {
  messages: VoiceflowMessage[];
  isEnding: boolean;
}

interface UserContext {
  userId: string;
  quitDate?: string;
  motivation?: string;
  substanceType?: string;
  usageAmount?: string;
  triggers?: string;
  daysSinceQuit?: number;
}

class VoiceflowAPIService {
  private config: VoiceflowConfig;
  private userSessions: Map<string, string> = new Map(); // userId -> sessionId

  constructor() {
    this.config = {
      projectID: '689cbc694a6d0113b8ffd747',
      baseURL: 'https://general-runtime.voiceflow.com',
      versionID: 'production'
    };
  }

  /**
   * Get authorization headers with API key
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const apiKey = await getVoiceflowAPIKey();
    if (!apiKey) {
      throw new Error('Voiceflow API key not available from backend.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  /**
   * Start a new conversation session
   */
  async startSession(userContext: UserContext): Promise<string> {
    try {
      console.log('🚀 Starting Voiceflow session for user:', userContext.userId);
      
      // Mark user as having an active session
      this.userSessions.set(userContext.userId, userContext.userId);

      // Initialize session with launch request - Voiceflow uses userId directly in URL
      const response = await fetch(`${this.config.baseURL}/state/${this.config.versionID}/user/${userContext.userId}/interact`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          request: {
            type: 'launch',
            payload: {
              user_id: userContext.userId,
              quit_date: userContext.quitDate,
              motivation: userContext.motivation,
              substance_type: userContext.substanceType,
              usage_amount: userContext.usageAmount,
              triggers: userContext.triggers,
              days_since_quit: userContext.daysSinceQuit || 0
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Voiceflow API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Voiceflow session started for user:', userContext.userId);
      
      analytics.track('voiceflow_session_started', {
        userId: userContext.userId
      });

      return userContext.userId;

    } catch (error) {
      console.error('❌ Error starting Voiceflow session:', error);
      analytics.track('voiceflow_session_error', {
        userId: userContext.userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Send a message to the Voiceflow API
   */
  async sendMessage(userId: string, message: string): Promise<VoiceflowResponse> {
    try {
      console.log('💬 Sending message to Voiceflow:', { userId, message });

      // Check if user has an active session
      if (!this.userSessions.has(userId)) {
        throw new Error('No active session found. Please start a session first.');
      }

      // Send message using userId directly in URL (Voiceflow manages sessions internally)
      const response = await fetch(`${this.config.baseURL}/state/${this.config.versionID}/user/${userId}/interact`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          request: {
            type: 'text',
            payload: message
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Voiceflow API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Voiceflow response received:', { messageCount: data.length });

      // Transform the response to our format
      const voiceflowResponse: VoiceflowResponse = {
        messages: data || [],
        isEnding: false // You can implement logic to detect conversation end
      };

      analytics.track('voiceflow_message_sent', {
        userId,
        messageLength: message.length,
        responseCount: data.length
      });

      return voiceflowResponse;

    } catch (error) {
      console.error('❌ Error sending message to Voiceflow:', error);
      analytics.track('voiceflow_message_error', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Send a choice/button response to Voiceflow
   */
  async sendChoice(userId: string, choiceRequest: any): Promise<VoiceflowResponse> {
    try {
      console.log('🎯 Sending choice to Voiceflow:', { userId, choiceRequest });

      // Check if user has an active session
      if (!this.userSessions.has(userId)) {
        throw new Error('No active session found. Please start a session first.');
      }

      const response = await fetch(`${this.config.baseURL}/state/${this.config.versionID}/user/${userId}/interact`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          request: choiceRequest
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Voiceflow API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Voiceflow choice response received:', { responseCount: data.length });

      const voiceflowResponse: VoiceflowResponse = {
        messages: data || [],
        isEnding: false
      };

      analytics.track('voiceflow_choice_sent', {
        userId,
        responseCount: data.length
      });

      return voiceflowResponse;

    } catch (error) {
      console.error('❌ Error sending choice to Voiceflow:', error);
      analytics.track('voiceflow_choice_error', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * End a conversation session
   */
  async endSession(userId: string): Promise<void> {
    try {
      console.log('🔚 Ending Voiceflow session for user:', userId);
      
      if (this.userSessions.has(userId)) {
        // Clean up session tracking
        this.userSessions.delete(userId);
        
        analytics.track('voiceflow_session_ended', {
          userId
        });
        
        console.log('✅ Voiceflow session ended for user:', userId);
      }
    } catch (error) {
      console.error('❌ Error ending Voiceflow session:', error);
    }
  }

  /**
   * Check if user has an active session
   */
  hasActiveSession(userId: string): boolean {
    return this.userSessions.has(userId);
  }

  /**
   * Get active session info for a user
   */
  getSessionInfo(userId: string): string | undefined {
    return this.userSessions.has(userId) ? userId : undefined;
  }
}

// Export singleton instance
export const voiceflowAPI = new VoiceflowAPIService();