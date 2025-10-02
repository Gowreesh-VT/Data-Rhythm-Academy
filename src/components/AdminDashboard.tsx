import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { type NavigatePath, type AppUser, type UserRole } from '../types';
import { type Course, coursesData } from '../data/coursesData';
import { dbHelpers } from '../lib/firebase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Shield,
  Crown
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: NavigatePath) => void;
  user: AppUser | null;
  onLogout: () => void;
}

interface Student {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrolledCourses: number;
  completedCourses: number;
  totalSpent: number;
  lastActive: string;
  status: 'active' | 'inactive';
}

interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

// Mock data - in real app, this would come from Firestore
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'student',
    enrolledCourses: 2,
    completedCourses: 1,
    totalSpent: 7998,
    lastActive: '2024-10-01',
    status: 'active'
  },
  {
    id: '2',
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    role: 'admin',
    enrolledCourses: 1,
    completedCourses: 1,
    totalSpent: 2999,
    lastActive: '2024-09-28',
    status: 'active'
  },
  {
    id: '3',
    name: 'Sneha Kumar',
    email: 'sneha@example.com',
    role: 'student',
    enrolledCourses: 3,
    completedCourses: 0,
    totalSpent: 14997,
    lastActive: '2024-09-25',
    status: 'inactive'
  }
];

const mockStats: CourseStats = {
  totalCourses: 7,
  activeCourses: 1,
  totalStudents: 1250,
  totalRevenue: 3748750,
  monthlyGrowth: 15.5
};

const mockRecentActivities = [
  {
    id: 1,
    type: 'enrollment',
    message: 'New student enrolled in Introduction to Python',
    timestamp: '2024-10-01 14:30',
    user: 'Rajesh Kumar'
  },
  {
    id: 2,
    type: 'completion',
    message: 'Student completed Python Basics module',
    timestamp: '2024-10-01 12:15',
    user: 'Priya Sharma'
  },
  {
    id: 3,
    type: 'payment',
    message: 'Payment received for Advanced Python Course',
    timestamp: '2024-10-01 10:45',
    user: 'Arjun Mehta'
  }
];

export function AdminDashboard({ onNavigate, user, onLogout }: AdminDashboardProps) {
  const { updateUserRole, refreshUserProfile, userProfile } = useAuth();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState<CourseStats>(mockStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch all users if user is super admin
  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchAllUsers();
    }
  }, [user]);

  const fetchAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await dbHelpers.getAllUsers();
      if (data && !error) {
        const typedUsers: AppUser[] = data.map((userData: any) => ({
          uid: userData.id,
          email: userData.email || '',
          name: userData.name || '',
          role: userData.role || 'student',
          photoURL: userData.photoURL,
          provider: userData.provider || 'email',
          createdAt: userData.createdAt || new Date(),
          updatedAt: userData.updatedAt || new Date()
        }));
        setAllUsers(typedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (user?.role !== 'super_admin') {
      alert('Only Super Admin can change user roles');
      return;
    }

    setIsUpdatingRole(true);
    const { success, error } = await updateUserRole(userId, newRole);
    
    if (success) {
      alert('User role updated successfully');
      await fetchAllUsers(); // Refresh the user list
      await refreshUserProfile(); // Refresh current user profile if needed
    } else {
      alert(`Failed to update role: ${error}`);
    }
    setIsUpdatingRole(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <Users className="w-4 h-4 text-blue-600" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      super_admin: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-purple-100 text-purple-800',
      student: 'bg-blue-100 text-blue-800'
    };
    return (
      <Badge className={colors[role]}>
        <div className="flex items-center gap-1">
          {getRoleIcon(role)}
          {role.replace('_', ' ').toUpperCase()}
        </div>
      </Badge>
    );
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'completion':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DRA</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Data Rhythm Academy
              </span>
            </button>
            
            <div className="flex items-center space-x-4">
              {getRoleBadge(userProfile?.role || 'admin')}
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-purple-600 text-white">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {getRoleIcon(userProfile?.role || 'admin')}
                    {userProfile?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard 📊
          </h1>
          <p className="text-gray-600">Manage your courses, students, and track performance.</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalStudents.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{stats.monthlyGrowth}% this month
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.3% this month
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.activeCourses}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalCourses - stats.activeCourses} coming soon
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalCourses}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    All courses available
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className={`grid w-full ${userProfile?.role === 'super_admin' ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            {userProfile?.role === 'super_admin' && (
              <TabsTrigger value="users">User Management</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest updates from your platform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRecentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500">by {activity.user}</p>
                          <p className="text-xs text-gray-400">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your platform efficiently</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Course
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Students
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Platform Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">Student</th>
                          <th className="text-left p-4 font-medium text-gray-900">Courses</th>
                          <th className="text-left p-4 font-medium text-gray-900">Completed</th>
                          <th className="text-left p-4 font-medium text-gray-900">Total Spent</th>
                          <th className="text-left p-4 font-medium text-gray-900">Last Active</th>
                          <th className="text-left p-4 font-medium text-gray-900">Status</th>
                          <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-blue-600 text-white">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">{student.enrolledCourses}</td>
                            <td className="p-4">{student.completedCourses}</td>
                            <td className="p-4">₹{student.totalSpent.toLocaleString()}</td>
                            <td className="p-4">{new Date(student.lastActive).toLocaleDateString()}</td>
                            <td className="p-4">
                              <Badge 
                                variant={student.status === 'active' ? 'default' : 'secondary'}
                                className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                              >
                                {student.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Course
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesData.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription className="mt-2">{course.description}</CardDescription>
                        </div>
                        <Badge 
                          variant={course.available ? 'default' : 'secondary'}
                          className={course.available ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                        >
                          {course.available ? 'Active' : 'Coming Soon'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">₹{course.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Students:</span>
                          <span className="font-medium">{course.students.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Level:</span>
                          <span className="font-medium">{course.level}</span>
                        </div>
                        <div className="flex gap-2 pt-3">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                    <CardDescription>Monthly revenue trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Revenue chart would go here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Student Enrollment</CardTitle>
                    <CardDescription>Course enrollment distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Enrollment chart would go here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* User Management Tab - Super Admin Only */}
          {userProfile?.role === 'super_admin' && (
            <TabsContent value="users" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>
                      Manage user roles and permissions across the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allUsers.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No users found</p>
                        ) : (
                          <div className="grid gap-4">
                            {allUsers.map((user: AppUser) => (
                              <div
                                key={user.uid}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <Avatar>
                                    <AvatarFallback className="bg-blue-600 text-white">
                                      {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.name || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {getRoleBadge(user.role)}
                                  <Select
                                    value={user.role}
                                    onValueChange={(newRole: UserRole) => handleRoleChange(user.uid, newRole)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="student">Student</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}