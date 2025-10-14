import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Calendar,
  Award,
  Brain,
  Zap,
  Eye,
  BarChart3
} from 'lucide-react';

interface ProgressAnalyticsProps {
  learningData: {
    dailyProgress: Array<{
      date: string;
      lessonsCompleted: number;
      timeSpent: number; // in minutes
      coursesStarted: number;
    }>;
    weeklyStats: {
      currentWeek: {
        lessonsCompleted: number;
        timeSpent: number;
        coursesProgress: number;
      };
      previousWeek: {
        lessonsCompleted: number;
        timeSpent: number;
        coursesProgress: number;
      };
    };
    skillProgress: Array<{
      skill: string;
      level: number;
      progress: number;
      totalLessons: number;
      completedLessons: number;
    }>;
    courseProgress: Array<{
      courseId: string;
      courseName: string;
      progress: number;
      timeSpent: number;
      lastAccessed: Date;
      estimatedCompletion: Date;
    }>;
  };
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ learningData }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const timeRangeOptions = [
    { value: '7d' as const, label: 'Last 7 Days' },
    { value: '30d' as const, label: 'Last 30 Days' },
    { value: '90d' as const, label: 'Last 90 Days' }
  ];

  // Calculate filtered data based on time range
  const filteredDailyData = useMemo(() => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return learningData.dailyProgress.filter(item => 
      new Date(item.date) >= cutoffDate
    );
  }, [learningData.dailyProgress, selectedTimeRange]);

  // Calculate totals and averages
  const analytics = useMemo(() => {
    const totalLessons = filteredDailyData.reduce((sum, day) => sum + day.lessonsCompleted, 0);
    const totalTime = filteredDailyData.reduce((sum, day) => sum + day.timeSpent, 0);
    const avgLessonsPerDay = totalLessons / filteredDailyData.length || 0;
    const avgTimePerDay = totalTime / filteredDailyData.length || 0;

    const weekComparison = {
      lessonsChange: learningData.weeklyStats.currentWeek.lessonsCompleted - learningData.weeklyStats.previousWeek.lessonsCompleted,
      timeChange: learningData.weeklyStats.currentWeek.timeSpent - learningData.weeklyStats.previousWeek.timeSpent,
      progressChange: learningData.weeklyStats.currentWeek.coursesProgress - learningData.weeklyStats.previousWeek.coursesProgress
    };

    return {
      totalLessons,
      totalTime,
      avgLessonsPerDay,
      avgTimePerDay,
      weekComparison
    };
  }, [filteredDailyData, learningData.weeklyStats]);

  // Prepare chart data
  const chartData = filteredDailyData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const skillChartData = learningData.skillProgress.map(skill => ({
    skill: skill.skill,
    progress: Math.round((skill.completedLessons / skill.totalLessons) * 100),
    level: skill.level
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <div className="w-4 h-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
          Learning Analytics
        </h2>
        <div className="flex space-x-2">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedTimeRange === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalLessons}</p>
                <div className={`flex items-center mt-1 ${getChangeColor(analytics.weekComparison.lessonsChange)}`}>
                  {getChangeIcon(analytics.weekComparison.lessonsChange)}
                  <span className="text-sm ml-1">
                    {analytics.weekComparison.lessonsChange > 0 ? '+' : ''}{analytics.weekComparison.lessonsChange} this week
                  </span>
                </div>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(analytics.totalTime)}</p>
                <div className={`flex items-center mt-1 ${getChangeColor(analytics.weekComparison.timeChange)}`}>
                  {getChangeIcon(analytics.weekComparison.timeChange)}
                  <span className="text-sm ml-1">
                    {formatTime(Math.abs(analytics.weekComparison.timeChange))} vs last week
                  </span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgLessonsPerDay.toFixed(1)}</p>
                <p className="text-sm text-gray-600 mt-1">lessons per day</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Course Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {learningData.weeklyStats.currentWeek.coursesProgress}%
                </p>
                <div className={`flex items-center mt-1 ${getChangeColor(analytics.weekComparison.progressChange)}`}>
                  {getChangeIcon(analytics.weekComparison.progressChange)}
                  <span className="text-sm ml-1">
                    {analytics.weekComparison.progressChange > 0 ? '+' : ''}{analytics.weekComparison.progressChange}% this week
                  </span>
                </div>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily Activity</TabsTrigger>
          <TabsTrigger value="skills">Skill Progress</TabsTrigger>
          <TabsTrigger value="courses">Course Progress</TabsTrigger>
          <TabsTrigger value="time">Time Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value, name) => [
                        name === 'lessonsCompleted' ? `${value} lessons` : 
                        name === 'timeSpent' ? formatTime(value as number) : value,
                        name === 'lessonsCompleted' ? 'Lessons' : 
                        name === 'timeSpent' ? 'Time Spent' : name
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="lessonsCompleted"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="timeSpent"
                      stackId="2"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Mastery Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningData.skillProgress.map((skill, index) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">{skill.skill}</span>
                        <Badge variant="outline">Level {skill.level}</Badge>
                      </div>
                      <span className="text-sm text-gray-600">
                        {skill.completedLessons}/{skill.totalLessons} lessons
                      </span>
                    </div>
                    <Progress 
                      value={(skill.completedLessons / skill.totalLessons) * 100} 
                      className="h-3"
                    />
                    <div className="text-xs text-gray-500">
                      {Math.round((skill.completedLessons / skill.totalLessons) * 100)}% complete
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningData.courseProgress.map((course) => (
                  <div key={course.courseId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{course.courseName}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(course.timeSpent)}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {course.lastAccessed.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {Math.round(course.progress)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Est. completion: {course.estimatedCompletion.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={learningData.courseProgress.map((course, index) => ({
                        name: course.courseName,
                        value: course.timeSpent,
                        fill: COLORS[index % COLORS.length]
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {learningData.courseProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatTime(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};