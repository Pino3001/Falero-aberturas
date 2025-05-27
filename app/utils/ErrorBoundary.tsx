import React, { Component, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error capturado:", error, errorInfo);
    // Puedes enviar el error a un servicio como Sentry/Bugsnag aquí
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>¡Algo salió mal!</Text>
          <Text>{this.state.error?.message}</Text>
          <Button title="Reintentar" onPress={this.resetError} />
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;