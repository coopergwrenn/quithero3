import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VoiceflowRequest {
  action: {
    type: 'launch' | 'text' | 'choice';
    payload?: any;
  };
  userId: string;
  userContext?: {
    quitDate?: string;
    motivation?: string;
    substanceType?: string;
    usageAmount?: string;
    triggers?: string;
    daysSinceQuit?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the request is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client to verify the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Verify the user token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the request body
    const { action, userId, userContext }: VoiceflowRequest = await req.json()

    // Validate required fields
    if (!action || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Ensure the userId matches the authenticated user (security check)
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Voiceflow API key from environment variables (secure server-side storage)
    const voiceflowApiKey = Deno.env.get('VOICEFLOW_API_KEY')
    if (!voiceflowApiKey) {
      console.error('VOICEFLOW_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Voiceflow service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Voiceflow configuration
    const voiceflowConfig = {
      projectID: '689cbc694a6d0113b8ffd747',
      baseURL: 'https://general-runtime.voiceflow.com',
      versionID: 'production'
    }

    console.log('🚀 Proxying Voiceflow request:', {
      userId,
      actionType: action.type,
      hasUserContext: !!userContext
    })

    // Prepare request to Voiceflow
    const voiceflowUrl = `${voiceflowConfig.baseURL}/state/user/${userId}/interact`
    const voiceflowHeaders = {
      'Content-Type': 'application/json',
      'Authorization': voiceflowApiKey,
      'versionID': voiceflowConfig.versionID,
    }

    // If it's a launch request and we have user context, enrich the payload
    let enrichedAction = action
    if (action.type === 'launch' && userContext) {
      enrichedAction = {
        ...action,
        payload: {
          ...action.payload,
          user_id: userId,
          quit_date: userContext.quitDate,
          motivation: userContext.motivation,
          substance_type: userContext.substanceType,
          usage_amount: userContext.usageAmount,
          triggers: userContext.triggers,
          days_since_quit: userContext.daysSinceQuit || 0
        }
      }
    }

    console.log('🔍 Voiceflow request:', {
      url: voiceflowUrl,
      headers: { ...voiceflowHeaders, Authorization: '[REDACTED]' },
      body: { action: enrichedAction }
    })

    // Make request to Voiceflow
    const voiceflowResponse = await fetch(voiceflowUrl, {
      method: 'POST',
      headers: voiceflowHeaders,
      body: JSON.stringify({ action: enrichedAction })
    })

    const responseText = await voiceflowResponse.text()
    console.log('📥 Voiceflow response:', {
      status: voiceflowResponse.status,
      statusText: voiceflowResponse.statusText,
      body: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
    })

    if (!voiceflowResponse.ok) {
      console.error('❌ Voiceflow API error:', {
        status: voiceflowResponse.status,
        statusText: voiceflowResponse.statusText,
        body: responseText
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'Voiceflow API error',
          details: {
            status: voiceflowResponse.status,
            statusText: voiceflowResponse.statusText,
            message: responseText
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse and return the Voiceflow response
    let voiceflowData
    try {
      voiceflowData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Failed to parse Voiceflow response:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid response from Voiceflow' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Successfully proxied Voiceflow request')

    return new Response(
      JSON.stringify({
        success: true,
        messages: voiceflowData || [],
        isEnding: false
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error in Voiceflow proxy:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
