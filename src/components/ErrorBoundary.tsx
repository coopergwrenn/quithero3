import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Theme } from '@/src/design-system/theme';
import { Button } from '@/src/design-system/components';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to analytics service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you might want to send this to a crash reporting service
    if (__DEV__) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>
        
        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details (Development):</Text>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}
        
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth
          onPress={resetError}
          style={styles.retryButton}
        >
          Try Again
        </Button>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.layout.screenPadding,
  },
  icon: {
    fontSize: 64,
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  message: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xl,
  },
  errorDetails: {
    backgroundColor: Theme.colors.dark.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.xl,
    width: '100%',
  },
  errorTitle: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  },
  errorText: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    fontFamily: 'monospace',
  },
  retryButton: {
    marginTop: Theme.spacing.lg,
  },
});