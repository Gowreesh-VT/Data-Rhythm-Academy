import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Video, 
  VideoOff,
  Mic, 
  MicOff,
  Users, 
  MessageSquare,
  Share,
  Settings,
  Circle,
  StopCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ScreenShare,
  Hand,
  Clock,
  Calendar,
  Monitor,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  Upload,
  Activity,
  Plus
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface LiveClassSession {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  startTime: Date;
  duration: number;
  status: 'scheduled' | 'live' | 'ended';
  attendeeCount: number;
  maxAttendees: number;
  recordingEnabled: boolean;
  isRecording: boolean;
  meetingUrl: string;
}

interface Attendee {
  id: string;
  name: string;
  avatar: string;
  joinTime: Date;
  isOnline: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  hasRaisedHand: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

interface ClassMetrics {
  averageAttendance: number;
  engagementScore: number;
  chatMessages: number;
  questionsAsked: number;
  handRaises: number;
  averageSessionDuration: number;
}

interface InstructorLiveClassConsoleProps {
  instructorId: string;
  onNavigate: (path: string) => void;
}

export const InstructorLiveClassConsole: React.FC<InstructorLiveClassConsoleProps> = ({ 
  instructorId, 
  onNavigate 
}) => {
  const { success, error } = useToast();
  const [currentSession, setCurrentSession] = useState<LiveClassSession | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveClassSession[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [classMetrics, setClassMetrics] = useState<ClassMetrics | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  useEffect(() => {
    loadLiveClassData();
    const interval = setInterval(loadLiveClassData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [instructorId]);

  const loadLiveClassData = async () => {
    // TODO: Replace with actual Firebase queries
    // Real data loading from Firestore:
    // - Load instructor's live class sessions from 'live_sessions' collection
    // - Load upcoming scheduled sessions
    // - Load session attendees from 'session_attendees' collection
    // - Calculate metrics from session data
    
    // For now, set empty/null values until real data integration

    setCurrentSession(null);
    setUpcomingSessions([]);
    setAttendees([]);
    setClassMetrics({
      averageAttendance: 0,
      engagementScore: 0,
      chatMessages: 0,
      questionsAsked: 0,
      handRaises: 0,
      averageSessionDuration: 0
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    success('Video Updated', `Video ${!isVideoEnabled ? 'enabled' : 'disabled'}`);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    success('Audio Updated', `Audio ${!isAudioEnabled ? 'enabled' : 'disabled'}`);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    success('Screen Share', `Screen sharing ${!isScreenSharing ? 'started' : 'stopped'}`);
  };

  const toggleRecording = () => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        isRecording: !currentSession.isRecording
      });
      success('Recording Updated', `Recording ${!currentSession.isRecording ? 'started' : 'stopped'}`);
    }
  };

  const startClass = (sessionId: string) => {
    const session = upcomingSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession({ ...session, status: 'live', attendeeCount: 1 });
      setUpcomingSessions(upcomingSessions.filter(s => s.id !== sessionId));
      success('Class Started', 'Your live class session has begun');
    }
  };

  const endClass = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, status: 'ended' });
      success('Class Ended', 'Your live class session has ended');
      setTimeout(() => setCurrentSession(null), 2000);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConnectionIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Wifi className="w-4 h-4 text-green-500" />;
      case 'good': return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <WifiOff className="w-4 h-4 text-red-500" />;
      default: return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Class Console</h1>
          <p className="text-gray-600 mt-1">Manage your live teaching sessions and student interactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : connectionStatus === 'connecting' ? (
              <Activity className="w-5 h-5 text-yellow-500 animate-pulse" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
          </div>
          <Button onClick={() => onNavigate('/analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {currentSession ? (
        /* Live Class Interface */
        <div className="space-y-6">
          {/* Live Session Header */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-semibold">LIVE</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentSession.title}</h2>
                    <p className="text-gray-600">{currentSession.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{formatDuration(45)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Attendees</p>
                    <p className="font-semibold">{currentSession.attendeeCount}/{currentSession.maxAttendees}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Class Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant={isVideoEnabled ? "default" : "destructive"}
                      onClick={toggleVideo}
                      className="flex flex-col items-center space-y-2 h-auto py-4"
                    >
                      {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                      <span className="text-xs">Video</span>
                    </Button>
                    
                    <Button 
                      variant={isAudioEnabled ? "default" : "destructive"}
                      onClick={toggleAudio}
                      className="flex flex-col items-center space-y-2 h-auto py-4"
                    >
                      {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                      <span className="text-xs">Audio</span>
                    </Button>
                    
                    <Button 
                      variant={isScreenSharing ? "default" : "outline"}
                      onClick={toggleScreenShare}
                      className="flex flex-col items-center space-y-2 h-auto py-4"
                    >
                      <ScreenShare className="w-6 h-6" />
                      <span className="text-xs">Share</span>
                    </Button>
                    
                    <Button 
                      variant={currentSession.isRecording ? "destructive" : "outline"}
                      onClick={toggleRecording}
                      className="flex flex-col items-center space-y-2 h-auto py-4"
                    >
                      {currentSession.isRecording ? <StopCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      <span className="text-xs">Record</span>
                    </Button>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Button variant="destructive" onClick={endClass} size="lg">
                      End Class
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Class Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{classMetrics?.chatMessages}</p>
                      <p className="text-sm text-gray-600">Chat Messages</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{classMetrics?.questionsAsked}</p>
                      <p className="text-sm text-gray-600">Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{classMetrics?.handRaises}</p>
                      <p className="text-sm text-gray-600">Hand Raises</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{classMetrics?.engagementScore}%</p>
                      <p className="text-sm text-gray-600">Engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendees Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Attendees ({attendees.length})</span>
                    <Users className="w-5 h-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center space-x-3 p-4 border-b hover:bg-gray-50">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{attendee.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getConnectionIcon(attendee.connectionQuality)}
                            <span className="text-xs text-gray-500">
                              {formatTime(attendee.joinTime)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {attendee.hasRaisedHand && (
                            <Hand className="w-4 h-4 text-yellow-500" />
                          )}
                          {attendee.hasVideo ? (
                            <Video className="w-4 h-4 text-green-500" />
                          ) : (
                            <VideoOff className="w-4 h-4 text-gray-400" />
                          )}
                          {attendee.hasAudio ? (
                            <Mic className="w-4 h-4 text-green-500" />
                          ) : (
                            <MicOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Share Meeting Link
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Attendance
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* No Active Session */
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Live Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{session.title}</h3>
                        <p className="text-gray-600">{session.courseName}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(session.startTime)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {session.startTime.toLocaleDateString()}
                          </span>
                          <span>{formatDuration(session.duration)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button onClick={() => startClass(session.id)} size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Start Class
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Sessions</h3>
                  <p className="text-gray-600 mb-4">Schedule your next live class to engage with students</p>
                  <Button onClick={() => onNavigate('/schedule')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule New Class
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          {classMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Average Attendance</span>
                      <span className="text-sm text-gray-600">{classMetrics.averageAttendance}%</span>
                    </div>
                    <Progress value={classMetrics.averageAttendance} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <span className="text-sm text-gray-600">{classMetrics.engagementScore}%</span>
                    </div>
                    <Progress value={classMetrics.engagementScore} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Session Duration</span>
                      <span className="text-sm text-gray-600">{classMetrics.averageSessionDuration}%</span>
                    </div>
                    <Progress value={classMetrics.averageSessionDuration} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};