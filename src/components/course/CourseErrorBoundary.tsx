import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, BookOpen, AlertTriangle } from 'lucide-react';
import { trackError } from '../../lib/analytics';
import { categorizeError, ErrorType } from '../../utils/errorHandling';

interface Props {
  children?: ReactNode;
  courseId?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class CourseErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Course Error:', error, errorInfo);
    
    // Track error analytics
    trackError(
      error.message,
      error.stack,
      'CourseErrorBoundary'
    );

    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onRetry?.();
  };

  private handleGoBack = () => {
    this.props.onGoBack?.();
  };

  private handleGoToCourses = () => {
    window.location.href = '/courses';
  };

  public render() {
    if (this.state.hasError) {
      const appError = categorizeError(this.state.error!);
      const isNetworkError = appError.type === ErrorType.NETWORK;
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Course Loading Error
              </h1>
              <p className="text-gray-600 mb-6">
                {appError.userMessage}
              </p>
            </div>

            <div className="space-y-3">
              {this.props.onRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Loading Course</span>
                </button>
              )}
              
              {this.props.onGoBack && (
                <button
                  onClick={this.handleGoBack}
                  className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              )}
              
              <button
                onClick={this.handleGoToCourses}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Browse All Courses</span>
              </button>
            </div>

            {isNetworkError && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Network troubleshooting:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Try refreshing the page</li>
                  <li>• Clear browser cache</li>
                  <li>• Try again in a few moments</li>
                </ul>
              </div>
            )}

            {this.props.courseId && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Course ID: {this.props.courseId}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}