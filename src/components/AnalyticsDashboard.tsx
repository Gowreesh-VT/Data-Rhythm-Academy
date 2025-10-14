import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Search,
  Play,
  Download,
  AlertTriangle,
  Clock,
  Target,
  Star,
  Eye
} from 'lucide-react';

interface AnalyticsDashboardProps {
  userRole: 'instructor' | 'admin';
  userId?: string;
}

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalRevenue: number;
    totalEnrollments: number;
  };
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
  courseMetrics: {
    mostPopularCourses: Array<{
      id: string;
      title: string;
      enrollments: number;
      rating: number;
      revenue: number;
    }>;
    completionRates: Array<{
      courseId: string;
      title: string;
      completionRate: number;
    }>;
  };
  searchAnalytics: {
    topSearchTerms: Array<{
      term: string;
      count: number;
      resultsFound: number;
    }>;
    searchTrends: Array<{
      date: string;
      searches: number;
    }>;
  };
  revenueMetrics: {
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      enrollments: number;
    }>;
    paymentMethods: Array<{
      method: string;
      percentage: number;
      amount: number;
    }>;
  };
  errorTracking: {
    totalErrors: number;
    errorsByType: Array<{
      type: string;
      count: number;
      lastOccurred: string;
    }>;
    errorTrends: Array<{
      date: string;
      errors: number;
    }>;
  };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userRole, userId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, userId]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock analytics data - replace with actual Google Analytics API calls
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 15420,
          totalCourses: 127,
          totalRevenue: 2845600,
          totalEnrollments: 8934
        },
        userEngagement: {
          dailyActiveUsers: 1247,
          weeklyActiveUsers: 5631,
          monthlyActiveUsers: 12890,
          averageSessionDuration: 1847 // seconds
        },
        courseMetrics: {
          mostPopularCourses: [
            {
              id: '1',
              title: 'Complete Python for Data Science',
              enrollments: 1245,
              rating: 4.8,
              revenue: 185000
            },
            {
              id: '2',
              title: 'React Development Masterclass',
              enrollments: 987,
              rating: 4.7,
              revenue: 147800
            },
            {
              id: '3',
              title: 'Machine Learning Fundamentals',
              enrollments: 765,
              rating: 4.9,
              revenue: 114750
            }
          ],
          completionRates: [
            { courseId: '1', title: 'Complete Python for Data Science', completionRate: 78 },
            { courseId: '2', title: 'React Development Masterclass', completionRate: 85 },
            { courseId: '3', title: 'Machine Learning Fundamentals', completionRate: 72 }
          ]
        },
        searchAnalytics: {
          topSearchTerms: [
            { term: 'python', count: 1847, resultsFound: 23 },
            { term: 'machine learning', count: 1245, resultsFound: 18 },
            { term: 'react', count: 987, resultsFound: 15 },
            { term: 'data science', count: 823, resultsFound: 31 },
            { term: 'javascript', count: 756, resultsFound: 12 }
          ],
          searchTrends: [
            { date: '2024-01-01', searches: 234 },
            { date: '2024-01-02', searches: 267 },
            { date: '2024-01-03', searches: 298 }
          ]
        },
        revenueMetrics: {
          monthlyRevenue: [
            { month: 'Jan 2024', revenue: 284560, enrollments: 456 },
            { month: 'Feb 2024', revenue: 312400, enrollments: 523 },
            { month: 'Mar 2024', revenue: 398750, enrollments: 634 }
          ],
          paymentMethods: [
            { method: 'Credit Card', percentage: 68, amount: 1935008 },
            { method: 'UPI', percentage: 22, amount: 626032 },
            { method: 'Net Banking', percentage: 7, amount: 199192 },
            { method: 'Wallet', percentage: 3, amount: 85368 }
          ]
        },
        errorTracking: {
          totalErrors: 47,
          errorsByType: [
            { type: 'Payment Failed', count: 18, lastOccurred: '2024-01-15T10:30:00Z' },
            { type: 'Video Loading Error', count: 12, lastOccurred: '2024-01-14T15:45:00Z' },
            { type: 'Login Error', count: 9, lastOccurred: '2024-01-13T09:20:00Z' },
            { type: 'Course Enrollment Error', count: 8, lastOccurred: '2024-01-12T14:10:00Z' }
          ],
          errorTrends: [
            { date: '2024-01-10', errors: 3 },
            { date: '2024-01-11', errors: 5 },
            { date: '2024-01-12', errors: 2 }
          ]
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load analytics data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">
            {userRole === 'admin' ? 'Platform Analytics' : 'Your Course Analytics'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalCourses}</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+18.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalEnrollments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8.4% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="search">Search Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.userEngagement.dailyActiveUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Weekly Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.userEngagement.weeklyActiveUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.userEngagement.monthlyActiveUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg. Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(analyticsData.userEngagement.averageSessionDuration)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Courses</CardTitle>
                <CardDescription>Top performing courses by enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.courseMetrics.mostPopularCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.enrollments} enrollments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(course.revenue)}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{course.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Completion Rates</CardTitle>
                <CardDescription>Percentage of students completing courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.courseMetrics.completionRates.map((course) => (
                    <div key={course.courseId} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{course.title}</span>
                        <span className="text-sm font-medium">{course.completionRate}%</span>
                      </div>
                      <Progress value={course.completionRate} className="w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Search Terms</CardTitle>
              <CardDescription>Most searched keywords and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.searchAnalytics.topSearchTerms.map((search, index) => (
                  <div key={search.term} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{search.term}</p>
                        <p className="text-sm text-gray-500">{search.resultsFound} results found</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{search.count.toLocaleString()} searches</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue and enrollment trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenueMetrics.monthlyRevenue.map((month) => (
                    <div key={month.month} className="flex justify-between items-center">
                      <span className="font-medium">{month.month}</span>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(month.revenue)}</p>
                        <p className="text-sm text-gray-500">{month.enrollments} enrollments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenueMetrics.paymentMethods.map((method) => (
                    <div key={method.method} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{method.method}</span>
                        <span className="text-sm">{method.percentage}%</span>
                      </div>
                      <Progress value={method.percentage} className="w-full" />
                      <p className="text-sm text-gray-500">{formatCurrency(method.amount)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Error Summary</span>
                </CardTitle>
                <CardDescription>Total errors: {analyticsData.errorTracking.totalErrors}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.errorTracking.errorsByType.map((error) => (
                    <div key={error.type} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{error.type}</p>
                        <p className="text-sm text-gray-500">
                          Last: {new Date(error.lastOccurred).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="destructive">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Trends</CardTitle>
                <CardDescription>Daily error occurrences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData.errorTracking.errorTrends.map((day) => (
                    <div key={day.date} className="flex justify-between">
                      <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                      <Badge variant={day.errors > 5 ? "destructive" : day.errors > 2 ? "secondary" : "outline"}>
                        {day.errors} errors
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};