import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  ExternalLink,
  Copy,
  Bell,
  MapPin,
  Globe,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ClassSchedule {
  id: string;
  title: string;
  courseName: string;
  instructorName: string;
  scheduledAt: Date;
  duration: number;
  meetingLink: string;
  meetingId: string;
  platform: 'meet' | 'zoom' | 'teams';
  status: 'upcoming' | 'live' | 'completed';
  enrolledStudents: number;
  maxStudents: number;
  description?: string;
}

interface ClassTimetableProps {
  onNavigate: (path: string) => void;
  userId: string;
}

export const ClassTimetable: React.FC<ClassTimetableProps> = ({ onNavigate, userId }) => {
  const { success, error, warning } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklySchedule, setWeeklySchedule] = useState<ClassSchedule[]>([]);
  const [todayClasses, setTodayClasses] = useState<ClassSchedule[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassSchedule[]>([]);

  useEffect(() => {
    loadSchedule();
    const interval = setInterval(loadSchedule, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadSchedule = () => {
    // Mock data - replace with actual API call
    const mockSchedule: ClassSchedule[] = [
      {
        id: 'class-1',
        title: 'Python Fundamentals - Session 5',
        courseName: 'Introduction To Python',
        instructorName: 'Dr. Sarah Johnson',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        duration: 90,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        meetingId: 'abc-defg-hij',
        platform: 'meet',
        status: 'upcoming',
        enrolledStudents: 28,
        maxStudents: 50,
        description: 'Object-Oriented Programming Concepts'
      },
      {
        id: 'class-2',
        title: 'Data Structures - Arrays & Lists',
        courseName: 'DSA in Python',
        instructorName: 'Dr. Michael Rodriguez',
        scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        duration: 120,
        meetingLink: 'https://meet.google.com/xyz-abcd-efgh',
        meetingId: 'xyz-abcd-efgh',
        platform: 'meet',
        status: 'upcoming',
        enrolledStudents: 22,
        maxStudents: 30,
        description: 'Deep dive into array operations and list comprehensions'
      },
      {
        id: 'class-3',
        title: 'Machine Learning Workshop',
        courseName: 'Foundation in Machine Learning',
        instructorName: 'Alex Chen',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 180,
        meetingLink: 'https://meet.google.com/ml-workshop-session',
        meetingId: 'ml-workshop-session',
        platform: 'meet',
        status: 'upcoming',
        enrolledStudents: 35,
        maxStudents: 40,
        description: 'Hands-on ML model building workshop'
      },
      {
        id: 'class-4',
        title: 'Live Q&A Session',
        courseName: 'Data Science Masterclass',
        instructorName: 'Dr. Sarah Johnson',
        scheduledAt: new Date(Date.now() - 30 * 60 * 1000), // Started 30 mins ago
        duration: 60,
        meetingLink: 'https://meet.google.com/qa-session-live',
        meetingId: 'qa-session-live',
        platform: 'meet',
        status: 'live',
        enrolledStudents: 18,
        maxStudents: 25,
        description: 'Weekly doubt clearing session'
      }
    ];

    setWeeklySchedule(mockSchedule);
    
    // Filter today's classes
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const todayClassList = mockSchedule.filter(cls => {
      const classDate = new Date(cls.scheduledAt);
      return classDate >= todayStart && classDate < todayEnd;
    });
    
    setTodayClasses(todayClassList);
    setUpcomingClasses(mockSchedule.filter(cls => cls.status === 'upcoming'));
  };

  const joinClass = (classData: ClassSchedule) => {
    if (!classData.meetingLink) {
      warning('Meeting Not Available', 'Meeting link will be available 15 minutes before class starts.');
      return;
    }

    // Open Google Meet in new tab
    window.open(classData.meetingLink, '_blank');
    success('Joining Class', 'Opening Google Meet...');
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    success('Link Copied!', 'Google Meet link copied to clipboard');
  };

  const isJoinable = (classData: ClassSchedule) => {
    if (classData.status === 'live') return true;
    
    const now = new Date();
    const classStart = new Date(classData.scheduledAt);
    const timeDiff = classStart.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Allow joining 15 minutes before class
    return minutesDiff <= 15 && minutesDiff >= -30; // Can join 15 min before, 30 min after start
  };

  const getTimeUntilClass = (scheduledAt: Date) => {
    const now = new Date();
    const timeDiff = new Date(scheduledAt).getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (timeDiff < 0) return 'Started';
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'meet': return 'bg-green-100 text-green-800';
      case 'zoom': return 'bg-blue-100 text-blue-800';
      case 'teams': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800 animate-pulse';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Timetable</h1>
          <p className="text-gray-600 mt-1">Your scheduled live classes with Google Meet links</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => onNavigate('/calendar')}>
            <Calendar className="w-4 h-4 mr-2" />
            Full Calendar
          </Button>
          <Button onClick={() => success('Notifications Enabled', 'You will receive reminders 15 minutes before each class.')}>
            <Bell className="w-4 h-4 mr-2" />
            Set Reminders
          </Button>
        </div>
      </div>

      {/* Today's Classes - Highlight */}
      {todayClasses.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayClasses.map(classData => (
                <Card key={classData.id} className="bg-white border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{classData.title}</h3>
                        <p className="text-sm text-gray-600">{classData.courseName}</p>
                      </div>
                      <Badge className={getStatusColor(classData.status)}>
                        {classData.status === 'live' ? '🔴 LIVE' : getTimeUntilClass(classData.scheduledAt)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(classData.scheduledAt)} ({classData.duration} mins)
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {classData.enrolledStudents}/{classData.maxStudents} students
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Google Meet
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {classData.instructorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{classData.instructorName}</span>
                    </div>

                    <div className="flex space-x-2">
                      {isJoinable(classData) ? (
                        <Button 
                          onClick={() => joinClass(classData)} 
                          className="flex-1"
                          size="sm"
                          variant={classData.status === 'live' ? 'default' : 'outline'}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          {classData.status === 'live' ? 'Join Now' : 'Join Class'}
                        </Button>
                      ) : (
                        <Button variant="outline" disabled className="flex-1" size="sm">
                          <Clock className="w-4 h-4 mr-2" />
                          Not Available Yet
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyMeetingLink(classData.meetingLink)}
                        className="flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            This Week's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingClasses.map(classData => (
              <div 
                key={classData.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Time Column */}
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-bold text-gray-900">
                      {formatTime(classData.scheduledAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(classData.scheduledAt).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  {/* Class Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{classData.title}</h3>
                        <p className="text-sm text-gray-600">{classData.courseName}</p>
                        {classData.description && (
                          <p className="text-xs text-gray-500 mt-1">{classData.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <Badge className={getPlatformColor(classData.platform)}>
                          Google Meet
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {classData.duration} mins
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {classData.instructorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700">{classData.instructorName}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        {classData.enrolledStudents}/{classData.maxStudents}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {isJoinable(classData) ? (
                    <Button 
                      onClick={() => joinClass(classData)} 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join
                    </Button>
                  ) : (
                    <Button variant="outline" disabled size="sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {getTimeUntilClass(classData.scheduledAt)}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyMeetingLink(classData.meetingLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(classData.meetingLink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {upcomingClasses.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Scheduled</h3>
              <p className="text-gray-600 mb-4">You don't have any upcoming classes this week.</p>
              <Button onClick={() => onNavigate('/courses')}>
                Browse Courses
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">One-Click Join</h3>
              <p className="text-sm text-gray-600">Click "Join" to instantly connect to Google Meet</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Reminders</h3>
              <p className="text-sm text-gray-600">Get notified 15 minutes before each class</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Google Meet Integration</h3>
              <p className="text-sm text-gray-600">Seamless video conferencing experience</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};