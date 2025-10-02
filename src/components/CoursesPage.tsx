import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { coursesData, type Course } from '../data/coursesData';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Star, Clock, Users, BookOpen, ArrowLeft } from 'lucide-react';
import { type NavigatePath } from '../types';

interface CoursesPageProps {
  onNavigate: (path: NavigatePath, data?: any) => void;
}

export function CoursesPage({ onNavigate }: CoursesPageProps) {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  const filteredCourses = coursesData.filter(course => {
    const levelMatch = filterLevel === 'all' || course.level.toLowerCase() === filterLevel;
    const availabilityMatch = filterAvailability === 'all' || 
      (filterAvailability === 'available' && course.available) ||
      (filterAvailability === 'coming-soon' && !course.available);
    
    return levelMatch && availabilityMatch;
  });

  const handleCourseAction = (course: Course) => {
    if (course.available) {
      onNavigate('/course-detail', course);
    } else {
      // Show coming soon message
      alert(`${course.title} is coming soon! Please contact us for more information.`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
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
            
            <Button variant="outline" onClick={() => onNavigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Our Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive data science and programming courses designed to accelerate your career
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label htmlFor="level-filter" className="font-medium text-gray-700">
                Level:
              </label>
              <select
                id="level-filter"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="availability-filter" className="font-medium text-gray-700">
                Availability:
              </label>
              <select
                id="availability-filter"
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Courses</option>
                <option value="available">Available Now</option>
                <option value="coming-soon">Coming Soon</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <Card className={`h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                course.available ? 'border-l-4 border-green-500' : 'border-l-4 border-orange-500'
              }`}>
                <CardHeader>
                  {/* Course Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      variant={course.available ? "default" : "secondary"}
                      className={course.available ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                    >
                      {course.available ? 'Available Now' : 'Coming Soon'}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {course.level}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">
                    {course.title}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Course Meta Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Duration</span>
                      </div>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Instructor</span>
                      </div>
                      <span className="font-medium">{course.instructor}</span>
                    </div>
                    {course.available && (
                      <>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Rating</span>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center">
                              {renderStars(course.rating)}
                            </div>
                            <span className="font-medium">({course.rating})</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Students</span>
                          </div>
                          <span className="font-medium">{course.students.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                    <p className="text-sm text-gray-700">{course.prerequisites}</p>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{course.price.toLocaleString()}
                    </div>
                    <Button
                      onClick={() => handleCourseAction(course)}
                      variant={course.available ? "default" : "secondary"}
                      className={course.available 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    >
                      {course.available ? 'View Details' : 'Get Notified'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No courses found */}
        {filteredCourses.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xl text-gray-600 mb-4">No courses found matching your criteria.</p>
            <Button
              onClick={() => {
                setFilterLevel('all');
                setFilterAvailability('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}