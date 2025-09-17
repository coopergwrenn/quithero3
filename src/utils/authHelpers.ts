import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

/**
 * Helper function to handle auth callback from password reset emails
 * This should be called when the app receives a deep link or URL with auth tokens
 */
export const handleAuthCallback = async (url: string) => {
  try {
    // Parse the URL to extract tokens
    const urlObj = new URL(url);
    const accessToken = urlObj.searchParams.get('access_token');
    const refreshToken = urlObj.searchParams.get('refresh_token');
    const tokenHash = urlObj.searchParams.get('token_hash');
    const type = urlObj.searchParams.get('type');

    if (type === 'recovery' && tokenHash) {
      // For password recovery, verify the OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      });

      if (error) {
        console.error('Auth callback error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, session: data.session };
    } else if (accessToken && refreshToken) {
      // For direct token exchange
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('Auth callback error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, session: data.session };
    }

    return { success: false, error: 'Invalid auth callback URL' };
  } catch (error) {
    console.error('Auth callback parsing error:', error);
    return { success: false, error: 'Failed to parse auth callback' };
  }
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

/**
 * Test Supabase password reset configuration
 * Use this to verify your setup is working
 */
export const testPasswordResetConfig = async (testEmail: string) => {
  try {
    console.log('🧪 Testing password reset configuration...');
    
    // Test 1: Check if we can send a password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'https://quithero.app/reset-password',
    });
    
    if (resetError) {
      console.error('❌ Password reset test failed:', resetError);
      return {
        success: false,
        error: `Failed to send reset email: ${resetError.message}`,
        recommendations: [
          'Check that the email exists in your Supabase auth users',
          'Verify redirect URL is configured in Supabase Dashboard',
          'Check SMTP configuration if emails aren\'t being delivered'
        ]
      };
    }
    
    console.log('✅ Password reset email sent successfully');
    
    return {
      success: true,
      message: 'Password reset test passed! Check the email inbox.',
      nextSteps: [
        'Check email inbox (and spam folder)',
        'Click the reset link in the email',
        'Verify it redirects to your reset password page',
        'Test updating the password'
      ]
    };
    
  } catch (error) {
    console.error('❌ Password reset test exception:', error);
    return {
      success: false,
      error: `Test failed: ${error}`,
      recommendations: [
        'Check your Supabase connection',
        'Verify your Supabase keys are correct',
        'Check network connectivity'
      ]
    };
  }
};

/**
 * Get current auth session info for debugging
 */
export const getAuthDebugInfo = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    return {
      session: {
        exists: !!session,
        expiresAt: session?.expires_at,
        tokenType: session?.token_type,
        error: sessionError?.message
      },
      user: {
        id: user?.id,
        email: user?.email,
        emailConfirmed: user?.email_confirmed_at ? true : false,
        lastSignIn: user?.last_sign_in_at,
        error: userError?.message
      }
    };
  } catch (error) {
    return {
      error: `Failed to get auth info: ${error}`
    };
  }
};
