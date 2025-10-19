import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  setDoc,
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
import { logger } from '../utils/logger';
import { Course, Enrollment, CourseProgress, User } from '../types';

// Helper function to safely update user documents (creates if doesn't exist)
const safeUpdateUserDoc = async (userId: string, updateData: any) => {
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, updateData);
  } catch (error: any) {
    if (error.code === 'not-found') {
      // Create user document with minimal data if it doesn't exist
      await setDoc(userDocRef, {
        ...updateData,
        enrolledCourses: updateData.enrolledCourses || [],
        createdCourses: updateData.createdCourses || [],
        assignedStudents: updateData.assignedStudents || [],
        assignedInstructors: updateData.assignedInstructors || [],
        profileStatus: updateData.profileStatus || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      throw error;
    }
  }
};

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
    await setDoc(userDocRef, {
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
    logger.error('Error creating user profile:', error);
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
    logger.error('Error getting user profile:', error);
    return { error: error as Error };
  }
};

// Course Management
export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>, adminId?: string) => {
  try {
    // Check if the user is an admin (if adminId is provided)
    if (adminId) {
      const adminDoc = await getDoc(doc(db, 'users', adminId));
      if (!adminDoc.exists() || adminDoc.data()?.role !== 'admin') {
        throw new Error('Permission denied: Admin role required to create courses');
      }
    }

    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add course to instructor's created courses using safe update
    await safeUpdateUserDoc(courseData.instructorId, {
      createdCourses: arrayUnion(docRef.id)
    });
    
    return { data: { id: docRef.id, ...courseData } };
  } catch (error) {
    logger.error('Error creating course:', error);
    return { error: error as Error };
  }
};

export const updateCourse = async (courseId: string, updates: Partial<Course>, adminId?: string) => {
  try {
    // Check if the user is an admin (if adminId is provided)
    if (adminId) {
      const adminDoc = await getDoc(doc(db, 'users', adminId));
      if (!adminDoc.exists() || adminDoc.data()?.role !== 'admin') {
        throw new Error('Permission denied: Admin role required to update courses');
      }
    }

    const courseDocRef = doc(db, 'courses', courseId);
    await updateDoc(courseDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    logger.error('Error updating course:', error);
    return { error: error as Error };
  }
};

export const deleteCourse = async (courseId: string, adminId: string) => {
  try {
    // Check if the user is an admin
    const adminDoc = await getDoc(doc(db, 'users', adminId));
    if (!adminDoc.exists() || adminDoc.data()?.role !== 'admin') {
      throw new Error('Permission denied: Admin role required to delete courses');
    }

    // Delete the course document
    await deleteDoc(doc(db, 'courses', courseId));
    
    logger.info('Course deleted successfully', { courseId, adminId });
    return { data: true };
  } catch (error) {
    logger.error('Error deleting course:', error);
    return { error: error as Error };
  }
};

export const getCourse = async (courseId: string) => {
  try {
    // Get from Firestore
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (courseDoc.exists()) {
      return { data: { id: courseDoc.id, ...courseDoc.data() } as Course };
    }
    
    return { data: null };
  } catch (error) {
    logger.error('Error getting course:', error);
    return { error: error as Error };
  }
};

export const getPublishedCourses = async () => {
  try {
    // Get published courses from Firestore
    const q = query(collection(db, 'courses'), where('isPublished', '==', true));
    const querySnapshot = await getDocs(q);
    const allCourses: Course[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];

    return { data: allCourses };
  } catch (error) {
    logger.error('Error getting published courses:', error);
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
    logger.error('Error getting instructor courses:', error);
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
    // Get user data to include name in enrollment
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    // Create enrollment record
    const enrollmentData: Omit<Enrollment, 'id'> = {
      userId,
      userName: userData?.displayName || userData?.email || 'Unknown User',
      userEmail: userData?.email || '',
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
    
    // Update user's enrolled courses using safe update
    await safeUpdateUserDoc(userId, {
      enrolledCourses: arrayUnion(courseId)
    });
    
    // Update course student count (optional, won't fail if course doc doesn't exist)
    try {
      const courseDocRef = doc(db, 'courses', courseId);
      await updateDoc(courseDocRef, {
        totalStudents: increment(1)
      });
    } catch (courseError) {
      // Course document doesn't exist in Firestore (using mock data)
      logger.log('Course document not found in Firestore (using mock data)');
    }
    
    return { data: { id: docRef.id, ...enrollmentData } };
  } catch (error) {
    logger.error('Error enrolling in course:', error);
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
    logger.error('Error getting user enrollments:', error);
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
    logger.error('Error getting enrolled courses:', error);
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
    logger.error('Error checking enrollment:', error);
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
    logger.error('Error updating progress:', error);
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
    logger.error('Error marking lesson complete:', error);
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
    logger.error('Error fetching users:', error);
    return { error: error as Error };
  }
};

export const updateUserRole = async (userId: string, newRole: 'student' | 'instructor' | 'admin', adminId: string) => {
  try {
    // Get current user data to check old role
    const userDoc = await getDoc(doc(db, 'users', userId));
    const currentUserData = userDoc.data();
    const oldRole = currentUserData?.role || 'unknown';
    
    // Check if we need to generate a new unique ID
    // Generate new unique ID when changing between instructor and student roles
    let updateData: any = {
      role: newRole,
      updatedAt: serverTimestamp(),
      lastModifiedBy: adminId
    };
    
    if ((oldRole === 'instructor' && newRole === 'student') || 
        (oldRole === 'student' && newRole === 'instructor')) {
      // Generate new unique ID for the new role
      const newUniqueId = await generateUniqueId(newRole);
      updateData.uniqueId = newUniqueId;
      
      logger.info(`Role change requires new unique ID: ${oldRole} -> ${newRole}, new ID: ${newUniqueId}`);
    }
    
    await safeUpdateUserDoc(userId, updateData);
    
    // Log the role change
    await addDoc(collection(db, 'admin_logs'), {
      action: 'role_change',
      targetUserId: userId,
      adminId: adminId,
      oldRole: oldRole,
      newRole: newRole,
      newUniqueId: updateData.uniqueId || null,
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    logger.error('Error updating user role:', error);
    return { error: error as Error };
  }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'pending', adminId: string) => {
  try {
    await safeUpdateUserDoc(userId, {
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
    logger.error('Error updating user status:', error);
    return { error: error as Error };
  }
};

export const assignStudentToInstructor = async (instructorId: string, studentId: string, adminId: string, courseId?: string) => {
  try {
    // Update instructor's assigned students
    await safeUpdateUserDoc(instructorId, {
      assignedStudents: arrayUnion(studentId),
      updatedAt: serverTimestamp()
    });
    
    // Update student's assigned instructors
    await safeUpdateUserDoc(studentId, {
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
    logger.error('Error assigning student to instructor:', error);
    return { error: error as Error };
  }
};

export const removeStudentFromInstructor = async (instructorId: string, studentId: string, adminId: string) => {
  try {
    // Update instructor's assigned students
    await safeUpdateUserDoc(instructorId, {
      assignedStudents: arrayRemove(studentId),
      updatedAt: serverTimestamp()
    });
    
    // Update student's assigned instructors
    await safeUpdateUserDoc(studentId, {
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
    logger.error('Error removing student from instructor:', error);
    return { error: error as Error };
  }
};

// Online class scheduling
export const createOnlineClass = async (classData: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'online_classes'), {
      ...classData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { data: { id: docRef.id, ...classData } };
  } catch (error) {
    logger.error('Error creating online class:', error);
    return { error: error as Error };
  }
};

export const updateOnlineClass = async (classId: string, updates: any) => {
  try {
    const classRef = doc(db, 'online_classes', classId);
    await updateDoc(classRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    logger.error('Error updating online class:', error);
    return { error: error as Error };
  }
};

export const deleteOnlineClass = async (classId: string) => {
  try {
    await deleteDoc(doc(db, 'online_classes', classId));
    return { success: true };
  } catch (error) {
    logger.error('Error deleting online class:', error);
    return { error: error as Error };
  }
};

export const getUpcomingClassesForCourse = async (courseId: string) => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'online_classes'),
      where('courseId', '==', courseId),
      where('scheduledAt', '>=', now),
      orderBy('scheduledAt', 'asc')
    );
    const snapshot = await getDocs(q);
    const classes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { data: classes };
  } catch (error) {
    logger.error('Error fetching upcoming classes for course:', error);
    return { error: error as Error };
  }
};

export const listenToUpcomingClassesForStudent = (studentId: string, callback: (classes: any[]) => void) => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'online_classes'),
      where('attendees', 'array-contains', studentId),
      where('scheduledAt', '>=', now),
      orderBy('scheduledAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const classes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(classes as any[]);
    });
  } catch (error) {
    logger.error('Error listening to upcoming classes for student:', error);
    return () => {};
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
    logger.error('Error fetching instructor students:', error);
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
    logger.error('Error fetching user management stats:', error);
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
    logger.error('Error creating admin user:', error);
    return { error: error as Error };
  }
};

// Utility function to update existing enrollments with user names
// This can be used to backfill userName and userEmail for existing enrollment records
export const updateEnrollmentsWithUserNames = async () => {
  try {
    logger.log('Starting to update enrollments with user names...');
    
    // Get all enrollments that don't have userName
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userName', '==', null)
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    let updatedCount = 0;
    
    for (const enrollmentDoc of enrollmentsSnapshot.docs) {
      const enrollment = enrollmentDoc.data();
      
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', enrollment.userId));
      const userData = userDoc.data();
      
      if (userData) {
        // Update enrollment with user name and email
        await updateDoc(enrollmentDoc.ref, {
          userName: userData.displayName || userData.email || 'Unknown User',
          userEmail: userData.email || '',
          updatedAt: new Date()
        });
        updatedCount++;
      }
    }
    
    logger.log(`Successfully updated ${updatedCount} enrollment records with user names`);
    return { data: { updatedCount }, error: null };
  } catch (error) {
    logger.error('Error updating enrollments with user names:', error);
    return { data: null, error: error as Error };
  }
};

// Unique ID Management Functions
export const generateUniqueId = async (role: 'instructor' | 'student'): Promise<string> => {
  try {
    const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year (25 for 2025)
    const prefix = role === 'instructor' ? `DRA-INS-${currentYear}` : `DRA-STU-${currentYear}`;
    const digitCount = 3; // xxx format for both types
    
    // Query all users with the same role to find the highest number
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      where('uniqueId', '>=', prefix),
      where('uniqueId', '<', prefix + '\uf8ff')
    );
    
    const snapshot = await getDocs(q);
    let maxNumber = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.uniqueId && data.uniqueId.startsWith(prefix)) {
        // Extract number part after the prefix (e.g., "001" from "DRA-INS-25001")
        const numberPart = data.uniqueId.substring(prefix.length);
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    const paddedNumber = nextNumber.toString().padStart(digitCount, '0');
    return `${prefix}${paddedNumber}`;
  } catch (error) {
    logger.error('Error generating unique ID:', error);
    throw error;
  }
};

// Helper function to validate unique ID format
export const validateUniqueIdFormat = (uniqueId: string, role: 'instructor' | 'student'): { isValid: boolean; error?: string } => {
  if (!uniqueId || typeof uniqueId !== 'string') {
    return { isValid: false, error: 'Unique ID is required' };
  }

  const currentYear = new Date().getFullYear().toString().slice(-2);
  const expectedPrefix = role === 'instructor' ? `DRA-INS-${currentYear}` : `DRA-STU-${currentYear}`;
  
  // Check if it follows the correct format: DRA-INS-25xxx or DRA-STU-25xxx
  const formatRegex = role === 'instructor' 
    ? new RegExp(`^DRA-INS-${currentYear}\\d{3}$`)
    : new RegExp(`^DRA-STU-${currentYear}\\d{3}$`);

  if (!formatRegex.test(uniqueId)) {
    return { 
      isValid: false, 
      error: `Invalid format. Expected format: ${expectedPrefix}xxx (e.g., ${expectedPrefix}001)` 
    };
  }

  return { isValid: true };
};

export const assignUniqueId = async (userId: string, newUniqueId: string, adminId: string) => {
  try {
    // Verify admin permissions
    const adminDoc = await getDoc(doc(db, 'users', adminId));
    if (!adminDoc.exists() || adminDoc.data()?.role !== 'admin') {
      throw new Error('Permission denied: Admin role required to assign unique IDs');
    }

    // Get user data to validate against their role
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const userRole = userData?.role;
    
    if (userRole === 'admin') {
      throw new Error('Admin users do not require unique IDs');
    }

    if (!userRole || (userRole !== 'instructor' && userRole !== 'student')) {
      throw new Error('User role must be instructor or student to assign unique ID');
    }

    // Validate the unique ID format
    const validation = validateUniqueIdFormat(newUniqueId, userRole);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check if unique ID is already taken
    const existingQuery = query(
      collection(db, 'users'),
      where('uniqueId', '==', newUniqueId)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      const existingUser = existingSnapshot.docs[0];
      if (existingUser.id !== userId) {
        throw new Error('Unique ID is already assigned to another user');
      }
    }

    // Update user with new unique ID
    await updateDoc(doc(db, 'users', userId), {
      uniqueId: newUniqueId,
      updatedAt: serverTimestamp()
    });

    // Log the change
    await addDoc(collection(db, 'admin_logs'), {
      action: 'assign_unique_id',
      userId,
      uniqueId: newUniqueId,
      adminId,
      timestamp: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    logger.error('Error assigning unique ID:', error);
    return { error: error as Error };
  }
};

export const getAvailableInstructors = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'instructor'),
      where('profileStatus', '==', 'active')
    );
    const snapshot = await getDocs(q);
    const instructors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    
    return { data: instructors };
  } catch (error) {
    logger.error('Error getting available instructors:', error);
    return { error: error as Error };
  }
};