import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  BookOpen, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Mail,
  Lock,
  Chrome,
  Github
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (userData: any) => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin({
        name: formData.email.split('@')[0],
        email: formData.email,
        id: '1'
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        name: `${provider} User`,
        email: `user@${provider}.com`,
        id: '1'
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => onNavigate('landing')}
            className="mb-6 text-gray-600 hover:text-blue-600 p-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              EduFlow
            </span>
          </div>

          <Card className="border-blue-100 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue learning
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="border-blue-200 hover:bg-blue-50"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      required
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  onClick={() => onNavigate('register')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up for free
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Protected by industry-standard encryption</p>
          </div>
        </motion.div>

        {/* Right Side - Image and Features */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl p-8">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1748665194498-21a7e3d8ff19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzU4NTE5OTM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern workspace"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>

            {/* Floating Stats Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-8 -left-6 bg-white rounded-xl shadow-lg p-4 border border-blue-100"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">50k+</div>
                <div className="text-sm text-gray-600">Active Students</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute bottom-8 -right-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg p-4 text-white"
            >
              <div className="text-center">
                <div className="text-2xl font-bold">4.9★</div>
                <div className="text-sm opacity-90">Average Rating</div>
              </div>
            </motion.div>
          </div>

          {/* Feature List */}
          <div className="mt-8 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              What awaits you:
            </h3>
            
            <div className="space-y-4">
              {[
                { icon: '🎯', text: 'Personalized learning paths tailored to your goals' },
                { icon: '👥', text: 'Connect with mentors and fellow learners' },
                { icon: '📊', text: 'Track your progress with detailed analytics' },
                { icon: '🏆', text: 'Earn certificates recognized by top companies' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-gray-600">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}