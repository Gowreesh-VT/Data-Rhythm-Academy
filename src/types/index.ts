export type Page =
  | "landing"
  | "login"
  | "register"
  | "privacy"
  | "courses"
  | "course-detail"
  | "my-courses"
  | "instructor-dashboard";

// New path-based navigation type
export type NavigatePath = 
  | "/"
  | "/login" 
  | "/register"
  | "/privacy"
  | "/about"
  | "/courses"
  | "/course/:id"
  | "/lesson/:id"
  | "/my-courses"
  | "/calendar"
  | "/instructor-dashboard"
  | "/admin-dashboard"
  | "/wishlist"
  | "/profile"
  | "/contact";

// Course-related types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'instructor' | 'admin';
  uniqueId?: string; // DRA-INS-25xxx for instructors, DRA-STU-25xxx for students
  enrolledCourses: string[];
  createdCourses?: string[];
  createdAt: Date;
  lastLoginAt: Date;
  // Admin specific permissions
  permissions?: AdminPermissions;
  // Instructor-Student relationships
  assignedStudents?: string[]; // For instructors: list of student IDs they can access
  assignedInstructors?: string[]; // For students: list of instructor IDs who can access them
  // Additional profile info
  bio?: string;
  profileStatus: 'active' | 'suspended' | 'pending';
  lastActivity?: Date;
}

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageCourses: boolean;
  canViewAnalytics: boolean;
  canManagePayments: boolean;
  canManageContent: boolean;
  canAccessSystemSettings: boolean;
  // Specific user management permissions
  canChangeUserRoles: boolean;
  canSuspendUsers: boolean;
  canDeleteUsers: boolean;
  canAssignInstructorStudents: boolean;
}

// Admin Dashboard specific types
export interface UserManagementData {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  activeUsers: number;
  suspendedUsers: number;
  recentSignups: User[];
}

export interface InstructorStudentRelationship {
  instructorId: string;
  instructorName: string;
  studentId: string;
  studentName: string;
  assignedAt: Date;
  assignedBy: string; // Admin ID who made the assignment
  courseId?: string; // Optional: specific course context
  status: 'active' | 'inactive' | 'completed';
}

// Online Class Scheduling types
export interface OnlineClass {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  scheduledAt: Date;
  duration: number; // in minutes
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  platform: 'zoom' | 'meet' | 'teams' | 'custom';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendees: string[]; // student IDs
  maxAttendees?: number;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number; // every N days/weeks/months
    endDate?: Date;
    occurrences?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface OnlineClassAttendance {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  status: 'registered' | 'attended' | 'missed' | 'excused';
  joinedAt?: Date;
  leftAt?: Date;
  attendanceDuration?: number; // in minutes
  createdAt: Date;
}

export interface ClassScheduleData {
  totalClasses: number;
  upcomingClasses: number;
  completedClasses: number;
  todayClasses: OnlineClass[];
  weekClasses: OnlineClass[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  instructorId: string;
  instructorName: string;
  instructorImage?: string;
  instructorBio?: string;
  category: CourseCategory;
  level: CourseLevel;
  language: string;
  price: number;
  originalPrice?: number;
  currency: string;
  enrollmentType: 'direct' | 'enquiry'; // 'direct' for immediate enrollment, 'enquiry' for contact-based
  duration: number; // in hours
  thumbnailUrl: string;
  previewVideoUrl?: string;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  lessons: Lesson[];
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  certificateTemplate?: string;
  // Online course specific features
  isOnline: true; // Always true for this platform
  hasLiveSupport: boolean;
  discussionEnabled: boolean;
  downloadableResources: boolean;
  mobileAccess: boolean;
  lifetimeAccess: boolean;
  completionCertificate: boolean;
  closedCaptions: boolean;
  multipleLanguageSubtitles?: string[];
  // Scheduled class features
  scheduledClasses: ScheduledClass[];
  classSchedule: ClassSchedule;
  liveClassUrl?: string; // Zoom/Meet URL for live classes
  recordedClassesAvailable: boolean;
  classNotifications: boolean;
  maxStudentsPerClass?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
  resources?: LessonResource[];
  quiz?: Quiz;
  transcriptUrl?: string;
  // Enhanced online features
  videoQuality: '720p' | '1080p' | '4K';
  subtitles?: string[]; // Language codes
  playbackSpeed: boolean; // Can adjust speed
  downloadable: boolean;
  notes?: string; // Student notes
  bookmarks?: number[]; // Timestamp bookmarks
  watchTime?: number; // Time watched in seconds
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'download';
  url: string;
  size?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: CourseProgress;
  certificateUrl?: string;
  rating?: number;
  review?: string;
  status: 'active' | 'completed' | 'cancelled' | 'refunded';
  lastActivity: Date;
  paymentData?: {
    paymentId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentDate: Date;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
  };
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  currentLessonId?: string;
  totalLessons: number;
  completionPercentage: number;
  timeSpent: number; // in minutes
  lastAccessedAt: Date;
  quizScores: { [lessonId: string]: number };
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  certificateUrl: string;
  grade?: string;
}

export type CourseCategory = 
  | 'Data Science'
  | 'Machine Learning'
  | 'Web Development'
  | 'Mobile Development'
  | 'Python'
  | 'Database'
  | 'Cloud Computing'
  | 'DevOps'
  | 'Cybersecurity'
  | 'AI'
  | 'Business Analytics'
  | 'Design'
  | 'Marketing';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface CourseFilter {
  category?: CourseCategory;
  level?: CourseLevel;
  priceRange?: [number, number];
  rating?: number;
  duration?: [number, number];
  language?: string;
  sortBy?: 'popularity' | 'rating' | 'newest' | 'price-low' | 'price-high';
}

// Scheduled class types for online course platform
export interface ScheduledClass {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  instructorId: string;
  maxStudents?: number;
  enrolledStudents: string[]; // Array of user IDs
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  classType: 'lecture' | 'workshop' | 'qa' | 'exam' | 'project-review';
  meetingUrl?: string; // Zoom/Meet/Teams URL
  recordingUrl?: string; // Available after class
  materials?: ClassMaterial[];
  attendance?: ClassAttendance[];
  isRecorded: boolean;
  timezone: string;
  reminderSent: boolean;
}

export interface ClassSchedule {
  courseId: string;
  pattern: 'weekly' | 'biweekly' | 'custom';
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  duration: number; // in minutes
  timezone: string;
  startDate: Date;
  endDate: Date;
  totalClasses: number;
  classFrequency: string; // e.g., "Every Monday & Wednesday"
}

export interface ClassMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'slides' | 'worksheet' | 'recording' | 'link';
  url: string;
  uploadedAt: Date;
  description?: string;
  size?: string;
}

export interface ClassAttendance {
  userId: string;
  classId: string;
  joinTime?: Date;
  leaveTime?: Date;
  duration: number; // in minutes
  status: 'present' | 'absent' | 'late';
  participationScore?: number;
}

// My Courses specific types
export interface MyCourse {
  enrollment: Enrollment;
  course: Course;
  nextClass?: ScheduledClass;
  upcomingClasses: ScheduledClass[];
  lastActivity: Date;
  progressSummary: {
    lessonsCompleted: number;
    totalLessons: number;
    classesAttended: number;
    totalClasses: number;
    overallProgress: number;
  };
}