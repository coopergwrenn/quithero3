import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, TextField, Card } from '@/src/design-system/components';
import { useAuthStore } from '@/src/stores/authStore';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signInWithOTP, verifyOTP, debugCheckUsers } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSignIn = async () => {
    if (!email || (!password && !useOTP)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (useOTP && !otpSent) {
        // Send OTP
        result = await signInWithOTP(email);
        if (!result.error) {
          setOtpSent(true);
          Alert.alert('Code Sent', 'Check your email for the verification code');
        }
      } else if (useOTP && otpSent) {
        // Verify OTP
        if (!otpCode) {
          Alert.alert('Error', 'Please enter the verification code');
          return;
        }
        result = await verifyOTP(email, otpCode);
      } else {
        // Regular password sign-in
        result = await signIn(email, password);
      }
      
      if (result.error) {
        Alert.alert('Sign In Error', result.error);
        return;
      }
      
      if (useOTP && !otpSent) {
        // Just sent OTP, don't redirect yet
        return;
      }
      
      // Success - let the app layout handle routing
      console.log('✅ Sign in successful, letting app layout handle routing');
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to sync your progress across devices
          </Text>
        </View>

        <Card style={styles.formCard}>
          <TextField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
          />
          
          {/* Toggle between password and OTP */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Sign in method:</Text>
            <View style={styles.toggleButtons}>
              <Button
                variant={!useOTP ? "primary" : "ghost"}
                size="sm"
                onPress={() => {
                  setUseOTP(false);
                  setOtpSent(false);
                  setOtpCode('');
                }}
                style={styles.toggleButton}
              >
                Password
              </Button>
              <Button
                variant={useOTP ? "primary" : "ghost"}
                size="sm"
                onPress={() => {
                  setUseOTP(true);
                  setPassword('');
                }}
                style={styles.toggleButton}
              >
                Email Code
              </Button>
            </View>
          </View>
          
          {!useOTP ? (
            <TextField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          ) : otpSent ? (
            <TextField
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
            />
          ) : null}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSignIn}
            loading={loading}
            style={styles.signInButton}
          >
            {useOTP && !otpSent ? 'Send Code' : useOTP && otpSent ? 'Verify Code' : 'Sign In'}
          </Button>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Link href="/(onboarding)" style={styles.link}>
              Sign up
            </Link>
          </Text>
          
          <Link href="/(app)/(tabs)/dashboard" style={styles.skipLink}>
            <Text style={styles.skipText}>Continue without account</Text>
          </Link>
          
          {/* Debug button - remove this after testing */}
          <Button
            variant="ghost"
            size="sm"
            onPress={debugCheckUsers}
            style={styles.debugButton}
          >
            🔍 Debug: Check Database
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  content: {
    flex: 1,
    padding: Theme.layout.screenPadding,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxxl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  input: {
    marginBottom: Theme.spacing.lg,
  },
  signInButton: {
    marginTop: Theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  footerText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
  },
  link: {
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  skipLink: {
    paddingVertical: Theme.spacing.sm,
  },
  skipText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  debugButton: {
    marginTop: Theme.spacing.md,
  },
  toggleContainer: {
    marginBottom: Theme.spacing.lg,
  },
  toggleLabel: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  toggleButton: {
    flex: 1,
  },
});