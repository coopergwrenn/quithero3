/**
 * Remote Configuration Service
 * A/B testing, feature flags, and dynamic content delivery
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from './analytics';

export interface RemoteConfig {
  // Paywall Configuration
  paywall: {
    headline: string;
    subheadline: string;
    pricing: {
      monthly: number;
      annual: number;
      lifetime: number;
    };
    trialDays: number;
    showSavingsCalculator: boolean;
    urgencyMessaging: boolean;
  };
  
  // Feature Flags
  features: {
    aiCoaching: boolean;
    nrtTracking: boolean;
    socialCompetition: boolean;
    financialIncentives: boolean;
    communityFeed: boolean;
    advancedAnalytics: boolean;
  };
  
  // Content Personalization
  content: {
    onboardingSteps: number;
    motivationalMessages: string[];
    crisisResources: {
      phone: string;
      text: string;
      website: string;
    };
  };
  
  // Notification Settings
  notifications: {
    morningPledgeEnabled: boolean;
    eveningReflectionEnabled: boolean;
    crisisSupportEnabled: boolean;
    milestoneEnabled: boolean;
    defaultTimes: {
      morning: string;
      evening: string;
    };
  };
  
  // A/B Test Assignments
  experiments: {
    paywallVariant: 'control' | 'urgency' | 'social-proof' | 'savings-focused';
    onboardingFlow: 'standard' | 'shortened' | 'gamified';
    coachingStyle: 'supportive' | 'direct' | 'clinical';
  };
}

class RemoteConfigService {
  private config: RemoteConfig | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour
  private readonly STORAGE_KEY = 'remote_config';

  async initialize(): Promise<void> {
    // Load cached config first
    await this.loadFromCache();
    
    // Fetch fresh config in background
    this.fetchConfig().catch(error => {
      console.error('Failed to fetch remote config:', error);
    });
  }

  async getConfig(): Promise<RemoteConfig> {
    if (!this.config || this.shouldRefresh()) {
      await this.fetchConfig();
    }
    
    return this.config || this.getDefaultConfig();
  }

  async getFeatureFlag(feature: keyof RemoteConfig['features']): Promise<boolean> {
    const config = await this.getConfig();
    return config.features[feature];
  }

  async getExperimentVariant<T extends keyof RemoteConfig['experiments']>(
    experiment: T
  ): Promise<RemoteConfig['experiments'][T]> {
    const config = await this.getConfig();
    return config.experiments[experiment];
  }

  async getPaywallConfig(): Promise<RemoteConfig['paywall']> {
    const config = await this.getConfig();
    return config.paywall;
  }

  async trackExperimentExposure(
    experiment: string, 
    variant: string, 
    userId?: string
  ): Promise<void> {
    analytics.track('experiment_exposure', {
      experiment,
      variant,
      user_id: userId,
    });
  }

  async trackConversion(
    experiment: string, 
    variant: string, 
    conversionType: string
  ): Promise<void> {
    analytics.track('experiment_conversion', {
      experiment,
      variant,
      conversion_type: conversionType,
    });
  }

  private async fetchConfig(): Promise<void> {
    try {
      const configUrl = process.env.EXPO_PUBLIC_REMOTE_CONFIG_URL;
      if (!configUrl) {
        console.warn('Remote config URL not configured, using defaults');
        this.config = this.getDefaultConfig();
        return;
      }

      const response = await fetch(configUrl, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'QuitHero/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const remoteConfig = await response.json();
      
      // Validate and merge with defaults
      this.config = this.mergeWithDefaults(remoteConfig);
      this.lastFetch = new Date();
      
      // Cache the config
      await this.saveToCache();
      
      analytics.track('remote_config_fetched', {
        success: true,
        config_version: remoteConfig.version || 'unknown',
      });
      
    } catch (error) {
      console.error('Failed to fetch remote config:', error);
      
      // Use cached config or defaults
      if (!this.config) {
        this.config = this.getDefaultConfig();
      }
      
      analytics.track('remote_config_fetch_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async loadFromCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        const { config, timestamp } = JSON.parse(cached);
        this.config = config;
        this.lastFetch = new Date(timestamp);
      }
    } catch (error) {
      console.error('Failed to load cached config:', error);
    }
  }

  private async saveToCache(): Promise<void> {
    try {
      const cacheData = {
        config: this.config,
        timestamp: this.lastFetch?.toISOString(),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save config to cache:', error);
    }
  }

  private shouldRefresh(): boolean {
    if (!this.lastFetch) return true;
    return Date.now() - this.lastFetch.getTime() > this.CACHE_DURATION;
  }

  private getDefaultConfig(): RemoteConfig {
    return {
      paywall: {
        headline: 'Your Personalized Quit Plan is Ready',
        subheadline: 'Evidence-based tools and support for your specific quit profile.',
        pricing: {
          monthly: 9.99,
          annual: 59.99,
          lifetime: 199.99,
        },
        trialDays: 7,
        showSavingsCalculator: true,
        urgencyMessaging: false,
      },
      features: {
        aiCoaching: true,
        nrtTracking: true,
        socialCompetition: true,
        financialIncentives: true,
        communityFeed: true,
        advancedAnalytics: true,
      },
      content: {
        onboardingSteps: 12,
        motivationalMessages: [
          "You're stronger than any craving",
          "Every smoke-free hour is a victory",
          "Your future self will thank you",
          "You have the power to overcome this",
        ],
        crisisResources: {
          phone: '1-800-QUIT-NOW',
          text: 'Text HOME to 741741',
          website: 'https://smokefree.gov',
        },
      },
      notifications: {
        morningPledgeEnabled: true,
        eveningReflectionEnabled: true,
        crisisSupportEnabled: true,
        milestoneEnabled: true,
        defaultTimes: {
          morning: '08:00',
          evening: '20:00',
        },
      },
      experiments: {
        paywallVariant: 'control',
        onboardingFlow: 'standard',
        coachingStyle: 'supportive',
      },
    };
  }

  private mergeWithDefaults(remoteConfig: Partial<RemoteConfig>): RemoteConfig {
    const defaults = this.getDefaultConfig();
    
    return {
      paywall: { ...defaults.paywall, ...remoteConfig.paywall },
      features: { ...defaults.features, ...remoteConfig.features },
      content: { ...defaults.content, ...remoteConfig.content },
      notifications: { ...defaults.notifications, ...remoteConfig.notifications },
      experiments: { ...defaults.experiments, ...remoteConfig.experiments },
    };
  }

  // A/B Testing Utilities
  async assignToExperiment(
    experimentName: string, 
    variants: string[], 
    userId?: string
  ): Promise<string> {
    // Use consistent hashing for stable assignment
    const seed = userId || 'anonymous';
    const hash = this.simpleHash(seed + experimentName);
    const variantIndex = hash % variants.length;
    const assignedVariant = variants[variantIndex];
    
    // Track assignment
    await this.trackExperimentExposure(experimentName, assignedVariant, userId);
    
    return assignedVariant;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export const remoteConfig = new RemoteConfigService();