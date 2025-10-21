import React, { useState, useEffect, useRef } from 'react';
import { User, UserManagementData, NavigatePath, Course } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Settings,
  Activity,
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Eye,
  LogOut,
  BookOpen,
  TrendingUp,
  DollarSign,
  BarChart3,
  CreditCard,
  Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ImageWithFallback } from './common/ImageWithFallback';
import { 
  getAllUsers, 
  updateUserRole, 
  updateUserStatus, 
  getUserManagementStats,
  getAllCourses,
  updateCourse,
  generateUniqueId,
  assignUniqueId,
  getAvailableInstructors,
  createCourse
} from '../lib/database';
import { logger } from '../utils/logger';

interface AdminDashboardProps {
  onNavigate: (path: NavigatePath) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserManagementData | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Course management states
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<Course | null>(null);
  const [showCourseEditModal, setShowCourseEditModal] = useState(false);
  const [updatingCourse, setUpdatingCourse] = useState(false);
  
  // Course creation states
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [availableInstructors, setAvailableInstructors] = useState<User[]>([]);
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Unique ID management states
  const [showUniqueIdModal, setShowUniqueIdModal] = useState(false);
  const [selectedUserForId, setSelectedUserForId] = useState<User | null>(null);
  const [newUniqueId, setNewUniqueId] = useState('');
  const [assigningUniqueId, setAssigningUniqueId] = useState(false);

  // Refs to prevent auto-close on modal mount
  const courseEditModalJustOpened = useRef(false);
  const userModalJustOpened = useRef(false);
  const createCourseModalJustOpened = useRef(false);

  // Load data on mount
  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
      loadCoursesData();
      loadInstructorsData();
    }
  }, [user]);
  
  // Load instructors
  const loadInstructorsData = async () => {
    try {
      const instructorsResult = await getAvailableInstructors();
      if (instructorsResult.data) {
        setAvailableInstructors(instructorsResult.data);
      }
    } catch (error) {
      logger.error('Error loading instructors:', error);
    }
  };

  // Load admin data (users and stats)
  const loadAdminData = async () => {
    try {
      setLoading(true);
      logger.info('Loading admin data...');

      const [usersResult, statsResult] = await Promise.all([
        getAllUsers(),
        getUserManagementStats()
      ]);

      if (usersResult.data) {
        setUsers(usersResult.data);
        setFilteredUsers(usersResult.data);
        logger.info(`Loaded ${usersResult.data.length} users`);
      }

      if (statsResult.data) {
        setStats(statsResult.data);
      }

      setLoading(false);
    } catch (err) {
      logger.error('Error loading admin data:', err);
      setError('Failed to load admin data');
      setLoading(false);
    }
  };

  // Load courses data
  const loadCoursesData = async () => {
    try {
      const coursesResult = await getAllCourses();
      if (coursesResult.data) {
        setCourses(coursesResult.data);
        logger.info(`Loaded ${coursesResult.data.length} courses`);
      }
    } catch (err) {
      logger.error('Error loading courses:', err);
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => (u.profileStatus || 'active') === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  // Handle course enrollment type update
  const handleUpdateCourseEnrollmentType = async (courseId: string, enrollmentType: 'direct' | 'enquiry') => {
    try {
      setUpdatingCourse(true);

      if (!user) {
        showError('Authentication Error', 'You must be logged in');
        return;
      }

      const result = await updateCourse(courseId, { enrollmentType }, user.id);

      if (result.error) {
        showError('Update Failed', result.error.message || 'Failed to update course enrollment type');
        return;
      }

      // Update local state
      setCourses(courses.map(course =>
        course.id === courseId ? { ...course, enrollmentType } : course
      ));

      // Update selected course if it's the one being edited
      if (selectedCourseForEdit?.id === courseId) {
        setSelectedCourseForEdit({ ...selectedCourseForEdit, enrollmentType });
      }

      setShowCourseEditModal(false);
      success('Course Updated', `Enrollment type changed to "${enrollmentType}" successfully`);
    } catch (err) {
      logger.error('Error updating course:', err);
      showError('Update Failed', 'An unexpected error occurred');
    } finally {
      setUpdatingCourse(false);
    }
  };

  // Handle course creation
  const handleCreateCourse = async (courseData: any) => {
    try {
      setCreatingCourse(true);
      console.log('Creating course with data:', courseData);

      if (!user) {
        showError('Authentication Error', 'You must be logged in to create a course');
        return;
      }

      // Find selected instructor
      const instructor = availableInstructors.find(i => i.id === courseData.instructorId);
      if (!instructor) {
        showError('Instructor Error', 'Selected instructor not found');
        return;
      }

      // Prepare complete course data with all required fields
      const completeData = {
        title: courseData.title,
        description: courseData.description,
        shortDescription: courseData.description ? courseData.description.substring(0, 150) : '',
        price: parseFloat(courseData.price) || 0,
        originalPrice: parseFloat(courseData.price) || 0,
        duration: parseInt(courseData.duration) || 40,
        level: courseData.level || 'beginner',
        language: 'English',
        category: courseData.category || 'general',
        instructorId: instructor.id,
        instructorName: instructor.displayName || instructor.email,
        instructorImage: instructor.photoURL || '',
        instructorBio: '',
        thumbnailUrl: courseData.thumbnailUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%23e5e7eb" width="400" height="225"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ECourse Thumbnail%3C/text%3E%3C/svg%3E',
        rating: 0,
        totalRatings: 0,
        enrollmentType: 'direct' as const,
        totalStudents: 0,
        isPublished: false,
        isOnline: true as const,
        currency: 'INR' as const,
        learningObjectives: courseData.learningObjectives ? courseData.learningObjectives.split('\n').filter((obj: string) => obj.trim()) : [],
        prerequisites: courseData.prerequisites ? courseData.prerequisites.split('\n').filter((pre: string) => pre.trim()) : [],
        tags: courseData.tags ? courseData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
        multipleLanguageSubtitles: [],
        lessons: [],
        hasLiveSupport: true,
        discussionEnabled: true,
        downloadableResources: true,
        mobileAccess: true,
        lifetimeAccess: true,
        completionCertificate: true,
        closedCaptions: false,
        scheduledClasses: [],
        classSchedule: {
          courseId: '', // Will be set after creation
          pattern: 'weekly' as const,
          daysOfWeek: [],
          startTime: '10:00',
          duration: 60,
          timezone: 'Asia/Kolkata',
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          totalClasses: 0,
          classFrequency: 'Flexible schedule'
        },
        recordedClassesAvailable: false,
        classNotifications: true,
      };

      console.log('Complete course data:', completeData);

      const result = await createCourse(completeData, user.id);

      if (result.error) {
        showError('Creation Failed', result.error.message || 'Failed to create course');
        return;
      }

      console.log('Course created successfully:', result.data);
      success('Course Created', 'The course has been created successfully');
      setShowCreateCourseModal(false);
      
      // Reload courses
      await loadCoursesData();
    } catch (err) {
      logger.error('Error creating course:', err);
      showError('Creation Failed', 'An unexpected error occurred while creating the course');
    } finally {
      setCreatingCourse(false);
    }
  };

  // Handle user role change
  const handleRoleChange = async (userId: string, newRole: 'student' | 'instructor' | 'admin') => {
    try {
      const result = await updateUserRole(userId, newRole, user!.id);
      if (result.error) {
        showError('Update Failed', result.error.message || 'Failed to update user role');
        return;
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      success('Role Updated', `User role changed to ${newRole} successfully`);
    } catch (err) {
      logger.error('Error updating role:', err);
      showError('Update Failed', 'An unexpected error occurred');
    }
  };

  // Handle user status change
  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    try {
      const result = await updateUserStatus(userId, newStatus, user!.id);
      if (result.error) {
        showError('Update Failed', result.error.message || 'Failed to update user status');
        return;
      }

      setUsers(users.map(u => u.id === userId ? { ...u, profileStatus: newStatus } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, profileStatus: newStatus });
      }
      success('Status Updated', `User status changed to ${newStatus} successfully`);
    } catch (err) {
      logger.error('Error updating status:', err);
      showError('Update Failed', 'An unexpected error occurred');
    }
  };

  // Handle unique ID assignment
  const handleAssignUniqueId = async () => {
    if (!selectedUserForId || !newUniqueId.trim()) {
      showError('Validation Error', 'Please enter a valid unique ID');
      return;
    }

    try {
      setAssigningUniqueId(true);
      const result = await assignUniqueId(selectedUserForId.id, newUniqueId.trim(), user!.id);

      if (result.error) {
        showError('Assignment Failed', result.error.message || 'Failed to assign unique ID');
        return;
      }

      setUsers(users.map(u =>
        u.id === selectedUserForId.id ? { ...u, uniqueId: newUniqueId.trim() } : u
      ));

      success('ID Assigned', `Unique ID "${newUniqueId.trim()}" assigned successfully`);
      setShowUniqueIdModal(false);
      setSelectedUserForId(null);
      setNewUniqueId('');
    } catch (err) {
      logger.error('Error assigning unique ID:', err);
      showError('Assignment Failed', 'An unexpected error occurred');
    } finally {
      setAssigningUniqueId(false);
    }
  };

  // Generate auto unique ID
  const handleGenerateUniqueId = async () => {
    if (!selectedUserForId) return;

    try {
      const role = selectedUserForId.role === 'admin' ? 'student' : selectedUserForId.role as 'student' | 'instructor';
      const generatedId = await generateUniqueId(role);
      setNewUniqueId(generatedId);
    } catch (err) {
      logger.error('Error generating unique ID:', err);
    }
  };

  // Helper functions for styling
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-600';
      case 'instructor': return 'bg-blue-600';
      case 'student': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'suspended': return 'bg-red-600';
      case 'pending': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need administrator privileges to access this page.</p>
            <Button onClick={() => onNavigate('/')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-purple-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage users, courses, and platform settings</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading admin data...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || users.length}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Courses</p>
                      <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                    </div>
                    <BookOpen className="w-12 h-12 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Instructors</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'instructor').length}
                      </p>
                    </div>
                    <UserCheck className="w-12 h-12 text-purple-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'student').length}
                      </p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="courses" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Courses
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Course Management Tab */}
              <TabsContent value="courses" className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                      <p className="text-gray-600 mt-1">Create, edit, and manage all courses on the platform</p>
                    </div>
                    <Button onClick={() => setShowCreateCourseModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Course
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      Course Enrollment Management
                    </CardTitle>
                    <p className="text-sm text-gray-600">Configure how students can enroll in courses</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                              <div className="aspect-video bg-gray-200 relative">
                                <ImageWithFallback
                                  src={course.thumbnailUrl} 
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 flex flex-col gap-2">
                                  <Badge 
                                    className={`${
                                      course.enrollmentType === 'direct' 
                                        ? 'bg-green-600' 
                                        : 'bg-orange-600'
                                    }`}
                                  >
                                    {course.enrollmentType === 'direct' ? 'Direct Enrollment' : 'Inquiry Based'}
                                  </Badge>
                                  <Badge 
                                    className={`${
                                      course.isPublished 
                                        ? 'bg-blue-600' 
                                        : 'bg-gray-600'
                                    }`}
                                  >
                                    {course.isPublished ? 'Published' : 'Draft'}
                                  </Badge>
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">By {course.instructorName}</p>
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                  <span>₹{course.price.toLocaleString()}</span>
                                  <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {course.totalStudents}
                                  </span>
                                  <span className="flex items-center">
                                    <Eye className="w-4 h-4 mr-1" />
                                    {course.rating}
                                  </span>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Edit Enrollment Type clicked for course:', course.title);
                                    console.log('Setting selectedCourseForEdit:', course);
                                    setSelectedCourseForEdit(course);
                                    console.log('Opening modal...');
                                    courseEditModalJustOpened.current = true;
                                    setShowCourseEditModal(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Enrollment Type
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
                          <p className="text-gray-600 mb-4">No courses have been created yet.</p>
                          <Button 
                            onClick={() => setShowCreateCourseModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Course
                          </Button>
                        </div>
                      )}
                      
                      <Alert>
                        <Settings className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Enrollment Types:</strong><br/>
                          • <strong>Direct Enrollment:</strong> Students see "Enroll Now" button and can proceed directly to payment<br/>
                          • <strong>Inquiry Based:</strong> Students see "Contact Us" button and are redirected to contact page for course inquiries
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Management Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-600 mt-1">Manage users, roles, and permissions across the platform</p>
                </div>

                <Card>
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="student">Students</SelectItem>
                          <SelectItem value="instructor">Instructors</SelectItem>
                          <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {filteredUsers.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {user.displayName?.charAt(0) || user.email.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.displayName || 'No name'}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getRoleColor(user.role)}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(user.profileStatus || 'active')}>
                                  {user.profileStatus || 'active'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSelectedUser(user);
                                      setShowUserModal(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                        <p className="text-gray-600 mb-4">
                          {users.length === 0 
                            ? "No users have been registered yet."
                            : "No users match your current search criteria."
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-lg border">
                  <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
                  <p className="text-gray-600 mt-1">Monitor platform performance and user engagement</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-12">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Analytics dashboard coming soon</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Enrollment Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-12">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Enrollment analytics coming soon</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border">
                  <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
                  <p className="text-gray-600 mt-1">Configure platform-wide settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">Platform configuration options coming soon</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Payment Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">Payment gateway configuration coming soon</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Course Edit Modal */}
      <Dialog 
        open={showCourseEditModal} 
        onOpenChange={(open) => {
          console.log('Course Edit Modal onOpenChange - open:', open, 'current state:', showCourseEditModal, 'justOpened:', courseEditModalJustOpened.current);
          
          // If the modal was just opened and this is a close event, ignore it
          if (courseEditModalJustOpened.current && !open) {
            console.log('Ignoring auto-close on mount');
            courseEditModalJustOpened.current = false;
            return;
          }
          
          console.log('Setting showCourseEditModal to:', open);
          setShowCourseEditModal(open);
          if (!open) {
            console.log('Clearing selectedCourseForEdit');
            setSelectedCourseForEdit(null);
            courseEditModalJustOpened.current = false;
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course Enrollment Type</DialogTitle>
            <DialogDescription>
              Change how students can enroll in this course - either directly or by inquiry
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourseForEdit && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <ImageWithFallback
                  src={selectedCourseForEdit.thumbnailUrl} 
                  alt={selectedCourseForEdit.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedCourseForEdit.title}</h3>
                  <p className="text-gray-600">By {selectedCourseForEdit.instructorName}</p>
                  <p className="text-sm text-gray-500 mt-1">₹{selectedCourseForEdit.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enrollment Type</label>
                  <Select 
                    value={selectedCourseForEdit.enrollmentType} 
                    onValueChange={(value: 'direct' | 'enquiry') => 
                      setSelectedCourseForEdit(prev => prev ? {...prev, enrollmentType: value} : null)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Enrollment</SelectItem>
                      <SelectItem value="enquiry">Inquiry Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">
                    {selectedCourseForEdit.enrollmentType === 'direct' ? 'Direct Enrollment' : 'Inquiry Based'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedCourseForEdit.enrollmentType === 'direct' 
                      ? 'Students will see an "Enroll Now" button and can proceed directly to payment.'
                      : 'Students will see a "Contact Us" button and will be redirected to the contact page for course inquiries.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCourseEditModal(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (selectedCourseForEdit) {
                  handleUpdateCourseEnrollmentType(selectedCourseForEdit.id, selectedCourseForEdit.enrollmentType);
                }
              }}
              disabled={updatingCourse}
            >
              {updatingCourse ? 'Updating...' : 'Update Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Edit Modal */}
      <Dialog 
        open={showUserModal} 
        onOpenChange={(open) => {
          setShowUserModal(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and account status
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedUser.displayName}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value: 'student' | 'instructor' | 'admin') => 
                    handleRoleChange(selectedUser.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={selectedUser.profileStatus || 'active'} 
                  onValueChange={(value: 'active' | 'suspended' | 'pending') => 
                    handleStatusChange(selectedUser.id, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowUserModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Course Modal */}
      <Dialog 
        open={showCreateCourseModal} 
        onOpenChange={(open) => {
          setShowCreateCourseModal(open);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to the platform
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleCreateCourse({
              title: formData.get('title'),
              description: formData.get('description'),
              price: formData.get('price'),
              duration: formData.get('duration'),
              level: formData.get('level'),
              category: formData.get('category'),
              instructorId: formData.get('instructorId'),
              thumbnailUrl: formData.get('thumbnailUrl'),
              learningObjectives: formData.get('learningObjectives'),
              prerequisites: formData.get('prerequisites'),
              tags: formData.get('tags'),
            });
          }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Course Title *</label>
                <Input name="title" placeholder="e.g., Python for Beginners" required />
              </div>

              <div>
                <label className="text-sm font-medium">Description *</label>
                <Textarea 
                  name="description" 
                  placeholder="Describe what students will learn..." 
                  rows={3}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (₹) *</label>
                  <Input name="price" type="number" placeholder="1999" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Input name="duration" placeholder="8 weeks" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Level</label>
                  <Select name="level" defaultValue="beginner">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input name="category" placeholder="Programming" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Instructor *</label>
                <Select name="instructorId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInstructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.displayName || instructor.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Thumbnail URL</label>
                <Input name="thumbnailUrl" placeholder="https://..." />
              </div>

              <div>
                <label className="text-sm font-medium">Learning Objectives (one per line)</label>
                <Textarea 
                  name="learningObjectives" 
                  placeholder="Master Python basics&#10;Build web applications&#10;Understand OOP concepts"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Prerequisites (one per line)</label>
                <Textarea 
                  name="prerequisites" 
                  placeholder="Basic computer skills&#10;Willingness to learn"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input name="tags" placeholder="python, programming, web development" />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowCreateCourseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creatingCourse}>
                {creatingCourse ? 'Creating...' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Unique ID Assignment Modal */}
      <Dialog 
        open={showUniqueIdModal} 
        onOpenChange={(open) => {
          setShowUniqueIdModal(open);
          if (!open) {
            setSelectedUserForId(null);
            setNewUniqueId('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Unique ID</DialogTitle>
            <DialogDescription>
              Generate or manually assign a unique ID for this user
            </DialogDescription>
          </DialogHeader>
          {selectedUserForId && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedUserForId.displayName}</p>
                <p className="text-sm text-gray-500">{selectedUserForId.email}</p>
                <Badge className="mt-1" variant="outline">
                  {selectedUserForId.role === 'instructor' ? 'Instructor' : 'Student'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Unique ID</label>
                <div className="flex space-x-2">
                  <Input
                    value={newUniqueId}
                    onChange={(e) => setNewUniqueId(e.target.value)}
                    placeholder="Enter ID or generate"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleGenerateUniqueId}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowUniqueIdModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignUniqueId}
                  disabled={assigningUniqueId || !newUniqueId.trim()}
                >
                  {assigningUniqueId ? 'Assigning...' : 'Assign ID'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
