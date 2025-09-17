#!/usr/bin/env node

/**
 * Password Reset Configuration Test Script
 * 
 * This script helps you test your Supabase password reset configuration
 * Run with: node test-password-reset.js your-email@example.com
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://saoheivherzwysrhglbq.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhb2hlaXZoZXJ6d3lzcmhnbGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEzOTUsImV4cCI6MjA3MDYyNzM5NX0.4kVNJNBgW2YIxLXzA6TfS1OrMtuIr6Zv2kgI00SyQB0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPasswordReset(email) {
  console.log('🧪 Testing Password Reset Configuration');
  console.log('=====================================');
  console.log(`📧 Test email: ${email}`);
  console.log(`🌐 Supabase URL: ${supabaseUrl}`);
  console.log('');

  try {
    // Test 1: Basic connection
    console.log('1️⃣  Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });
    
    if (healthError && healthError.code !== 'PGRST116') {
      console.log('❌ Supabase connection failed:', healthError.message);
      return;
    }
    console.log('✅ Supabase connection successful');

    // Test 2: Send password reset email
    console.log('');
    console.log('2️⃣  Sending password reset email...');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://quithero.app/reset-password',
    });

    if (resetError) {
      console.log('❌ Failed to send reset email:', resetError.message);
      console.log('');
      console.log('🔧 Possible fixes:');
      console.log('   • Check that the email exists in Supabase Auth users');
      console.log('   • Verify redirect URL is configured in Supabase Dashboard');
      console.log('   • Check SMTP configuration in Authentication → Settings');
      console.log('   • Make sure Site URL is set correctly');
      return;
    }

    console.log('✅ Password reset email sent successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Check email inbox (and spam folder)');
    console.log('   2. Look for email from Supabase or your configured sender');
    console.log('   3. Click the reset link in the email');
    console.log('   4. Verify it redirects to: https://quithero.app/reset-password');
    console.log('   5. Test updating the password');
    console.log('');
    console.log('🎉 If you receive the email, your configuration is working!');

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   • Check your internet connection');
    console.log('   • Verify Supabase URL and API key are correct');
    console.log('   • Make sure you have the latest @supabase/supabase-js package');
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node test-password-reset.js your-email@example.com');
  console.log('');
  console.log('This script will test your password reset configuration by:');
  console.log('1. Connecting to your Supabase project');
  console.log('2. Sending a test password reset email');
  console.log('3. Providing feedback on the configuration');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Invalid email format. Please provide a valid email address.');
  process.exit(1);
}

testPasswordReset(email);
