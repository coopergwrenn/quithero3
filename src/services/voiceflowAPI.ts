import { analytics } from './analytics';

interface VoiceflowConfig {
  projectID: string;
  apiKey?: string;
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
      versionID: 'production',
      // TODO: Add your Voiceflow API key here
      // You can get this from your Voiceflow project settings
      apiKey: process.env.EXPO_PUBLIC_VOICEFLOW_API_KEY || ''
    };
  }

  /**
   * Start a new conversation session
   */
  async startSession(userContext: UserContext): Promise<string> {
    try {
      console.log('🚀 Starting Voiceflow session for user:', userContext.userId);
      
      // Check if API key is available
      if (!this.config.apiKey) {
        throw new Error('Voiceflow API key is missing. Please add EXPO_PUBLIC_VOICEFLOW_API_KEY to your environment variables.');
      }
      
      const sessionId = `session_${userContext.userId}_${Date.now()}`;
      this.userSessions.set(userContext.userId, sessionId);

      // Initialize session with user context
      const response = await fetch(`${this.config.baseURL}/state/${this.config.versionID}/user/${sessionId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          action: {
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
          },
          config: {
            tts: false,
            stripSSML: true,
            stopAll: true,
            excludeTypes: ['block', 'debug', 'flow']
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Voiceflow API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Voiceflow session started:', sessionId);
      
      analytics.track('voiceflow_session_started', {
        sessionId,
        userId: userContext.userId
      });

      return sessionId;
    } catch (error) {
      console.error('❌ Failed to start Voiceflow session:', error);
      analytics.track('voiceflow_session_error', {
        error: error.message,
        userId: userContext.userId
      });
      throw error;
    }
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(userId: string, message: string, userContext?: UserContext): Promise<VoiceflowResponse> {
    try {
      console.log('📤 Sending message to Voiceflow:', message);

      let sessionId = this.userSessions.get(userId);
      
      // Start new session if none exists
      if (!sessionId && userContext) {
        sessionId = await this.startSession(userContext);
      }

      if (!sessionId) {
        throw new Error('No active session found and no user context provided');
      }

      const response = await fetch(`${this.config.baseURL}/state/${this.config.versionID}/user/${sessionId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          action: {
            type: 'text',
            payload: message
          },
          config: {
            tts: false,
            stripSSML: true,
            stopAll: true,
            excludeTypes: ['block', 'debug', 'flow']
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Voiceflow API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Voiceflow response:', data);

      const processedResponse = this.processVoiceflowResponse(data);
      
      analytics.track('voiceflow_message_sent', {
        sessionId,
        userId,
        messageLength: message.length,
        responseCount: processedResponse.messages.length
      });

      return processedResponse;
    } catch (error) {
      console.error('❌ Failed to send message to Voiceflow:', error);
      analytics.track('voiceflow_message_error', {
        error: error.message,
        userId,
        message: message.substring(0, 100) // Log first 100 chars for debugging
      });
      throw error;
    }
  }

  /**
   * Process raw Voiceflow response into our format
   */
  private processVoiceflowResponse(rawResponse: any): VoiceflowResponse {
    const messages: VoiceflowMessage[] = [];
    let isEnding = false;

    // Process each trace in the response
    if (rawResponse && Array.isArray(rawResponse)) {
      for (const trace of rawResponse) {
        switch (trace.type) {
          case 'text':
            if (trace.payload && trace.payload.message) {
              messages.push({
                type: 'text',
                payload: {
                  message: trace.payload.message
                }
              });
            }
            break;
          
          case 'choice':
            if (trace.payload && trace.payload.choices) {
              messages.push({
                type: 'choice',
                payload: {
                  choices: trace.payload.choices
                }
              });
            }
            break;
          
          case 'end':
            isEnding = true;
            break;
          
          // Handle other types as needed
          default:
            console.log('🔍 Unhandled Voiceflow trace type:', trace.type, trace);
            break;
        }
      }
    }

    // Fallback if no messages processed
    if (messages.length === 0) {
      console.warn('⚠️ No messages found in Voiceflow response, using fallback');
      messages.push({
        type: 'text',
        payload: {
          message: "I'm here to help you. Could you tell me more about what you're experiencing?"
        }
      });
    }

    return { messages, isEnding };
  }

  /**
   * End a conversation session
   */
  async endSession(userId: string): Promise<void> {
    try {
      const sessionId = this.userSessions.get(userId);
      if (sessionId) {
        console.log('🔚 Ending Voiceflow session:', sessionId);
        this.userSessions.delete(userId);
        
        analytics.track('voiceflow_session_ended', {
          sessionId,
          userId
        });
      }
    } catch (error) {
      console.error('❌ Failed to end Voiceflow session:', error);
    }
  }

  /**
   * Get current session ID for a user
   */
  getSessionId(userId: string): string | undefined {
    return this.userSessions.get(userId);
  }

  /**
   * Check if user has an active session
   */
  hasActiveSession(userId: string): boolean {
    return this.userSessions.has(userId);
  }
}

// Export singleton instance
export const voiceflowAPI = new VoiceflowAPIService();
