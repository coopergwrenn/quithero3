import React, { useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatStore } from '@/src/stores/chatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { QuickReplies } from './QuickReplies';
import { TypingIndicator } from './TypingIndicator';
import { Theme } from '@/src/design-system/theme';

interface ChatInterfaceProps {
  sessionType?: 'coaching' | 'crisis' | 'checkin' | 'general';
}

export function ChatInterface({ sessionType = 'coaching' }: ChatInterfaceProps) {
  const { 
    messages, 
    isTyping, 
    currentSession, 
    isCrisisMode,
    startNewSession, 
    sendMessage 
  } = useChatStore();
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Start session on mount
  useEffect(() => {
    if (!currentSession) {
      startNewSession(sessionType);
    }
  }, [currentSession, sessionType, startNewSession]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);
  
  const handleSendMessage = (message: string) => {
    sendMessage(message.trim());
  };
  
  return (
    <SafeAreaView style={[styles.container, isCrisisMode && styles.crisisMode]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              isCrisisMode={isCrisisMode}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
        </ScrollView>
        
        {/* Quick Replies */}
        <QuickReplies onSelectReply={handleSendMessage} />
        
        {/* Input */}
        <ChatInput onSendMessage={handleSendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  crisisMode: {
    backgroundColor: '#1a0f0f', // Darker background for crisis mode
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});
