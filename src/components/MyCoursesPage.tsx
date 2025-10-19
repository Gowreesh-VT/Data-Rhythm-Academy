import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dbHelpers } from '../lib/firebase';
import { DashboardSkeleton } from './common/LoadingStates';
import { ErrorState } from './common/ErrorStates';
import { NavigatePath } from '../types';
import {
  CalendarDays,
  Clock,
  Users,
  PlayCircle,
  BookOpen,
  Award,
  Video,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';

interface MyCoursesPageProps {
  onNavigate: (path: NavigatePath) => void;
}

export function MyCoursesPage({ onNavigate }: MyCoursesPageProps) {
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listeners, setListeners] = useState<(() => void)[]>([]);
  const { user } = useAuth();
  const { success, error: showError, warning } = useToast();

  useEffect(() => {
    if (user) {
      loadMyCourses();
    }
    
    // Cleanup listeners on unmount
    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  }, [user]);

  const setupRealTimeListeners = (courses: any[]) => {
    // Clean up existing listeners
    listeners.forEach(unsubscribe => unsubscribe());
    
    const newListeners: (() => void)[] = [];
    
    courses.forEach((courseData, index) => {
      const unsubscribe = dbHelpers.listenToScheduledClasses(courseData.course.id, (updatedClasses) => {
        setMyCourses(prevCourses => {
          const newCourses = [...prevCourses];
          if (newCourses[index]) {
            newCourses[index] = {
              ...newCourses[index],
              upcomingClasses: updatedClasses.slice(0, 5),
              nextClass: updatedClasses[0] || null
            };
          }
          return newCourses;
        });
      });
      newListeners.push(unsubscribe);
    });
    
    setListeners(newListeners);
  };

  useEffect(() => {
    if (user) {
      loadMyCourses();
    }
  }, [user]);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }
      
      const { data, error } = await dbHelpers.getMyCourses(user.id);
      
      if (error) {
        setError(error);
      } else {
        setMyCourses(data);
        // Set up real-time listeners for schedule updates
        setupRealTimeListeners(data);
      }
    } catch (err: any) {
      setError('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: any) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const joinClass = (classData: any) => {
    if (classData.meetingUrl) {
      window.open(classData.meetingUrl, '_blank');
    } else {
      alert('Meeting link will be available 15 minutes before class starts');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
        <div className="max-w-7xl mx-auto">
          <ErrorState 
            error={error} 
            onRetry={loadMyCourses}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Continue your learning journey with scheduled online classes
          </p>
        </motion.div>

        {myCourses.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Courses Enrolled Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start learning today by enrolling in our online courses with live classes
            </p>
            <Button onClick={() => onNavigate('/courses')} size="lg">
              Browse Courses
            </Button>
          </motion.div>
        ) : (
          // Courses Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {myCourses.map((myCourse, index) => (
              <motion.div
                key={myCourse.course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                          {myCourse.course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {myCourse.course.shortDescription}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {myCourse.course.category}
                      </Badge>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={myCourse.course.instructorImage} />
                        <AvatarFallback>
                          {myCourse.course.instructorName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {myCourse.course.instructorName}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-medium">
                          {Math.round(myCourse.progressSummary.overallProgress)}%
                        </span>
                      </div>
                      <Progress value={myCourse.progressSummary.overallProgress} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>
                            {myCourse.progressSummary.lessonsCompleted}/
                            {myCourse.progressSummary.totalLessons} Lessons
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          <span>
                            {myCourse.progressSummary.classesAttended}/
                            {myCourse.progressSummary.totalClasses} Classes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Next Class */}
                    {myCourse.nextClass && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Next Class</span>
                          </div>
                          <Badge className={getStatusColor(myCourse.nextClass.status)}>
                            {myCourse.nextClass.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="font-medium text-gray-900">
                            {myCourse.nextClass.title}
                          </div>
                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              <span>{formatDateTime(myCourse.nextClass.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatDuration(
                                  (new Date(myCourse.nextClass.endTime).getTime() - 
                                   new Date(myCourse.nextClass.startTime).getTime()) / 60000
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => joinClass(myCourse.nextClass)}
                          disabled={myCourse.nextClass.status !== 'live'}
                        >
                          {myCourse.nextClass.status === 'live' ? (
                            <>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Join Class
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Scheduled
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onNavigate(`/course/${myCourse.course.id}` as NavigatePath)}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                      
                      {myCourse.upcomingClasses.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Show schedule information in a toast
                            const scheduleInfo = myCourse.upcomingClasses
                              .slice(0, 3)
                              .map((cls: any) => `${cls.title} - ${formatDateTime(cls.date)}`)
                              .join('\n');
                            
                            success(
                              'Upcoming Classes', 
                              `Next classes for ${myCourse.course.title}:\n${scheduleInfo}${myCourse.upcomingClasses.length > 3 ? '\n...and more' : ''}`
                            );
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Last Activity */}
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Last activity: {formatDateTime(myCourse.lastActivity)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {myCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {myCourses.length}
                </div>
                <div className="text-sm text-gray-600">Active Courses</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    myCourses.reduce((acc, course) => 
                      acc + course.progressSummary.overallProgress, 0
                    ) / myCourses.length
                  )}%
                </div>
                <div className="text-sm text-gray-600">Average Progress</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {myCourses.reduce((acc, course) => 
                    acc + course.progressSummary.classesAttended, 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Classes Attended</div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}