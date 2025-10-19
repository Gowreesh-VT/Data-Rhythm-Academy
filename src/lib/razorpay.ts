import { trackPaymentInitiated, trackPaymentCompleted, trackPaymentFailed } from './analytics';
import { logger } from '../utils/logger';

// Define Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayInstance {
  open(): void;
  close(): void;
}

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Payment result interface
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create Razorpay order (this would typically be done on the backend)
export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  // In a real application, this should be handled by your backend
  // For demo purposes, we'll create a mock order
  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    status: 'created'
  };
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async ({
  amount,
  courseId,
  courseTitle,
  userEmail,
  userName,
  userContact,
  onSuccess,
  onFailure
}: {
  amount: number;
  courseId: string;
  courseTitle: string;
  userEmail: string;
  userName: string;
  userContact?: string;
  onSuccess: (paymentData: PaymentResult) => void;
  onFailure: (error: string) => void;
}): Promise<void> => {
  try {
    // Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Get Razorpay key from environment variables
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey || razorpayKey === 'your_razorpay_key_here') {
      throw new Error('Razorpay key not configured. Please add VITE_RAZORPAY_KEY_ID to your environment variables.');
    }

    // Create order
    const order = await createRazorpayOrder(amount);
    
    // Track payment initiation
    trackPaymentInitiated(courseId, amount);
    logger.info('Payment initiated for course:', { courseId, amount, orderId: order.id });

    // Configure Razorpay options
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Data Rhythm Academy',
      description: `Payment for ${courseTitle}`,
      order_id: order.id,
      prefill: {
        name: userName,
        email: userEmail,
        contact: userContact
      },
      theme: {
        color: '#3B82F6' // Blue theme to match the app
      },
      handler: (response: RazorpayResponse) => {
        // Payment successful
        const paymentResult: PaymentResult = {
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature
        };
        
        // Track successful payment
        trackPaymentCompleted(response.razorpay_payment_id, courseId, amount);
        logger.info('Payment completed successfully:', paymentResult);
        
        onSuccess(paymentResult);
      },
      modal: {
        ondismiss: () => {
          // Payment cancelled or dismissed
          const error = 'Payment cancelled by user';
          trackPaymentFailed(courseId, amount, error);
          logger.warn('Payment dismissed by user:', { courseId, amount });
          onFailure(error);
        }
      }
    };

    // Create and open Razorpay checkout
    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
    logger.error('Razorpay payment initialization error:', error);
    trackPaymentFailed(courseId, amount, errorMessage);
    onFailure(errorMessage);
  }
};

// Verify payment signature (should be done on backend in production)
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // In production, this verification should be done on your backend
  // using Razorpay's webhook or API verification
  console.warn('Payment signature verification should be implemented on the backend');
  return true; // For demo purposes, always return true
};

// Format amount for display
export const formatAmount = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Calculate total amount with taxes/fees
export const calculateTotalAmount = (
  baseAmount: number,
  taxRate: number = 0.18, // 18% GST in India
  processingFee: number = 0
): {
  baseAmount: number;
  taxAmount: number;
  processingFee: number;
  totalAmount: number;
} => {
  const taxAmount = Math.round(baseAmount * taxRate);
  const totalAmount = baseAmount + taxAmount + processingFee;
  
  return {
    baseAmount,
    taxAmount,
    processingFee,
    totalAmount
  };
};