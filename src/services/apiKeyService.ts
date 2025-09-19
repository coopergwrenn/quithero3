import { supabase } from '@/src/lib/supabase';

/**
 * Secure API Key Service
 * 
 * This service fetches API keys from the secure Supabase backend.
 * API keys are stored server-side and never exposed to the client.
 */

interface APIKeyCache {
  [serviceName: string]: {
    key: string;
    timestamp: number;
  };
}

class APIKeyService {
  private cache: APIKeyCache = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get API key for a specific service
   * @param serviceName - Name of the service (e.g., 'voiceflow')
   * @returns Promise<string> - The API key
   */
  async getAPIKey(serviceName: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.cache[serviceName];
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
        console.log(`🔑 Using cached API key for ${serviceName}`);
        return cached.key;
      }

      console.log(`🔑 Fetching API key for ${serviceName} from backend...`);

      // Call the secure database function
      const { data, error } = await supabase.rpc('get_api_key', {
        service_name_param: serviceName
      });

      if (error) {
        console.error(`❌ Error fetching API key for ${serviceName}:`, error);
        throw new Error(`Failed to fetch API key: ${error.message}`);
      }

      if (!data) {
        throw new Error(`API key not found for service: ${serviceName}`);
      }

      // Cache the result
      this.cache[serviceName] = {
        key: data,
        timestamp: now
      };

      console.log(`✅ Successfully fetched API key for ${serviceName}`);
      return data;

    } catch (error) {
      console.error(`❌ API Key Service Error for ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache for a specific service or all services
   * @param serviceName - Optional service name to clear, if not provided clears all
   */
  clearCache(serviceName?: string): void {
    if (serviceName) {
      delete this.cache[serviceName];
      console.log(`🗑️ Cleared API key cache for ${serviceName}`);
    } else {
      this.cache = {};
      console.log('🗑️ Cleared all API key cache');
    }
  }

  /**
   * Check if we have a cached key for a service
   * @param serviceName - Name of the service
   * @returns boolean - True if cached and not expired
   */
  hasCachedKey(serviceName: string): boolean {
    const cached = this.cache[serviceName];
    const now = Date.now();
    return cached && (now - cached.timestamp) < this.CACHE_DURATION;
  }
}

// Export singleton instance
export const apiKeyService = new APIKeyService();

// Export specific helper for Voiceflow
export const getVoiceflowAPIKey = async (): Promise<string> => {
  return apiKeyService.getAPIKey('voiceflow');
};
