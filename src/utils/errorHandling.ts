import { logger } from './logger';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION', 
  VALIDATION = 'VALIDATION',
  FIREBASE = 'FIREBASE',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  retryable: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Categorize and enhance an error
   */
  categorizeError(error: Error | any, context?: Record<string, any>): AppError {
    const timestamp = new Date();
    
    // Firebase errors
    if (error?.code?.startsWith('auth/')) {
      return this.createAuthError(error, context, timestamp);
    }
    
    if (error?.code?.startsWith('firestore/')) {
      return this.createFirestoreError(error, context, timestamp);
    }

    // Network errors
    if (error?.name === 'NetworkError' || error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: error.message || 'Network error occurred',
        userMessage: 'Please check your internet connection and try again.',
        originalError: error,
        context,
        timestamp,
        retryable: true
      };
    }

    // Validation errors
    if (error?.name === 'ValidationError' || error?.message?.includes('validation')) {
      return {
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.LOW,
        message: error.message || 'Validation error',
        userMessage: 'Please check your input and try again.',
        originalError: error,
        context,
        timestamp,
        retryable: false
      };
    }

    // Default unknown error
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: error?.message || 'An unexpected error occurred',
      userMessage: 'Something went wrong. Please try again.',
      originalError: error,
      context,
      timestamp,
      retryable: true
    };
  }

  private createAuthError(error: any, context?: Record<string, any>, timestamp?: Date): AppError {
    const authErrorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups for this site.'
    };

    return {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
      message: error.message || 'Authentication error',
      userMessage: authErrorMessages[error.code] || 'Authentication failed. Please try again.',
      code: error.code,
      originalError: error,
      context,
      timestamp: timestamp || new Date(),
      retryable: ['auth/network-request-failed', 'auth/too-many-requests'].includes(error.code)
    };
  }

  private createFirestoreError(error: any, context?: Record<string, any>, timestamp?: Date): AppError {
    const firestoreErrorMessages: Record<string, string> = {
      'firestore/permission-denied': 'You don\'t have permission to perform this action.',
      'firestore/not-found': 'The requested data was not found.',
      'firestore/already-exists': 'This data already exists.',
      'firestore/resource-exhausted': 'Service is temporarily unavailable. Please try again later.',
      'firestore/unauthenticated': 'Please sign in to continue.',
      'firestore/unavailable': 'Service is temporarily unavailable. Please try again later.',
      'firestore/deadline-exceeded': 'Request timed out. Please try again.',
      'firestore/cancelled': 'Request was cancelled.',
      'firestore/invalid-argument': 'Invalid data provided.'
    };

    return {
      type: ErrorType.FIREBASE,
      severity: ErrorSeverity.HIGH,
      message: error.message || 'Database error',
      userMessage: firestoreErrorMessages[error.code] || 'Database operation failed. Please try again.',
      code: error.code,
      originalError: error,
      context,
      timestamp: timestamp || new Date(),
      retryable: ['firestore/unavailable', 'firestore/deadline-exceeded', 'firestore/resource-exhausted'].includes(error.code)
    };
  }

  /**
   * Handle error with retry mechanism
   */
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries ?? this.maxRetries;
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const appError = this.categorizeError(error, { ...context, attempt });
        
        // Log error
        logger.error('Operation failed', {
          error: appError,
          attempt,
          maxRetries: retries
        });

        // If not retryable or last attempt, throw
        if (!appError.retryable || attempt === retries) {
          this.addToQueue(appError);
          throw appError;
        }

        // Wait before retry
        if (attempt < retries) {
          await this.delay(this.retryDelays[attempt] || 4000);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Add error to queue for tracking
   */
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Keep only last 100 errors
    if (this.errorQueue.length > 100) {
      this.errorQueue = this.errorQueue.slice(-100);
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 10): AppError[] {
    return this.errorQueue.slice(-limit);
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: Error | AppError): boolean {
    if ('retryable' in error) {
      return error.retryable;
    }
    
    const appError = this.categorizeError(error);
    return appError.retryable;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: Error | AppError): string {
    if ('userMessage' in error) {
      return error.userMessage;
    }
    
    const appError = this.categorizeError(error);
    return appError.userMessage;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, any>,
  maxRetries?: number
): Promise<T> => {
  return errorHandler.handleWithRetry(operation, context, maxRetries);
};

export const categorizeError = (error: Error | any, context?: Record<string, any>): AppError => {
  return errorHandler.categorizeError(error, context);
};

export const isRetryableError = (error: Error | AppError): boolean => {
  return errorHandler.isRetryable(error);
};

export const getUserFriendlyMessage = (error: Error | AppError): string => {
  return errorHandler.getUserMessage(error);
};