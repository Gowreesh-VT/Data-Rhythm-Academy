import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, Enrollment, CourseProgress, User } from '../types';

// User Management
export const createUserProfile = async (userId: string, userData: {
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'instructor' | 'admin';
  profileStatus?: 'active' | 'suspended' | 'pending';
  assignedStudents?: string[];
  assignedInstructors?: string[];
}) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...userData,
      enrolledCourses: [],
      createdCourses: userData.role === 'instructor' ? [] : undefined,
      profileStatus: userData.profileStatus || 'active',
      assignedStudents: userData.assignedStudents || [],
      assignedInstructors: userData.assignedInstructors || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { error: error as Error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { data: { id: userDoc.id, ...userDoc.data() } as User };
    }
    return { data: null };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { error: error as Error };
  }
};

// Course Management
export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add course to instructor's created courses
    const userDocRef = doc(db, 'users', courseData.instructorId);
    await updateDoc(userDocRef, {
      createdCourses: arrayUnion(docRef.id)
    });
    
    return { data: { id: docRef.id, ...courseData } };
  } catch (error) {
    console.error('Error creating course:', error);
    return { error: error as Error };
  }
};

export const updateCourse = async (courseId: string, updates: Partial<Course>) => {
  try {
    const courseDocRef = doc(db, 'courses', courseId);
    await updateDoc(courseDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating course:', error);
    return { error: error as Error };
  }
};

export const getCourse = async (courseId: string) => {
  try {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (courseDoc.exists()) {
      return { data: { id: courseDoc.id, ...courseDoc.data() } as Course };
    }
    return { data: null };
  } catch (error) {
    console.error('Error getting course:', error);
    return { error: error as Error };
  }
};

export const getPublishedCourses = async () => {
  try {
    const q = query(
      collection(db, 'courses'), 
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];
    return { data: courses };
  } catch (error) {
    console.error('Error getting published courses:', error);
    return { error: error as Error };
  }
};

export const getInstructorCourses = async (instructorId: string) => {
  try {
    const q = query(
      collection(db, 'courses'), 
      where('instructorId', '==', instructorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const courses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];
    return { data: courses };
  } catch (error) {
    console.error('Error getting instructor courses:', error);
    return { error: error as Error };
  }
};

// Enrollment Management
export const enrollInCourse = async (userId: string, courseId: string, paymentData?: {
  paymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}) => {
  try {
    // Create enrollment record
    const enrollmentData: Omit<Enrollment, 'id'> = {
      userId,
      courseId,
      enrolledAt: new Date(),
      status: 'active',
      lastActivity: new Date(),
      progress: {
        userId,
        courseId,
        completedLessons: [],
        totalLessons: 0,
        completionPercentage: 0,
        timeSpent: 0,
        lastAccessedAt: new Date(),
        quizScores: {}
      },
      paymentData: paymentData ? {
        ...paymentData,
        paymentDate: new Date(),
        status: 'completed' as const
      } : undefined
    };
    
    const docRef = await addDoc(collection(db, 'enrollments'), enrollmentData);
    
    // Update user's enrolled courses
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      enrolledCourses: arrayUnion(courseId)
    });
    
    // Update course student count
    const courseDocRef = doc(db, 'courses', courseId);
    await updateDoc(courseDocRef, {
      totalStudents: increment(1)
    });
    
    return { data: { id: docRef.id, ...enrollmentData } };
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return { error: error as Error };
  }
};

export const getUserEnrollments = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'enrollments'), 
      where('userId', '==', userId),
      orderBy('enrolledAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const enrollments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Enrollment[];
    return { data: enrollments };
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    return { error: error as Error };
  }
};

export const getUserEnrolledCourses = async (userId: string) => {
  try {
    // Get user's enrollments
    const enrollmentsResult = await getUserEnrollments(userId);
    if (enrollmentsResult.error) {
      return { error: enrollmentsResult.error };
    }
    
    const enrollments = enrollmentsResult.data || [];
    const courseIds = enrollments.map(e => e.courseId);
    
    if (courseIds.length === 0) {
      return { data: [] };
    }
    
    // Get course details for enrolled courses
    const coursesPromises = courseIds.map(courseId => getCourse(courseId));
    const coursesResults = await Promise.all(coursesPromises);
    
    const courses = coursesResults
      .filter(result => result.data !== null)
      .map(result => result.data!) as Course[];
    
    // Merge with enrollment data
    const coursesWithProgress = courses.map(course => {
      const enrollment = enrollments.find(e => e.courseId === course.id);
      return {
        ...course,
        enrollment,
        progress: enrollment?.progress
      };
    });
    
    return { data: coursesWithProgress };
  } catch (error) {
    console.error('Error getting enrolled courses:', error);
    return { error: error as Error };
  }
};

export const checkUserEnrollment = async (userId: string, courseId: string) => {
  try {
    const q = query(
      collection(db, 'enrollments'), 
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    return { data: !querySnapshot.empty };
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return { error: error as Error };
  }
};

// Progress Tracking
export const updateCourseProgress = async (
  userId: string, 
  courseId: string, 
  progressData: Partial<CourseProgress>
) => {
  try {
    const q = query(
      collection(db, 'enrollments'), 
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const enrollmentDoc = querySnapshot.docs[0];
      await updateDoc(enrollmentDoc.ref, {
        'progress': {
          ...enrollmentDoc.data().progress,
          ...progressData,
          lastAccessedAt: serverTimestamp()
        }
      });
      return { success: true };
    }
    
    return { error: new Error('Enrollment not found') };
  } catch (error) {
    console.error('Error updating progress:', error);
    return { error: error as Error };
  }
};

export const markLessonComplete = async (userId: string, courseId: string, lessonId: string) => {
  try {
    const q = query(
      collection(db, 'enrollments'), 
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const enrollmentDoc = querySnapshot.docs[0];
      const currentProgress = enrollmentDoc.data().progress;
      
      if (!currentProgress.completedLessons.includes(lessonId)) {
        const newCompletedLessons = [...currentProgress.completedLessons, lessonId];
        const completionPercentage = Math.round(
          (newCompletedLessons.length / currentProgress.totalLessons) * 100
        );
        
        await updateDoc(enrollmentDoc.ref, {
          'progress.completedLessons': newCompletedLessons,
          'progress.completionPercentage': completionPercentage,
          'progress.lastAccessedAt': serverTimestamp(),
          lastActivity: serverTimestamp()
        });
        
        // Mark as completed if 100%
        if (completionPercentage === 100) {
          await updateDoc(enrollmentDoc.ref, {
            completedAt: serverTimestamp()
          });
        }
      }
      
      return { success: true };
    }
    
    return { error: new Error('Enrollment not found') };
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    return { error: error as Error };
  }
};

// Real-time subscriptions
export const subscribeToUserEnrollments = (userId: string, callback: (enrollments: Enrollment[]) => void) => {
  const q = query(
    collection(db, 'enrollments'), 
    where('userId', '==', userId),
    orderBy('enrolledAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const enrollments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Enrollment[];
    callback(enrollments);
  });
};

export const subscribeToInstructorCourses = (instructorId: string, callback: (courses: Course[]) => void) => {
  const q = query(
    collection(db, 'courses'), 
    where('instructorId', '==', instructorId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];
    callback(courses);
  });
};

// Admin Management Functions
export const getAllUsers = async (role?: 'student' | 'instructor' | 'admin') => {
  try {
    let q;
    if (role) {
      q = query(collection(db, 'users'), where('role', '==', role), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    
    return { data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: error as Error };
  }
};

export const updateUserRole = async (userId: string, newRole: 'student' | 'instructor' | 'admin', adminId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
      lastModifiedBy: adminId
    });
    
    // Log the role change
    await addDoc(collection(db, 'admin_logs'), {
      action: 'role_change',
      targetUserId: userId,
      adminId: adminId,
      oldRole: 'unknown', // Would need to fetch current role first
      newRole: newRole,
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { error: error as Error };
  }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'pending', adminId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profileStatus: status,
      updatedAt: serverTimestamp(),
      lastModifiedBy: adminId
    });
    
    await addDoc(collection(db, 'admin_logs'), {
      action: 'status_change',
      targetUserId: userId,
      adminId: adminId,
      newStatus: status,
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { error: error as Error };
  }
};

export const assignStudentToInstructor = async (instructorId: string, studentId: string, adminId: string, courseId?: string) => {
  try {
    // Update instructor's assigned students
    const instructorRef = doc(db, 'users', instructorId);
    await updateDoc(instructorRef, {
      assignedStudents: arrayUnion(studentId),
      updatedAt: serverTimestamp()
    });
    
    // Update student's assigned instructors
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
      assignedInstructors: arrayUnion(instructorId),
      updatedAt: serverTimestamp()
    });
    
    // Create relationship record
    await addDoc(collection(db, 'instructor_student_relationships'), {
      instructorId,
      studentId,
      assignedAt: serverTimestamp(),
      assignedBy: adminId,
      courseId: courseId || null,
      status: 'active'
    });
    
    await addDoc(collection(db, 'admin_logs'), {
      action: 'assign_student',
      instructorId,
      studentId,
      adminId,
      courseId: courseId || null,
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error assigning student to instructor:', error);
    return { error: error as Error };
  }
};

export const removeStudentFromInstructor = async (instructorId: string, studentId: string, adminId: string) => {
  try {
    // Update instructor's assigned students
    const instructorRef = doc(db, 'users', instructorId);
    await updateDoc(instructorRef, {
      assignedStudents: arrayRemove(studentId),
      updatedAt: serverTimestamp()
    });
    
    // Update student's assigned instructors
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
      assignedInstructors: arrayRemove(instructorId),
      updatedAt: serverTimestamp()
    });
    
    // Update relationship status
    const relationshipQuery = query(
      collection(db, 'instructor_student_relationships'),
      where('instructorId', '==', instructorId),
      where('studentId', '==', studentId),
      where('status', '==', 'active')
    );
    
    const relationshipSnapshot = await getDocs(relationshipQuery);
    relationshipSnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        status: 'inactive',
        removedAt: serverTimestamp(),
        removedBy: adminId
      });
    });
    
    await addDoc(collection(db, 'admin_logs'), {
      action: 'remove_student',
      instructorId,
      studentId,
      adminId,
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing student from instructor:', error);
    return { error: error as Error };
  }
};

export const getInstructorStudents = async (instructorId: string) => {
  try {
    const relationshipQuery = query(
      collection(db, 'instructor_student_relationships'),
      where('instructorId', '==', instructorId),
      where('status', '==', 'active')
    );
    
    const relationshipSnapshot = await getDocs(relationshipQuery);
    const studentIds = relationshipSnapshot.docs.map(doc => doc.data().studentId);
    
    if (studentIds.length === 0) {
      return { data: [] };
    }
    
    const studentsQuery = query(
      collection(db, 'users'),
      where('__name__', 'in', studentIds)
    );
    
    const studentsSnapshot = await getDocs(studentsQuery);
    const students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    
    return { data: students };
  } catch (error) {
    console.error('Error fetching instructor students:', error);
    return { error: error as Error };
  }
};

export const getUserManagementStats = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => doc.data()) as User[];
    
    const stats = {
      totalUsers: users.length,
      totalStudents: users.filter(u => u.role === 'student').length,
      totalInstructors: users.filter(u => u.role === 'instructor').length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      activeUsers: users.filter(u => u.profileStatus === 'active').length,
      suspendedUsers: users.filter(u => u.profileStatus === 'suspended').length,
      recentSignups: users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    };
    
    return { data: stats };
  } catch (error) {
    console.error('Error fetching user management stats:', error);
    return { error: error as Error };
  }
};

export const createAdminUser = async (adminData: {
  email: string;
  displayName: string;
  photoURL?: string;
}) => {
  try {
    const adminUser = {
      ...adminData,
      role: 'admin' as const,
      profileStatus: 'active' as const,
      permissions: {
        canManageUsers: true,
        canManageCourses: true,
        canViewAnalytics: true,
        canManagePayments: true,
        canManageContent: true,
        canAccessSystemSettings: true,
        canChangeUserRoles: true,
        canSuspendUsers: true,
        canDeleteUsers: true,
        canAssignInstructorStudents: true
      },
      enrolledCourses: [],
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'users'), adminUser);
    return { data: { id: docRef.id, ...adminUser } };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { error: error as Error };
  }
};