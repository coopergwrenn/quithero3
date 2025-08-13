import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, TextField, Card } from '@/src/design-system/components';
import { useAuthStore } from '@/src/stores/authStore';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      router.replace('/(onboarding)');
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join thousands who've quit with QuitHero
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
          
          <TextField
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TextField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSignUp}
            loading={loading}
            style={styles.signUpButton}
          >
            Create Account
          </Button>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Link href="/(auth)/signin" style={styles.link}>
              Sign in
            </Link>
          </Text>
          
          <Link href="/(app)/(tabs)/dashboard" style={styles.skipLink}>
            <Text style={styles.skipText}>Continue without account</Text>
          </Link>
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
  signUpButton: {
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
});