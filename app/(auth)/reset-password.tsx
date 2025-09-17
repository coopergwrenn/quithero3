import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Button, TextField, Card } from '@/src/design-system/components';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updatePassword } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid password reset session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsValidSession(true);
      } else {
        Alert.alert(
          'Invalid Reset Link',
          'This password reset link is invalid or has expired. Please request a new one.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/signin') }]
        );
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword(newPassword);
      
      if (result.error) {
        Alert.alert('Password Reset Error', result.error);
        return;
      }

      Alert.alert(
        'Password Updated!',
        'Your password has been successfully updated. You can now sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/(auth)/signin')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below
          </Text>
        </View>

        <Card style={styles.formCard}>
          <TextField
            label="New Password"
            placeholder="Enter your new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
          />

          <TextField
            label="Confirm Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleResetPassword}
            loading={loading}
            style={styles.resetButton}
          >
            Update Password
          </Button>
        </Card>
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
  },
  input: {
    marginBottom: Theme.spacing.lg,
  },
  resetButton: {
    marginTop: Theme.spacing.md,
  },
});
