import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Card, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { useAuthStore } from '@/src/stores/authStore';
import { analytics } from '@/src/services/analytics';
import { ChatInterface } from '@/src/components/chatbot';

export default function CoachScreen() {
  const [showChat, setShowChat] = useState(false);
  const { quitData } = useQuitStore();
  const { user } = useAuthStore();

  useEffect(() => {
    analytics.track('ai_coach_opened');
  }, []);

  // Coach intro before launching chat
  const renderCoachIntro = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Card style={styles.introCard}>
        <Text style={styles.robotIcon}>🤖</Text>
        <Text style={styles.introTitle}>Meet Your AI Quit Coach</Text>
        <Text style={styles.introDescription}>
          I'm your personal AI coach, trained specifically on smoking cessation science. 
          I'm here 24/7 to provide support, answer questions, and guide you through challenges.
        </Text>
        
        <View style={styles.capabilitiesSection}>
          <Text style={styles.sectionTitle}>How I can help you:</Text>
          
          <View style={styles.capabilityItem}>
            <Text style={styles.capabilityIcon}>🆘</Text>
            <View style={styles.capabilityText}>
              <Text style={styles.capabilityTitle}>Crisis Support</Text>
              <Text style={styles.capabilityDesc}>Immediate help during cravings and urges</Text>
            </View>
          </View>
          
          <View style={styles.capabilityItem}>
            <Text style={styles.capabilityIcon}>📊</Text>
            <View style={styles.capabilityText}>
              <Text style={styles.capabilityTitle}>Progress Analysis</Text>
              <Text style={styles.capabilityDesc}>Review your quit journey and suggest improvements</Text>
            </View>
          </View>
          
          <View style={styles.capabilityItem}>
            <Text style={styles.capabilityIcon}>🎯</Text>
            <View style={styles.capabilityText}>
              <Text style={styles.capabilityTitle}>Personalized Strategies</Text>
              <Text style={styles.capabilityDesc}>Custom advice based on your triggers and patterns</Text>
            </View>
          </View>
          
          <View style={styles.capabilityItem}>
            <Text style={styles.capabilityIcon}>💊</Text>
            <View style={styles.capabilityText}>
              <Text style={styles.capabilityTitle}>NRT Guidance</Text>
              <Text style={styles.capabilityDesc}>Information about nicotine replacement therapy</Text>
            </View>
          </View>
        </View>

        {quitData.quitDate && (
          <Card style={styles.contextCard}>
            <Text style={styles.contextTitle}>I know about your quit journey:</Text>
            <Text style={styles.contextItem}>• Quit date: {new Date(quitData.quitDate).toLocaleDateString()}</Text>
            {quitData.motivation && <Text style={styles.contextItem}>• Motivation: {quitData.motivation}</Text>}
            {quitData.usageAmount && quitData.substanceType && (
              <Text style={styles.contextItem}>• Usage pattern: {quitData.usageAmount} {quitData.substanceType} daily</Text>
            )}
            {quitData.triggers && quitData.triggers.length > 0 && (
              <Text style={styles.contextItem}>• Main triggers: {quitData.triggers.join(', ')}</Text>
            )}
          </Card>
        )}

        <Button
          variant="primary"
          size="lg"
          onPress={() => {
            setShowChat(true);
            analytics.track('ai_coach_chat_started', { type: 'custom_voiceflow' });
          }}
          style={styles.startButton}
        >
          Start Coaching Session
        </Button>
        
        <TouchableOpacity onPress={() => Alert.alert('Coach Info', 'This AI coach uses advanced AI technology trained on evidence-based smoking cessation methods. Your conversations are private and secure, and the coach adapts to your personal quit journey.')}>
          <Text style={styles.infoLink}>How does this work?</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );

  // Voiceflow chat component
  const renderVoiceflowChat = () => {

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #1a1a1a; 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            overflow: hidden;
          }
          #voiceflow-chat { 
            width: 100%; 
            height: 100vh; 
            border: none;
          }
          .vfrc-chat { 
            background-color: #1a1a1a !important; 
          }
          .vfrc-header {
            background-color: #2a2a2a !important;
          }
          .vfrc-message--user {
            background-color: #8B5CF6 !important;
          }
          .vfrc-message--system {
            background-color: #374151 !important;
          }
        </style>
      </head>
      <body>
        <div id="voiceflow-chat"></div>
        <script type="text/javascript">
          console.log('🚀 Starting Voiceflow integration...');
          console.log('📊 User data:', {
            userId: '${escapedUserData.userId}',
            quitDate: '${escapedUserData.quitDate}',
            motivation: '${escapedUserData.motivation}',
            substanceType: '${escapedUserData.substanceType}',
            usageAmount: '${escapedUserData.usageAmount}',
            triggers: '${escapedUserData.triggers}'
          });
          
          (function(d, t) {
              console.log('📦 Loading Voiceflow script...');
              var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
              
              v.onerror = function() {
                console.error('❌ Failed to load Voiceflow script from CDN');
                document.getElementById('voiceflow-chat').innerHTML = 
                  '<div style="padding: 20px; color: white; text-align: center;">' +
                  '<h3>Script Loading Error</h3>' +
                  '<p>Unable to load Voiceflow script. Check your internet connection.</p>' +
                  '</div>';
              };
              
              v.onload = function() {
                console.log('✅ Voiceflow script loaded successfully');
                try {
                  console.log('🔧 Initializing Voiceflow chat...');
                  
                  if (!window.voiceflow) {
                    throw new Error('Voiceflow object not available');
                  }
                  
                  window.voiceflow.chat.load({
                    verify: { projectID: '689cbc694a6d0113b8ffd747' },
                    url: 'https://general-runtime.voiceflow.com',
                    versionID: 'production',
                    voice: {
                      url: "https://runtime-api.voiceflow.com"
                    },
                    render: {
                      mode: 'embedded',
                      target: document.getElementById('voiceflow-chat')
                    },
                    launch: {
                      event: {
                        type: 'launch',
                        payload: {
                          user_id: '${escapedUserData.userId}',
                          quit_date: '${escapedUserData.quitDate}',
                          motivation: '${escapedUserData.motivation}',
                          substance_type: '${escapedUserData.substanceType}',
                          usage_amount: '${escapedUserData.usageAmount}',
                          triggers: '${escapedUserData.triggers}'
                        }
                      }
                    },
                    autostart: true
                  });
                  
                  console.log('🎉 Voiceflow chat initialization complete');
                  
                } catch (error) {
                  console.error('❌ Voiceflow loading error:', error);
                  console.error('Error details:', error.message, error.stack);
                  document.getElementById('voiceflow-chat').innerHTML = 
                    '<div style="padding: 20px; color: white; text-align: center;">' +
                    '<h3>Connection Issue</h3>' +
                    '<p>Unable to connect to the AI coach: ' + error.message + '</p>' +
                    '<p style="font-size: 12px; margin-top: 10px;">Check console for details</p>' +
                    '</div>';
                }
              }
              
              console.log('📡 Requesting Voiceflow script from CDN...');
              v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; 
              v.type = "text/javascript"; 
              s.parentNode.insertBefore(v, s);
          })(document, 'script');
        </script>
      </body>
      </html>
    `;

    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            onPress={() => {
              setShowChat(false);
              analytics.track('ai_coach_chat_closed');
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.chatTitle}>AI Quit Coach</Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onLoadStart={() => {
            console.log('🌐 WebView: Starting to load Voiceflow chat...');
            setIsLoading(true);
          }}
          onLoadEnd={() => {
            console.log('✅ WebView: Load completed');
            setIsLoading(false);
          }}
          onLoadProgress={(event) => {
            console.log('📊 WebView: Load progress:', event.nativeEvent.progress);
          }}
          allowsInlineMediaPlayback={true}
          mixedContentMode="compatibility"
          onMessage={(event) => {
            console.log('📨 WebView message:', event.nativeEvent.data);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ WebView error:', nativeEvent);
            Alert.alert('Connection Error', `Unable to load the AI coach: ${nativeEvent.description}. Please check your internet connection.`);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('🌐 WebView HTTP error:', nativeEvent);
            Alert.alert('HTTP Error', `HTTP error ${nativeEvent.statusCode}: ${nativeEvent.description}`);
          }}
          injectedJavaScript={`
            // Capture console logs from WebView
            (function() {
              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;
              
              console.log = function(...args) {
                window.ReactNativeWebView?.postMessage('LOG: ' + args.join(' '));
                originalLog.apply(console, args);
              };
              
              console.error = function(...args) {
                window.ReactNativeWebView?.postMessage('ERROR: ' + args.join(' '));
                originalError.apply(console, args);
              };
              
              console.warn = function(...args) {
                window.ReactNativeWebView?.postMessage('WARN: ' + args.join(' '));
                originalWarn.apply(console, args);
              };
              
              // Catch unhandled errors
              window.onerror = function(message, source, lineno, colno, error) {
                window.ReactNativeWebView?.postMessage('UNCAUGHT ERROR: ' + message + ' at ' + source + ':' + lineno);
                return false;
              };
              
              window.addEventListener('unhandledrejection', function(event) {
                window.ReactNativeWebView?.postMessage('UNHANDLED PROMISE REJECTION: ' + event.reason);
              });
            })();
            true;
          `}
        />
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Connecting to your AI coach...</Text>
          </View>
        )}
      </View>
    );
  };

  // Render native chatbot
  const renderNativeChatbot = () => (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <TouchableOpacity 
          onPress={() => {
            setShowChat(false);
            analytics.track('ai_coach_chat_closed');
          }}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.chatTitle}>AI Quit Coach (Native)</Text>
        <View style={styles.onlineIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>
      
      <ChatInterface sessionType="coaching" />
    </View>
  );



  return (
    <View style={styles.container}>
      {showChat ? renderNativeChatbot() : renderCoachIntro()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 90, // Add top padding since we removed SafeAreaView
    paddingBottom: 120, // Ensure content flows cleanly behind tabs
  },
  introCard: {
    margin: Theme.spacing.md,
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  robotIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.lg,
  },
  introTitle: {
    ...Theme.typography.title1,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  introDescription: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xl,
  },
  capabilitiesSection: {
    width: '100%',
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  capabilityIcon: {
    fontSize: 24,
    marginRight: Theme.spacing.md,
    marginTop: 2,
  },
  capabilityText: {
    flex: 1,
  },
  capabilityTitle: {
    ...Theme.typography.callout,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  capabilityDesc: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
  },
  contextCard: {
    width: '100%',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.purple[500] + '10',
    borderColor: Theme.colors.purple[500] + '30',
    marginBottom: Theme.spacing.xl,
  },
  contextTitle: {
    ...Theme.typography.callout,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  contextItem: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  startButton: {
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  infoLink: {
    ...Theme.typography.footnote,
    color: Theme.colors.purple[500],
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    paddingTop: 90, // Add top padding since we removed SafeAreaView
    paddingBottom: 120, // Ensure content flows cleanly behind tabs
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  backButtonText: {
    color: Theme.colors.purple[500],
    fontSize: 16,
    fontWeight: '600',
  },
  chatTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.success.text,
    marginRight: Theme.spacing.xs,
  },
  onlineText: {
    ...Theme.typography.caption1,
    color: Theme.colors.success.text,
  },
  webview: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Theme.colors.text.primary,
    fontSize: 16,
    textAlign: 'center',
  },
});