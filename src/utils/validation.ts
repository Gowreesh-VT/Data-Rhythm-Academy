import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

// Course validation schemas
export const courseCreationSchema = z.object({
  title: z.string()
    .min(5, 'Course title must be at least 5 characters')
    .max(100, 'Course title must be less than 100 characters'),
  
  description: z.string()
    .min(50, 'Course description must be at least 50 characters')
    .max(2000, 'Course description must be less than 2000 characters'),
  
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(10000, 'Price cannot exceed $10,000'),
  
  duration: z.string()
    .min(1, 'Duration is required'),
  
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  tags: z.array(z.string())
    .max(10, 'Cannot have more than 10 tags'),
  
  imageUrl: z.string()
    .url('Please enter a valid URL')
    .optional()
});

// Payment validation schemas
export const paymentSchema = z.object({
  cardNumber: z.string()
    .regex(/^\d{16}$/, 'Card number must be 16 digits'),
  
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  
  cvv: z.string()
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  
  cardholderName: z.string()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(100, 'Cardholder name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Cardholder name can only contain letters and spaces'),
  
  billingAddress: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: z.string().min(2, 'Country is required')
  })
});

// Review validation schema
export const reviewSchema = z.object({
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  
  comment: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be less than 1000 characters')
    .refine(comment => !/<[^>]*>/.test(comment), 'HTML tags are not allowed')
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string().email('Please enter a valid email address'),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters')
});

// Utility functions for validation
export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Sanitize HTML content
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Sanitize user input for database
export const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML brackets
    .substring(0, 1000); // Limit length
};