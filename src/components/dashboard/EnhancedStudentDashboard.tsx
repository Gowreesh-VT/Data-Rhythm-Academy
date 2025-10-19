import React, { useState, useEffect } from 'react';
import { Course, Enrollment, Certificate } from '../../types';
import { CourseCard } from '../course/CourseCard';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp, 
  Star,
  PlayCircle,
  Download,
  Calendar,
  Target,
  Heart,
  User,
  LogOut,
  Bell,
  Settings,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Flame,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserEnrolledCourses, getUserEnrollments } from '../../lib/database';
import { trackCourseProgress, trackFeatureUsage } from '../../lib/analytics';

// Import new components
import { DashboardSkeleton, CourseCardSkeleton } from '../common/LoadingStates';
import { ErrorState, RetryWrapper } from '../common/ErrorStates';
import { 
  LearningStreak, 
  Achievements, 
  StudyPlanner, 
  CourseRecommendations 
} from './EnhancedDashboardComponents';
import { ProgressAnalytics } from './ProgressAnalytics';

interface EnhancedStudentDashboardProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const EnhancedStudentDashboard: React.FC<EnhancedStudentDashboardProps> = ({ 
  onNavigate, 
  onLogout 
}) => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enhanced dashboard state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'in-progress' | 'completed' | 'not-started'>('all');

  // Mock data for enhanced features
  const [learningStreak] = useState({
    currentStreak: 7,
    longestStreak: 21,
    weeklyGoal: 5,
    weeklyProgress: 4,
    streakData: [
      { date: '2024-01-08', completed: true, lessonsCompleted: 3 },
      { date: '2024-01-09', completed: true, lessonsCompleted: 2 },
      { date: '2024-01-10', completed: false, lessonsCompleted: 0 },
      { date: '2024-01-11', completed: true, lessonsCompleted: 4 },
      { date: '2024-01-12', completed: true, lessonsCompleted: 1 },
      { date: '2024-01-13', completed: true, lessonsCompleted: 5 },
      { date: '2024-01-14', completed: true, lessonsCompleted: 2 }
    ]
  });

  const [achievements] = useState([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      unlockedAt: new Date(),
      progress: 1,
      maxProgress: 1,
      category: 'courses' as const
    },
    {
      id: '2',
      title: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      unlockedAt: new Date(),
      progress: 7,
      maxProgress: 7,
      category: 'streak' as const
    },
    {
      id: '3',
      title: 'Course Crusher',
      description: 'Complete 5 courses',
      icon: '📚',
      progress: 2,
      maxProgress: 5,
      category: 'courses' as const
    },
    {
      id: '4',
      title: 'Speed Learner',
      description: 'Complete 10 lessons in one day',
      icon: '⚡',
      progress: 8,
      maxProgress: 10,
      category: 'skills' as const
    }
  ]);

  const [studyPlannerData] = useState({
    upcomingDeadlines: [
      {
        id: '1',
        title: 'Python Project Submission',
        type: 'project' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        courseTitle: 'Complete Python for Data Science',
        priority: 'high' as const
      },
      {
        id: '2',
        title: 'React Quiz',
        type: 'exam' as const,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        courseTitle: 'React Development Masterclass',
        priority: 'medium' as const
      }
    ],
    studyGoals: [
      {
        id: '1',
        title: 'Complete Python Course',
        target: 50,
        current: 32,
        unit: 'lessons',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Study Time Goal',
        target: 10,
        current: 6.5,
        unit: 'hours/week',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  const [courseRecommendations] = useState([
    {
      id: 'rec-1',
      title: 'Advanced Machine Learning',
      instructor: 'Dr. Sarah Chen',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
      rating: 4.9,
      studentsCount: 2847,
      price: 3999,
      reason: 'Based on your Python progress',
      relevanceScore: 95
    },
    {
      id: 'rec-2',
      title: 'Data Visualization with D3.js',
      instructor: 'Mike Johnson',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      rating: 4.7,
      studentsCount: 1923,
      price: 2999,
      reason: 'Complements your data science skills',
      relevanceScore: 88
    }
  ]);

  const [analyticsData] = useState({
    dailyProgress: [
      { date: '2024-01-01', lessonsCompleted: 3, timeSpent: 120, coursesStarted: 1 },
      { date: '2024-01-02', lessonsCompleted: 2, timeSpent: 90, coursesStarted: 0 },
      { date: '2024-01-03', lessonsCompleted: 4, timeSpent: 150, coursesStarted: 0 },
      { date: '2024-01-04', lessonsCompleted: 1, timeSpent: 45, coursesStarted: 0 },
      { date: '2024-01-05', lessonsCompleted: 5, timeSpent: 180, coursesStarted: 1 },
      { date: '2024-01-06', lessonsCompleted: 3, timeSpent: 105, coursesStarted: 0 },
      { date: '2024-01-07', lessonsCompleted: 2, timeSpent: 75, coursesStarted: 0 }
    ],
    weeklyStats: {
      currentWeek: { lessonsCompleted: 20, timeSpent: 765, coursesProgress: 78 },
      previousWeek: { lessonsCompleted: 15, timeSpent: 630, coursesProgress: 65 }
    },
    skillProgress: [
      { skill: 'Python Programming', level: 3, progress: 78, totalLessons: 50, completedLessons: 39 },
      { skill: 'Data Analysis', level: 2, progress: 45, totalLessons: 30, completedLessons: 14 },
      { skill: 'Machine Learning', level: 1, progress: 12, totalLessons: 25, completedLessons: 3 }
    ],
    courseProgress: [
      {
        courseId: '1',
        courseName: 'Complete Python for Data Science',
        progress: 78,
        timeSpent: 450,
        lastAccessed: new Date(),
        estimatedCompletion: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        courseId: '2',
        courseName: 'React Development Masterclass',
        progress: 34,
        timeSpent: 210,
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estimatedCompletion: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0,
    currentStreak: 7,
    weeklyGoal: 85 // percentage
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      trackFeatureUsage('dashboard', 'view', 1);
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user's enrolled courses
      const enrolledCoursesResult = await getUserEnrolledCourses(user.id);
      if (enrolledCoursesResult.error) {
        throw new Error(enrolledCoursesResult.error.message || 'Failed to load enrolled courses');
      }
      
      const courses = enrolledCoursesResult.data || [];
      setEnrolledCourses(courses);

      // Fetch user's enrollments
      const enrollmentsResult = await getUserEnrollments(user.id);
      if (enrollmentsResult.error) {
        throw new Error(enrollmentsResult.error.message || 'Failed to load enrollments');
      }
      
      const enrollments = enrollmentsResult.data || [];
      setEnrollments(enrollments);

      // Generate certificates for completed courses
      const mockCertificates: Certificate[] = enrollments
        .filter(enrollment => enrollment.completedAt)
        .map(enrollment => ({
          id: `cert-${enrollment.id}`,
          userId: user.id,
          courseId: enrollment.courseId,
          courseName: courses.find(c => c.id === enrollment.courseId)?.title || 'Unknown Course',
          instructorName: courses.find(c => c.id === enrollment.courseId)?.instructorName || 'Unknown Instructor',
          completionDate: enrollment.completedAt!,
          certificateUrl: `#certificate-${enrollment.id}`,
          grade: 'A'
        }));
      
      setCertificates(mockCertificates);
      
      // Calculate enhanced stats
      const completedCourses = mockCertificates.length;
      const totalHours = courses.reduce((acc: number, course: Course) => acc + course.duration, 0);
      
      setStats({
        totalCourses: courses.length,
        completedCourses,
        totalHours,
        certificates: mockCertificates.length,
        currentStreak: 7,
        weeklyGoal: 85
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId: string) => {
    trackCourseProgress(courseId, 'Continue Learning', 0);
    onNavigate(`/course/${courseId}`);
  };

  const handleViewCourse = (courseId: string) => {
    trackFeatureUsage('course-recommendations', 'view', 1);
    onNavigate(`/course/${courseId}`);
  };

  const handleEnrollInRecommendation = (courseId: string) => {
    trackFeatureUsage('course-recommendations', 'enroll', 1);
    onNavigate(`/course/${courseId}`);
  };

  const handleDownloadCertificate = (certificateId: string) => {
    trackFeatureUsage('certificates', 'download', 1);
    console.log('Downloading certificate:', certificateId);
  };

  // Filter courses based on search and filter criteria
  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterBy === 'all') return true;
    
    const enrollment = enrollments.find(e => e.courseId === course.id);
    if (filterBy === 'completed') return enrollment?.completedAt;
    if (filterBy === 'in-progress') return enrollment && !enrollment.completedAt && (typeof enrollment.progress === 'number' ? enrollment.progress > 0 : false);
    if (filterBy === 'not-started') return !enrollment || (typeof enrollment.progress === 'number' ? enrollment.progress === 0 : true);
    
    return true;
  });

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <RetryWrapper onRetry={loadDashboardData}>
        <ErrorState
          error={error}
          onRetry={loadDashboardData}
          onGoHome={() => onNavigate('/')}
        />
      </RetryWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 
                className="text-2xl font-bold text-blue-600 cursor-pointer" 
                onClick={() => onNavigate('/')}
              >
                Data Rhythm Academy
              </h1>
              <Badge variant="secondary" className="hidden sm:flex">
                Student Dashboard
              </Badge>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <Button variant="ghost" onClick={() => onNavigate('/courses')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Courses
              </Button>
              <Button variant="ghost" onClick={() => onNavigate('/my-courses')}>
                My Learning
              </Button>
              <Button variant="ghost">
                <Bell className="w-4 h-4" />
              </Button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user?.displayName || user?.email?.split('@')[0] || 'Student'}
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || 'Student'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to continue your learning journey? You're doing great!
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Courses</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalCourses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedCourses}</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Time</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalHours}h</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Streak</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.currentStreak}</p>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
                <p className="text-sm text-gray-600">{stats.weeklyGoal}%</p>
              </div>
              <Progress value={stats.weeklyGoal} className="h-3 mb-2" />
              <p className="text-xs text-gray-500">Keep up the great work!</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="planner">Planner</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <LearningStreak {...learningStreak} />
                <CourseRecommendations
                  recommendations={courseRecommendations}
                  onEnroll={handleEnrollInRecommendation}
                  onViewCourse={handleViewCourse}
                />
              </div>
              <div className="space-y-6">
                <Achievements achievements={achievements} />
                <StudyPlanner {...studyPlannerData} />
              </div>
            </div>
          </TabsContent>

          {/* My Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search your courses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                {(['all', 'in-progress', 'completed', 'not-started'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={filterBy === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy(filter)}
                    className="capitalize"
                  >
                    {filter.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => {
                  const enrollment = enrollments.find(e => e.courseId === course.id);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEnroll={() => handleContinueLearning(course.id)}
                      onPreview={() => handleContinueLearning(course.id)}
                      onNavigate={onNavigate}
                      progress={typeof enrollment?.progress === 'number' ? enrollment.progress : 0}
                      isEnrolled={true}
                      showProgress={true}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Start your learning journey today!'}
                </p>
                <Button onClick={() => onNavigate('/courses')}>
                  Browse Courses
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <LearningStreak {...learningStreak} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Achievements achievements={achievements} />
          </TabsContent>

          {/* Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <StudyPlanner {...studyPlannerData} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <ProgressAnalytics learningData={analyticsData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};