import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TextInput, FlatList } from 'react-native';
import { Theme } from '@/src/design-system/theme';
import { Card, Button } from '@/src/design-system/components';
import { aiCoaching, AIMessage, UserContext } from '@/src/services/aiCoaching';
import { useAuthStore } from '@/src/stores/authStore';
import { useQuitStore } from '@/src/stores/quitStore';
import { useState, useEffect } from 'react';
import { Send } from 'lucide-react-native';

export default function CoachScreen() {
  const { user } = useAuthStore();
  const { quitData } = useQuitStore();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    if (!user) return;
    const history = await aiCoaching.getConversationHistory();
    setMessages(history);
  };

  const sendMessage = async (isEmergency: boolean = false) => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const userContext: UserContext = {
        quitDate: quitData.quitDate,
        streakDays: quitData.personalizedPlan?.riskLevel === 'high' ? 5 : 10, // Mock data
        riskLevel: quitData.personalizedPlan?.riskLevel || 'medium',
        triggers: quitData.triggers || [],
        recentStruggles: [],
        toolUsage: { panic: 2, breathwork: 5, urgeTimer: 3 },
        substanceType: quitData.substanceType || 'cigarettes',
      };

      const aiResponse = await aiCoaching.sendMessage(userMessage, userContext, isEmergency);
      
      // Add both messages to the conversation
      setMessages(prev => [...prev, 
        {
          id: `user_${Date.now()}`,
          sessionId: aiResponse.sessionId,
          type: 'user',
          content: userMessage,
          timestamp: new Date(),
        },
        aiResponse
      ]);
      
      setShowChat(true);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: AIMessage }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.type === 'user' ? styles.userMessageText : styles.aiMessageText
      ]}>
        {item.content}
      </Text>
      <Text style={styles.messageTime}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  if (showChat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
          <Button variant="ghost" onPress={() => setShowChat(false)}>
            ← Back
          </Button>
          <Text style={styles.chatTitle}>AI Coach</Text>
          <View style={{ width: 60 }} />
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your coach anything..."
            placeholderTextColor={Theme.colors.text.tertiary}
            multiline
            maxLength={500}
          />
          <Button
            variant="primary"
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={styles.sendButton}
          >
            <Send size={20} color={Theme.colors.text.primary} />
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Coach</Text>
            <Text style={styles.subtitle}>
              AI-powered coaching based on your quit journey
            </Text>
          </View>

          {/* Emergency Support */}
          <Card style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>🚨 Need Immediate Help?</Text>
            <Text style={styles.emergencyDescription}>
              Having an intense craving or crisis moment?
            </Text>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onPress={() => {
                setInputText("I'm having an intense craving right now and need help");
                sendMessage(true);
              }}
              style={styles.emergencyButton}
            >
              Get Crisis Support
            </Button>
          </Card>

          {/* AI Chat Interface */}
          <Card style={styles.chatCard}>
            <Text style={styles.chatCardTitle}>💬 Chat with Your AI Coach</Text>
            <Text style={styles.chatDescription}>
              Get personalized advice based on your quit journey, triggers, and progress.
            </Text>
            <Button 
              variant="secondary" 
              size="lg" 
              fullWidth
              onPress={() => setShowChat(true)}
            >
              Start Conversation
            </Button>
          </Card>

          {/* Quick Questions */}
          <View style={styles.quickQuestions}>
            <Text style={styles.sectionTitle}>Quick Questions</Text>
            
            <Card style={styles.questionCard} onTouchEnd={() => {
              setInputText("What should I do when I feel a craving coming on?");
              sendMessage();
            }}>
              <Text style={styles.questionText}>What should I do when I feel a craving?</Text>
            </Card>

            <Card style={styles.questionCard} onTouchEnd={() => {
              setInputText("How can I handle stress without smoking?");
              sendMessage();
            }}>
              <Text style={styles.questionText}>How can I handle stress without smoking?</Text>
            </Card>

            <Card style={styles.questionCard} onTouchEnd={() => {
              setInputText("What are some healthy alternatives to smoking?");
              sendMessage();
            }}>
              <Text style={styles.questionText}>What are healthy alternatives to smoking?</Text>
            </Card>
          </View>

          {/* Coaching Features */}
          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Your AI Coach Can Help With:</Text>
            <Text style={styles.featuresList}>
              • Personalized coping strategies{'\n'}
              • Crisis intervention and support{'\n'}
              • Trigger management techniques{'\n'}
              • Motivation and encouragement{'\n'}
              • Evidence-based quit advice{'\n'}
              • Progress celebration and guidance
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Theme.layout.screenPadding,
    paddingTop: Theme.spacing.xl,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  emergencyCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.error.background,
    borderColor: Theme.colors.error.border,
    alignItems: 'center',
  },
  emergencyTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emergencyDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emergencyButton: {
    backgroundColor: Theme.colors.error.text,
  },
  chatCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  chatCardTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  chatDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  quickQuestions: {
    marginBottom: Theme.spacing.lg,
  },
  questionCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  questionText: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
  },
  featuresCard: {
    padding: Theme.spacing.lg,
  },
  featuresTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  featuresList: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  sectionTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  // Chat Interface Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  chatTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: Theme.spacing.md,
  },
  messageContainer: {
    marginBottom: Theme.spacing.md,
    maxWidth: '80%',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Theme.colors.purple[500],
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.dark.surface,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
  },
  messageText: {
    ...Theme.typography.body,
    lineHeight: 22,
    marginBottom: Theme.spacing.xs,
  },
  userMessageText: {
    color: Theme.colors.text.primary,
  },
  aiMessageText: {
    color: Theme.colors.text.primary,
  },
  messageTime: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    backgroundColor: Theme.colors.dark.surface,
    borderWidth: 1,
    borderColor: Theme.colors.dark.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: Theme.spacing.sm,
  },
});