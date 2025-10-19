import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, CreditCard, AlertTriangle, ArrowLeft } from 'lucide-react';
import { trackError } from '../../lib/analytics';
import { categorizeError, ErrorType } from '../../utils/errorHandling';

interface Props {
  children?: ReactNode;
  onRetry?: () => void;
  onGoBack?: () => void;
  courseId?: string;
  amount?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class PaymentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Payment Error:', error, errorInfo);
    
    // Track error analytics
    trackError(
      error.message,
      error.stack,
      'PaymentErrorBoundary'
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

  private handleContactSupport = () => {
    window.location.href = '/contact';
  };

  public render() {
    if (this.state.hasError) {
      const appError = categorizeError(this.state.error!);
      const isPaymentError = appError.message.toLowerCase().includes('payment') || 
                           appError.message.toLowerCase().includes('transaction');
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Processing Error
              </h1>
              <p className="text-gray-600 mb-6">
                {isPaymentError ? appError.userMessage : 'There was an issue processing your payment. Please try again.'}
              </p>
            </div>

            {this.props.amount && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Transaction Amount</p>
                <p className="text-lg font-semibold text-gray-900">₹{this.props.amount}</p>
              </div>
            )}

            <div className="space-y-3">
              {this.props.onRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Payment</span>
                </button>
              )}
              
              {this.props.onGoBack && (
                <button
                  onClick={this.handleGoBack}
                  className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
              )}
              
              <button
                onClick={this.handleContactSupport}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Contact Support
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Payment troubleshooting:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Check your card details and balance</li>
                <li>• Ensure your internet connection is stable</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-xs text-yellow-700">
                  Don't worry - your card wasn't charged if the payment failed.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}