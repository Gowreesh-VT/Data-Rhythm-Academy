import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server, 
  Shield, 
  Home,
  ArrowLeft,
  Bug,
  Mail
} from 'lucide-react';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  type?: 'network' | 'server' | 'auth' | 'permission' | 'generic';
  showDetails?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onGoHome,
  onGoBack,
  type = 'generic',
  showDetails = false
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(showDetails);
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' ? error.stack : undefined;

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          title: 'Connection Problem',
          description: 'Please check your internet connection and try again.',
          color: 'text-orange-500'
        };
      case 'server':
        return {
          icon: Server,
          title: 'Server Error',
          description: 'Our servers are experiencing issues. Please try again later.',
          color: 'text-red-500'
        };
      case 'auth':
        return {
          icon: Shield,
          title: 'Authentication Required',
          description: 'Please log in to access this content.',
          color: 'text-blue-500'
        };
      case 'permission':
        return {
          icon: Shield,
          title: 'Access Denied',
          description: 'You don\'t have permission to access this resource.',
          color: 'text-yellow-500'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Something went wrong',
          description: 'An unexpected error occurred. Please try again.',
          color: 'text-red-500'
        };
    }
  };

  const { icon: Icon, title, description, color } = getErrorConfig();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{description}</p>
          
          {errorMessage && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {errorStack && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="text-gray-500"
              >
                <Bug className="w-4 h-4 mr-2" />
                {showErrorDetails ? 'Hide' : 'Show'} Technical Details
              </Button>
              
              {showErrorDetails && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-left">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                    {errorStack}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {onGoBack && (
              <Button variant="outline" onClick={onGoBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
            
            {onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            )}
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Still having trouble?{' '}
              <a href="mailto:support@datarhythmacademy.in" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Specific error components for common scenarios
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    error="Unable to connect to the internet"
    type="network"
    onRetry={onRetry}
  />
);

export const ServerError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    error="Server is temporarily unavailable"
    type="server"
    onRetry={onRetry}
  />
);

export const AuthError: React.FC<{ onGoHome?: () => void }> = ({ onGoHome }) => (
  <ErrorState
    error="Please log in to continue"
    type="auth"
    onGoHome={onGoHome}
  />
);

export const PermissionError: React.FC<{ onGoBack?: () => void }> = ({ onGoBack }) => (
  <ErrorState
    error="You don't have permission to access this page"
    type="permission"
    onGoBack={onGoBack}
  />
);

// Retry wrapper component with exponential backoff
interface RetryWrapperProps {
  children: React.ReactNode;
  onRetry: () => Promise<void>;
  maxRetries?: number;
  delay?: number;
}

export const RetryWrapper: React.FC<RetryWrapperProps> = ({
  children,
  onRetry,
  maxRetries = 3,
  delay = 1000
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRetry = async () => {
    if (retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, retryCount)));
      await onRetry();
      setRetryCount(0);
    } catch (err) {
      setError(err as Error);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  if (error && retryCount >= maxRetries) {
    return (
      <ErrorState
        error={error}
        onRetry={() => {
          setRetryCount(0);
          setError(null);
          handleRetry();
        }}
      />
    );
  }

  if (isRetrying) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            Retrying... ({retryCount + 1}/{maxRetries})
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Network status indicator
export const NetworkStatusIndicator: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center text-sm z-50">
      <div className="flex items-center justify-center">
        <WifiOff className="w-4 h-4 mr-2" />
        You're currently offline. Some features may not work properly.
      </div>
    </div>
  );
};

// Global error boundary fallback
export const GlobalErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Oops! Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <p className="text-gray-600">
          We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
        </p>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={resetError} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'} 
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500">
            Error ID: {Date.now().toString(36)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Need help?{' '}
            <a 
              href="mailto:support@datarhythmacademy.in" 
              className="text-blue-600 hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);