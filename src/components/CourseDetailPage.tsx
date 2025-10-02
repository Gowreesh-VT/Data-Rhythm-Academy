import React from 'react';
import { motion } from 'framer-motion';
import { type Course } from '../data/coursesData';
import { type NavigatePath } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Star, ArrowLeft, Clock, Users, BookOpen, CheckCircle, User } from 'lucide-react';

interface CourseDetailPageProps {
  course: Course;
  onNavigate: (path: NavigatePath, data?: any) => void;
}

export function CourseDetailPage({ course, onNavigate }: CourseDetailPageProps) {
  const { user } = useAuth();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleEnrollClick = () => {
    if (!user) {
      alert('Please login to enroll in this course');
      onNavigate('/login');
      return;
    }
    
    // Navigate to payment with course data
    onNavigate('/payment', course);
  };

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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DRA</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Data Rhythm Academy
              </span>
            </button>
            
            <Button variant="outline" onClick={() => onNavigate('/courses')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <Badge
                    variant={course.available ? "default" : "secondary"}
                    className={course.available ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}
                  >
                    {course.available ? 'Available Now' : 'Coming Soon'}
                  </Badge>
                  <Badge variant="outline" className="bg-white/20 text-white border-white">
                    {course.level}
                  </Badge>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-blue-100 mb-6">{course.description}</p>
                
                {course.available && (
                  <div className="flex items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      {renderStars(course.rating)}
                      <span className="text-lg">({course.rating})</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-5 h-5" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Meta Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-700 mb-2">Duration</h4>
                <p className="text-2xl font-bold text-blue-600">{course.duration}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-700 mb-2">Level</h4>
                <p className="text-2xl font-bold text-green-600">{course.level}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-8 h-8 text-purple-600 mx-auto mb-2 text-2xl">₹</div>
                <h4 className="font-semibold text-gray-700 mb-2">Price</h4>
                <p className="text-2xl font-bold text-purple-600">₹{course.price.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-700 mb-2">Students</h4>
                <p className="text-2xl font-bold text-orange-600">{course.students.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    What You'll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.modules.map((module, index) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-800 font-medium">{module}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Prerequisites */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-gray-800 font-medium">{course.prerequisites}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Instructor Information */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Your Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{course.instructor}</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{course.instructorBio}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enrollment Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="border-2 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Ready to Start Learning?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Join thousands of students who have already transformed their careers
                    </p>
                    
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-purple-600">
                        ₹{course.price.toLocaleString()}
                      </div>
                      <p className="text-gray-500 text-sm">One-time payment</p>
                    </div>
                    
                    {course.available ? (
                      <Button
                        onClick={handleEnrollClick}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-3"
                        size="lg"
                      >
                        Enroll Now
                      </Button>
                    ) : (
                      <div>
                        <p className="text-orange-600 font-semibold mb-4">This course is coming soon!</p>
                        <Button
                          onClick={() => alert('We will notify you when this course becomes available!')}
                          variant="outline"
                          className="w-full text-lg py-3"
                          size="lg"
                        >
                          Get Notified
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}