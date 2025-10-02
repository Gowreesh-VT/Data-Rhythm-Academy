import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { type NavigatePath } from '../types';
import { type Course, coursesData } from '../data/coursesData';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Trophy, 
  Calendar, 
  Download,
  Play,
  CheckCircle,
  ArrowLeft,
  LogOut,
  User,
  Settings,
  Bell,
  BarChart3
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (path: NavigatePath) => void;
  user: any;
  onLogout: () => void;
}

interface EnrolledCourse extends Course {
  enrollmentDate: string;
  progress: number;
  completed: boolean;
  lastAccessed: string;
  nextLesson: string;
  certificateUrl?: string;
}

// Mock enrolled courses data - in real app, this would come from Firestore
const mockEnrolledCourses: EnrolledCourse[] = [
  {
    ...coursesData.find(c => c.id === 1)!,
    enrollmentDate: '2024-09-15',
    progress: 75,
    completed: false,
    lastAccessed: '2024-10-01',
    nextLesson: 'Functions and Scope',
    certificateUrl: undefined
  }
];

const mockAchievements = [
  {
    id: 1,
    title: 'First Course Enrolled',
    description: 'Enrolled in your first course',
    icon: '🎯',
    date: '2024-09-15',
    unlocked: true
  },
  {
    id: 2,
    title: 'Fast Learner',
    description: 'Completed 5 lessons in a week',
    icon: '⚡',
    date: '2024-09-22',
    unlocked: true
  },
  {
    id: 3,
    title: 'Course Completion',
    description: 'Complete your first course',
    icon: '🏆',
    date: null,
    unlocked: false
  }
];

export function StudentDashboard({ onNavigate, user, onLogout }: StudentDashboardProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>(mockEnrolledCourses);
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(enrolledCourses[0] || null);

  const completedCourses = enrolledCourses.filter(course => course.completed);
  const activeCourses = enrolledCourses.filter(course => !course.completed);
  const totalProgress = enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length || 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
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
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
              <Button variant="ghost" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">Continue your learning journey and achieve your goals.</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-blue-600">{enrolledCourses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedCourses.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(totalProgress)}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-orange-600">{mockAchievements.filter(a => a.unlocked).length}</p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="courses" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
              </TabsList>

              {/* My Courses Tab */}
              <TabsContent value="courses" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Active Courses</h2>
                    <Button onClick={() => onNavigate('/courses')} variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse More Courses
                    </Button>
                  </div>

                  {activeCourses.length > 0 ? (
                    <div className="space-y-4">
                      {activeCourses.map((course) => (
                        <Card key={course.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {course.level}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-3">{course.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{course.instructor}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                  </div>
                                  <Progress value={course.progress} className="h-2" />
                                  <p className="text-sm text-blue-600">Next: {course.nextLesson}</p>
                                </div>
                              </div>
                              <Button className="ml-4">
                                <Play className="w-4 h-4 mr-2" />
                                Continue
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Courses</h3>
                        <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course.</p>
                        <Button onClick={() => onNavigate('/courses')}>
                          Browse Courses
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Progress</h2>
                  
                  {enrolledCourses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription>Enrolled on {new Date(course.enrollmentDate).toLocaleDateString()}</CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(course.rating)}
                            <span className="text-sm text-gray-600 ml-2">({course.rating})</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Overall Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-3" />
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {course.modules.map((module, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className={`w-4 h-4 ${
                                  index < Math.floor(course.modules.length * (course.progress / 100))
                                    ? 'text-green-600' 
                                    : 'text-gray-300'
                                }`} />
                                <span className="text-sm">{module}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Certificates</h2>
                  
                  {completedCourses.length > 0 ? (
                    <div className="space-y-4">
                      {completedCourses.map((course) => (
                        <Card key={course.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                  <Trophy className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold">{course.title}</h3>
                                  <p className="text-gray-600">Completed on {new Date(course.enrollmentDate).toLocaleDateString()}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {renderStars(course.rating)}
                                    <span className="text-sm text-gray-600 ml-2">({course.rating})</span>
                                  </div>
                                </div>
                              </div>
                              <Button>
                                <Download className="w-4 h-4 mr-2" />
                                Download Certificate
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
                        <p className="text-gray-600">Complete courses to earn certificates.</p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => onNavigate('/courses')} className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
                  <Button onClick={() => onNavigate('/booking')} variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAchievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        achievement.unlocked ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${achievement.unlocked ? 'text-green-900' : 'text-gray-500'}`}>
                          {achievement.title}
                        </p>
                        <p className={`text-sm ${achievement.unlocked ? 'text-green-700' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                        {achievement.date && (
                          <p className="text-xs text-gray-500">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}