import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { getInstructorCourses } from '../../lib/database';
import { 
  BookOpen, 
  Users, 
  Star,
  BarChart3,
  MessageSquare,
  Video,
  GraduationCap,
  TrendingUp,
  Clock
} from 'lucide-react';
import { InstructorAnalyticsDashboard } from './InstructorAnalyticsDashboard';
import { InstructorCommunicationHub } from './InstructorCommunicationHub';
import { InstructorLiveClassConsole } from './InstructorLiveClassConsole';

interface InstructorDashboardProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export function InstructorDashboard({ onNavigate, onLogout }: InstructorDashboardProps) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadInstructorData();
  }, [user]);

  const loadInstructorData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const coursesResult = await getInstructorCourses(user.id);
      if (coursesResult.data) {
        setCourses(coursesResult.data);
      }
    } catch (error) {
      console.error('Error loading instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalStudents = courses.reduce((sum, course) => sum + (course.totalStudents || 0), 0);
    const avgRating = courses.length > 0 
      ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length 
      : 0;
    const totalLessons = courses.reduce((sum, course) => sum + (course.lessons?.length || 0), 0);

    return {
      totalCourses: courses.length,
      totalStudents,
      totalLessons,
      avgRating: Math.round(avgRating * 10) / 10
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading instructor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.displayName || 'Instructor'}</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => onNavigate('/')}>
                Back to Site
              </Button>
              <Button variant="destructive" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 shadow-md border border-gray-200 overflow-x-auto">
              <TabsTrigger 
                value="overview" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-white hover:text-gray-900 min-w-[80px]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-white hover:text-gray-900 min-w-[80px]"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="live-classes" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-white hover:text-gray-900 min-w-[90px]"
              >
                Live Classes
              </TabsTrigger>
              <TabsTrigger 
                value="communication" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-white hover:text-gray-900 min-w-[100px]"
              >
                Communication
              </TabsTrigger>
              <TabsTrigger 
                value="courses" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-white hover:text-gray-900 min-w-[80px]"
              >
                Courses
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalCourses}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Active courses
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                  <Users className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalStudents}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enrolled across all courses
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Lessons</CardTitle>
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalLessons}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Content modules
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                  <Star className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stats.avgRating}/5</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Across all courses
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New student enrolled in Python for Beginners</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Course completion rate improved by 12%</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">5-star review received on Data Science course</p>
                      <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New lesson uploaded to Web Development course</p>
                      <p className="text-xs text-gray-500 mt-1">5 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setActiveTab('analytics')}
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                  >
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <span>View Analytics</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('live-classes')}
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                  >
                    <Video className="w-6 h-6 text-purple-600" />
                    <span>Live Classes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <InstructorAnalyticsDashboard 
              instructorId={user?.id || ''}
              onNavigate={onNavigate}
            />
          </TabsContent>

          {/* Live Classes Tab */}
          <TabsContent value="live-classes">
            <InstructorLiveClassConsole 
              instructorId={user?.id || ''}
              onNavigate={onNavigate}
            />
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <InstructorCommunicationHub 
              instructorId={user?.id || ''}
              onNavigate={onNavigate}
            />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <Button 
                onClick={() => onNavigate('/create-course')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Create New Course
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</CardTitle>
                    <div className="flex items-center space-x-2 pt-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">{course.category}</Badge>
                      <Badge variant="outline" className="border-gray-300">{course.level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{course.shortDescription}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Students</span>
                        </div>
                        <span className="text-sm font-bold">{course.totalStudents || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Rating</span>
                        </div>
                        <span className="text-sm font-bold">
                          {course.rating ? `${course.rating}/5` : 'No ratings'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Lessons</span>
                        </div>
                        <span className="text-sm font-bold">{course.lessons?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => onNavigate(`/course/${course.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        View Course
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onNavigate(`/edit-course/${course.id}`)}
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {courses.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses assigned yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Courses will appear here once an administrator assigns them to you or creates new courses for the platform.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
