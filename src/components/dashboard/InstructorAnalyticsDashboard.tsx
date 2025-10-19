import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  Award,
  PlayCircle,
  MessageCircle,
  Download,
  Eye,
  Calendar,
  Target,
  Zap,
  BookOpen,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Globe,
  GraduationCap,
  ThumbsUp
} from 'lucide-react';

interface AnalyticsData {
  coursePerformance: {
    courseId: string;
    courseName: string;
    totalStudents: number;
    completionRate: number;
    averageProgress: number;
    rating: number;
    engagementScore: number;
    totalLessons: number;
  }[];
  studentEngagement: {
    activeStudents: number;
    totalStudents: number;
    averageSessionTime: number;
    forumParticipation: number;
    assignmentSubmission: number;
    liveClassAttendance: number;
  };
  teachingMetrics: {
    totalHoursTeaching: number;
    averageClassDuration: number;
    studentSatisfaction: number;
    courseCompletions: number;
  };
  contentInsights: {
    totalVideoViews: number;
    averageWatchTime: number;
    mostPopularLesson: string;
    dropOffPoints: string[];
    downloadCount: number;
  };
  liveClassMetrics: {
    totalClasses: number;
    averageAttendance: number;
    averageRating: number;
    recordingViews: number;
    chatMessages: number;
  };
}

interface InstructorAnalyticsDashboardProps {
  instructorId: string;
  onNavigate: (path: string) => void;
}

export const InstructorAnalyticsDashboard: React.FC<InstructorAnalyticsDashboardProps> = ({ 
  instructorId, 
  onNavigate 
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');

  useEffect(() => {
    loadAnalyticsData();
  }, [instructorId, selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      // Real analytics data will be calculated from Firebase/Firestore
      // For now, set empty/default values until real analytics are implemented
      const realAnalytics: AnalyticsData = {
        coursePerformance: [],
        studentEngagement: {
          activeStudents: 0,
          totalStudents: 0,
          averageSessionTime: 0,
          forumParticipation: 0,
          assignmentSubmission: 0,
          liveClassAttendance: 0
        },
        teachingMetrics: {
          totalHoursTeaching: 0,
          averageClassDuration: 0,
          studentSatisfaction: 0,
          courseCompletions: 0
        },
        contentInsights: {
          totalVideoViews: 0,
          averageWatchTime: 0,
          mostPopularLesson: 'No data available',
          dropOffPoints: [],
          downloadCount: 0
        },
        liveClassMetrics: {
          totalClasses: 0,
          averageAttendance: 0,
          averageRating: 0,
          recordingViews: 0,
          chatMessages: 0
        }
      };

      // TODO: Replace with actual Firebase analytics queries
      // Example queries to implement:
      // - Get instructor's courses from Firestore
      // - Calculate student enrollment and completion rates
      // - Get course ratings and reviews
      // - Calculate engagement metrics from user activity logs
      
      setAnalytics(realAnalytics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into your teaching performance</p>
        </div>
        <div className="flex space-x-2">
          {['7days', '30days', '90days', '1year'].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe === '7days' && '7 Days'}
              {timeframe === '30days' && '30 Days'}
              {timeframe === '90days' && '90 Days'}
              {timeframe === '1year' && '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Students</p>
                <p className="text-3xl font-bold">{analytics.studentEngagement.activeStudents}</p>
                <p className="text-blue-100 text-sm">
                  {Math.round((analytics.studentEngagement.activeStudents / analytics.studentEngagement.totalStudents) * 100)}% of total
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Teaching Hours</p>
                <p className="text-3xl font-bold">{analytics.teachingMetrics.totalHoursTeaching}</p>
                <p className="text-green-100 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Total hours taught
                </p>
              </div>
              <GraduationCap className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Completion Rate</p>
                <p className="text-3xl font-bold">
                  {Math.round(analytics.coursePerformance.reduce((acc, course) => acc + course.completionRate, 0) / analytics.coursePerformance.length)}%
                </p>
                <p className="text-purple-100 text-sm">Across all courses</p>
              </div>
              <Target className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Overall Rating</p>
                <p className="text-3xl font-bold">
                  {(analytics.coursePerformance.reduce((acc, course) => acc + course.rating, 0) / analytics.coursePerformance.length).toFixed(1)}
                </p>
                <p className="text-orange-100 text-sm flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  Student satisfaction
                </p>
              </div>
              <Award className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
          <TabsTrigger value="teaching">Teaching Metrics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="live-classes">Live Classes</TabsTrigger>
        </TabsList>

        {/* Course Performance Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Course Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.coursePerformance.map((course) => (
                  <div key={course.courseId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{course.courseName}</h3>
                        <p className="text-gray-600">{course.totalStudents} enrolled students</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{course.totalLessons} Lessons</p>
                        <p className="text-sm text-gray-500">Course Content</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Completion Rate</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={course.completionRate} className="flex-1" />
                          <span className="text-sm font-medium">{course.completionRate}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg Progress</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={course.averageProgress} className="flex-1" />
                          <span className="text-sm font-medium">{course.averageProgress}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{course.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Engagement</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${course.engagementScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{course.engagementScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => onNavigate(`/course/${course.courseId}/analytics`)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Detailed View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onNavigate(`/course/${course.courseId}/students`)}>
                        <Users className="w-4 h-4 mr-1" />
                        Student List
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Forum Participation</span>
                    <span className="text-sm text-gray-600">{analytics.studentEngagement.forumParticipation}%</span>
                  </div>
                  <Progress value={analytics.studentEngagement.forumParticipation} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Assignment Submission</span>
                    <span className="text-sm text-gray-600">{analytics.studentEngagement.assignmentSubmission}%</span>
                  </div>
                  <Progress value={analytics.studentEngagement.assignmentSubmission} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Live Class Attendance</span>
                    <span className="text-sm text-gray-600">{analytics.studentEngagement.liveClassAttendance}%</span>
                  </div>
                  <Progress value={analytics.studentEngagement.liveClassAttendance} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Session Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{analytics.studentEngagement.averageSessionTime}min</div>
                    <div className="text-sm text-gray-600">Average Session Time</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{analytics.studentEngagement.activeStudents}</div>
                      <div className="text-xs text-gray-600">Active This Month</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">{analytics.studentEngagement.totalStudents}</div>
                      <div className="text-xs text-gray-600">Total Students</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teaching Metrics Tab */}
        <TabsContent value="teaching" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">{analytics.teachingMetrics.totalHoursTeaching}</div>
                <div className="text-sm text-gray-600">Total Teaching Hours</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">{analytics.teachingMetrics.averageClassDuration}min</div>
                <div className="text-sm text-gray-600">Avg Class Duration</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <ThumbsUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">{analytics.teachingMetrics.studentSatisfaction}/5</div>
                <div className="text-sm text-gray-600">Student Satisfaction</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">{analytics.teachingMetrics.courseCompletions}</div>
                <div className="text-sm text-gray-600">Course Completions</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Teaching Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Teaching Efficiency</h4>
                  <p className="text-sm text-blue-700">Your average class duration is optimal for student engagement. Consider interactive elements to maintain attention.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Student Feedback</h4>
                  <p className="text-sm text-green-700">Excellent satisfaction rating! Students appreciate your clear explanations and teaching methodology.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Analytics Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Video Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.contentInsights.totalVideoViews.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Video Views</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.contentInsights.averageWatchTime}min</div>
                  <div className="text-sm text-gray-600">Average Watch Time</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Content Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Most Popular Lesson</h4>
                  <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">{analytics.contentInsights.mostPopularLesson}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Total Downloads</h4>
                  <p className="text-2xl font-bold text-orange-600">{analytics.contentInsights.downloadCount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.contentInsights.dropOffPoints.map((point, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">{point}</span>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Analyze
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Classes Tab */}
        <TabsContent value="live-classes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{analytics.liveClassMetrics.totalClasses}</div>
                <div className="text-sm text-gray-600">Classes Conducted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{analytics.liveClassMetrics.averageAttendance}%</div>
                <div className="text-sm text-gray-600">Avg Attendance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{analytics.liveClassMetrics.averageRating}</div>
                <div className="text-sm text-gray-600">Avg Class Rating</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{analytics.liveClassMetrics.chatMessages.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Chat Messages</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recording Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6">
                <PlayCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.liveClassMetrics.recordingViews.toLocaleString()}</div>
                <div className="text-gray-600">Total Recording Views</div>
                <Button className="mt-4" onClick={() => onNavigate('/recordings')}>
                  Manage Recordings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-medium mb-1">Improve Course Completion</h4>
              <p className="text-sm text-gray-600 mb-3">Some courses have low completion rates. Consider adding more engaging content.</p>
              <Button size="sm" variant="outline">View Details</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium mb-1">Increase Forum Engagement</h4>
              <p className="text-sm text-gray-600 mb-3">Student forum participation could be higher. Consider posting discussion prompts.</p>
              <Button size="sm" variant="outline">Go to Forums</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <Globe className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-medium mb-1">Schedule More Live Classes</h4>
              <p className="text-sm text-gray-600 mb-3">Students love your live sessions. Consider adding more interactive classes.</p>
              <Button size="sm" variant="outline">Schedule Class</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};