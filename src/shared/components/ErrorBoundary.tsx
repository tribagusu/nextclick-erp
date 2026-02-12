'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Feature-Level Error Boundary
 * 
 * Catches React errors within a feature's component tree and displays
 * a user-friendly error message instead of crashing the entire ERP.
 * 
 * Each vertical slice (feature) should be wrapped with this boundary
 * to ensure one failing API or component doesn't crash the whole app.
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${this.props.featureName} Error Boundary]`, error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // TODO: In production, you might want to log to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {this.props.featureName} Error
            </AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                Something went wrong while loading the {this.props.featureName.toLowerCase()} feature.
                The rest of the ERP continues to work normally.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer font-medium">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-destructive/10 p-2">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleReset}
                  className="mt-2"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Reload Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

