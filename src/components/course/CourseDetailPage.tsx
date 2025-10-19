import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Course, NavigatePath } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  Star, 
  Clock, 
  Users, 
  PlayCircle, 
  ArrowLeft, 
  Heart,
  Calendar,
  Video,
  FileText,
  Download,
  Share2,
  BookOpen,
  Award,
  Globe,
  Monitor,
  Target,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Play
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { withErrorHandling, categorizeError } from '../../utils/errorHandling';
import { dbHelpers } from '../../lib/firebase';
import { trackCourseEnrollment } from '../../lib/analytics';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { usePayment } from '../../hooks/usePayment';
import { formatAmount } from '../../lib/razorpay';
import { logger } from '../../utils/logger';
import { getDoc, doc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CourseReviews } from './CourseReviews';

interface CourseDetailPageProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ onNavigate, onLogout }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { success, error: showError, errorWithRetry, warning } = useToast();

  // Payment hook for Razorpay integration
  const { processPayment, isProcessing: isPaymentProcessing } = usePayment({
    onSuccess: (paymentData, enrollmentId) => {
      setIsEnrolled(true);
      success('Payment Successful!', 'You have been enrolled in the course. Redirecting...');
      setTimeout(() => {
        onNavigate('/my-courses');
      }, 2000);
    },
    onError: (error) => {
      console.error('Payment error:', error);
    }
  });
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourseData(courseId);
    }
  }, [courseId]);

  const loadCourseData = async (id: string) => {
    try {
      // Get course from Firebase
      const courseDoc = await getDoc(doc(db, 'courses', id));
      
      if (courseDoc.exists()) {
        const courseData = courseDoc.data() as Course;
        const loadedCourse = { ...courseData, id: courseDoc.id };
        setCourse(loadedCourse);
        setIsEnrolled(user?.enrolledCourses?.includes(id) || false);
        setProgress(isEnrolled ? Math.random() * 100 : 0);
        
        // Track course view
        const { trackCourseView } = await import('../../lib/analytics');
        trackCourseView(loadedCourse.id, loadedCourse.title);
      } else {
        throw new Error('Course not found');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      setErrorState('Failed to load course details. Please try again later.');
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    if (!user) {
      onNavigate('/login');
      return;
    }
    
    // Show enrollment overview modal before actual enrollment
    setShowEnrollmentModal(true);
  };

  const handleEnroll = async () => {
    if (!user || !courseId) {
      console.error('❌ User or Course ID not found');
      return;
    }

    setEnrolling(true);
    setShowEnrollmentModal(false);
    try {
      console.log('🎯 Enrolling user in course:', { userId: user.id, courseId });
      
      // Enroll user in course using Firebase
      const { id: enrollmentId, error } = await dbHelpers.enrollInCourse(user.id, courseId);
      
      if (error) {
        logger.error('❌ Enrollment failed:', error);
        errorWithRetry(
          'Enrollment Failed',
          error,
          () => handleEnroll()
        );
        return;
      }

      console.log('✅ Successfully enrolled in course:', enrollmentId);
      setIsEnrolled(true);
      
      // Track course enrollment
      if (course) {
        trackCourseEnrollment(course.id, course.title, course.price);
      }
      
      // Show success message and redirect to My Courses
      success('Successfully Enrolled!', 'Redirecting to your courses...');
      setTimeout(() => {
        onNavigate('/my-courses');
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error enrolling:', err);
      errorWithRetry(
        'Unexpected Error',
        'An unexpected error occurred during enrollment.',
        () => handleEnroll()
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (course && course.lessons && course.lessons.length > 0) {
      onNavigate(`/lesson/${course.lessons[0].id}`);
    } else {
      // Fallback: if no lessons available, show a message or redirect to dashboard
      warning('Course Not Ready', 'Course content is being prepared. Please check back later.');
      onNavigate('/my-courses');
    }
  };

  const handlePreviewLesson = (lessonId: string) => {
    onNavigate(`/lesson/${lessonId}`);
  };

  const handlePaymentEnrollment = async () => {
    if (!user) {
      onNavigate('/login');
      return;
    }

    if (!course) {
      showError('Course Error', 'Course information not available');
      return;
    }

    try {
      await processPayment({
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.displayName || user.email || 'Student',
        autoEnroll: true
      });
    } catch (error) {
      console.error('Failed to initiate payment:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => onNavigate('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => onNavigate('/')}>
                Data Rhythm Academy
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => onNavigate('/courses')} className="text-gray-700 hover:text-blue-600">
                Browse Courses
              </button>
              {user && (
                <button onClick={() => onNavigate('/my-courses')} className="text-gray-700 hover:text-blue-600">
                  My Courses
                </button>
              )}
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Hello, {user.displayName || user.email}</span>
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onNavigate('/login')}>
                    Login
                  </Button>
                  <Button size="sm" onClick={() => onNavigate('/register')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Course Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge className="mb-2">{course.category}</Badge>
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-gray-300 mb-6">{course.shortDescription}</p>
              </div>

              <div className="flex items-center space-x-6 text-sm mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-gray-300 ml-1">({course.totalRatings.toLocaleString()} ratings)</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-1" />
                  <span>{course.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-1" />
                  <span>{course.duration}h total</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-1" />
                  <span>{course.language}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={course.instructorImage} />
                  <AvatarFallback>{course.instructorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Created by {course.instructorName}</p>
                  <p className="text-sm text-gray-300">Updated {course.updatedAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-0">
                  {course.previewVideoUrl ? (
                    <div className="relative">
                      <iframe
                        src={course.previewVideoUrl}
                        className="w-full h-48 rounded-t-lg"
                        title="Course Preview"
                        allowFullScreen
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-t-lg">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">
                        {course.currency}{course.price}
                      </div>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <div className="text-lg text-gray-500 line-through">
                          {course.currency}{course.originalPrice}
                        </div>
                      )}
                    </div>

                    {isEnrolled ? (
                      <div className="space-y-4">
                        {progress > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Your Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} />
                          </div>
                        )}
                        <Button className="w-full" onClick={handleStartLearning}>
                          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Button>
                      </div>
                    ) : course.price > 0 ? (
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatAmount(course.price)}
                          </div>
                          <div className="text-sm text-gray-500">
                            + {formatAmount(Math.round(course.price * 0.18))} GST
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            Total: {formatAmount(Math.round(course.price * 1.18))}
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={handlePaymentEnrollment}
                          disabled={enrolling || isPaymentProcessing}
                        >
                          {(enrolling || isPaymentProcessing) ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4" />
                              <span>Enroll Now - {formatAmount(course.price)}</span>
                            </div>
                          )}
                        </Button>
                        <div className="text-xs text-center text-gray-500">
                          Secure payment via Razorpay
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleEnrollClick}
                        disabled={enrolling}
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Certificate of completion
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {course.classSchedule ? course.classSchedule.totalClasses : course.lessons.length} live classes
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {course.classSchedule ? course.classSchedule.duration : 90} min per session
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Interactive live learning
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Description Section */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">About This Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">{course.description}</p>
              </div>
              
              {/* Quick Course Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {course.classSchedule ? course.classSchedule.totalClasses : course.lessons.length}
                  </div>
                  <div className="text-sm text-gray-600">Live Classes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {course.classSchedule ? course.classSchedule.duration : 90}min
                  </div>
                  <div className="text-sm text-gray-600">Per Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{course.level}</div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {course.completionCertificate ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600">Certificate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="space-y-6">
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schedule">Live Classes</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Learning Objectives */}
                <Card>
                  <CardHeader>
                    <CardTitle>What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.learningObjectives.map((objective, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Course Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {course.hasLiveSupport && (
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">Live Instructor Support</span>
                        </div>
                      )}
                      {course.discussionEnabled && (
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <Globe className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">Discussion Forums</span>
                        </div>
                      )}
                      {course.downloadableResources && (
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium">Downloadable Resources</span>
                        </div>
                      )}
                      {course.mobileAccess && (
                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Play className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium">Mobile Access</span>
                        </div>
                      )}
                      {course.completionCertificate && (
                        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <Award className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium">Certificate of Completion</span>
                        </div>
                      )}
                      {course.recordedClassesAvailable && (
                        <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                          <PlayCircle className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm font-medium">Recorded Classes Available</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Requirements/Prerequisites */}
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Who is this course for */}
                <Card>
                  <CardHeader>
                    <CardTitle>Who is this course for?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span>Beginners who want to start their journey in {course.category}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span>Students looking for hands-on, practical learning experience</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span>Professionals wanting to upgrade their skills in {course.category}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span>Anyone interested in interactive live learning with expert instructors</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Class Schedule</CardTitle>
                    <p className="text-gray-600">
                      {course.classSchedule ? course.classSchedule.classFrequency : 'Schedule to be announced'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {course.scheduledClasses && course.scheduledClasses.length > 0 ? (
                      <div className="space-y-4">
                        {course.scheduledClasses.map((scheduledClass, index) => (
                          <div 
                            key={scheduledClass.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium">{scheduledClass.title}</h4>
                                {scheduledClass.description && (
                                  <p className="text-sm text-gray-600">{scheduledClass.description}</p>
                                )}
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(scheduledClass.startTime).toLocaleDateString('en-IN', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(scheduledClass.startTime).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} - {new Date(scheduledClass.endTime).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {scheduledClass.enrolledStudents.length}/{scheduledClass.maxStudents || 50} enrolled
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={scheduledClass.status === 'scheduled' ? 'default' : 
                                       scheduledClass.status === 'live' ? 'destructive' : 'secondary'}
                              >
                                {scheduledClass.status}
                              </Badge>
                              {isEnrolled && scheduledClass.meetingUrl && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(scheduledClass.meetingUrl, '_blank')}
                                  disabled={scheduledClass.status !== 'live'}
                                >
                                  {scheduledClass.status === 'live' ? 'Join Class' : 'Scheduled'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Class schedule will be available after enrollment</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                {/* Course Curriculum Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Course Curriculum</CardTitle>
                    <p className="text-gray-600">
                      Interactive live classes with hands-on projects and comprehensive study materials
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Course Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {course.classSchedule ? course.classSchedule.totalClasses : course.lessons.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Classes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {course.classSchedule ? `${course.classSchedule.duration}min` : '90min'}
                        </div>
                        <div className="text-sm text-gray-600">Per Session</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {course.lessons.length}
                        </div>
                        <div className="text-sm text-gray-600">Resource Sets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">Live</div>
                        <div className="text-sm text-gray-600">Interactive</div>
                      </div>
                    </div>

                    {/* Learning Path */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-lg mb-3 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-blue-600" />
                        Learning Path
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-blue-600 font-bold">1</span>
                          </div>
                          <h5 className="font-medium">Foundation</h5>
                          <p className="text-sm text-gray-600">Build core concepts and fundamentals</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-green-600 font-bold">2</span>
                          </div>
                          <h5 className="font-medium">Practice</h5>
                          <p className="text-sm text-gray-600">Hands-on projects and exercises</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-purple-600 font-bold">3</span>
                          </div>
                          <h5 className="font-medium">Mastery</h5>
                          <p className="text-sm text-gray-600">Advanced topics and real-world applications</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Curriculum */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                        Course Modules & Materials
                      </h4>
                      {course.lessons.map((lesson, index) => (
                        <div 
                          key={lesson.id} 
                          className="flex items-center justify-between p-6 border-2 border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-gray-600 mb-2">
                                  {lesson.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Interactive Live Session
                                </span>
                                {lesson.resources && lesson.resources.length > 0 && (
                                  <span className="flex items-center">
                                    <FileText className="w-4 h-4 mr-1" />
                                    {lesson.resources.length} Study Material{lesson.resources.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <Award className="w-4 h-4 mr-1" />
                                  Hands-on Project
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {isEnrolled ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePreviewLesson(lesson.id)}
                                className="mb-2"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Access Materials
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="mb-2">Available after enrollment</Badge>
                            )}
                            <div className="text-xs text-gray-500">
                              Module {index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Additional Course Benefits */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        What's Included in Your Enrollment
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-indigo-800">
                          <CheckCircle className="w-4 h-4 text-indigo-600 mr-2" />
                          All live class recordings available for review
                        </div>
                        <div className="flex items-center text-indigo-800">
                          <CheckCircle className="w-4 h-4 text-indigo-600 mr-2" />
                          Downloadable study materials and code samples
                        </div>
                        <div className="flex items-center text-indigo-800">
                          <CheckCircle className="w-4 h-4 text-indigo-600 mr-2" />
                          Direct access to instructor during Q&A sessions
                        </div>
                        <div className="flex items-center text-indigo-800">
                          <CheckCircle className="w-4 h-4 text-indigo-600 mr-2" />
                          Personalized feedback on assignments and projects
                        </div>
                        <div className="flex items-center text-indigo-800">
                          <CheckCircle className="w-4 h-4 text-indigo-600 mr-2" />
                          Certificate of completion upon finishing course
                        </div>
                        <div className="flex items-center text-indigo-800">
                          <CheckCircle className="w-4 h-4 text-indigo-600 mr-2" />
                          Lifetime access to course materials and updates
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={course.instructorImage} />
                        <AvatarFallback>{course.instructorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{course.instructorName}</h3>
                        <p className="text-gray-600 mb-4">Data Science Expert & Educator</p>
                        <p className="text-gray-700">
                          Dr. Sarah Johnson is a renowned data scientist with over 10 years of experience 
                          in machine learning and artificial intelligence. She has worked at top tech companies 
                          and has published numerous research papers in the field of data science.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <CourseReviews 
                  courseId={course.id}
                  averageRating={course.rating}
                  totalReviews={course.totalRatings}
                  canReview={isEnrolled}
                  onReviewSubmit={async (review) => {
                    console.log('New review submitted:', review);
                    try {
                      // Save review to Firebase
                      const { addDoc, collection } = await import('firebase/firestore');
                      await addDoc(collection(db, 'reviews'), {
                        ...review,
                        courseId: course.id,
                        userId: user?.id,
                        userDisplayName: user?.displayName || user?.email,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      });
                      
                      success('Review Submitted', 'Thank you for your feedback!');
                    } catch (err) {
                      console.error('Error saving review:', err);
                      showError('Failed to Submit', 'Could not save your review. Please try again.');
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Course Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Downloadable resources</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Certificate of completion</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Enrollment Overview Modal */}
      <Dialog open={showEnrollmentModal} onOpenChange={setShowEnrollmentModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Course Overview - {course?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Course Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge className="mb-2">{course?.category}</Badge>
                  <h3 className="text-xl font-semibold">{course?.title}</h3>
                  <p className="text-gray-600 mt-2">{course?.shortDescription}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {course?.currency}{course?.price}
                  </div>
                  {course?.originalPrice && course.originalPrice > course.price && (
                    <div className="text-lg text-gray-500 line-through">
                      {course?.currency}{course.originalPrice}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">
                    {course?.classSchedule ? course.classSchedule.totalClasses : course?.lessons.length}
                  </div>
                  <div className="text-gray-600">Live Classes</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">
                    {course?.classSchedule ? `${course.classSchedule.duration}min` : '90min'}
                  </div>
                  <div className="text-gray-600">Per Session</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{course?.level}</div>
                  <div className="text-gray-600">Difficulty</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">
                    {course?.completionCertificate ? 'Yes' : 'No'}
                  </div>
                  <div className="text-gray-600">Certificate</div>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            {course?.learningObjectives && course.learningObjectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    What You'll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prerequisites */}
            {course?.prerequisites && course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                    Prerequisites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Syllabus Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Course Syllabus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course?.lessons && course.lessons.slice(0, 5).map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{lesson.title}</h4>
                        {lesson.description && (
                          <p className="text-xs text-gray-600 mt-1">{lesson.description}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lesson.duration}min
                      </div>
                    </div>
                  ))}
                  {course?.lessons && course.lessons.length > 5 && (
                    <div className="text-center py-2 text-sm text-gray-600">
                      ... and {course.lessons.length - 5} more lessons
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-600" />
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course?.hasLiveSupport && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Live instructor support</span>
                    </div>
                  )}
                  {course?.discussionEnabled && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Discussion forums</span>
                    </div>
                  )}
                  {course?.downloadableResources && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Downloadable resources</span>
                    </div>
                  )}
                  {course?.mobileAccess && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Mobile access</span>
                    </div>
                  )}
                  {course?.completionCertificate && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Certificate of completion</span>
                    </div>
                  )}
                  {course?.lifetimeAccess && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Lifetime access</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Actions */}
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-lg">Ready to start learning?</h4>
                <p className="text-gray-600 text-sm">
                  Join thousands of students and begin your journey today.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEnrollmentModal(false)}
                >
                  Maybe Later
                </Button>
                <Button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {enrolling ? 'Enrolling...' : `Enroll Now - ${course?.currency}${course?.price}`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};