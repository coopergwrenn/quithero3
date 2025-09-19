import React, { useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  
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

  // Handle swipe down gesture to dismiss keyboard
  const handleSwipeDown = (event: any) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    // Dismiss keyboard if user swipes down with sufficient distance or velocity
    if (translationY > 30 || velocityY > 500) {
      Keyboard.dismiss();
    }
  };
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={[styles.container, isCrisisMode && styles.crisisMode]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -18 : 0}
      >
      {/* Messages Container - Takes available space */}
      <View style={styles.messagesContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
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
      </View>
      
      {/* Input Area - Fixed at bottom, NOT absolutely positioned */}
      <PanGestureHandler onGestureEvent={handleSwipeDown}>
        <View style={[styles.inputAreaWrapper, { paddingBottom: Math.max(insets.bottom - 10, 2) }]}>
          {/* Quick Replies - Above input */}
          <QuickReplies onSelectReply={handleSendMessage} />
          
          {/* Input Field */}
          <View style={styles.inputContainer}>
            <ChatInput onSendMessage={handleSendMessage} />
          </View>
        </View>
      </PanGestureHandler>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  crisisMode: {
    backgroundColor: '#1a0f0f', // Darker background for crisis mode
  },
  messagesContainer: {
    flex: 1, // Takes available space above input area
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  inputAreaWrapper: {
    // NO absolute positioning - part of normal layout flow
    backgroundColor: Theme.colors.dark.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 2,
  },
  inputContainer: {
    backgroundColor: Theme.colors.dark.background,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 4,
  },
});
