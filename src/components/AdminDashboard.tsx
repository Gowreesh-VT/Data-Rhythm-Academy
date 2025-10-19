import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Loader2, Users, GraduationCap, Shield, Activity, UserPlus, Settings, BookOpen, Plus, Trash2, Edit } from 'lucide-react';
import { 
  getAllUsers, 
  getUserManagementStats, 
  updateUserRole, 
  updateUserStatus,
  assignStudentToInstructor,
  removeStudentFromInstructor,
  getPublishedCourses,
  deleteCourse
} from '../lib/database';
import { User, UserManagementData, Course } from '../types';
import { removeTemporaryAdmin, listAdminUsers } from '../utils/adminSetup';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserManagementData | null>(null);
  const [selectedRole, setSelectedRole] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'joinDate' | 'lastActivity' | 'role'>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Course management state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
    loadCourses(); // Also load courses on mount
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, check if the current user is actually an admin
      if (!user || user.role !== 'admin') {
        throw new Error('Access denied: Admin role required');
      }

      // Load user management statistics
      const statsResult = await getUserManagementStats();
      if (statsResult.error) {
        if (statsResult.error.message?.includes('permission-denied')) {
          throw new Error('Permission denied: Please ensure you have admin role in Firestore and the security rules are deployed');
        }
        throw statsResult.error;
      }
      setStats(statsResult.data);

      // Load all users
      const usersResult = await getAllUsers();
      if (usersResult.error) {
        if (usersResult.error.message?.includes('permission-denied')) {
          throw new Error('Permission denied: Unable to access user data. Please check your admin permissions.');
        }
        throw usersResult.error;
      }
      setUsers(usersResult.data || []);
      
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      const errorMessage = err.message || 'Failed to load dashboard data. Please try again.';
      setError(errorMessage);
      showError('Failed to load dashboard data', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const coursesResult = await getPublishedCourses();
      if (coursesResult.error) {
        throw coursesResult.error;
      }
      setCourses(coursesResult.data || []);
    } catch (err: any) {
      console.error('Error loading courses:', err);
      showError('Failed to load courses', err.message || 'Please try again.');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!user?.id || deletingCourse) return;
    
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    setDeletingCourse(courseId);
    try {
      const result = await deleteCourse(courseId, user.id);
      if (result.error) {
        throw result.error;
      }
      
      // Remove course from local state
      setCourses(prev => prev.filter(c => c.id !== courseId));
      success('Course deleted', 'The course has been successfully deleted.');
    } catch (err: any) {
      console.error('Error deleting course:', err);
      showError('Failed to delete course', err.message || 'Please try again.');
    } finally {
      setDeletingCourse(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'student' | 'instructor' | 'admin') => {
    if (!user?.id || updatingUser) return;
    
    setUpdatingUser(userId);
    try {
      const result = await updateUserRole(userId, newRole, user.id);
      if (result.error) {
        throw result.error;
      }
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      success(`User role updated to ${newRole}`);
    } catch (err) {
      console.error('Error updating user role:', err);
      showError('Failed to update user role', 'Please check your permissions and try again');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    if (!user?.id || updatingUser) return;
    
    setUpdatingUser(userId);
    try {
      const result = await updateUserStatus(userId, newStatus, user.id);
      if (result.error) {
        throw result.error;
      }
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, profileStatus: newStatus } : u
      ));
      
      success(`User status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating user status:', err);
      showError('Failed to update user status', 'Please check your permissions and try again');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredAndSortedUsers.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'suspended' | 'pending') => {
    if (!user?.id || selectedUsers.size === 0) return;
    
    setUpdatingUser('bulk');
    const selectedArray = Array.from(selectedUsers);
    
    try {
      const results = await Promise.all(
        selectedArray.map(userId => updateUserStatus(userId, newStatus, user.id))
      );
      
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        throw new Error('Some updates failed');
      }
      
      // Update local state
      setUsers(prev => prev.map(u => 
        selectedUsers.has(u.id) ? { ...u, profileStatus: newStatus } : u
      ));
      
      success(`Updated ${selectedUsers.size} users to ${newStatus}`);
      setSelectedUsers(new Set());
    } catch (err) {
      console.error('Error bulk updating user status:', err);
      showError('Bulk update failed', 'Some users may not have been updated');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleRemoveTemporaryAdmin = async () => {
    if (!confirm('Are you sure you want to remove the temporary admin user (admin@dataridythmacademy.com)?')) {
      return;
    }
    
    setUpdatingUser('temp-admin');
    try {
      const result = await removeTemporaryAdmin();
      if (result.error) {
        throw result.error;
      }
      
      if (result.removedUser) {
        success('Temporary admin user removed successfully');
        // Refresh the user list
        await loadDashboardData();
      } else {
        success(result.message || 'No temporary admin user found');
      }
    } catch (err) {
      console.error('Error removing temporary admin:', err);
      showError('Failed to remove temporary admin', 'Please try again or check the console for details');
    } finally {
      setUpdatingUser(null);
    }
  };

  // Filter and sort users based on multiple criteria
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || user.profileStatus === selectedStatus;
      const matchesSearch = !searchTerm || 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.displayName?.toLowerCase() || '';
          bValue = b.displayName?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'joinDate':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'lastActivity':
          aValue = new Date(a.lastActivity || a.lastLoginAt || 0).getTime();
          bValue = new Date(b.lastActivity || b.lastLoginAt || 0).getTime();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (date: any) => {
    if (!date) return 'Never';
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users, courses, and system settings</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => onNavigate('/')}>
                Back to Site
              </Button>
              <Button variant="destructive" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
              {error.includes('Permission denied') && (
                <div className="mt-2">
                  <p className="text-sm">To fix this issue:</p>
                  <ol className="text-sm list-decimal list-inside mt-1">
                    <li>Ensure your user account has the 'admin' role in Firestore</li>
                    <li>Make sure the updated security rules are deployed</li>
                    <li>Try refreshing the page after making changes</li>
                  </ol>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.recentSignups.length} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.totalStudents / stats.totalUsers) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instructors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInstructors}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.totalInstructors / stats.totalUsers) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.suspendedUsers} suspended
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="lg:col-span-2"
                  />
                  
                  <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
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
                  
                  <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex space-x-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joinDate">Join Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="lastActivity">Last Activity</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Showing {filteredAndSortedUsers.length} of {users.length} users</span>
                    {selectedUsers.size > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600 font-medium">{selectedUsers.size} selected</span>
                        <Select onValueChange={(value) => handleBulkStatusChange(value as any)}>
                          <SelectTrigger className="w-40 h-8">
                            <SelectValue placeholder="Bulk action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Set Active</SelectItem>
                            <SelectItem value="suspended">Set Suspended</SelectItem>
                            <SelectItem value="pending">Set Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedUsers(new Set())}
                          disabled={updatingUser === 'bulk'}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button onClick={loadDashboardData} disabled={loading} size="sm">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAndSortedUsers.length > 0 && (
                  <div className="flex items-center space-x-4 p-4 border-b bg-gray-50 rounded-t-lg">
                    <Checkbox
                      checked={selectedUsers.size === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({filteredAndSortedUsers.length})
                    </span>
                    <div className="flex-1" />
                    <span className="text-xs text-gray-500">
                      Role | Status | Actions
                    </span>
                  </div>
                )}
                
                <div className="space-y-1">
                  {filteredAndSortedUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-lg">No users found</div>
                      <div className="text-sm">Try adjusting your filters or search terms</div>
                    </div>
                  ) : (
                    filteredAndSortedUsers.map((user: User) => (
                      <div key={user.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                        
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <span className="text-lg font-medium text-gray-600">
                                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-gray-900 truncate">{user.displayName || 'No name'}</p>
                              <Badge className={getRoleColor(user.role)}>
                                {user.role}
                              </Badge>
                              <Badge className={getStatusColor(user.profileStatus || 'pending')}>
                                {user.profileStatus || 'pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>Joined: {formatDate(user.createdAt)}</span>
                              <span>•</span>
                              <span>Last seen: {formatRelativeTime(user.lastActivity || user.lastLoginAt)}</span>
                              {user.enrolledCourses && (
                                <>
                                  <span>•</span>
                                  <span>{user.enrolledCourses.length} courses</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-4">
                          <div className="flex flex-col space-y-2">
                            <Select 
                              value={user.role} 
                              onValueChange={(value) => handleRoleChange(user.id, value as any)}
                              disabled={updatingUser === user.id}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Select 
                              value={user.profileStatus || 'pending'} 
                              onValueChange={(value) => handleStatusChange(user.id, value as any)}
                              disabled={updatingUser === user.id}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {updatingUser === user.id && (
                            <div className="flex items-center justify-center w-8 h-8">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Course Management</CardTitle>
                <Button onClick={() => onNavigate('/create-course')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Course
                </Button>
              </CardHeader>
              <CardContent>
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading courses...
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first course</p>
                    <Button onClick={() => onNavigate('/create-course')} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">
                        Total courses: {courses.length}
                      </p>
                      <Button
                        onClick={loadCourses}
                        variant="outline"
                        size="sm"
                      >
                        Refresh
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => (
                        <Card key={course.id} className="relative">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{course.category}</Badge>
                              <Badge variant="outline">{course.level}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-600 line-clamp-2">{course.shortDescription}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Students: {course.totalStudents || 0}</span>
                              <span>Lessons: {course.lessons?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Price: ${course.price}</span>
                              <span>Duration: {course.duration}h</span>
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onNavigate(`/course/${course.id}`)}
                                className="flex-1"
                              >
                                <BookOpen className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onNavigate(`/edit-course/${course.id}`)}
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCourse(course.id)}
                                disabled={deletingCourse === course.id}
                              >
                                {deletingCourse === course.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Signups</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentSignups && stats.recentSignups.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentSignups.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                            ) : (
                              <span className="text-sm font-medium">
                                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.displayName || 'No name'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent signups to display.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <p className="text-sm text-gray-600">Manage system-wide settings and configurations</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Database Status</h3>
                      <p className="text-sm text-gray-500">Firestore connection status</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">User Registration</h3>
                      <p className="text-sm text-gray-500">Allow new user registrations</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">System Maintenance</h3>
                      <p className="text-sm text-gray-500">Current system status</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-lg mb-4">Admin User Management</h3>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Remove Temporary Admin</h4>
                        <p className="text-sm text-gray-500">
                          Remove the temporary admin user (admin@dataridythmacademy.com) if it was created for testing
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleRemoveTemporaryAdmin}
                        disabled={updatingUser === 'temp-admin'}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {updatingUser === 'temp-admin' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Remove Temp Admin'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};