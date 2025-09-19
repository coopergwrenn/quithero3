import { create } from 'zustand';
import { ChatMessage, ChatSession, ChatbotConfig, QuickReply } from '@/src/types/chat';
import { voiceflowAPI } from '@/src/services/voiceflowAPI';
import { useAuthStore } from './authStore';
import { useQuitStore } from './quitStore';

interface ChatStore {
  // Current session
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isTyping: boolean;
  
  // Configuration
  config: ChatbotConfig;
  
  // Quick replies
  quickReplies: QuickReply[];
  
  // Actions
  startNewSession: (sessionType?: ChatSession['sessionType']) => void;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  updateConfig: (newConfig: Partial<ChatbotConfig>) => void;
  clearChat: () => void;
  
  // Crisis mode
  enterCrisisMode: () => void;
  exitCrisisMode: () => void;
  isCrisisMode: boolean;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  currentSession: null,
  messages: [],
  isTyping: false,
  isCrisisMode: false,
  
  config: {
    personalityMode: 'supportive',
    responseSpeed: 'realistic',
    maxTokens: 150,
    temperature: 0.7,
  },
  
  quickReplies: [
    { id: '1', text: "I'm having an urge", action: 'urge_timer', category: 'crisis' },
    { id: '2', text: "I'm feeling anxious", action: 'breathing_exercise', category: 'crisis' },
    { id: '3', text: "I need motivation", category: 'support' },
    { id: '4', text: "How am I doing?", category: 'general' },
    { id: '5', text: "Crisis help", action: 'crisis_mode', category: 'crisis' },
  ],
  
  // Actions
  startNewSession: (sessionType = 'coaching') => {
    const session: ChatSession = {
      id: Date.now().toString(),
      userId: 'current-user', // TODO: Get from auth store
      messages: [],
      startedAt: new Date(),
      lastActivity: new Date(),
      sessionType,
      context: {
        quitDay: 1, // TODO: Calculate from quit store
      },
    };
    
    set({ 
      currentSession: session,
      messages: [],
      isCrisisMode: sessionType === 'crisis'
    });
    
    // Add welcome message
    get().addMessage({
      content: get().getWelcomeMessage(sessionType),
      role: 'assistant',
    });
  },
  
  sendMessage: async (content: string) => {
    // Add user message
    get().addMessage({
      content,
      role: 'user',
    });
    
    // Show typing indicator
    set({ isTyping: true });
    
    try {
      // Get user context for Voiceflow
      const authStore = useAuthStore.getState();
      const quitStore = useQuitStore.getState();
      const user = authStore.user;
      const quitData = quitStore.quitData;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate days since quit
      const daysSinceQuit = quitData.quitDate 
        ? Math.floor((Date.now() - new Date(quitData.quitDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const userContext = {
        userId: user.id,
        quitDate: quitData.quitDate?.toString() || '',
        motivation: quitData.motivation || '',
        substanceType: quitData.substanceType || '',
        usageAmount: quitData.usageAmount?.toString() || '',
        triggers: quitData.triggers?.join(', ') || '',
        daysSinceQuit
      };

      // Ensure we have an active Voiceflow session
      if (!voiceflowAPI.hasActiveSession(user.id)) {
        console.log('🚀 No active session found, starting new Voiceflow session...');
        await voiceflowAPI.startSession(userContext);
      }

      // Send message to Voiceflow
      const response = await voiceflowAPI.sendMessage(user.id, content);
      
      // Process response messages
      for (const message of response.messages) {
        if (message.type === 'text' && message.payload.message) {
          get().addMessage({
            content: message.payload.message,
            role: 'assistant',
            metadata: {
              messageType: 'ai_response',
              sentiment: 'supportive',
            },
          });
        }
        
        // Handle choice messages (quick replies)
        if (message.type === 'choice' && message.payload.choices) {
          // Update quick replies based on Voiceflow choices
          const newQuickReplies = message.payload.choices.map((choice: any, index: number) => ({
            id: `vf_${Date.now()}_${index}`,
            text: choice.name,
            category: 'ai_generated',
            voiceflowRequest: choice.request
          }));
          
          set(state => ({
            quickReplies: [...state.quickReplies.filter(r => r.category !== 'ai_generated'), ...newQuickReplies]
          }));
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to get AI response:', error);
      
      // Fallback message
      get().addMessage({
        content: "I'm having trouble connecting right now, but I'm here for you. Can you tell me more about what's on your mind?",
        role: 'assistant',
        metadata: {
          messageType: 'fallback',
          error: true,
        },
      });
    } finally {
      set({ isTyping: false });
    }
  },
  
  addMessage: (messageData) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...messageData,
    };
    
    set(state => ({
      messages: [...state.messages, message],
    }));
    
    // Update session last activity
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: {
          ...session,
          lastActivity: new Date(),
          messages: [...session.messages, message],
        },
      });
    }
  },
  
  setTyping: (typing: boolean) => set({ isTyping: typing }),
  
  updateConfig: (newConfig) => {
    set(state => ({
      config: { ...state.config, ...newConfig },
    }));
  },
  
  clearChat: () => {
    set({
      currentSession: null,
      messages: [],
      isTyping: false,
      isCrisisMode: false,
    });
  },
  
  enterCrisisMode: () => {
    set({ isCrisisMode: true });
    get().addMessage({
      content: "I'm here to help you through this crisis. You're not alone. Let's focus on getting you through the next few minutes safely.",
      role: 'assistant',
      metadata: {
        messageType: 'crisis',
        urgencyLevel: 'high',
      },
    });
  },
  
  exitCrisisMode: () => {
    set({ isCrisisMode: false });
    get().addMessage({
      content: "I'm glad you're feeling better. Remember, I'm always here when you need support. How would you like to continue?",
      role: 'assistant',
    });
  },
  
  // Helper method (not exposed in interface)
  getWelcomeMessage: (sessionType: ChatSession['sessionType']) => {
    const welcomeMessages = {
      coaching: "Hi! I'm your personal quit coach. I'm here to support you on your journey. How are you feeling today?",
      crisis: "I'm here to help you through this difficult moment. You're brave for reaching out. What's happening right now?",
      checkin: "Great to see you! Let's check in on how you're doing with your quit journey. What's on your mind?",
      general: "Hello! I'm here to chat and support you however you need. What would you like to talk about?",
    };
    return welcomeMessages[sessionType];
  },
}));
