/**
 * Privacy-First Analytics Service for QuitHero
 * Local-first approach with optional cloud sync
 */

// import { MMKV } from 'react-native-mmkv';

// Initialize analytics storage - temporarily disabled due to TurboModules issue
// const analyticsStorage = new MMKV({ id: 'analytics-storage' });
const analyticsStorage = {
  set: (key: string, value: string) => {},
  getString: (key: string) => undefined,
  delete: (key: string) => {},
  getAllKeys: () => [],
};

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  cloudSyncEnabled: boolean;
  retentionDays: number;
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.config = this.loadConfig();
    this.sessionId = this.generateSessionId();
    this.loadEventQueue();
    this.startBatchProcessor();
  }

  // Core event tracking methods
  track(event: string, properties?: Record<string, any>) {
    if (!this.config.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        platform: 'mobile',
        app_version: '1.0.0',
      },
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    this.eventQueue.push(analyticsEvent);
    this.saveEventQueue();

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  // Landing & Conversion Events
  trackLandingView() {
    this.track('landing_view');
  }

  trackHeroCTAClick(action: 'start_plan' | 'try_tool') {
    this.track('hero_cta_click', { action });
  }

  // Onboarding Flow Events
  trackOnboardingStarted() {
    this.track('onboarding_started');
  }

  trackOnboardingStepCompleted(stepNumber: number, stepData?: Record<string, any>) {
    this.track('onboarding_step_completed', {
      step_number: stepNumber,
      ...stepData,
    });
  }

  trackOnboardingAbandoned(stepNumber: number) {
    this.track('onboarding_abandoned', { step_number: stepNumber });
  }

  trackOnboardingCompleted(riskLevel: string, quitDate?: Date) {
    this.track('onboarding_completed', {
      risk_level: riskLevel,
      quit_date: quitDate?.toISOString(),
      completion_time: Date.now() - this.getSessionStartTime(),
    });
  }

  // Paywall Conversion Events
  trackPaywallViewed(riskLevel?: string, personalizationType?: string) {
    this.track('paywall_viewed', {
      risk_level: riskLevel,
      personalization_type: personalizationType,
    });
  }

  trackPaywallPurchaseAttempted(productSku: string) {
    this.track('paywall_purchase_attempted', { product_sku: productSku });
  }

  trackPaywallPurchaseCompleted(productSku: string, trialStarted: boolean) {
    this.track('paywall_purchase_completed', {
      product_sku: productSku,
      trial_started: trialStarted,
    });
  }

  trackPaywallDismissed(exitMethod: 'back_button' | 'try_free' | 'close') {
    this.track('paywall_dismissed', { exit_method: exitMethod });
  }

  // Tool Usage Events (Core Value)
  trackToolOpened(toolType: string, source: string) {
    this.track('tool_opened', {
      tool_type: toolType,
      source,
    });
  }

  trackToolCompleted(toolType: string, duration: number) {
    this.track('tool_completed', {
      tool_type: toolType,
      duration,
    });
  }

  trackToolAbandoned(toolType: string, completionPercentage: number) {
    this.track('tool_abandoned', {
      tool_type: toolType,
      completion_percentage: completionPercentage,
    });
  }

  // Retention & Engagement Events
  trackDailyPledgeCompleted() {
    this.track('daily_pledge_completed');
  }

  trackStreakMilestoneReached(days: number) {
    this.track('streak_milestone_reached', { days });
  }

  trackNotificationReceived(type: string) {
    this.track('notification_received', { type });
  }

  trackNotificationOpened(type: string) {
    this.track('notification_opened', { type });
  }

  // Configuration methods
  updateConfig(newConfig: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...newConfig };
    analyticsStorage.set('analytics_config', JSON.stringify(this.config));
  }

  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  // Privacy methods
  clearAllData() {
    this.eventQueue = [];
    analyticsStorage.delete('event_queue');
    analyticsStorage.delete('analytics_config');
    analyticsStorage.delete('session_start_time');
  }

  exportUserData(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  // Private methods
  private loadConfig(): AnalyticsConfig {
    const configString = analyticsStorage.getString('analytics_config');
    if (configString) {
      return JSON.parse(configString);
    }
    
    // Default config
    const defaultConfig: AnalyticsConfig = {
      enabled: true,
      cloudSyncEnabled: false,
      retentionDays: 30,
    };
    
    analyticsStorage.set('analytics_config', JSON.stringify(defaultConfig));
    return defaultConfig;
  }

  private generateSessionId(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    analyticsStorage.set('session_start_time', Date.now().toString());
    return sessionId;
  }

  private getSessionStartTime(): number {
    const startTime = analyticsStorage.getString('session_start_time');
    return startTime ? parseInt(startTime) : Date.now();
  }

  private loadEventQueue() {
    const queueString = analyticsStorage.getString('event_queue');
    if (queueString) {
      try {
        const events = JSON.parse(queueString);
        this.eventQueue = events.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }));
      } catch (error) {
        console.error('Error loading event queue:', error);
        this.eventQueue = [];
      }
    }
  }

  private saveEventQueue() {
    try {
      analyticsStorage.set('event_queue', JSON.stringify(this.eventQueue));
    } catch (error) {
      console.error('Error saving event queue:', error);
    }
  }

  private startBatchProcessor() {
    setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private flush() {
    if (!this.config.cloudSyncEnabled || this.eventQueue.length === 0) {
      return;
    }

    // In a real implementation, this would send events to your analytics service
    console.log('Flushing analytics events:', this.eventQueue.length);
    
    // For now, just clear the queue after "sending"
    this.eventQueue = [];
    this.saveEventQueue();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();