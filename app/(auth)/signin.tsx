import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, TextField, Card } from '@/src/design-system/components';
import { useAuthStore } from '@/src/stores/authStore';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        Alert.alert('Sign In Error', result.error);
        return;
      }
      
      // Success - redirect to dashboard
      router.replace('/(app)/(tabs)/dashboard');
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
          
          <TextField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSignIn}
            loading={loading}
            style={styles.signInButton}
          >
            Sign In
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
});