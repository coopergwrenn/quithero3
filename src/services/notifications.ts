/**
 * Smart Notification Service for QuitHero
 * Behavioral triggers and habit formation
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { analytics } from './analytics';

// Initialize notification storage
const notificationStorage = new MMKV({ id: 'notification-storage' });

export interface NotificationPreferences {
  morningPledge: boolean;
  eveningReflection: boolean;
  crisisSupport: boolean;
  milestones: boolean;
  enabled: boolean;
}

export interface NotificationSchedule {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Notifications.NotificationTriggerInput;
}

class NotificationService {
  private preferences: NotificationPreferences;
  private hasPermission = false;

  constructor() {
    this.preferences = this.loadPreferences();
    this.setupNotificationHandler();
  }

  // Permission management
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false; // Web doesn't support local notifications
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    this.hasPermission = finalStatus === 'granted';
    return this.hasPermission;
  }

  async checkPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status } = await Notifications.getPermissionsAsync();
    this.hasPermission = status === 'granted';
    return this.hasPermission;
  }

  // Core notification scheduling
  async scheduleNotification(schedule: NotificationSchedule): Promise<string | null> {
    if (!this.hasPermission || !this.preferences.enabled) {
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: schedule.title,
          body: schedule.body,
          data: {
            type: schedule.type,
            deepLink: schedule.data?.deepLink,
            ...schedule.data,
          },
        },
        trigger: schedule.trigger,
      });

      analytics.trackNotificationReceived(schedule.type);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Habit formation notifications
  async scheduleMorningPledge(): Promise<void> {
    if (!this.preferences.morningPledge) return;

    // Check if pledge already completed today
    const today = new Date().toDateString();
    const lastPledgeDate = notificationStorage.getString('last_pledge_date');
    
    if (lastPledgeDate === today) {
      return; // Already completed today
    }

    await this.scheduleNotification({
      id: 'morning_pledge',
      type: 'morning_pledge',
      title: 'Start Your Day Smoke-Free 💪',
      body: 'Take today\'s pledge and commit to your freedom',
      data: {
        deepLink: 'quithero://tools/pledge',
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      },
    });
  }

  async scheduleEveningReflection(): Promise<void> {
    if (!this.preferences.eveningReflection) return;

    await this.scheduleNotification({
      id: 'evening_reflection',
      type: 'evening_reflection',
      title: 'How Did Today Go? ✨',
      body: 'Reflect on your progress and plan for tomorrow',
      data: {
        deepLink: 'quithero://dashboard',
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  }

  // Crisis support notifications
  async scheduleCrisisSupport(delayMinutes: number = 30): Promise<void> {
    if (!this.preferences.crisisSupport) return;

    // Only for users who've used tools before
    const hasUsedTools = notificationStorage.getBoolean('has_used_tools') ?? false;
    if (!hasUsedTools) return;

    await this.scheduleNotification({
      id: 'crisis_support',
      type: 'crisis_support',
      title: 'Feeling an Urge? You\'ve Got This 🌟',
      body: 'Use your panic protocol - you\'re stronger than any craving',
      data: {
        deepLink: 'quithero://tools/panic',
      },
      trigger: {
        seconds: delayMinutes * 60,
      },
    });
  }

  // Milestone celebrations
  async scheduleMilestone(days: number): Promise<void> {
    if (!this.preferences.milestones) return;

    const milestoneMessages = {
      1: {
        title: '🎉 24 Hours Smoke-Free!',
        body: 'Your heart rate and blood pressure are already normalizing',
      },
      3: {
        title: '🎉 3 Days Strong!',
        body: 'You\'re rewiring your brain and breaking the addiction cycle',
      },
      7: {
        title: '🎉 One Week Smoke-Free!',
        body: 'Your taste and smell are improving significantly',
      },
      30: {
        title: '🎉 One Month Achievement!',
        body: 'Your lung function is beginning to improve dramatically',
      },
      90: {
        title: '🎉 Three Months Free!',
        body: 'Your circulation has improved and lung function increased',
      },
      365: {
        title: '🎉 One Year Smoke-Free!',
        body: 'Your risk of heart disease has been cut in half',
      },
    };

    const message = milestoneMessages[days as keyof typeof milestoneMessages];
    if (!message) return;

    await this.scheduleNotification({
      id: `milestone_${days}`,
      type: 'milestone',
      title: message.title,
      body: message.body,
      data: {
        deepLink: 'quithero://dashboard',
        milestone_days: days,
      },
      trigger: {
        seconds: days * 24 * 60 * 60, // Convert days to seconds
      },
    });
  }

  // Smart triggers based on usage patterns
  async triggerSmartNotification(context: {
    lastToolUse?: Date;
    stressLevel?: 'high' | 'medium' | 'low';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
  }): Promise<void> {
    const { lastToolUse, stressLevel, timeOfDay } = context;

    // High stress pattern detection
    if (stressLevel === 'high' && lastToolUse) {
      const hoursSinceLastUse = (Date.now() - lastToolUse.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastUse > 4) {
        await this.scheduleCrisisSupport(5); // 5 minute delay
      }
    }

    // Time-based contextual support
    if (timeOfDay === 'morning') {
      await this.scheduleMorningPledge();
    } else if (timeOfDay === 'evening') {
      await this.scheduleEveningReflection();
    }
  }

  // Preference management
  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    notificationStorage.set('notification_preferences', JSON.stringify(this.preferences));
    
    // Reschedule notifications based on new preferences
    this.rescheduleAll();
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Utility methods
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  markToolUsed(): void {
    notificationStorage.set('has_used_tools', true);
  }

  markPledgeCompleted(): void {
    const today = new Date().toDateString();
    notificationStorage.set('last_pledge_date', today);
  }

  // Private methods
  private loadPreferences(): NotificationPreferences {
    const prefsString = notificationStorage.getString('notification_preferences');
    if (prefsString) {
      return JSON.parse(prefsString);
    }
    
    // Default preferences
    const defaultPrefs: NotificationPreferences = {
      morningPledge: true,
      eveningReflection: true,
      crisisSupport: true,
      milestones: true,
      enabled: true,
    };
    
    notificationStorage.set('notification_preferences', JSON.stringify(defaultPrefs));
    return defaultPrefs;
  }

  private setupNotificationHandler(): void {
    // Handle notification responses (when user taps notification)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Track notification opens
    Notifications.addNotificationResponseReceivedListener(response => {
      const notificationType = response.notification.request.content.data?.type as string;
      if (notificationType) {
        analytics.trackNotificationOpened(notificationType);
      }
    });
  }

  private async rescheduleAll(): Promise<void> {
    // Cancel existing notifications
    await this.cancelAllNotifications();
    
    // Reschedule based on current preferences
    if (this.preferences.enabled) {
      await this.scheduleMorningPledge();
      await this.scheduleEveningReflection();
    }
  }
}

// Export singleton instance
export const notifications = new NotificationService();