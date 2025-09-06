import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@/src/types/chat';
import { Theme } from '@/src/design-system/theme';

interface MessageBubbleProps {
  message: ChatMessage;
  isCrisisMode?: boolean;
}

export function MessageBubble({ message, isCrisisMode = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isCrisisMessage = message.metadata?.messageType === 'crisis';
  
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        isCrisisMessage && styles.crisisBubble,
        isCrisisMode && !isUser && styles.crisisModeBubble
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.assistantText,
          isCrisisMessage && styles.crisisText,
          isCrisisMode && !isUser && styles.crisisModeText
        ]}>
          {message.content}
        </Text>
        
        {/* Timestamp */}
        <Text style={[
          styles.timestamp,
          isUser ? styles.userTimestamp : styles.assistantTimestamp
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
      
      {/* Message type indicator */}
      {message.metadata?.messageType && !isUser && (
        <View style={styles.metadataContainer}>
          <Text style={styles.metadata}>
            {getMessageTypeEmoji(message.metadata.messageType)}
          </Text>
        </View>
      )}
    </View>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getMessageTypeEmoji(type: string): string {
  const emojis = {
    crisis: '🆘',
    encouragement: '💪',
    question: '❓',
    general: '💬',
  };
  return emojis[type as keyof typeof emojis] || '💬';
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Theme.colors.purple[500],
    borderBottomRightRadius: 8,
  },
  assistantBubble: {
    backgroundColor: Theme.colors.dark.surface,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  crisisBubble: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
  },
  crisisModeBubble: {
    backgroundColor: '#450a0a',
    borderColor: '#7f1d1d',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Theme.colors.text.primary,
  },
  assistantText: {
    color: Theme.colors.text.primary,
  },
  crisisText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  crisisModeText: {
    color: '#fecaca',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: Theme.colors.text.primary,
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: Theme.colors.text.secondary,
  },
  metadataContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  metadata: {
    fontSize: 12,
    opacity: 0.6,
  },
});
