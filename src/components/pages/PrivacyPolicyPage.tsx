import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Logo } from '../ui/logo';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, Mail } from 'lucide-react';
import { NavigatePath } from '../../types';

interface PrivacyPolicyPageProps {
  onNavigate: (path: NavigatePath) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Logo size="md" className="text-blue-600" />
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Data Rhythm Academy
              </span>
            </button>
            
            <Button variant="outline" onClick={() => onNavigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This privacy policy explains how Data Rhythm Academy 
            collects, uses, and protects your information.
          </p>
          
          <Badge className="mt-4 bg-green-100 text-green-700 border-green-200">
            Last updated: September 30, 2025
          </Badge>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Information We Collect */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                <p className="text-gray-600">
                  When you create an account, we may collect:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Name and email address</li>
                  <li>Profile picture (if provided via OAuth)</li>
                  <li>Authentication information from third-party providers (Google, GitHub)</li>
                  <li>Course enrollment and progress data</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Usage Information</h4>
                <p className="text-gray-600">
                  We automatically collect information about how you use our service:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  <li>Device information (browser, operating system)</li>
                  <li>IP address and location data</li>
                  <li>Pages visited and time spent</li>
                  <li>Interaction with course content</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Analytics Information</h4>
                <p className="text-gray-600">
                  We use Google Analytics to understand how users interact with our platform. 
                  This includes page views, session duration, and user behavior patterns.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Provide and maintain our educational services</li>
                <li>Personalize your learning experience</li>
                <li>Communicate with you about courses and updates</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Service Providers:</strong> We may share information with trusted third parties who assist us in operating our platform (Firebase, Google Analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Encryption of data in transit and at rest</li>
                <li>Firebase Authentication with industry-standard security</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure hosting with Firebase/Google Cloud Platform</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a structured format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Limit Processing:</strong> Restrict how we use your information</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle>Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Remember your login status and preferences</li>
                <li>Analyze site usage with Google Analytics</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-gray-600 mt-4">
                You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Our platform integrates with the following third-party services:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Firebase (Google)</h4>
                  <p className="text-sm text-gray-600">Authentication, database, and hosting services</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                  <p className="text-sm text-gray-600">Website analytics and user behavior tracking</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Google OAuth</h4>
                  <p className="text-sm text-gray-600">Third-party authentication</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">GitHub OAuth</h4>
                  <p className="text-sm text-gray-600">Third-party authentication</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe 
                your child has provided us with personal information, please contact us so we can delete 
                such information.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy or our practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@datarhythmacademy.com</p>
                <p><strong>Website:</strong> https://data-rhythm-academy.web.app</p>
                <p><strong>Response Time:</strong> We will respond to your inquiry within 30 days</p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
                advised to review this Privacy Policy periodically for any changes. Changes to this Privacy 
                Policy are effective when they are posted on this page.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-500 text-sm">
            © 2025 Data Rhythm Academy. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/')}>
              Home
            </Button>
            <Button variant="ghost" size="sm">
              Terms of Service
            </Button>
            <Button variant="ghost" size="sm">
              Contact
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}