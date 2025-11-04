import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, BookOpen, Target, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface PrerequisitesSyllabusProps {
  courseTitle: string;
  objectives: string[];
  syllabus: Array<{
    module: string;
    topics: string[];
  }>;
  outcomes: string[];
  paymentQRUrl: string;
  contactNumber: string;
  onBack: () => void;
}

const PrerequisitesSyllabus: React.FC<PrerequisitesSyllabusProps> = ({
  courseTitle,
  objectives,
  syllabus,
  outcomes,
  paymentQRUrl,
  contactNumber,
  onBack,
}) => {
  const [showPayment, setShowPayment] = useState(false);

  const handleEnrollClick = () => {
    setShowPayment(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{courseTitle}</h1>
          <p className="text-gray-600 mt-1">Enrollment Details</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Objectives */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Target className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-semibold">Course Objectives</h2>
                </div>
                <div className="space-y-3">
                  {objectives.map((objective, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="font-semibold text-blue-600 mr-3 mt-0.5">{idx + 1}.</span>
                      <span className="text-gray-700">{objective}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Outcomes */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-2xl font-semibold">Course Outcomes</h2>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 font-medium">At the end of the course, students should be able to:</p>
                </div>
                <div className="space-y-3">
                  {outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="font-semibold text-green-600 mr-3 mt-0.5">{idx + 1}.</span>
                      <span className="text-gray-700">{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Syllabus */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-semibold">Course Syllabus</h2>
                </div>
                <div className="space-y-4">
                  {syllabus.map((module, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start mb-3">
                        <span className="font-semibold text-blue-600 mr-3">{idx + 1}.</span>
                        <h3 className="font-semibold text-gray-900 flex-1">{module.module}</h3>
                      </div>
                      <ul className="ml-6 space-y-2">
                        {module.topics.map((topic, topicIdx) => (
                          <li key={topicIdx} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span className="text-gray-700 text-sm">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {!showPayment ? (
                  <>
                    <h3 className="text-xl font-semibold mb-4">Ready to Start?</h3>
                    <p className="text-gray-600 mb-6">
                      Enroll now and start your learning journey today!
                    </p>
                    <Button
                      onClick={handleEnrollClick}
                      className="w-full"
                    >
                      Enroll Now
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">Complete Payment</h3>
                    
                    {/* QR Code */}
                    <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-blue-200">
                      <img 
                        src={paymentQRUrl} 
                        alt="Payment QR Code" 
                        className="w-full max-w-[250px] h-auto"
                      />
                    </div>
                    
                    {/* Payment Instructions */}
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                      <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions</h4>
                      <ol className="text-sm text-blue-800 space-y-2">
                        <li>1. Scan the QR code to make payment</li>
                        <li>2. Take a screenshot of the payment confirmation</li>
                        <li>3. Send screenshot to: <strong>{contactNumber}</strong></li>
                      </ol>
                    </div>
                    
                    {/* Activation Notice */}
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-green-800 text-sm text-center">
                        <strong>Your course will be activated within 12 hours</strong> after payment verification and check your dashboard for access.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrerequisitesSyllabus;
