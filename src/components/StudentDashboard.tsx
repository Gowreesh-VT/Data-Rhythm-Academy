import React, { useState, useEffect } from 'react';
import { Course, Enrollment, Certificate } from '../types';
import { CourseCard } from './CourseCard';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserEnrolledCourses, getUserEnrollments } from '../lib/database';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningStreak, setLearningStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(10); // 10 hours per week
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch user's enrolled courses
      const enrolledCoursesResult = await getUserEnrolledCourses(user.id);
      if (enrolledCoursesResult.error) {
        console.error('Error loading enrolled courses:', enrolledCoursesResult.error);
      } else {
        setEnrolledCourses(enrolledCoursesResult.data || []);
      }

      // Fetch user's enrollments for certificates and progress
      const enrollmentsResult = await getUserEnrollments(user.id);
      if (enrollmentsResult.error) {
        console.error('Error loading enrollments:', enrollmentsResult.error);
      } else {
        const enrollments = enrollmentsResult.data || [];
        
        // Mock certificates for completed courses
        const mockCertificates: Certificate[] = enrollments
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
        
        setCertificates(mockCertificates);
        setEnrollments(enrollments);
      }

      // Generate mock recent activity based on enrolled courses
      const mockActivity = enrolledCourses.slice(0, 3).map((course, index) => ({
        id: `activity-${index}`,
        type: index === 0 ? 'lesson_completed' : 'course_enrolled',
        courseTitle: course.title,
        lessonTitle: index === 0 ? 'Introduction Lesson' : undefined,
        timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Last few days
        progress: index === 0 ? 65 : 0
      }));

      setRecentActivity(mockActivity);
      
      // Calculate stats based on real data
      const completedCourses = certificates.length;
      const totalHours = enrolledCourses.reduce((acc: number, course: Course) => acc + course.duration, 0);
      
      setStats({
        totalCourses: enrolledCourses.length,
        completedCourses,
        totalHours,
        certificates: certificates.length
      });
      
      // Generate learning streak (mock data)
      const streak = Math.floor(Math.random() * 30) + 1; // 1-30 days
      setLearningStreak(streak);
      
      // Generate weekly progress (mock data)
      const thisWeekHours = Math.random() * weeklyGoal;
      setWeeklyProgress(thisWeekHours);
      
      // Generate achievements (mock data)
      const mockAchievements = [
        {
          id: 'first-course',
          title: 'First Course Complete',
          description: 'Completed your first course',
          icon: 'trophy',
          unlocked: completedCourses > 0,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'week-streak',
          title: 'Week Warrior',
          description: 'Maintained a 7-day learning streak',
          icon: 'flame',
          unlocked: streak >= 7,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'speed-learner',
          title: 'Speed Learner',
          description: 'Completed 3 courses in one month',
          icon: 'zap',
          unlocked: completedCourses >= 3,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];
      setAchievements(mockAchievements);
      
      // Generate upcoming classes (mock data)
      const mockUpcomingClasses = enrolledCourses.slice(0, 3).map((course, index) => ({
        id: `class-${index}`,
        courseTitle: course.title,
        instructor: course.instructorName,
        date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
        time: '18:00',
        duration: 90,
        type: 'live'
      }));
      setUpcomingClasses(mockUpcomingClasses);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId: string) => {
    onNavigate(`/course/${courseId}`);
  };

  const handleDownloadCertificate = (certificateId: string) => {
    // Implement certificate download
    console.log('Downloading certificate:', certificateId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
              <button onClick={() => onNavigate('/my-courses')} className="text-blue-600 font-medium">
                My Dashboard
              </button>
              <button onClick={() => onNavigate('/wishlist')} className="text-gray-700 hover:text-blue-600 flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                Wishlist
              </button>
              {user?.role === 'instructor' && (
                <button onClick={() => onNavigate('/instructor-dashboard')} className="text-gray-700 hover:text-blue-600">
                  Instructor Dashboard
                </button>
              )}
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Hello, {user?.displayName || user?.email}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.displayName || 'Student'}! 👋</h2>
          <p className="text-gray-600 mt-2">Continue your learning journey and track your progress.</p>
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
                  onClick={() => enrolledCourses.length > 0 && handleContinueLearning(enrolledCourses[0].id)}
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
                  onClick={() => upcomingClasses.length > 0 && console.log('Join live class')}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  Join Live Class
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => onNavigate('/certificates')}
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
                    progress={Math.random() * 100} // Mock progress
                    onPreview={handleContinueLearning}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Upcoming Classes & Schedule</h3>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
            
            {upcomingClasses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming classes</h3>
                  <p className="text-gray-600 mb-4">Your enrolled courses will show live classes here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map(classItem => (
                  <Card key={classItem.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{classItem.courseTitle}</h4>
                          <p className="text-sm text-gray-600">with {classItem.instructor}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">
                              {classItem.date.toLocaleDateString()} at {classItem.time}
                            </span>
                            <span className="text-sm text-gray-500">
                              {classItem.duration} minutes
                            </span>
                            <Badge variant="secondary">{classItem.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm">
                        Join Class
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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