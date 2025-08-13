export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          apple_id: string | null
          created_at: string
          quit_date: string | null
          risk_level: 'high' | 'medium' | 'low' | null
          motivation: string | null
          substance_type: 'cigarettes' | 'vape' | 'both' | null
          usage_amount: number | null
          triggers: string[] | null
          streak_days: number
          total_saved: number
          last_active: string
        }
        Insert: {
          id?: string
          email?: string | null
          apple_id?: string | null
          created_at?: string
          quit_date?: string | null
          risk_level?: 'high' | 'medium' | 'low' | null
          motivation?: string | null
          substance_type?: 'cigarettes' | 'vape' | 'both' | null
          usage_amount?: number | null
          triggers?: string[] | null
          streak_days?: number
          total_saved?: number
          last_active?: string
        }
        Update: {
          id?: string
          email?: string | null
          apple_id?: string | null
          created_at?: string
          quit_date?: string | null
          risk_level?: 'high' | 'medium' | 'low' | null
          motivation?: string | null
          substance_type?: 'cigarettes' | 'vape' | 'both' | null
          usage_amount?: number | null
          triggers?: string[] | null
          streak_days?: number
          total_saved?: number
          last_active?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          anonymous_name: string
          streak_days: number
          post_type: 'milestone' | 'struggle' | 'tip' | 'celebration'
          likes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          anonymous_name: string
          streak_days?: number
          post_type?: 'milestone' | 'struggle' | 'tip' | 'celebration'
          likes_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          anonymous_name?: string
          streak_days?: number
          post_type?: 'milestone' | 'struggle' | 'tip' | 'celebration'
          likes_count?: number
          created_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string
          event_name: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_name: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_name?: string
          event_data?: Json
          created_at?: string
        }
      }
      tool_usage: {
        Row: {
          id: string
          user_id: string
          tool_type: string
          duration: number | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_type: string
          duration?: number | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_type?: string
          duration?: number | null
          completed?: boolean
          created_at?: string
        }
      }
      user_streaks: {
        Row: {
          id: string
          user_id: string
          streak_type: 'quit' | 'pledge' | 'tool_usage'
          current_streak: number
          best_streak: number
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          streak_type: 'quit' | 'pledge' | 'tool_usage'
          current_streak?: number
          best_streak?: number
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          streak_type?: 'quit' | 'pledge' | 'tool_usage'
          current_streak?: number
          best_streak?: number
          last_activity?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}