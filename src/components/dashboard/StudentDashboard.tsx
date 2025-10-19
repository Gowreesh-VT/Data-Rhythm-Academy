import React, { useState, useEffect } from 'react';
import { Course, Enrollment, Certificate } from '../../types';
import { CourseCard } from '../course/CourseCard';
import { QuickActionDashboard } from './QuickActionDashboard';
import { NotificationCenter } from '../common/NotificationCenter';
import { ClassTimetable } from '../class-management/ClassTimetable';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { DashboardSkeleton } from '../common/LoadingStates';
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp,
  PlayCircle,
  Download,
  Calendar,
  Target,
  Heart,
  Flame,
  Trophy,
  Zap,
  BarChart3,
  User,
  CreditCard,
  MessageCircle,
  Settings,
  LogOut,
  GraduationCap,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserEnrolledCourses, getUserEnrollments } from '../../lib/database';
import { withErrorHandling, categorizeError } from '../../utils/errorHandling';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const { success, error, warning, errorWithRetry } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [learningStreak, setLearningStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(10); // 10 hours per week
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      // Auto-refresh every 5 minutes
      const refreshInterval = setInterval(() => {
        refreshDashboardData();
      }, 5 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  const refreshDashboardData = async () => {
    if (!user?.id || loading) return;
    
    setRefreshing(true);
    try {
      await loadDashboardData(false);
      setLastRefresh(new Date());
      success('Dashboard updated', 'Your data has been refreshed.');
    } catch (err) {
      errorWithRetry(
        'Refresh Failed',
        'Unable to refresh dashboard data.',
        () => refreshDashboardData()
      );
    } finally {
      setRefreshing(false);
    }
  };

  const loadDashboardData = async (showLoading = true) => {
    if (!user?.id) return;
    
    if (showLoading) setLoading(true);
    
    return withErrorHandling(async () => {
      // Fetch user's enrolled courses
      const enrolledCoursesResult = await getUserEnrolledCourses(user.id);
      if (enrolledCoursesResult.error) {
        throw enrolledCoursesResult.error;
      } else {
        setEnrolledCourses(enrolledCoursesResult.data || []);
        
        console.log('=== ENROLLED COURSES LOADED ===');
        console.log('User ID:', user.id);
        console.log('Enrolled courses result:', enrolledCoursesResult.data);
        console.log('Number of enrolled courses:', (enrolledCoursesResult.data || []).length);
        if (enrolledCoursesResult.data && enrolledCoursesResult.data.length > 0) {
          enrolledCoursesResult.data.forEach((course, index) => {
            console.log(`Course ${index + 1}:`, { id: course.id, title: course.title });
          });
        }
        console.log('=== END ENROLLED COURSES ===');
      }

      // Fetch user's enrollments for certificates and progress
      const enrollmentsResult = await getUserEnrollments(user.id);
      if (enrollmentsResult.error) {
        throw enrollmentsResult.error;
      } else {
        const enrollments = enrollmentsResult.data || [];
        
        // Real certificates for completed courses
        const realCertificates: Certificate[] = enrollments
          .filter(enrollment => enrollment.completedAt)
          .map(enrollment => ({
            id: `cert-${enrollment.id}`,
            userId: user.id,
            courseId: enrollment.courseId,
            courseName: enrolledCoursesResult.data?.find(c => c.id === enrollment.courseId)?.title || 'Unknown Course',
            instructorName: enrolledCoursesResult.data?.find(c => c.id === enrollment.courseId)?.instructorName || 'Unknown Instructor',
            completionDate: enrollment.completedAt!,
            certificateUrl: `#certificate-${enrollment.id}`,
            grade: 'A'
          }));
        
        setCertificates([]);
        setEnrollments(enrollments);
        
        // Generate real data based on actual enrolled courses if any exist
        const courses = enrolledCoursesResult.data || [];
        if (courses.length > 0) {
          generateRealDataFromCourses(courses, []);
        }
      }
      
      if (showLoading) setLoading(false);
    }, { operation: 'loadDashboardData', userId: user.id }, 3)
    .catch(error => {
      const appError = categorizeError(error);
      if (showLoading) setLoading(false);
      errorWithRetry(
        'Failed to load dashboard',
        appError.userMessage,
        () => loadDashboardData()
      );
    });
  };

  const generateRealDataFromCourses = (courses: Course[], passedCertificates: Certificate[] = []) => {
    // Set empty or minimal data since we removed mock data
    setRecentActivity([]);
    
    // Calculate stats based on actual data
    const certificateCount = passedCertificates.length;
    const totalHours = courses.reduce((acc: number, course: Course) => acc + course.duration, 0);
    
    setStats({
      totalCourses: courses.length,
      completedCourses: certificateCount,
      totalHours,
      certificates: certificateCount
    });
    
    // Set empty data for other fields
    setLearningStreak(0);
    setWeeklyProgress(0);
    setAchievements([]);
    setUpcomingClasses([]);
    setNotifications([]);
  };

  const handleContinueLearning = (courseId: string) => {
    if (!courseId) {
      error('Invalid Course', 'Course ID is missing.');
      return;
    }
    
    console.log('=== CONTINUE LEARNING DEBUG ===');
    console.log('Continue Learning clicked for course ID:', courseId);
    console.log('Course ID type:', typeof courseId);
    console.log('Available enrolled courses:', enrolledCourses.map(c => ({ id: c.id, title: c.title })));
    console.log('First enrolled course ID:', enrolledCourses[0]?.id);
    console.log('First enrolled course title:', enrolledCourses[0]?.title);
    console.log('Navigating to:', `/course/${courseId}`);
    console.log('=== END DEBUG ===');
    
    try {
      onNavigate(`/course/${courseId}`);
      success('Redirecting to course', `Loading course: ${courseId}...`);
    } catch (err) {
      error('Navigation Error', 'Unable to navigate to course. Please try again.');
    }
  };

  const handleEnquire = (courseId: string) => {
    if (!courseId) {
      error('Invalid Course', 'Course ID is missing.');
      return;
    }
    
    try {
      // Navigate to contact page with course information
      onNavigate(`/contact?course=${courseId}`);
      success('Redirecting to enquiry', 'Please fill out the enquiry form...');
    } catch (err) {
      error('Navigation Error', 'Unable to navigate to enquiry form. Please try again.');
    }
  };

  const handleDownloadCertificate = (certificateId: string) => {
    if (!certificateId) {
      error('Invalid Certificate', 'Certificate ID is missing.');
      return;
    }
    
    try {
      // For now, show a coming soon message since certificate download isn't implemented
      warning('Coming Soon', 'Certificate download feature is coming soon! You can view your certificates in your profile.');
      console.log('Certificate download requested:', certificateId);
    } catch (err) {
      error('Download Failed', 'Unable to download certificate.');
    }
  };

  const handleJoinLiveClass = (classId: string) => {
    if (!classId) {
      error('Invalid Class', 'Class ID is missing.');
      return;
    }
    
    try {
      // For now, show a coming soon message since live classes aren't implemented
      warning('Coming Soon', 'Live class feature is coming soon! We\'ll notify you when it\'s available.');
      console.log('Live class join requested:', classId);
    } catch (err) {
      error('Connection Failed', 'Unable to join live class.');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => onNavigate('/')}>
                <GraduationCap className="w-8 h-8 inline-block mr-2" />
                Data Rhythm Academy
              </h1>
            </div>

            {/* Main Navigation */}
            <nav className="hidden lg:flex space-x-1" role="navigation" aria-label="Main navigation">
              <button 
                onClick={() => onNavigate('/courses')} 
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Browse available courses"
              >
                <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                Browse Courses
              </button>
              <button 
                onClick={() => onNavigate('/my-courses')} 
                className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 font-medium rounded-lg"
                aria-label="View my enrolled courses"
                aria-current="page"
              >
                <PlayCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                My Courses
              </button>
              <button 
                onClick={() => onNavigate('/wishlist')} 
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="View my course wishlist"
              >
                <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                Wishlist
              </button>
              <button 
                onClick={() => {
                  warning('Coming Soon', 'Transaction history feature is coming soon!');
                }} 
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="View transaction history"
              >
                <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" />
                Transactions
              </button>
              <button 
                onClick={() => onNavigate('/profile')} 
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="View my certificates and achievements"
              >
                <Award className="w-4 h-4 mr-2" aria-hidden="true" />
                Certificates
              </button>
              <button 
                onClick={() => onNavigate('/contact')} 
                className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Contact support"
              >
                <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                Contact Us
              </button>
            </nav>

            {/* Right Side - User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button 
                onClick={() => {
                  warning('Notifications', `You have ${notifications.filter(n => !n.read).length} unread notifications. Full notification center coming soon!`);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => onNavigate('/profile')}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.displayName || 'Student'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </button>
              </div>

              {/* Settings & Logout */}
              <button 
                onClick={() => {
                  warning('Coming Soon', 'Settings page is coming soon!');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Settings (Coming Soon)"
              >
                <Settings className="w-5 h-5" />
              </button>
              <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden border-t pt-4 pb-4">
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => onNavigate('/courses')}
                className="flex flex-col items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <BookOpen className="w-5 h-5 mb-1" />
                <span className="text-xs">Browse</span>
              </button>
              <button 
                onClick={() => onNavigate('/my-courses')}
                className="flex flex-col items-center p-3 text-blue-600 bg-blue-50 rounded-lg"
              >
                <PlayCircle className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">My Courses</span>
              </button>
              <button 
                onClick={() => onNavigate('/wishlist')}
                className="flex flex-col items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5 mb-1" />
                <span className="text-xs">Wishlist</span>
              </button>
              <button 
                onClick={() => {
                  warning('Coming Soon', 'Transaction history feature is coming soon!');
                }}
                className="flex flex-col items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-xs">Payments</span>
              </button>
              <button 
                onClick={() => onNavigate('/profile')}
                className="flex flex-col items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Award className="w-5 h-5 mb-1" />
                <span className="text-xs">Certificates</span>
              </button>
              <button 
                onClick={() => onNavigate('/contact')}
                className="flex flex-col items-center p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5 mb-1" />
                <span className="text-xs">Contact</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.displayName || 'Student'}! 👋</h2>
            <p className="text-gray-600 mt-2">Continue your learning journey and track your progress.</p>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDashboardData}
            disabled={refreshing}
            className="flex items-center"
          >
            <TrendingUp className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Learning Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalHours)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Flame className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{learningStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(weeklyProgress)}/{weeklyGoal}h</p>
                  <div className="mt-2">
                    <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions Dashboard */}
        <div className="mb-8">
          <QuickActionDashboard 
            onNavigate={onNavigate}
            userProgress={{
              lastLesson: enrolledCourses.length > 0 ? {
                courseId: enrolledCourses[0].id,
                lessonId: 'lesson-1',
                title: enrolledCourses[0].title
              } : undefined,
              upcomingClass: upcomingClasses.length > 0 ? {
                id: upcomingClasses[0].id,
                title: upcomingClasses[0].courseTitle,
                startTime: upcomingClasses[0].date
              } : undefined,
              currentStreak: learningStreak,
              weeklyGoal: weeklyGoal,
              weeklyProgress: weeklyProgress,
              pendingAssignments: 2,
              unreadNotifications: notifications.filter(n => !n.read).length
            }}
          />
        </div>

        {/* Quick Actions and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => {
                    if (enrolledCourses.length > 0) {
                      handleContinueLearning(enrolledCourses[0].id);
                    } else {
                      warning('No Courses', 'Enroll in a course first to start learning.');
                      onNavigate('/courses');
                    }
                  }}
                  disabled={enrolledCourses.length === 0}
                >
                  <PlayCircle className="h-6 w-6 mb-2" />
                  Continue Learning
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => onNavigate('/courses')}
                >
                  <BookOpen className="h-6 w-6 mb-2" />
                  Browse Courses
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => {
                    if (upcomingClasses.length > 0) {
                      handleJoinLiveClass(upcomingClasses[0].id);
                    } else {
                      warning('No Live Classes', 'No upcoming live classes scheduled.');
                    }
                  }}
                  disabled={upcomingClasses.length === 0}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  Join Live Class
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => onNavigate('/profile')}
                >
                  <Download className="h-6 w-6 mb-2" />
                  My Certificates
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.filter(a => a.unlocked).slice(0, 3).map(achievement => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                    {achievement.icon === 'trophy' && <Trophy className="h-5 w-5 text-yellow-600" />}
                    {achievement.icon === 'flame' && <Flame className="h-5 w-5 text-orange-500" />}
                    {achievement.icon === 'zap' && <Zap className="h-5 w-5 text-blue-500" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{achievement.title}</p>
                      <p className="text-xs text-gray-600 truncate">{achievement.description}</p>
                    </div>
                  </div>
                ))}
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <p className="text-sm text-gray-600 text-center py-4">Complete courses to unlock achievements!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">My Enrolled Courses</h3>
              <Button onClick={() => onNavigate('/courses')}>Browse More Courses</Button>
            </div>
            
            {enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                  <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course.</p>
                  <Button onClick={() => onNavigate('/courses')}>Browse Courses</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={true}
                    showProgress={true}
                    progress={50} // Default progress
                    onPreview={handleContinueLearning}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <ClassTimetable 
              onNavigate={onNavigate}
              userId={user?.id || ''}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h3 className="text-xl font-semibold">Learning Progress & Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Weekly Learning Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress this week</span>
                      <span className="font-medium">{Math.round(weeklyProgress)} / {weeklyGoal} hours</span>
                    </div>
                    <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-3" />
                    <p className="text-sm text-gray-600">
                      {weeklyProgress >= weeklyGoal 
                        ? "🎉 Congratulations! You've reached your weekly goal!" 
                        : `${Math.round(weeklyGoal - weeklyProgress)} hours remaining to reach your goal`
                      }
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Adjust Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Streak */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flame className="h-5 w-5 mr-2 text-orange-500" />
                    Learning Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">{learningStreak}</div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Days in a row!</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Keep learning daily to maintain your streak
                    </p>
                    <div className="flex justify-center space-x-1">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-4 h-4 rounded-full ${
                            i < (learningStreak % 7) ? 'bg-orange-500' : 'bg-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Learning Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        {activity.type === 'lesson_completed' ? (
                          <PlayCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {activity.type === 'lesson_completed' 
                              ? `Completed lesson: ${activity.lessonTitle}`
                              : `Enrolled in: ${activity.courseTitle}`
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.courseTitle} • {activity.timestamp.toLocaleDateString()}
                          </p>
                          {activity.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={activity.progress} className="w-32" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <h3 className="text-xl font-semibold">My Certificates</h3>
            
            {certificates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                  <p className="text-gray-600 mb-4">Complete courses to earn certificates.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map(certificate => (
                  <Card key={certificate.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Award className="h-8 w-8 text-yellow-600" />
                        <Badge variant="secondary">{certificate.grade}</Badge>
                      </div>
                      <CardTitle className="text-lg">{certificate.courseName}</CardTitle>
                      <p className="text-sm text-gray-600">by {certificate.instructorName}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Completed on {certificate.completionDate.toLocaleDateString()}
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleDownloadCertificate(certificate.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h3 className="text-xl font-semibold">Recent Activity</h3>
            
            <Card>
              <CardContent className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        {activity.type === 'lesson_completed' ? (
                          <PlayCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {activity.type === 'lesson_completed' 
                              ? `Completed lesson: ${activity.lessonTitle}`
                              : `Enrolled in: ${activity.courseTitle}`
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.courseTitle} • {activity.timestamp.toLocaleDateString()}
                          </p>
                          {activity.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={activity.progress} className="w-32" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <h3 className="text-xl font-semibold">Recommended for You</h3>
            
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Personalized recommendations coming soon!</h3>
                <p className="text-gray-600 mb-4">We're working on AI-powered course recommendations based on your learning history.</p>
                <Button onClick={() => onNavigate('/courses')}>Browse All Courses</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <h3 className="text-xl font-semibold">Achievements & Badges</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map(achievement => (
                <Card key={achievement.id} className={`p-6 text-center ${
                  achievement.unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 opacity-75'
                }`}>
                  <div className="flex justify-center mb-4">
                    {achievement.icon === 'trophy' && (
                      <Trophy className={`h-12 w-12 ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />
                    )}
                    {achievement.icon === 'flame' && (
                      <Flame className={`h-12 w-12 ${achievement.unlocked ? 'text-orange-500' : 'text-gray-400'}`} />
                    )}
                    {achievement.icon === 'zap' && (
                      <Zap className={`h-12 w-12 ${achievement.unlocked ? 'text-blue-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <h4 className={`font-semibold text-lg mb-2 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Earned {achievement.date.toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">Not yet earned</span>
                  )}
                </Card>
              ))}
            </div>
            
            {achievements.filter(a => a.unlocked).length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                  <p className="text-gray-600 mb-4">Complete courses and maintain learning streaks to unlock achievements!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};