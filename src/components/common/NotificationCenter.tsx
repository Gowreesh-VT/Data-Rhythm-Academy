import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Bell, 
  Calendar, 
  BookOpen, 
  Award, 
  MessageCircle,
  Settings,
  Clock,
  Star,
  CheckCircle2,
  X,
  Filter,
  Mail,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'class' | 'assignment' | 'achievement' | 'course' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionable?: {
    label: string;
    action: () => void;
  };
  metadata?: {
    courseId?: string;
    classId?: string;
    achievementId?: string;
  };
}

interface NotificationSettings {
  classReminders: boolean;
  assignmentDeadlines: boolean;
  courseUpdates: boolean;
  achievements: boolean;
  socialUpdates: boolean;
  systemNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
}

interface NotificationCenterProps {
  onNavigate: (path: string) => void;
  userId: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    classReminders: true,
    assignmentDeadlines: true,
    courseUpdates: true,
    achievements: true,
    socialUpdates: false,
    systemNotifications: true,
    pushNotifications: true,
    emailNotifications: false,
    soundEnabled: true
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'class' | 'assignment' | 'achievement'>('all');
  const [loading, setLoading] = useState(false);

  // Mock notifications for demonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'class',
        title: 'Live Class Starting Soon',
        message: 'React Fundamentals class starts in 15 minutes',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        priority: 'high',
        actionable: {
          label: 'Join Class',
          action: () => onNavigate('/calendar')
        },
        metadata: { classId: 'class-1' }
      },
      {
        id: '2',
        type: 'assignment',
        title: 'Assignment Due Tomorrow',
        message: 'JavaScript Basics assignment is due tomorrow at 11:59 PM',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        priority: 'high',
        actionable: {
          label: 'View Assignment',
          action: () => onNavigate('/assignments')
        }
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Achievement Unlocked! 🏆',
        message: 'You completed your first course! Well done!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
        priority: 'medium'
      },
      {
        id: '4',
        type: 'course',
        title: 'New Lesson Available',
        message: 'Advanced React Patterns lesson has been added to your course',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: false,
        priority: 'medium',
        actionable: {
          label: 'Start Lesson',
          action: () => onNavigate('/my-courses')
        },
        metadata: { courseId: 'react-course' }
      },
      {
        id: '5',
        type: 'social',
        title: 'New Discussion Reply',
        message: 'Sarah replied to your question in Python Basics discussion',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: true,
        priority: 'low'
      }
    ];
    setNotifications(mockNotifications);
  }, [onNavigate]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'class': return Calendar;
      case 'assignment': return BookOpen;
      case 'achievement': return Award;
      case 'course': return BookOpen;
      case 'social': return MessageCircle;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Here you would save to backend/localStorage
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filter Tabs */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {['all', 'unread', 'class', 'assignment', 'achievement'].map((filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterType as any)}
                    className="capitalize"
                  >
                    {filterType === 'all' && <Filter className="w-3 h-3 mr-1" />}
                    {filterType === 'unread' && <Mail className="w-3 h-3 mr-1" />}
                    {filterType === 'class' && <Calendar className="w-3 h-3 mr-1" />}
                    {filterType === 'assignment' && <BookOpen className="w-3 h-3 mr-1" />}
                    {filterType === 'achievement' && <Award className="w-3 h-3 mr-1" />}
                    {filterType}
                    {filterType === 'unread' && unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <Card
                    key={notification.id}
                    className={`border-l-4 transition-all hover:shadow-sm ${
                      notification.read ? 'opacity-70' : ''
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs capitalize"
                                >
                                  {notification.type}
                                </Badge>
                                {notification.priority === 'high' && (
                                  <Badge variant="destructive" className="text-xs">
                                    High Priority
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {notification.actionable && (
                                <Button 
                                  size="sm" 
                                  onClick={notification.actionable.action}
                                >
                                  {notification.actionable.label}
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Learning Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Class Reminders</label>
                      <p className="text-sm text-gray-600">Get notified before live classes</p>
                    </div>
                    <Switch
                      checked={settings.classReminders}
                      onCheckedChange={(checked) => updateSetting('classReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Assignment Deadlines</label>
                      <p className="text-sm text-gray-600">Reminders for upcoming due dates</p>
                    </div>
                    <Switch
                      checked={settings.assignmentDeadlines}
                      onCheckedChange={(checked) => updateSetting('assignmentDeadlines', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Course Updates</label>
                      <p className="text-sm text-gray-600">New lessons and course content</p>
                    </div>
                    <Switch
                      checked={settings.courseUpdates}
                      onCheckedChange={(checked) => updateSetting('courseUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Achievements</label>
                      <p className="text-sm text-gray-600">Celebrate your learning milestones</p>
                    </div>
                    <Switch
                      checked={settings.achievements}
                      onCheckedChange={(checked) => updateSetting('achievements', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Social & System</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Social Updates</label>
                      <p className="text-sm text-gray-600">Discussion replies and peer interactions</p>
                    </div>
                    <Switch
                      checked={settings.socialUpdates}
                      onCheckedChange={(checked) => updateSetting('socialUpdates', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">System Notifications</label>
                      <p className="text-sm text-gray-600">Important system updates and maintenance</p>
                    </div>
                    <Switch
                      checked={settings.systemNotifications}
                      onCheckedChange={(checked) => updateSetting('systemNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Delivery Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Push Notifications</label>
                      <p className="text-sm text-gray-600">Browser and mobile push notifications</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Email Notifications</label>
                      <p className="text-sm text-gray-600">Important updates via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {settings.soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      )}
                      <label className="font-medium">Sound Effects</label>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};