import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  Target, 
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Star
} from 'lucide-react';

interface LearningStreakProps {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streakData: Array<{
    date: string;
    completed: boolean;
    lessonsCompleted: number;
  }>;
}

export const LearningStreak: React.FC<LearningStreakProps> = ({
  currentStreak,
  longestStreak,
  weeklyGoal,
  weeklyProgress,
  streakData
}) => {
  const today = new Date();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getWeekData = () => {
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = streakData.find(d => d.date === dateStr);
      
      week.push({
        day: weekDays[date.getDay()],
        date: date.getDate(),
        completed: dayData?.completed || false,
        lessonsCompleted: dayData?.lessonsCompleted || 0,
        isToday: dateStr === today.toISOString().split('T')[0]
      });
    }
    return week;
  };

  const weekData = getWeekData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Flame className="w-5 h-5 mr-2 text-orange-500" />
          Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <Flame className="w-12 h-12 text-orange-500 mx-auto mb-1" />
            <div className="text-xs text-gray-500">Keep it up!</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{longestStreak}</div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Weekly Goal</span>
            <span className="text-sm text-gray-600">{weeklyProgress}/{weeklyGoal} days</span>
          </div>
          <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekData.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{day.day}</div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                  day.completed
                    ? 'bg-green-500 text-white'
                    : day.isToday
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {day.completed ? '✓' : day.date}
              </div>
              {day.lessonsCompleted > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  {day.lessonsCompleted}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: 'courses' | 'streak' | 'skills' | 'social';
}

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', label: 'All', icon: Award },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'streak', label: 'Streaks', icon: Flame },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'social', label: 'Social', icon: Star }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Achievements
          </div>
          <Badge variant="secondary">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                <Icon className="w-3 h-3 mr-1" />
                {category.label}
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border text-center transition-all ${
                achievement.unlockedAt
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`text-2xl mb-2 ${achievement.unlockedAt ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className={`font-medium text-sm mb-1 ${
                achievement.unlockedAt ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.title}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {achievement.description}
              </div>
              {!achievement.unlockedAt && (
                <div className="space-y-1">
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-1"
                  />
                  <div className="text-xs text-gray-500">
                    {achievement.progress}/{achievement.maxProgress}
                  </div>
                </div>
              )}
              {achievement.unlockedAt && (
                <Badge variant="secondary" className="text-xs">
                  Unlocked
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface StudyPlannerProps {
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    type: 'assignment' | 'exam' | 'project';
    dueDate: Date;
    courseTitle: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  studyGoals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    deadline: Date;
  }>;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ 
  upcomingDeadlines, 
  studyGoals 
}) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  
  const getWeekRange = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { start: startOfWeek, end: endOfWeek };
  };

  const { start: weekStart, end: weekEnd } = getWeekRange(currentWeek);
  
  const weekDeadlines = upcomingDeadlines.filter(deadline => {
    const dueDate = new Date(deadline.dueDate);
    return dueDate >= weekStart && dueDate <= weekEnd;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Study Planner
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(currentWeek - 1)}
              disabled={currentWeek <= -4}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeek(currentWeek + 1)}
              disabled={currentWeek >= 4}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Upcoming Deadlines
            </h4>
            {weekDeadlines.length > 0 ? (
              <div className="space-y-2">
                {weekDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className={`p-3 rounded-lg border ${getPriorityColor(deadline.priority)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{deadline.title}</div>
                        <div className="text-xs opacity-75">{deadline.courseTitle}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium">
                          {formatDate(deadline.dueDate)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {deadline.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No deadlines this week
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Study Goals
            </h4>
            <div className="space-y-3">
              {studyGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span className="text-sm text-gray-600">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Due: {formatDate(goal.deadline)}</span>
                    <span>{Math.round((goal.current / goal.target) * 100)}% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CourseRecommendation {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  studentsCount: number;
  price: number;
  reason: string;
  relevanceScore: number;
}

interface CourseRecommendationsProps {
  recommendations: CourseRecommendation[];
  onEnroll: (courseId: string) => void;
  onViewCourse: (courseId: string) => void;
}

export const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({
  recommendations,
  onEnroll,
  onViewCourse
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((course) => (
            <div key={course.id} className="flex space-x-4 p-3 rounded-lg border hover:shadow-md transition-shadow">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{course.title}</h4>
                <p className="text-xs text-gray-600 mb-1">{course.instructor}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs ml-1">{course.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {course.studentsCount.toLocaleString()} students
                  </span>
                </div>
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {course.reason}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-600 mb-2">
                  ₹{course.price.toLocaleString()}
                </div>
                <div className="space-y-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewCourse(course.id)}
                    className="w-full text-xs"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onEnroll(course.id)}
                    className="w-full text-xs"
                  >
                    Enroll
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};