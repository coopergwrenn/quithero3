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
  initialMessage?: string;
}

// Styles defined first so they can be used by components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Let StarField show through
  },
  gestureContainer: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Let StarField show through
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  crisisMode: {
    backgroundColor: 'rgba(26, 15, 15, 0.85)', // Semi-transparent darker background for crisis mode
  },
  // Starfield Background
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B0B1A', // Deep space background
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
    flex: 1, // Takes all available space above input area
    minHeight: 0, // Important: allows flex child to shrink
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
    justifyContent: 'flex-end', // Messages stick to bottom
  },
  inputAreaWrapper: {
    // NO absolute positioning - natural layout flow
    backgroundColor: 'rgba(11, 11, 26, 0.95)', // Slightly more opaque for better contrast
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
    // Flex: 0 means it won't grow, only takes needed space
    flexShrink: 0, // Won't shrink smaller than content
  },
  inputContainer: {
    backgroundColor: 'transparent', // Let parent handle background
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
});

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
    const animations = animatedValues.map((animValue) =>
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

export function ChatInterface({ sessionType = 'coaching', initialMessage }: ChatInterfaceProps) {
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Start session on mount
  useEffect(() => {
    if (!currentSession) {
      startNewSession(sessionType);
    }
  }, [currentSession, sessionType, startNewSession]);

  // Keyboard event listeners for better handling
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  // Handle initial message from dashboard preview
  useEffect(() => {
    if (initialMessage && currentSession && messages.length === 0) {
      // Send the initial message automatically
      sendMessage(initialMessage);
    }
  }, [initialMessage, currentSession, messages.length, sendMessage]);
  
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
    <View style={styles.container}>
      <StarField />
      <GestureHandlerRootView style={styles.gestureContainer}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >
          {/* Main Content Container - Flexbox Layout */}
          <View style={[styles.mainContent, isCrisisMode && styles.crisisMode]}>
            
            {/* Messages Container - Takes remaining space */}
            <View style={styles.messagesContainer}>
              <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                maintainVisibleContentPosition={{
                  minIndexForVisible: 0,
                  autoscrollToTopThreshold: 10,
                }}
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
            
            {/* Input Area - Natural layout flow, NOT absolutely positioned */}
            <PanGestureHandler onGestureEvent={handleSwipeDown}>
              <View style={[
                styles.inputAreaWrapper, 
                { paddingBottom: Math.max(insets.bottom, 8) }
              ]}>
                {/* Quick Replies - Above input */}
                <QuickReplies onSelectReply={handleSendMessage} />
                
                {/* Input Field */}
                <View style={styles.inputContainer}>
                  <ChatInput onSendMessage={handleSendMessage} />
                </View>
              </View>
            </PanGestureHandler>
            
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </View>
  );
}
