import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

interface AuthErrorDisplayProps {
  error: {
    code?: string;
    message: string;
    originalMessage?: string;
  };
  onRetry?: () => void;
}

export const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ error, onRetry }) => {
  const getErrorContent = () => {
    switch (error.code) {
      case 'auth/unauthorized-domain':
        return {
          title: 'Domain Not Authorized',
          description: error.message,
          action: (
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Try accessing from our main website:
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open('https://the-data-rhythm-academy.web.app', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Main Site
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                If you're a developer, add this domain to Firebase authorized domains.
              </p>
            </div>
          )
        };

      case 'auth/popup-blocked':
        return {
          title: 'Popup Blocked',
          description: error.message,
          action: (
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-sm text-muted-foreground">
                Please allow popups for this site and try again.
              </p>
              {onRetry && (
                <Button size="sm" onClick={onRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          )
        };

      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return {
          title: 'Sign-in Cancelled',
          description: 'The sign-in process was cancelled.',
          action: onRetry ? (
            <Button size="sm" onClick={onRetry} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ) : null
        };

      case 'auth/api-key-not-valid':
        return {
          title: 'Configuration Error',
          description: 'There is a configuration issue. Please try again later or contact support.',
          action: onRetry ? (
            <Button size="sm" onClick={onRetry} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ) : null
        };

      default:
        return {
          title: 'Authentication Error',
          description: error.message,
          action: onRetry ? (
            <Button size="sm" onClick={onRetry} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ) : null
        };
    }
  };

  const { title, description, action } = getErrorContent();

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>{description}</p>
          {action}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Hook for handling auth errors consistently
export const useAuthErrorHandler = () => {
  const handleAuthError = (error: any): string => {
    if (!error) return '';

    // Map Firebase auth errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'auth/unauthorized-domain': 'This domain is not authorized for sign-in. Please try from our main website.',
      'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups and try again.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
      'auth/api-key-not-valid': 'Authentication service is temporarily unavailable. Please try again.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
    };

    return errorMap[error.code] || error.message || 'An unexpected error occurred.';
  };

  const isRetryableError = (error: any): boolean => {
    const retryableCodes = [
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/network-request-failed',
      'auth/api-key-not-valid'
    ];

    return retryableCodes.includes(error?.code);
  };

  const isDomainError = (error: any): boolean => {
    return error?.code === 'auth/unauthorized-domain';
  };

  return {
    handleAuthError,
    isRetryableError,
    isDomainError
  };
};

export default AuthErrorDisplay;