import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Animated, Dimensions } from 'react-native';
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

// Starfield Component for Premium Background
const StarField = () => {
  const [stars] = useState(() => {
    const starArray = [];
    for (let i = 0; i < 150; i++) {
      starArray.push({
        id: i,
        x: Math.random() * Dimensions.get('window').width,
        y: Math.random() * Dimensions.get('window').height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }
    return starArray;
  });

  const animatedValues = useRef(stars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((animValue, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.starfield}>
      {stars.map((star, index) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [star.opacity * 0.3, star.opacity],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

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
    <View style={[styles.container, isCrisisMode && styles.crisisMode]}>
      <StarField />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B1A', // Deep space background with subtle blue tint - same as dashboard
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Let StarField show through
  },
  crisisMode: {
    backgroundColor: '#1a0f0f', // Darker background for crisis mode
  },
  // Starfield Background
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  messagesContainer: {
    flex: 1, // Takes available space above input area
    zIndex: 1, // Above starfield
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
    backgroundColor: 'rgba(11, 11, 26, 0.7)', // More transparent to show stars behind
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 2,
    zIndex: 1, // Above starfield
  },
  inputContainer: {
    backgroundColor: 'transparent', // Let the parent handle background
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 4,
  },
});
