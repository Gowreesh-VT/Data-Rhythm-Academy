import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  PlayCircle, 
  Calendar, 
  Clock, 
  Zap, 
  BookOpen, 
  Award, 
  MessageCircle,
  Download,
  Target,
  TrendingUp,
  Bell,
  Star,
  Users,
  Brain,
  CheckCircle2,
  ArrowRight,
  Flame,
  Trophy,
  Gift
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  badge?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'learning' | 'social' | 'progress' | 'system';
}

interface QuickActionDashboardProps {
  onNavigate: (path: string) => void;
  userProgress?: {
    lastLesson?: { courseId: string; lessonId: string; title: string };
    upcomingClass?: { id: string; title: string; startTime: Date };
    currentStreak: number;
    weeklyGoal: number;
    weeklyProgress: number;
    pendingAssignments: number;
    unreadNotifications: number;
  };
}

export const QuickActionDashboard: React.FC<QuickActionDashboardProps> = ({ 
  onNavigate, 
  userProgress = {
    currentStreak: 0,
    weeklyGoal: 5,
    weeklyProgress: 2,
    pendingAssignments: 0,
    unreadNotifications: 0
  }
}) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning! 🌅');
    else if (hour < 17) setGreeting('Good Afternoon! ☀️');
    else setGreeting('Good Evening! 🌙');
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'continue-learning',
      title: 'Continue Learning',
      description: userProgress.lastLesson ? `Resume: ${userProgress.lastLesson.title}` : 'Start your next lesson',
      icon: PlayCircle,
      action: () => {
        if (userProgress.lastLesson) {
          onNavigate(`/lesson/${userProgress.lastLesson.lessonId}`);
        } else {
          onNavigate('/my-courses');
        }
      },
      priority: 'high',
      category: 'learning'
    },
    {
      id: 'join-class',
      title: 'View Timetable',
      description: userProgress.upcomingClass ? 
        `Next: ${userProgress.upcomingClass.title}` : 
        'Check your class schedule',
      icon: Calendar,
      action: () => onNavigate('/timetable'),
      badge: userProgress.upcomingClass ? 'Live' : undefined,
      priority: userProgress.upcomingClass ? 'high' : 'medium',
      category: 'learning'
    },
    {
      id: 'browse-courses',
      title: 'Explore Courses',
      description: 'Discover new skills to learn',
      icon: BookOpen,
      action: () => onNavigate('/courses'),
      priority: 'medium',
      category: 'learning'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: userProgress.pendingAssignments > 0 ? 
        `${userProgress.pendingAssignments} pending submissions` : 
        'No pending assignments',
      icon: Target,
      action: () => onNavigate('/assignments'),
      badge: userProgress.pendingAssignments > 0 ? userProgress.pendingAssignments.toString() : undefined,
      priority: userProgress.pendingAssignments > 0 ? 'high' : 'low',
      category: 'progress'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: userProgress.unreadNotifications > 0 ? 
        `${userProgress.unreadNotifications} unread messages` : 
        'All caught up!',
      icon: Bell,
      action: () => onNavigate('/notifications'),
      badge: userProgress.unreadNotifications > 0 ? userProgress.unreadNotifications.toString() : undefined,
      priority: userProgress.unreadNotifications > 0 ? 'medium' : 'low',
      category: 'system'
    },
    {
      id: 'study-groups',
      title: 'Study Groups',
      description: 'Connect with peers',
      icon: Users,
      action: () => onNavigate('/study-groups'),
      priority: 'medium',
      category: 'social'
    }
  ];

  const highPriorityActions = quickActions.filter(action => action.priority === 'high');
  const otherActions = quickActions.filter(action => action.priority !== 'high');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const weeklyProgressPercentage = (userProgress.weeklyProgress / userProgress.weeklyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Greeting and Quick Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{greeting}</h2>
              <p className="text-gray-600">Ready to continue your learning journey?</p>
            </div>
            <div className="flex items-center space-x-4 text-center">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center text-orange-500 mb-1">
                  <Flame className="w-4 h-4 mr-1" />
                  <span className="font-bold">{userProgress.currentStreak}</span>
                </div>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center text-green-500 mb-1">
                  <Target className="w-4 h-4 mr-1" />
                  <span className="font-bold">{userProgress.weeklyProgress}/{userProgress.weeklyGoal}</span>
                </div>
                <p className="text-xs text-gray-500">Weekly Goal</p>
              </div>
            </div>
          </div>
          
          {/* Weekly Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Weekly Learning Goal</span>
              <span className="text-sm text-gray-600">{Math.round(weeklyProgressPercentage)}% complete</span>
            </div>
            <Progress value={weeklyProgressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* High Priority Actions */}
      {highPriorityActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highPriorityActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex items-start space-x-3 hover:shadow-md transition-all border-l-4 border-l-red-500"
                    onClick={action.action}
                  >
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{action.title}</h3>
                        {action.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 relative hover:shadow-md transition-all"
                  onClick={action.action}
                >
                  {action.badge && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 text-xs min-w-[20px] h-5 flex items-center justify-center"
                    >
                      {action.badge}
                    </Badge>
                  )}
                  <Icon className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium text-center">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Motivation */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-full">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">Daily Motivation</h3>
              <p className="text-sm text-green-700">
                {userProgress.currentStreak > 0 ? 
                  `Amazing! You're on a ${userProgress.currentStreak}-day learning streak! Keep going! 🚀` :
                  "Today is a perfect day to start learning something new! 💡"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};