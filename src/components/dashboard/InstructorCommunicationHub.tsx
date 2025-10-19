import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Megaphone,
  HelpCircle,
  Star,
  Clock,
  Search,
  Filter,
  Plus,
  Bell,
  Archive,
  Pin,
  Reply,
  Forward,
  MoreHorizontal,
  Video,
  Phone,
  Mail,
  Eye,
  Calendar
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'direct' | 'announcement' | 'question';
  courseId?: string;
  attachments?: string[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  courseId: string;
  courseName: string;
  timestamp: Date;
  views: number;
  isImportant: boolean;
  targetAudience: 'all' | 'enrolled' | 'specific';
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  courseId: string;
  timestamp: Date;
  replies: number;
  lastActivity: Date;
  isSticky: boolean;
  isLocked: boolean;
  views: number;
}

interface InstructorCommunicationHubProps {
  instructorId: string;
  onNavigate: (path: string) => void;
}

export const InstructorCommunicationHub: React.FC<InstructorCommunicationHubProps> = ({ 
  instructorId, 
  onNavigate 
}) => {
  const { success, error } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadCommunicationData();
  }, [instructorId]);

  const loadCommunicationData = async () => {
    try {
      // TODO: Replace with actual Firebase queries
      // Real data loading from Firestore:
      // - Load instructor's messages from 'messages' collection
      // - Load course announcements from 'announcements' collection  
      // - Load forum topics from 'forum_topics' collection
      
      // For now, set empty arrays until real data integration
      setMessages([]);
      setAnnouncements([]);
      setForumTopics([]);
    } catch (error) {
      console.error('Error loading communication data:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: instructorId,
      senderName: 'Dr. Sarah Johnson',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor',
      recipientId: selectedConversation || '',
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
      messageType: 'direct'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');
    success('Message Sent', 'Your message has been sent successfully.');
  };

  const createAnnouncement = async (announcementData: any) => {
    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      ...announcementData,
      timestamp: new Date(),
      views: 0
    };

    setAnnouncements(prev => [announcement, ...prev]);
    setShowNewAnnouncement(false);
    success('Announcement Created', 'Your announcement has been posted successfully.');
  };

  const getUnreadCount = () => messages.filter(msg => !msg.isRead && msg.recipientId === instructorId).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
          <p className="text-gray-600 mt-1">Manage all your student communications in one place</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => onNavigate('/calendar')}>
            <Clock className="w-4 h-4 mr-2" />
            Office Hours
          </Button>
          <Dialog open={showNewAnnouncement} onOpenChange={setShowNewAnnouncement}>
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Announcement title" />
                <Textarea placeholder="Announcement content" rows={4} />
                <div className="flex space-x-2">
                  <Button onClick={() => createAnnouncement({ title: 'Sample', content: 'Sample content', courseId: 'course-1', courseName: 'Sample Course', isImportant: false, targetAudience: 'enrolled' })}>
                    Post Announcement
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewAnnouncement(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{getUnreadCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Megaphone className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Announcements</p>
                <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <HelpCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Forum Topics</p>
                <p className="text-2xl font-bold text-gray-900">{forumTopics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Communication Interface */}
      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages" className="relative">
            Messages
            {getUnreadCount() > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">{getUnreadCount()}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="forums">Discussion Forums</TabsTrigger>
          <TabsTrigger value="office-hours">Office Hours</TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Messages</span>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search messages..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer border-b ${
                          selectedConversation === message.senderId ? 'bg-blue-50' : ''
                        } ${!message.isRead && message.recipientId === instructorId ? 'font-semibold' : ''}`}
                        onClick={() => setSelectedConversation(message.senderId)}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.senderAvatar} />
                            <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {message.senderName}
                              </p>
                              <p className="text-xs text-gray-500">{formatTime(message.timestamp)}</p>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{message.content}</p>
                            {message.messageType === 'question' && (
                              <Badge variant="outline" className="mt-1">Question</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                {selectedConversation ? (
                  <>
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={messages.find(m => m.senderId === selectedConversation)?.senderAvatar} />
                            <AvatarFallback>
                              {messages.find(m => m.senderId === selectedConversation)?.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {messages.find(m => m.senderId === selectedConversation)?.senderName}
                            </h3>
                            <p className="text-sm text-gray-500">Student</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4">
                      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                        {messages
                          .filter(m => m.senderId === selectedConversation || m.recipientId === selectedConversation)
                          .map((message) => (
                          <div 
                            key={message.id}
                            className={`flex ${message.senderId === instructorId ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === instructorId 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === instructorId ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-600">Choose a message from the list to start chatting</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{announcement.title}</h3>
                        {announcement.isImportant && (
                          <Badge variant="destructive">Important</Badge>
                        )}
                        <Badge variant="outline">{announcement.courseName}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{announcement.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(announcement.timestamp)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {announcement.views} views
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Pin className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forums Tab */}
        <TabsContent value="forums" className="space-y-6">
          <div className="space-y-4">
            {forumTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold hover:text-blue-600 cursor-pointer">
                          {topic.title}
                        </h3>
                        {topic.isSticky && <Pin className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <p className="text-gray-600 mb-3">{topic.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {topic.authorName}</span>
                        <span className="flex items-center">
                          <Reply className="w-4 h-4 mr-1" />
                          {topic.replies} replies
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {topic.views} views
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(topic.lastActivity)}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Thread
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Office Hours Tab */}
        <TabsContent value="office-hours" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Office Hours Management</h3>
              <p className="text-gray-600 mb-6">Set up virtual office hours for one-on-one student consultations</p>
              <div className="space-y-4">
                <Button className="w-full max-w-md">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Office Hours
                </Button>
                <Button variant="outline" className="w-full max-w-md">
                  <Video className="w-4 h-4 mr-2" />
                  Start Instant Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};