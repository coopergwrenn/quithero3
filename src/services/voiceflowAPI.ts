import { analytics } from './analytics';
import { supabase } from '@/src/lib/supabase';

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

interface BackendProxyRequest {
  action: {
    type: 'launch' | 'text' | 'choice';
    payload?: any;
  };
  userId: string;
  userContext?: UserContext;
}

interface BackendProxyResponse {
  success: boolean;
  messages: VoiceflowMessage[];
  isEnding: boolean;
  error?: string;
  details?: any;
}

class VoiceflowAPIService {
  private userSessions: Map<string, boolean> = new Map(); // userId -> hasActiveSession
  private backendUrl: string;

  constructor() {
    // Use Supabase Edge Function as our secure proxy
    // Extract the base URL from the Supabase client
    const supabaseUrl = 'https://saoheivherzwysrhglbq.supabase.co';
    this.backendUrl = `${supabaseUrl}/functions/v1/voiceflow-proxy`;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('🔐 Auth session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      error: error?.message,
      tokenPreview: session?.access_token?.substring(0, 20) + '...'
    });
    
    if (error) {
      throw new Error(`Auth error: ${error.message}`);
    }
    
    if (!session?.access_token) {
      throw new Error('User not authenticated - no access token');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  private async callBackendProxy(request: BackendProxyRequest): Promise<BackendProxyResponse> {
    const headers = await this.getAuthHeaders();
    
    console.log('🔗 Calling backend proxy:', {
      url: this.backendUrl,
      userId: request.userId,
      actionType: request.action.type,
      headers: { ...headers, Authorization: '[REDACTED]' }
    });

    const response = await fetch(this.backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Backend proxy error:', responseData);
      throw new Error(responseData.error || `Backend proxy error: ${response.status}`);
    }

    return responseData;
  }

  /**
   * Start a new conversation session
   */
  async startSession(userContext: UserContext): Promise<string> {
    try {
      console.log('🚀 Starting Voiceflow session for user:', userContext.userId);
      
      // Mark user as having an active session
      this.userSessions.set(userContext.userId, true);

      const request: BackendProxyRequest = {
        action: {
          type: 'launch'
        },
        userId: userContext.userId,
        userContext: userContext
      };

      const response = await this.callBackendProxy(request);

      if (!response.success) {
        throw new Error(response.error || 'Failed to start session');
      }

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
   * Send a message to the Voiceflow API via backend proxy
   */
  async sendMessage(userId: string, message: string): Promise<VoiceflowResponse> {
    try {
      console.log('💬 Sending message to Voiceflow:', { userId, message });

      // Check if user has an active session
      if (!this.userSessions.has(userId)) {
        throw new Error('No active session found. Please start a session first.');
      }

      const request: BackendProxyRequest = {
        action: {
          type: 'text',
          payload: message
        },
        userId: userId
      };

      const response = await this.callBackendProxy(request);

      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }

      console.log('✅ Voiceflow response received:', { messageCount: response.messages.length });

      // Transform the response to our format
      const voiceflowResponse: VoiceflowResponse = {
        messages: response.messages || [],
        isEnding: response.isEnding || false
      };

      analytics.track('voiceflow_message_sent', {
        userId,
        messageLength: message.length,
        responseCount: response.messages.length
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
   * Send a choice/button response to Voiceflow via backend proxy
   */
  async sendChoice(userId: string, choiceRequest: any): Promise<VoiceflowResponse> {
    try {
      console.log('🎯 Sending choice to Voiceflow:', { userId, choiceRequest });

      // Check if user has an active session
      if (!this.userSessions.has(userId)) {
        throw new Error('No active session found. Please start a session first.');
      }

      const request: BackendProxyRequest = {
        action: choiceRequest,
        userId: userId
      };

      const response = await this.callBackendProxy(request);

      if (!response.success) {
        throw new Error(response.error || 'Failed to send choice');
      }

      console.log('✅ Voiceflow choice response received:', { responseCount: response.messages.length });

      const voiceflowResponse: VoiceflowResponse = {
        messages: response.messages || [],
        isEnding: response.isEnding || false
      };

      analytics.track('voiceflow_choice_sent', {
        userId,
        responseCount: response.messages.length
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