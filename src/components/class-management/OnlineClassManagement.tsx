import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Monitor,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share,
  MessageSquare,
  Hand,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  ExternalLink,
  Bell,
  Copy,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FileText,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface OnlineClass {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  scheduledAt: Date;
  duration: number;
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  platform: 'zoom' | 'meet' | 'teams' | 'custom';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendees: string[];
  maxAttendees?: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

interface ClassAttendance {
  userId: string;
  userName: string;
  joinTime: Date;
  leaveTime?: Date;
  duration: number;
  participationScore: number;
  status: 'present' | 'late' | 'absent';
}

interface OnlineClassManagementProps {
  onNavigate: (path: string) => void;
  userRole: 'student' | 'instructor' | 'admin';
  userId: string;
}

export const OnlineClassManagement: React.FC<OnlineClassManagementProps> = ({ 
  onNavigate, 
  userRole,
  userId 
}) => {
  const { success, error, warning } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedClass, setSelectedClass] = useState<OnlineClass | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<OnlineClass[]>([]);
  const [ongoingClasses, setOngoingClasses] = useState<OnlineClass[]>([]);
  const [completedClasses, setCompletedClasses] = useState<OnlineClass[]>([]);
  const [attendance, setAttendance] = useState<ClassAttendance[]>([]);
  const [classStats, setClassStats] = useState({
    totalClasses: 0,
    attendedClasses: 0,
    averageAttendance: 0,
    upcomingToday: 0
  });

  // Audio/Video controls state (for when in a live class)
  const [mediaControls, setMediaControls] = useState({
    camera: true,
    microphone: true,
    screenShare: false,
    recording: false
  });

  useEffect(() => {
    loadClassData();
    // Set up real-time listeners for class updates
    const interval = setInterval(loadClassData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const loadClassData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockUpcoming: OnlineClass[] = [
        {
          id: 'class-1',
          title: 'Python Fundamentals - Session 5',
          description: 'Object-Oriented Programming Concepts',
          courseId: 'course-1',
          courseName: 'Introduction To Python',
          instructorId: 'instructor-1',
          instructorName: 'Dr. Sarah Johnson',
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          duration: 90,
          meetingLink: 'https://meet.google.com/python-session-5',
          meetingId: 'python-session-5',
          platform: 'meet',
          status: 'scheduled',
          attendees: ['user1', 'user2', 'user3'],
          maxAttendees: 50,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'class-2',
          title: 'Data Science Workshop',
          description: 'Hands-on Data Analysis with Pandas',
          courseId: 'course-2',
          courseName: 'Data Science Masterclass',
          instructorId: 'instructor-2',
          instructorName: 'Alex Chen',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          duration: 120,
          meetingLink: 'https://zoom.us/j/datascience-workshop',
          meetingId: 'datascience-workshop',
          platform: 'zoom',
          status: 'scheduled',
          attendees: ['user1', 'user4', 'user5'],
          maxAttendees: 30,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockOngoing: OnlineClass[] = [
        {
          id: 'class-live-1',
          title: 'Machine Learning Live Q&A',
          description: 'Weekly doubt clearing session',
          courseId: 'course-3',
          courseName: 'Machine Learning Fundamentals',
          instructorId: 'instructor-3',
          instructorName: 'Dr. Michael Rodriguez',
          scheduledAt: new Date(Date.now() - 30 * 60 * 1000), // Started 30 mins ago
          duration: 60,
          meetingLink: 'https://meet.google.com/ml-qa-session',
          meetingId: 'ml-qa-session',
          platform: 'meet',
          status: 'ongoing',
          attendees: ['user1', 'user6', 'user7', 'user8'],
          maxAttendees: 25,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setUpcomingClasses(mockUpcoming);
      setOngoingClasses(mockOngoing);
      
      // Calculate stats
      setClassStats({
        totalClasses: mockUpcoming.length + mockOngoing.length + 5, // +5 for completed
        attendedClasses: 12,
        averageAttendance: 85,
        upcomingToday: mockUpcoming.filter(cls => 
          new Date(cls.scheduledAt).toDateString() === new Date().toDateString()
        ).length
      });

    } catch (err) {
      error('Failed to load class data', 'Please try refreshing the page.');
    }
  };

  const joinClass = async (classData: OnlineClass) => {
    try {
      if (!classData.meetingLink) {
        warning('Meeting Not Available', 'Meeting link will be available 15 minutes before class starts.');
        return;
      }

      // Record attendance
      const attendanceRecord = {
        userId,
        userName: 'Student User', // Replace with actual user name
        joinTime: new Date(),
        duration: 0,
        participationScore: 0,
        status: 'present' as const
      };

      // Open meeting in new tab
      window.open(classData.meetingLink, '_blank');
      success('Joining Class', `Opening ${classData.platform} meeting...`);
      
      // Track attendance (mock)
      console.log('Recording attendance:', attendanceRecord);
      
    } catch (err) {
      error('Failed to Join', 'Unable to join the class. Please try again.');
    }
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    success('Copied!', 'Meeting link copied to clipboard');
  };

  const toggleMediaControl = (control: keyof typeof mediaControls) => {
    setMediaControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
    
    const actions = {
      camera: (prev: boolean) => prev ? 'Camera turned off' : 'Camera turned on',
      microphone: (prev: boolean) => prev ? 'Microphone muted' : 'Microphone unmuted',
      screenShare: (prev: boolean) => prev ? 'Screen sharing stopped' : 'Screen sharing started',
      recording: (prev: boolean) => prev ? 'Recording stopped' : 'Recording started'
    };
    
    success('Control Updated', actions[control](mediaControls[control]));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zoom': return '🟦';
      case 'meet': return '🟢';
      case 'teams': return '🟣';
      default: return '📹';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isJoinable = (classData: OnlineClass) => {
    const now = new Date();
    const classStart = new Date(classData.scheduledAt);
    const timeDiff = classStart.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Allow joining 15 minutes before and during class
    return minutesDiff <= 15 && classData.status !== 'completed';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Online Classes</h1>
          <p className="text-gray-600 mt-1">Manage your live classes, recordings, and attendance</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => onNavigate('/calendar')}>
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          {userRole === 'instructor' && (
            <Button onClick={() => warning('Coming Soon', 'Class creation feature coming soon!')}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classStats.totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attended</p>
                <p className="text-2xl font-bold text-gray-900">{classStats.attendedClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{classStats.averageAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classStats.upcomingToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming ({upcomingClasses.length})</TabsTrigger>
          <TabsTrigger value="live">Live Now ({ongoingClasses.length})</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Upcoming Classes */}
        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingClasses.map(classData => (
              <Card key={classData.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{classData.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{classData.courseName}</p>
                      <p className="text-sm text-gray-500 mt-1">{classData.description}</p>
                    </div>
                    <Badge className={getStatusColor(classData.status)}>
                      {classData.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Class Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDateTime(classData.scheduledAt)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {classData.duration} minutes
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {classData.attendees.length}/{classData.maxAttendees} students
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2">{getPlatformIcon(classData.platform)}</span>
                        {classData.platform.charAt(0).toUpperCase() + classData.platform.slice(1)}
                      </div>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {classData.instructorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{classData.instructorName}</span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Enrollment</span>
                        <span>{Math.round((classData.attendees.length / (classData.maxAttendees || 1)) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(classData.attendees.length / (classData.maxAttendees || 1)) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {isJoinable(classData) ? (
                        <Button 
                          onClick={() => joinClass(classData)} 
                          className="flex-1"
                          size="sm"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Class
                        </Button>
                      ) : (
                        <Button variant="outline" disabled className="flex-1" size="sm">
                          <Clock className="w-4 h-4 mr-2" />
                          Not Yet Available
                        </Button>
                      )}
                      
                      {classData.meetingLink && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyMeetingLink(classData.meetingLink!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => warning('Coming Soon', 'Class details page coming soon!')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {upcomingClasses.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Classes</h3>
                <p className="text-gray-600 mb-4">You don't have any scheduled classes coming up.</p>
                <Button onClick={() => onNavigate('/courses')}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Classes */}
        <TabsContent value="live" className="space-y-6">
          {ongoingClasses.length > 0 ? (
            <div className="space-y-6">
              {ongoingClasses.map(classData => (
                <Card key={classData.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-green-800">{classData.title}</CardTitle>
                        <p className="text-green-700 mt-1">{classData.courseName}</p>
                        <div className="flex items-center mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-sm font-medium text-green-700">Live Now</span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        LIVE
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Class Info */}
                      <div>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-green-700">
                            <Users className="w-4 h-4 mr-2" />
                            {classData.attendees.length} students in class
                          </div>
                          <div className="flex items-center text-sm text-green-700">
                            <Clock className="w-4 h-4 mr-2" />
                            Started {formatDateTime(classData.scheduledAt)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {classData.instructorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-green-800">{classData.instructorName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-4">
                        <Button 
                          onClick={() => joinClass(classData)} 
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="lg"
                        >
                          <Video className="w-5 h-5 mr-2" />
                          Join Live Class
                        </Button>
                        
                        {/* Media Controls (if in class) */}
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMediaControl('camera')}
                            className={!mediaControls.camera ? 'bg-red-100 text-red-700' : ''}
                          >
                            {mediaControls.camera ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMediaControl('microphone')}
                            className={!mediaControls.microphone ? 'bg-red-100 text-red-700' : ''}
                          >
                            {mediaControls.microphone ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMediaControl('screenShare')}
                            className={mediaControls.screenShare ? 'bg-blue-100 text-blue-700' : ''}
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => warning('Coming Soon', 'Chat feature coming soon!')}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Classes</h3>
                <p className="text-gray-600 mb-4">There are no live classes happening right now.</p>
                <Button onClick={() => setActiveTab('upcoming')}>
                  View Upcoming Classes
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recordings */}
        <TabsContent value="recordings" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Class Recordings</h3>
              <p className="text-gray-600 mb-4">Access recorded classes and lectures here.</p>
              <p className="text-sm text-gray-500 mb-4">Feature coming soon - recordings will be automatically available after each class.</p>
              <Button variant="outline" disabled>
                <Download className="w-4 h-4 mr-2" />
                Browse Recordings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Class Analytics</h3>
              <p className="text-gray-600 mb-4">View detailed analytics about your class participation and performance.</p>
              <p className="text-sm text-gray-500 mb-4">Coming soon - attendance tracking, participation scores, and learning insights.</p>
              <Button variant="outline" disabled>
                <Zap className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};