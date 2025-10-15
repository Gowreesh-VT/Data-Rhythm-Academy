import React, { useState, useEffect } from 'react';
import { Course, User } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../utils/logger';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Edit,
  Eye,
  BarChart3,
  Calendar,
  Star,
  PlayCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInstructorCourses, createCourse } from '../lib/database';

interface InstructorDashboardProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '' as any,
    level: '' as any,
    language: 'English',
    price: 0,
    duration: 0,
    thumbnailUrl: '',
    learningObjectives: [''],
    prerequisites: [''],
    tags: ''
  });

  useEffect(() => {
    if (user) {
      loadInstructorData();
    }
  }, [user]);

  const loadInstructorData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch instructor's courses from database
      const coursesResult = await getInstructorCourses(user.id);
      if (coursesResult.error) {
        console.error('Error loading instructor courses:', coursesResult.error);
        setCourses([]);
      } else {
        const instructorCourses = coursesResult.data || [];
        setCourses(instructorCourses);
        
        // Calculate stats based on real data
        const totalStudents = instructorCourses.reduce((acc: number, course: Course) => acc + course.totalStudents, 0);
        const totalRevenue = instructorCourses.reduce((acc: number, course: Course) => acc + (course.price * course.totalStudents), 0);
        const averageRating = instructorCourses.length > 0 
          ? instructorCourses.reduce((acc: number, course: Course) => acc + course.rating, 0) / instructorCourses.length 
          : 0;
        
        setStats({
          totalCourses: instructorCourses.length,
          totalStudents,
          totalRevenue,
          averageRating: Math.round(averageRating * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error loading instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!user?.id) return;
    
    try {
      const courseData = {
        ...newCourse,
        instructorId: user.id,
        instructorName: user.displayName || user.email || 'Unknown Instructor',
        rating: 0,
        totalRatings: 0,
        totalStudents: 0,
        lessons: [],
        learningObjectives: newCourse.learningObjectives.filter(obj => obj.trim() !== ''),
        prerequisites: newCourse.prerequisites.filter(req => req.trim() !== ''),
        tags: newCourse.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        isPublished: false,
        currency: '$',
        thumbnailUrl: newCourse.thumbnailUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        // Online course specific features
        isOnline: true as const,
        hasLiveSupport: true,
        discussionEnabled: true,
        downloadableResources: true,
        mobileAccess: true,
        lifetimeAccess: true,
        completionCertificate: true,
        closedCaptions: false,
        // Scheduled class features - required properties
        scheduledClasses: [],
        classSchedule: {
          courseId: '',
          pattern: 'weekly' as const,
          daysOfWeek: [1, 3], // Monday and Wednesday
          startTime: '10:00',
          duration: 90, // 90 minutes
          timezone: 'UTC',
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          totalClasses: 12,
          classFrequency: 'Every Monday & Wednesday'
        },
        recordedClassesAvailable: true,
        classNotifications: true
      };

      const result = await createCourse(courseData);
      if (result.error) {
        console.error('Error creating course:', result.error);
        showError('Course Creation Failed', 'Error creating course. Please try again.');
      } else {
        console.log('Course created successfully:', result.data);
        setShowCreateCourse(false);
        // Reset form
        setNewCourse({
          title: '',
          description: '',
          shortDescription: '',
          category: '' as any,
          level: '' as any,
          language: 'English',
          price: 0,
          duration: 0,
          thumbnailUrl: '',
          learningObjectives: [''],
          prerequisites: [''],
          tags: ''
        });
        // Reload courses
        loadInstructorData();
      }
    } catch (error) {
      console.error('Error creating course:', error);
      showError('Course Creation Failed', 'Error creating course. Please try again.');
    }
  };

  const handleEditCourse = (courseId: string) => {
    onNavigate(`/course/${courseId}/edit`);
  };

  const handleViewCourse = (courseId: string) => {
    onNavigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <button onClick={() => onNavigate('/courses')} className="text-blue-600 font-medium">
                Browse Courses
              </button>
              <button onClick={() => onNavigate('/profile')} className="text-gray-700 hover:text-blue-600">
                Profile
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Hello, {user.displayName || user.email}</span>
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => onNavigate('/login')}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Courses</CardTitle>
            <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Course Title</label>
                    <Input 
                      value={newCourse.title}
                      onChange={(e) => setNewCourse(prev => ({...prev, title: e.target.value}))}
                      placeholder="Enter course title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Short Description</label>
                    <Input 
                      value={newCourse.shortDescription}
                      onChange={(e) => setNewCourse(prev => ({...prev, shortDescription: e.target.value}))}
                      placeholder="Brief course description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Full Description</label>
                    <Textarea 
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({...prev, description: e.target.value}))}
                      placeholder="Detailed course description"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={newCourse.category} onValueChange={(value) => setNewCourse(prev => ({...prev, category: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                          <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Level</label>
                      <Select value={newCourse.level} onValueChange={(value) => setNewCourse(prev => ({...prev, level: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Price ($)</label>
                      <Input 
                        type="number"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration (hours)</label>
                      <Input 
                        type="number"
                        value={newCourse.duration}
                        onChange={(e) => setNewCourse(prev => ({...prev, duration: parseFloat(e.target.value) || 0}))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <Input 
                      value={newCourse.tags}
                      onChange={(e) => setNewCourse(prev => ({...prev, tags: e.target.value}))}
                      placeholder="python, data science, beginner"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateCourse(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCourse}>
                      Create Course
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.shortDescription}</p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-sm font-medium">${course.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {course.totalStudents}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {course.rating || 'N/A'}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewCourse(course.id)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => handleEditCourse(course.id)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};