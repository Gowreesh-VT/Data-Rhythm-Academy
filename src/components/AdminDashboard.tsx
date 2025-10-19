import React, { useState, useEffect } from 'react';
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
import { 
  getAllUsers, 
  updateUserRole, 
  updateUserStatus, 
  getUserManagementStats,
  getPublishedCourses,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [enrollments, setEnrollments] = useState<any[]>([]);
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

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
      loadCoursesData();
      loadInstructorsData();
    }
  }, [user]);
  
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

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      logger.info('Loading admin data...');
      
      // Load all users
      const usersResult = await getAllUsers();
      if (usersResult.error) {
        logger.error('Error loading users:', usersResult.error);
        setError('Failed to load users data from Firestore');
        setUsers([]);
        setStats(null);
      } else if (usersResult.data) {
        logger.info(`Loaded ${usersResult.data.length} users`);
        setUsers(usersResult.data);
        
        // Load management stats
        const statsResult = await getUserManagementStats();
        if (statsResult.error) {
          logger.error('Error loading stats:', statsResult.error);
          setStats(null);
        } else if (statsResult.data) {
          setStats(statsResult.data);
        }
      } else {
        // No users found in Firestore
        logger.info('No users found in Firestore');
        setUsers([]);
        setStats(null);
      }
    } catch (error) {
      logger.error('Error loading admin data:', error);
      setError('Failed to connect to Firestore database');
      setUsers([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCoursesData = async () => {
    try {
      const coursesResult = await getPublishedCourses();
      if (coursesResult.error) {
        logger.error('Error loading courses:', coursesResult.error);
        setCourses([]);
      } else if (coursesResult.data) {
        setCourses(coursesResult.data);
      } else {
        setCourses([]);
      }
    } catch (error) {
      logger.error('Error loading courses:', error);
      setCourses([]);
    }
  };



  const handleUpdateCourseEnrollmentType = async (courseId: string, enrollmentType: 'direct' | 'enquiry') => {
    if (!user?.id) {
      showError('Authentication Error', 'You must be logged in as an admin');
      return;
    }
    
    setUpdatingCourse(true);
    try {
      const result = await updateCourse(courseId, { enrollmentType }, user.id);
      
      if (result.error) {
        showError('Update Failed', result.error.message || 'Failed to update course enrollment type');
        return;
      }
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, enrollmentType } : course
      ));
      
      // Update selectedCourseForEdit if it's the same course
      if (selectedCourseForEdit && selectedCourseForEdit.id === courseId) {
        setSelectedCourseForEdit({ ...selectedCourseForEdit, enrollmentType });
      }
      
      success('Course Updated', `Enrollment type changed to "${enrollmentType}" successfully`);
      setShowCourseEditModal(false);
      
    } catch (error: any) {
      logger.error('Error updating course:', error);
      showError('Update Failed', error.message || 'An unexpected error occurred');
    } finally {
      setUpdatingCourse(false);
    }
  };
  
  // Unique ID management handlers
  const handleOpenUniqueIdModal = (user: User) => {
    setSelectedUserForId(user);
    setNewUniqueId(user.uniqueId || '');
    setShowUniqueIdModal(true);
  };
  
  const handleGenerateUniqueId = async () => {
    if (!selectedUserForId) {
      showError('Error', 'No user selected');
      return;
    }
    
    if (selectedUserForId.role !== 'instructor' && selectedUserForId.role !== 'student') {
      showError('Invalid Role', 'Unique IDs can only be generated for instructors and students');
      return;
    }
    
    try {
      const generatedId = await generateUniqueId(selectedUserForId.role as 'instructor' | 'student');
      setNewUniqueId(generatedId);
      success('Generated', `Unique ID generated: ${generatedId}`);
    } catch (error: any) {
      logger.error('Error generating unique ID:', error);
      showError('Generation Failed', error.message || 'Failed to generate unique ID');
    }
  };
  
  const handleAssignUniqueId = async () => {
    if (!selectedUserForId) {
      showError('Error', 'No user selected');
      return;
    }
    
    if (!user?.id) {
      showError('Authentication Error', 'You must be logged in as an admin');
      return;
    }
    
    if (!newUniqueId.trim()) {
      showError('Validation Error', 'Please enter a unique ID or click Generate');
      return;
    }
    
    setAssigningUniqueId(true);
    try {
      const result = await assignUniqueId(selectedUserForId.id, newUniqueId.trim(), user.id);
      if (result.error) {
        showError('Assignment Failed', result.error.message);
      } else {
        success('Success', `Unique ID ${newUniqueId} assigned to ${selectedUserForId.displayName}`);
        setShowUniqueIdModal(false);
        setSelectedUserForId(null);
        setNewUniqueId('');
        loadAdminData(); // Refresh data
      }
    } catch (error: any) {
      logger.error('Error assigning unique ID:', error);
      showError('Assignment Failed', error.message || 'Failed to assign unique ID');
    } finally {
      setAssigningUniqueId(false);
    }
  };
  
  // Course creation handlers
  const handleCreateCourse = async (courseData: any) => {
    if (!user?.id) {
      showError('Authentication Error', 'You must be logged in as an admin');
      return;
    }
    
    // Validate required fields
    if (!courseData.title || !courseData.instructorId || !courseData.category) {
      showError('Validation Error', 'Please fill in all required fields (Title, Instructor, Category)');
      return;
    }
    
    setCreatingCourse(true);
    try {
      const result = await createCourse({
        ...courseData,
        enrollmentType: 'direct',
        rating: 0,
        totalRatings: 0,
        totalStudents: 0,
        lessons: [],
        isPublished: false,
        isOnline: true,
        hasLiveSupport: true,
        discussionEnabled: true,
        downloadableResources: true,
        mobileAccess: true,
        lifetimeAccess: true,
        completionCertificate: true,
        closedCaptions: false,
        scheduledClasses: [],
        classSchedule: {
          courseId: '',
          pattern: 'weekly',
          daysOfWeek: [1, 3],
          startTime: '10:00',
          duration: 90,
          timezone: 'IST',
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          totalClasses: 12,
          classFrequency: 'Every Monday & Wednesday'
        },
        recordedClassesAvailable: true,
        classNotifications: true
      }, user.id);
      
      if (result.error) {
        showError('Creation Failed', result.error.message);
      } else {
        success('Success', `Course "${courseData.title}" created successfully`);
        setShowCreateCourseModal(false);
        loadCoursesData(); // Refresh courses
      }
    } catch (error: any) {
      logger.error('Error creating course:', error);
      showError('Creation Failed', error.message || 'Failed to create course');
    } finally {
      setCreatingCourse(false);
    }
  };



  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.profileStatus === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: string, newRole: 'student' | 'instructor' | 'admin') => {
    if (!user?.id) return;
    
    try {
      await updateUserRole(userId, newRole, user.id);
      
      // Update the selected user in the modal immediately
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      
      success('Role Updated', `User role changed to ${newRole} successfully`);
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      showError('Role Update Failed', 'Failed to update user role. Please try again.');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    if (!user?.id) return;
    
    try {
      await updateUserStatus(userId, newStatus, user.id);
      
      // Update the selected user in the modal immediately
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, profileStatus: newStatus });
      }
      
      success('Status Updated', `User status changed to ${newStatus} successfully`);
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Error updating user status:', error);
      showError('Status Update Failed', 'Failed to update user status. Please try again.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You must be an administrator to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => onNavigate('/')}>
                Data Rhythm Academy - Admin
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => onNavigate('/courses')} 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Browse Courses
              </button>
              <button 
                onClick={() => onNavigate('/profile')} 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Profile
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-gray-700">
                Hello, {user.displayName || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout} className="hover:bg-red-50 hover:border-red-200">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
        {/* Error State */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <div className="flex space-x-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadAdminData}
                >
                  Retry Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && (
          <>


            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || users.filter(u => u.profileStatus === 'active').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Instructors</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalInstructors || users.filter(u => u.role === 'instructor').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BookOpen className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Courses</p>
                      <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="courses" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-gray-100/50 rounded-lg">
                <TabsTrigger 
                  value="courses" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm font-medium py-3 px-2 md:px-4 rounded-md"
                >
                  <span className="hidden sm:inline">Course </span>Course Manage
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm font-medium py-3 px-2 md:px-4 rounded-md"
                >
                  <span className="hidden sm:inline">User </span>User Manage
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm font-medium py-3 px-2 md:px-4 rounded-md"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs md:text-sm font-medium py-3 px-2 md:px-4 rounded-md"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Course Management Tab */}
              <TabsContent value="courses" className="space-y-6">
                {/* Quick Actions Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                    <p className="text-gray-600 mt-1">Manage courses, enrollments, and instructor assignments</p>
                  </div>
                  <Button 
                    onClick={() => setShowCreateCourseModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Course
                  </Button>
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
                      {/* Course Grid */}
                      {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                              <div className="aspect-video bg-gray-200 relative">
                                <img 
                                  src={course.thumbnailUrl} 
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                                <Badge 
                                  className={`absolute top-2 right-2 ${
                                    course.enrollmentType === 'direct' 
                                      ? 'bg-green-600' 
                                      : 'bg-orange-600'
                                  }`}
                                >
                                  {course.enrollmentType === 'direct' ? 'Direct Enrollment' : 'Inquiry Based'}
                                </Badge>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">By {course.instructorName}</p>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-lg">₹{course.price.toLocaleString()}</span>
                                  <Badge variant="outline">
                                    {course.enrollmentType === 'direct' ? 'Enroll Now' : 'Contact Us'}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
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
                                  onClick={() => {
                                    setSelectedCourseForEdit(course);
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
                          <p className="text-gray-600 mb-4">No courses have been created yet in Firestore.</p>
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

              {/* User Management Tab - Simplified version of original */}
              <TabsContent value="users" className="space-y-6">
                {/* User Management Header */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-600 mt-1">Manage users, roles, and permissions across the platform</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="student">Students</SelectItem>
                          <SelectItem value="instructor">Instructors</SelectItem>
                          <SelectItem value="admin">Admins</SelectItem>
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
                                    onClick={() => {
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
                            ? "No users have been registered yet in Firestore."
                            : "No users match your current search criteria."
                          }
                        </p>
                        {users.length === 0 && (
                          <Alert className="max-w-md mx-auto">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Users will appear here once they register through the application.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                {/* Analytics Header */}
                <div className="p-6 lg:p-8 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-xl border border-purple-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
                      <p className="text-gray-600 text-sm lg:text-base">Monitor platform performance, user engagement, and business metrics in real-time</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-purple-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Live Data</span>
                    </div>
                  </div>
                </div>

                {/* Analytics Stats Grid - 2x2 Layout for Better Mobile Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
                  {/* Row 1 */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Course Views</p>
                          </div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">12,847</p>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-xs text-green-600 font-medium">+15.3% from last month</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                              <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">New Enrollments</p>
                          </div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">{enrollments.length}</p>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-xs text-green-600 font-medium">+8.7% from last month</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Row 2 */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                              <BookOpen className="h-6 w-6 text-purple-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Course Completion</p>
                          </div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">84.2%</p>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-xs text-green-600 font-medium">+2.1% from last month</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                              <DollarSign className="h-6 w-6 text-yellow-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Revenue</p>
                          </div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">₹2,45,890</p>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-xs text-green-600 font-medium">+12.4% from last month</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
                    <CardTitle className="flex items-center text-xl font-semibold">
                      <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                      Analytics Overview
                    </CardTitle>
                    <p className="text-gray-600 mt-2">Comprehensive insights into platform performance and user behavior</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="font-medium">Advanced analytics dashboard is being developed with real-time data visualization.</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 w-fit">Coming Soon</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            User Activity
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">Track user engagement, course progress, and learning patterns with detailed behavioral analytics.</p>
                        </div>
                        <div className="p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-green-50">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                              <BookOpen className="w-5 h-5 text-green-600" />
                            </div>
                            Course Performance
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">Monitor course enrollment, completion rates, user feedback and instructor performance metrics.</p>
                        </div>
                        <div className="p-5 border border-gray-200 rounded-xl hover:border-yellow-300 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-yellow-50">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                              <DollarSign className="w-5 h-5 text-yellow-600" />
                            </div>
                            Revenue Insights
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">Analyze payment trends, subscription metrics, financial growth and revenue forecasting.</p>
                        </div>
                        <div className="p-5 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                              <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            System Health
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">Monitor platform performance, error rates, uptime and user experience metrics in real-time.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                {/* Settings Header */}
                <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border">
                  <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                  <p className="text-gray-600 mt-1">Configure platform settings, integrations, and system preferences</p>
                </div>

                {/* Course Creation Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Course Creation
                      <Button onClick={() => setShowCreateCourseModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Course
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Create new courses and assign them to instructors.</p>
                  </CardContent>
                </Card>

                {/* Unique ID Management Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Unique ID Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Manage instructor and student unique IDs (DRA-INS-25xxx, DRA-STU-25xxx format).</p>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Instructors</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {users.filter(u => u.role === 'instructor').map(instructor => (
                              <div key={instructor.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <p className="font-medium text-sm">{instructor.displayName}</p>
                                  <p className="text-xs text-gray-500">{instructor.uniqueId || 'No ID assigned'}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleOpenUniqueIdModal(instructor)}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit ID
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Students</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {users.filter(u => u.role === 'student').map(student => (
                              <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <p className="font-medium text-sm">{student.displayName}</p>
                                  <p className="text-xs text-gray-500">{student.uniqueId || 'No ID assigned'}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleOpenUniqueIdModal(student)}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit ID
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Email Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm">Configure system email notifications and templates.</p>
                          <Button className="mt-3" variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" />
                            Configure Email
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Payment Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm">Manage payment gateway configuration and pricing.</p>
                          <Button className="mt-3" variant="outline" size="sm">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Configure Payments
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Course Edit Modal */}
      <Dialog open={showCourseEditModal} onOpenChange={(open) => {
        setShowCourseEditModal(open);
        if (!open) {
          setSelectedCourseForEdit(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course Enrollment Type</DialogTitle>
            <DialogDescription>
              Change how students can enroll in this course - either directly or by inquiry
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourseForEdit && (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="flex items-start space-x-4">
                <img 
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

              {/* Enrollment Type Selection */}
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

                {/* Explanation */}
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
            <Button variant="outline" onClick={() => setShowCourseEditModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
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

      {/* User Edit Modal - Simplified */}
      <Dialog open={showUserModal} onOpenChange={(open) => {
        setShowUserModal(open);
        if (!open) {
          setSelectedUser(null);
        }
      }}>
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

      {/* Unique ID Assignment Modal */}
      <Dialog open={showUniqueIdModal} onOpenChange={(open) => {
        setShowUniqueIdModal(open);
        if (!open) {
          // Reset state when modal closes
          setSelectedUserForId(null);
          setNewUniqueId('');
        }
      }}>
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
                <label className="text-sm font-medium">
                  Unique ID ({selectedUserForId.role === 'instructor' ? 'DRA-INS-25xxx format' : 'DRA-STU-25xxx format'})
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={newUniqueId}
                    onChange={(e) => setNewUniqueId(e.target.value)}
                    placeholder={selectedUserForId.role === 'instructor' ? 'DRA-INS-25001' : 'DRA-STU-25001'}
                  />
                  <Button variant="outline" onClick={handleGenerateUniqueId}>
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

      {/* Course Creation Modal */}
      <Dialog open={showCreateCourseModal} onOpenChange={setShowCreateCourseModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the course details to create a new course for your academy
            </DialogDescription>
          </DialogHeader>
          <CourseCreationForm
            availableInstructors={availableInstructors}
            onSubmit={handleCreateCourse}
            onCancel={() => setShowCreateCourseModal(false)}
            isCreating={creatingCourse}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Course Creation Form Component
interface CourseCreationFormProps {
  availableInstructors: User[];
  onSubmit: (courseData: any) => void;
  onCancel: () => void;
  isCreating: boolean;
}

const CourseCreationForm: React.FC<CourseCreationFormProps> = ({ 
  availableInstructors, 
  onSubmit, 
  onCancel, 
  isCreating 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    instructorId: '',
    category: '',
    level: '',
    language: 'English',
    price: 0,
    duration: 0,
    thumbnailUrl: '',
    learningObjectives: [''],
    prerequisites: [''],
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a course title');
      return;
    }
    if (!formData.instructorId) {
      alert('Please select an instructor');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    if (!formData.level) {
      alert('Please select a difficulty level');
      return;
    }
    if (!formData.shortDescription.trim()) {
      alert('Please enter a short description');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a full description');
      return;
    }
    
    const courseData = {
      ...formData,
      learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
      prerequisites: formData.prerequisites.filter(req => req.trim() !== ''),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      instructorName: availableInstructors.find(i => i.id === formData.instructorId)?.displayName || 'Unknown Instructor'
    };
    
    onSubmit(courseData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Course Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter course title"
            required
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Assign to Instructor</label>
          <Select value={formData.instructorId} onValueChange={(value) => setFormData(prev => ({ ...prev, instructorId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent>
              {availableInstructors.map(instructor => (
                <SelectItem key={instructor.id} value={instructor.id}>
                  {instructor.displayName} ({instructor.uniqueId || instructor.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Short Description</label>
        <Input
          value={formData.shortDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
          placeholder="Brief course description"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Full Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed course description"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Data Science">Data Science</SelectItem>
              <SelectItem value="Web Development">Web Development</SelectItem>
              <SelectItem value="Mobile Development">Mobile Development</SelectItem>
              <SelectItem value="Machine Learning">Machine Learning</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Level</label>
          <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
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

        <div>
          <label className="text-sm font-medium">Language</label>
          <Input
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
            placeholder="Course language"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Price (₹)</label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
            placeholder="Course price"
            min="0"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Duration (hours)</label>
          <Input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            placeholder="Course duration"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
};