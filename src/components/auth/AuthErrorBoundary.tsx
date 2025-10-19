import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, LogIn, AlertTriangle } from 'lucide-react';
import { trackError } from '../../lib/analytics';
import { categorizeError, ErrorType } from '../../utils/errorHandling';

interface Props {
  children?: ReactNode;
  onRetry?: () => void;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error:', error, errorInfo);
    
    // Track error analytics
    trackError(
      error.message,
      error.stack,
      'AuthErrorBoundary'
    );

    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onRetry?.();
  };

  private handleGoToLogin = () => {
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      const appError = categorizeError(this.state.error!);
      const isAuthError = appError.type === ErrorType.AUTHENTICATION;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isAuthError ? 'Authentication Error' : 'Something went wrong'}
              </h1>
              <p className="text-gray-600 mb-6">
                {this.props.fallbackMessage || appError.userMessage}
              </p>
            </div>

            <div className="space-y-3">
              {this.props.onRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              )}
              
              <button
                onClick={this.handleGoToLogin}
                className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Login</span>
              </button>
            </div>

            {isAuthError && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Common solutions:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Check your email and password</li>
                  <li>• Try resetting your password</li>
                  <li>• Clear browser cache and cookies</li>
                  <li>• Check your internet connection</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}