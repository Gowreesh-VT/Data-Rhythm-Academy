import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  BookOpen, 
  CreditCard, 
  Shield, 
  Lock, 
  ArrowLeft,
  CheckCircle,
  QrCode,
  Smartphone,
  Building,
  Calendar,
  Clock,
  User,
  LogOut
} from 'lucide-react';

interface PaymentPageProps {
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
}

export function PaymentPage({ onNavigate, user, onLogout }: PaymentPageProps) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    saveCard: false,
    agreeTerms: false
  });

  // Mock booking data
  const bookingData = {
    mentor: {
      name: 'Sarah Chen',
      role: 'Senior Full-Stack Developer',
      company: 'Google',
      avatar: 'SC'
    },
    session: {
      type: 'Career Mentorship',
      duration: '60 min',
      date: 'Friday, January 12, 2025',
      time: '2:00 PM',
      price: 150,
      platformFee: 15
    }
  };

  const handlePayment = async () => {
    if (!formData.agreeTerms) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <Card className="border-green-200 bg-white/90 backdrop-blur-sm text-center">
            <CardHeader className="pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
              <CardDescription className="text-green-600">
                Your mentorship session has been booked
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg text-left">
                <h4 className="font-medium text-green-900 mb-3">Session Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Mentor:</span>
                    <span className="font-medium">{bookingData.mentor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Date:</span>
                    <span className="font-medium">{bookingData.session.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Time:</span>
                    <span className="font-medium">{bookingData.session.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Type:</span>
                    <span className="font-medium">{bookingData.session.type}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>📧 Confirmation email sent to {user?.email}</p>
                <p>📅 Calendar invite will be sent 24 hours before</p>
                <p>🎥 Meeting link will be shared via email</p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => onNavigate('booking')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Book Another Session
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('landing')}
                  className="w-full border-green-200 text-green-700 hover:bg-green-50"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                EduFlow
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="ghost" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate('booking')}
            className="mb-4 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>
          
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Secure checkout for your mentorship session
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Payment Method</span>
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'card' ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="card" id="card" />
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <Label htmlFor="card" className="cursor-pointer">Credit/Debit Card</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'upi' ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="upi" id="upi" />
                          <div className="flex items-center space-x-2">
                            <QrCode className="w-5 h-5 text-blue-600" />
                            <Label htmlFor="upi" className="cursor-pointer">UPI</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'paypal' ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-5 h-5 text-blue-600" />
                            <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <span>
                      {paymentMethod === 'card' ? 'Card Details' : 
                       paymentMethod === 'upi' ? 'UPI Details' : 'PayPal'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {paymentMethod === 'card' ? 'Enter your card information securely' :
                     paymentMethod === 'upi' ? 'Enter your UPI ID' : 'You\'ll be redirected to PayPal'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            cardNumber: formatCardNumber(e.target.value) 
                          })}
                          maxLength={19}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              expiryDate: formatExpiryDate(e.target.value) 
                            })}
                            maxLength={5}
                            className="border-blue-200 focus:border-blue-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                            })}
                            className="border-blue-200 focus:border-blue-400"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          placeholder="John Doe"
                          value={formData.cardholderName}
                          onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveCard"
                          checked={formData.saveCard}
                          onCheckedChange={(checked) => setFormData({ ...formData, saveCard: checked })}
                        />
                        <Label htmlFor="saveCard" className="text-sm">
                          Save card for future payments
                        </Label>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          placeholder="yourname@upi"
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div className="text-center p-6 border-2 border-dashed border-blue-200 rounded-lg">
                        <QrCode className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                        <p className="text-sm text-gray-600">
                          Scan QR code to pay with any UPI app
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="text-center p-8 border-2 border-dashed border-blue-200 rounded-lg">
                      <Smartphone className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                      <p className="text-gray-600 mb-4">
                        You will be redirected to PayPal to complete your payment securely
                      </p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Safe & Secure
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Billing Address */}
            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span>Billing Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingAddress">Address</Label>
                      <Input
                        id="billingAddress"
                        placeholder="123 Main Street"
                        value={formData.billingAddress}
                        onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="San Francisco"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          placeholder="12345"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your session details</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Mentor Info */}
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      {bookingData.mentor.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-blue-900">{bookingData.mentor.name}</h4>
                    <p className="text-sm text-blue-700">{bookingData.mentor.role}</p>
                    <p className="text-xs text-blue-600">{bookingData.mentor.company}</p>
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{bookingData.session.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{bookingData.session.time} ({bookingData.session.duration})</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{bookingData.session.type}</span>
                  </div>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Session fee</span>
                    <span className="font-medium">${bookingData.session.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Platform fee</span>
                    <span className="font-medium">${bookingData.session.platformFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${bookingData.session.price + bookingData.session.platformFee}
                    </span>
                  </div>
                </div>

                {/* Terms and Payment */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked })}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeTerms" className="text-xs leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>,{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>, and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Cancellation Policy</a>
                    </Label>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={!formData.agreeTerms || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Complete Payment</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Security Notice */}
                <div className="text-xs text-gray-500 text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <p>Your payment information is secure and encrypted</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}