import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Video, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Users,
  LogOut
} from 'lucide-react';

interface SlotBookingPageProps {
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
}

export function SlotBookingPage({ onNavigate, user, onLogout }: SlotBookingPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');

  const mentors = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Senior Full-Stack Developer',
      company: 'Google',
      rating: 4.9,
      reviews: 124,
      expertise: ['React', 'Node.js', 'System Design'],
      price: 150,
      avatar: 'SC',
      availability: 'High'
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Data Science Lead',
      company: 'Microsoft',
      rating: 4.8,
      reviews: 89,
      expertise: ['Python', 'ML', 'Data Analysis'],
      price: 180,
      avatar: 'MR',
      availability: 'Medium'
    },
    {
      id: '3',
      name: 'Emily Johnson',
      role: 'UX Design Director',
      company: 'Airbnb',
      rating: 4.9,
      reviews: 156,
      expertise: ['Figma', 'Design Systems', 'User Research'],
      price: 120,
      avatar: 'EJ',
      availability: 'High'
    }
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const sessionTypes = [
    { 
      id: 'mentorship', 
      name: 'Career Mentorship', 
      duration: '60 min',
      description: 'Guidance on career growth, skill development, and industry insights'
    },
    { 
      id: 'code-review', 
      name: 'Code Review', 
      duration: '45 min',
      description: 'Get your code reviewed and receive feedback on best practices'
    },
    { 
      id: 'interview-prep', 
      name: 'Interview Preparation', 
      duration: '90 min',
      description: 'Mock interviews and preparation for technical assessments'
    },
    { 
      id: 'project-help', 
      name: 'Project Assistance', 
      duration: '60 min',
      description: 'Help with specific projects, debugging, and implementation'
    }
  ];

  const selectedMentorData = mentors.find(m => m.id === selectedMentor);
  const selectedSessionData = sessionTypes.find(s => s.id === selectedSessionType);

  const handleBookSession = () => {
    if (selectedDate && selectedMentor && selectedSlot && selectedSessionType) {
      onNavigate('payment');
    }
  };

  const isSlotAvailable = (slot: string) => {
    // Mock availability logic
    const unavailableSlots = ['11:00 AM', '02:00 PM', '06:00 PM'];
    return !unavailableSlots.includes(slot);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                EduFlow
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={() => onNavigate('landing')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Book a Mentorship Session
          </h1>
          <p className="text-gray-600">
            Connect with industry experts for personalized guidance and support
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span>Session Type</span>
                  </CardTitle>
                  <CardDescription>
                    Choose the type of session that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {sessionTypes.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedSessionType === session.id
                            ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                        onClick={() => setSelectedSessionType(session.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{session.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {session.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{session.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mentor Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Choose Your Mentor</span>
                  </CardTitle>
                  <CardDescription>
                    Select an expert mentor for your session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentors.map((mentor) => (
                      <div
                        key={mentor.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedMentor === mentor.id
                            ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                        onClick={() => setSelectedMentor(mentor.id)}
                      >
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                              {mentor.avatar}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{mentor.name}</h4>
                                <p className="text-sm text-gray-600">{mentor.role} at {mentor.company}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-blue-600">${mentor.price}/hr</div>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs mt-1 ${getAvailabilityColor(mentor.availability)}`}
                                >
                                  {mentor.availability} Availability
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{mentor.rating}</span>
                                <span className="text-sm text-gray-500">({mentor.reviews} reviews)</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {mentor.expertise.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Date and Time Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <span>Select Date & Time</span>
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred date and time slot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div>
                      <h4 className="font-medium mb-3">Available Dates</h4>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                        className="border rounded-md"
                      />
                    </div>
                    
                    {/* Time Slots */}
                    <div>
                      <h4 className="font-medium mb-3">Available Times</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slot) => {
                          const available = isSlotAvailable(slot);
                          return (
                            <Button
                              key={slot}
                              variant={selectedSlot === slot ? 'default' : 'outline'}
                              className={`text-sm h-12 ${
                                selectedSlot === slot
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                  : available
                                  ? 'border-blue-200 hover:border-blue-300'
                                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                              onClick={() => available && setSelectedSlot(slot)}
                              disabled={!available}
                            >
                              {slot}
                              {!available && (
                                <div className="absolute inset-0 bg-gray-100/50 rounded-md" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                            <span>Booked</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your session details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSessionData && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-blue-900">{selectedSessionData.name}</h4>
                        <p className="text-sm text-blue-700">{selectedSessionData.duration}</p>
                      </div>
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                )}

                {selectedMentorData && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                          {selectedMentorData.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900">{selectedMentorData.name}</h4>
                        <p className="text-sm text-green-700">{selectedMentorData.role}</p>
                      </div>
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                )}

                {selectedDate && selectedSlot && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-purple-900">
                          {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h4>
                        <p className="text-sm text-purple-700">{selectedSlot}</p>
                      </div>
                      <Check className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                )}

                {selectedMentorData && selectedSessionData && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Session fee</span>
                        <span className="font-medium">${selectedMentorData.price}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Platform fee</span>
                        <span className="font-medium">$15</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                          ${selectedMentorData.price + 15}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleBookSession}
                      disabled={!selectedDate || !selectedMentor || !selectedSlot || !selectedSessionType}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6"
                    >
                      Proceed to Payment
                    </Button>
                  </>
                )}

                {(!selectedDate || !selectedMentor || !selectedSlot || !selectedSessionType) && (
                  <div className="text-center text-sm text-gray-500 py-4">
                    Complete all selections to proceed
                  </div>
                )}

                <div className="text-xs text-gray-500 text-center">
                  <p>Sessions include recording and follow-up notes</p>
                  <p className="mt-1">Free cancellation up to 24 hours before</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}