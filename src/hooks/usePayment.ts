import { useState } from 'react';
import { initiateRazorpayPayment, PaymentResult, calculateTotalAmount } from '../lib/razorpay';
import { enrollInCourse } from '../lib/database';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../utils/logger';

export interface PaymentState {
  isProcessing: boolean;
  isSuccess: boolean;
  error: string | null;
  paymentId: string | null;
}

export interface UsePaymentOptions {
  onSuccess?: (paymentData: PaymentResult, enrollmentId?: string) => void;
  onError?: (error: string) => void;
}

export const usePayment = (options: UsePaymentOptions = {}) => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    isSuccess: false,
    error: null,
    paymentId: null
  });

  const { success, error: showError } = useToast();

  const resetPaymentState = () => {
    setPaymentState({
      isProcessing: false,
      isSuccess: false,
      error: null,
      paymentId: null
    });
  };

  const processPayment = async ({
    courseId,
    courseTitle,
    amount,
    userId,
    userEmail,
    userName,
    userContact,
    autoEnroll = true
  }: {
    courseId: string;
    courseTitle: string;
    amount: number;
    userId: string;
    userEmail: string;
    userName: string;
    userContact?: string;
    autoEnroll?: boolean;
  }) => {
    // Reset state
    resetPaymentState();
    
    setPaymentState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Calculate total amount with taxes
      const { totalAmount, taxAmount, baseAmount } = calculateTotalAmount(amount);
      
      logger.info('Initiating payment:', {
        courseId,
        baseAmount,
        taxAmount,
        totalAmount,
        userId
      });

      await initiateRazorpayPayment({
        amount: totalAmount,
        courseId,
        courseTitle,
        userEmail,
        userName,
        userContact,
        onSuccess: async (paymentData: PaymentResult) => {
          try {
            setPaymentState(prev => ({
              ...prev,
              isSuccess: true,
              paymentId: paymentData.paymentId || null,
              error: null
            }));

            let enrollmentId: string | undefined;

            // Auto-enroll user if enabled
            if (autoEnroll) {
              logger.info('Auto-enrolling user after payment:', { userId, courseId, paymentData });
              
              const enrollmentResult = await enrollInCourse(userId, courseId, {
                paymentId: paymentData.paymentId!,
                amount: totalAmount,
                currency: 'INR',
                paymentMethod: 'razorpay'
              });

              if (enrollmentResult.error) {
                throw new Error(`Enrollment failed: ${enrollmentResult.error.message}`);
              }

              enrollmentId = enrollmentResult.data?.id;
              logger.info('User enrolled successfully:', { enrollmentId, userId, courseId });
            }

            // Show success message
            success(
              'Payment Successful!',
              autoEnroll 
                ? 'You have been enrolled in the course. Redirecting...'
                : 'Payment completed successfully.'
            );

            // Call success callback
            options.onSuccess?.(paymentData, enrollmentId);

          } catch (enrollmentError) {
            logger.error('Post-payment enrollment error:', enrollmentError);
            const errorMessage = enrollmentError instanceof Error 
              ? enrollmentError.message 
              : 'Failed to enroll after payment';
            
            setPaymentState(prev => ({
              ...prev,
              error: errorMessage,
              isSuccess: false
            }));

            showError('Enrollment Error', errorMessage);
            options.onError?.(errorMessage);
          } finally {
            setPaymentState(prev => ({ ...prev, isProcessing: false }));
          }
        },
        onFailure: (errorMessage: string) => {
          logger.warn('Payment failed or cancelled:', { courseId, errorMessage });
          
          setPaymentState(prev => ({
            ...prev,
            isProcessing: false,
            error: errorMessage,
            isSuccess: false
          }));

          if (!errorMessage.includes('cancelled')) {
            showError('Payment Failed', errorMessage);
          }
          
          options.onError?.(errorMessage);
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
      logger.error('Payment processing error:', error);
      
      setPaymentState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        isSuccess: false
      }));

      showError('Payment Error', errorMessage);
      options.onError?.(errorMessage);
    }
  };

  return {
    paymentState,
    processPayment,
    resetPaymentState,
    isProcessing: paymentState.isProcessing,
    isSuccess: paymentState.isSuccess,
    error: paymentState.error,
    paymentId: paymentState.paymentId
  };
};