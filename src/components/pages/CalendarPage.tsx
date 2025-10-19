import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar as CalendarIcon, Clock, Video, Users, ChevronLeft, ChevronRight, ExternalLink, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dbHelpers } from '../../lib/firebase';
import { DashboardSkeleton } from '../common/LoadingStates';
import { ErrorState } from '../common/ErrorStates';
import { ScheduledClass } from '../../types';

interface CalendarPageProps {
  onNavigate: (path: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  courseTitle: string;
  courseId: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  meetingUrl?: string;
  instructorName: string;
  classType: string;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [user]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }
      
      // Get user's enrolled courses
      const { data: myCourses, error: coursesError } = await dbHelpers.getMyCourses(user.id);
      
      if (coursesError) {
        setError(coursesError);
        return;
      }

      // Extract all scheduled classes from enrolled courses
      const events: CalendarEvent[] = [];
      myCourses.forEach(({ course }) => {
        if (course.scheduledClasses) {
          course.scheduledClasses.forEach((scheduledClass: ScheduledClass) => {
            events.push({
              id: scheduledClass.id,
              title: scheduledClass.title,
              startTime: new Date(scheduledClass.startTime),
              endTime: new Date(scheduledClass.endTime),
              courseTitle: course.title,
              courseId: course.id,
              status: scheduledClass.status,
              meetingUrl: scheduledClass.meetingUrl,
              instructorName: course.instructorName,
              classType: scheduledClass.classType
            });
          });
        }
      });

      // Sort events by start time
      events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      setCalendarEvents(events);
      
    } catch (err: any) {
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Start from Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      week.push(currentDay);
    }
    return week;
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const joinClass = (event: CalendarEvent) => {
    if (event.meetingUrl) {
      window.open(event.meetingUrl, '_blank');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const exportToGoogleCalendar = (event: CalendarEvent) => {
    const startTime = event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(`Course: ${event.courseTitle}\nInstructor: ${event.instructorName}\nClass Type: ${event.classType}\n\nJoin Meeting: ${event.meetingUrl || 'TBD'}`)}`;
    window.open(googleCalendarUrl, '_blank');
  };

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} onRetry={loadCalendarData} />;

  const weekDates = getWeekDates(currentDate);
  const upcomingEvents = calendarEvents
    .filter(event => event.startTime > new Date())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => onNavigate('/')}>
                Data Rhythm Academy
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => onNavigate('/courses')} className="text-gray-700 hover:text-blue-600">
                Courses
              </button>
              <button onClick={() => onNavigate('/my-courses')} className="text-gray-700 hover:text-blue-600">
                My Courses
              </button>
              <button onClick={() => onNavigate('/calendar')} className="text-blue-600 font-medium">
                Calendar
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Class Calendar</h1>
            <p className="text-gray-600">View and manage your upcoming live classes</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
            <div className="flex rounded-md shadow-sm">
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button 
                variant={viewMode === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2" />
                    {viewMode === 'week' ? 'Week View' : 'Month View'}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-medium text-lg px-4">
                      {currentDate.toLocaleDateString('en-IN', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'week' && (
                  <div className="space-y-4">
                    {weekDates.map((date, index) => {
                      const dayEvents = getEventsForDate(date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border-2 ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`font-semibold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                              {date.toLocaleDateString('en-IN', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                              {isToday && <span className="text-blue-600 ml-2">(Today)</span>}
                            </h3>
                            <Badge variant="outline">
                              {dayEvents.length} {dayEvents.length === 1 ? 'class' : 'classes'}
                            </Badge>
                          </div>
                          
                          {dayEvents.length > 0 ? (
                            <div className="space-y-2">
                              {dayEvents.map(event => (
                                <div
                                  key={event.id}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                                    <p className="text-sm text-gray-600">{event.courseTitle}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                      <span className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                      </span>
                                      <span className="flex items-center">
                                        <Users className="w-3 h-3 mr-1" />
                                        {event.instructorName}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getStatusColor(event.status)}>
                                      {event.status}
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => exportToGoogleCalendar(event)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    {event.status === 'live' && event.meetingUrl && (
                                      <Button
                                        size="sm"
                                        onClick={() => joinClass(event)}
                                      >
                                        <Video className="w-4 h-4 mr-1" />
                                        Join
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm italic">No classes scheduled</p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Upcoming Classes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map(event => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{event.courseTitle}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {formatDate(event.startTime)}
                          </span>
                          <Badge className={getStatusColor(event.status)}>
                            {formatTime(event.startTime)}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No upcoming classes</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => onNavigate('/courses')}
                    >
                      Browse Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Classes</span>
                    <Badge variant="outline">
                      {weekDates.reduce((total, date) => total + getEventsForDate(date).length, 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Live Classes</span>
                    <Badge className="bg-red-500">
                      {calendarEvents.filter(e => e.status === 'live').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <Badge className="bg-green-500">
                      {calendarEvents.filter(e => e.status === 'completed').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};