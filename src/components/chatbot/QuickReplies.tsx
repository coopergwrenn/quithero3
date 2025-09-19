import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useChatStore } from '@/src/stores/chatStore';
import { Theme } from '@/src/design-system/theme';

interface QuickRepliesProps {
  onSelectReply: (reply: string) => void;
}

export function QuickReplies({ onSelectReply }: QuickRepliesProps) {
  const { quickReplies, isCrisisMode, enterCrisisMode } = useChatStore();
  
  const handleReplyPress = (reply: any) => {
    // Handle special actions
    if (reply.action === 'crisis_mode') {
      enterCrisisMode();
      return;
    }
    
    if (reply.action === 'urge_timer') {
      // TODO: Navigate to urge timer tool
      onSelectReply("I'm having an urge and need help");
      return;
    }
    
    if (reply.action === 'breathing_exercise') {
      // TODO: Navigate to breathing exercise
      onSelectReply("I'm feeling anxious and need breathing exercises");
      return;
    }
    
    // Send as regular message
    onSelectReply(reply.text);
  };
  
  // Filter replies based on crisis mode
  const filteredReplies = quickReplies.filter(reply => {
    if (isCrisisMode) {
      return reply.category === 'crisis' || reply.category === 'support';
    }
    return true;
  });
  
  if (filteredReplies.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredReplies.map((reply) => (
          <TouchableOpacity
            key={reply.id}
            style={[
              styles.replyButton,
              reply.category === 'crisis' && styles.crisisReply,
              isCrisisMode && styles.crisisModeReply
            ]}
            onPress={() => handleReplyPress(reply)}
          >
            <Text style={[
              styles.replyText,
              reply.category === 'crisis' && styles.crisisReplyText,
              isCrisisMode && styles.crisisModeReplyText
            ]}>
              {reply.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    backgroundColor: 'transparent', // Let parent handle background
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  replyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Theme.colors.dark.surface,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  crisisReply: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  crisisModeReply: {
    backgroundColor: '#450a0a',
    borderColor: '#7f1d1d',
  },
  replyText: {
    fontSize: 14,
    color: Theme.colors.text.primary,
    fontWeight: '500',
  },
  crisisReplyText: {
    color: '#dc2626',
  },
  crisisModeReplyText: {
    color: '#fecaca',
  },
});
