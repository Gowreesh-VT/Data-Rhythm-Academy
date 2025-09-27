import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Logo } from './ui/logo';
import { Page } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Eye,
  EyeOff,
  Chrome,
  Github,
  AlertCircle
} from 'lucide-react';

import { NavigatePath } from '../types';

interface RegisterPageProps {
  onNavigate: (path: NavigatePath) => void;
  onRegister: (userData: any) => void;
}

export function RegisterPage({ onNavigate, onRegister }: RegisterPageProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signInWithOAuth } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: '',
    experience: '',
    goals: [] as string[],
    agreeTerms: false
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const courses = [
    { value: 'fullstack', label: 'Full-Stack Web Development', duration: '12 weeks', price: '$299' },
    { value: 'datascience', label: 'Data Science & Analytics', duration: '16 weeks', price: '$399' },
    { value: 'uxui', label: 'UX/UI Design Mastery', duration: '10 weeks', price: '$249' },
    { value: 'marketing', label: 'Digital Marketing', duration: '8 weeks', price: '$199' },
    { value: 'mobile', label: 'Mobile App Development', duration: '14 weeks', price: '$349' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Complete Beginner', desc: 'New to this field' },
    { value: 'some', label: 'Some Experience', desc: '6 months - 2 years' },
    { value: 'intermediate', label: 'Intermediate', desc: '2-5 years experience' },
    { value: 'advanced', label: 'Advanced', desc: '5+ years experience' }
  ];

  const learningGoals = [
    'Career change',
    'Skill upgrade',
    'Personal project',
    'Freelancing',
    'Startup',
    'Certification'
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength (basic)
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await signUp(
        formData.email, 
        formData.password,
        {
          full_name: `${formData.firstName} ${formData.lastName}`,
          first_name: formData.firstName,
          last_name: formData.lastName,
          course: formData.course,
          experience: formData.experience,
          learning_goals: formData.goals,
        }
      );
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Successfully registered
        onRegister({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          course: formData.course,
          id: data.user.id
        });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'github') => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
      // Note: OAuth redirects will handle the success case
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && 
               formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword && formData.agreeTerms;
      case 2:
        return formData.course && formData.experience;
      case 3:
        return formData.goals.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => onNavigate('/')}
            className="mb-6 text-gray-600 hover:text-blue-600 p-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <Logo size="lg" className="text-blue-600" />
            <span className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Data Rhythm Academy
            </span>
          </div>

          <Card className="border-blue-100 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div>
                <CardTitle className="text-2xl font-bold">Join Data Rhythm Academy</CardTitle>
                <CardDescription>
                  Start your learning journey with us
                </CardDescription>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Step {step} of {totalSteps}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Social Signup */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => handleSocialSignup('google')}
                        disabled={isLoading}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <Chrome className="w-4 h-4 mr-2" />
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSocialSignup('github')}
                        disabled={isLoading}
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">
                          Or continue with email
                        </span>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10 border-blue-200 focus:border-blue-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="border-blue-200 focus:border-blue-400"
                      />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-red-500">Passwords don't match</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked: boolean) => setFormData({ ...formData, agreeTerms: checked })}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Course Selection */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Choose Your Course</h3>
                      <p className="text-sm text-gray-600">Select the course that aligns with your goals</p>
                    </div>

                    <div className="space-y-3">
                      {courses.map((course) => (
                        <div
                          key={course.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.course === course.value
                              ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-blue-200'
                          }`}
                          onClick={() => setFormData({ ...formData, course: course.value })}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{course.label}</h4>
                              <p className="text-sm text-gray-600 mt-1">{course.duration}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-blue-600">{course.price}</div>
                              {formData.course === course.value && (
                                <CheckCircle className="w-5 h-5 text-blue-500 mt-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select value={formData.experience} onValueChange={(value: string) => setFormData({ ...formData, experience: value })}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-400">
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-sm text-gray-500">{level.desc}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Learning Goals */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-2">What are your goals?</h3>
                      <p className="text-sm text-gray-600">Select all that apply to personalize your experience</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {learningGoals.map((goal) => (
                        <Badge
                          key={goal}
                          variant={formData.goals.includes(goal) ? 'default' : 'outline'}
                          className={`cursor-pointer p-3 justify-center text-center hover:scale-105 transition-transform ${
                            formData.goals.includes(goal)
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'border-blue-200 hover:border-blue-300'
                          }`}
                          onClick={() => toggleGoal(goal)}
                        >
                          {goal}
                        </Badge>
                      ))}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Almost there! 🎉</h4>
                      <p className="text-sm text-blue-700">
                        Based on your selections, we'll create a personalized learning path 
                        and connect you with the right mentors and resources.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button variant="outline" onClick={handlePrevious} className="border-blue-200">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                <div className="ml-auto">
                  {step < totalSteps ? (
                    <Button 
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit}
                      disabled={!isStepValid() || isLoading}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : null}
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  onClick={() => onNavigate('/login')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in here
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Side - Benefits */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl p-8">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1608986596619-eb50cc56831f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NTg0Mjc5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Online learning"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>

            {/* Success Stories Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-8 -left-6 bg-white rounded-xl shadow-lg p-4 border border-blue-100"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="text-sm text-gray-600">Job Placement Rate</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute bottom-8 -right-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-4 text-white"
            >
              <div className="text-center">
                <div className="text-2xl font-bold">$75k+</div>
                <div className="text-sm opacity-90">Average Salary Increase</div>
              </div>
            </motion.div>
          </div>

          {/* Benefits List */}
          <div className="mt-8 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Join thousands of successful graduates
            </h3>
            
            <div className="space-y-4">
              {[
                { 
                  icon: '🎯', 
                  title: 'Personalized Learning',
                  desc: 'AI-powered recommendations based on your goals and progress'
                },
                { 
                  icon: '👨‍🏫', 
                  title: 'Expert Mentorship',
                  desc: 'One-on-one guidance from industry professionals'
                },
                { 
                  icon: '🚀', 
                  title: 'Career Support',
                  desc: 'Job placement assistance and portfolio development'
                },
                { 
                  icon: '🤝', 
                  title: 'Vibrant Community',
                  desc: 'Connect with peers and build lasting professional networks'
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}