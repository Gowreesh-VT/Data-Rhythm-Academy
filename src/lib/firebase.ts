import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { logger } from '../utils/logger';

// Get environment variables with proper fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  const value = (import.meta as any).env[key];
  if (!value || value.trim() === '') {
    logger.warn(`Environment variable ${key} is missing or empty, using fallback`);
    return fallback;
  }
  return value.trim();
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'AIzaSyDAFjeEcaZO2JzQp_kdcV_-udClhvoRWJ8'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'the-data-rhythm-academy.firebaseapp.com'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'the-data-rhythm-academy'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'the-data-rhythm-academy.firebasestorage.app'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '340053953391'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:340053953391:web:b8cf96681bc3a9cf74769a'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', 'G-QDXM5DS2TH')
};

// Validate required config
const validateConfig = (config: any) => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !config[key] || config[key].trim() === '');
  
  if (missing.length > 0) {
    throw new Error(`Missing required Firebase config: ${missing.join(', ')}`);
  }
};

// Validate configuration before initialization
validateConfig(firebaseConfig);

// Initialize Firebase with error handling
let app: any;
let auth: any;
let db: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Debug: Log current configuration (safe info only)
  logger.log('Firebase Config:', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'server',
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing',
    configLoaded: true
  });
  
  logger.log('✅ Firebase initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  logger.error('❌ Firebase initialization failed:', error);
  throw error;
}

export { auth, db };

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add additional scopes for better user data
googleProvider.addScope('email');
googleProvider.addScope('profile');
githubProvider.addScope('user:email');

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string, additionalData?: any) => {
    try {
      logger.log('Attempting to create user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      logger.log('User created successfully:', userCredential.user.uid);
      return { 
        data: { user: userCredential.user }, 
        error: null 
      };
    } catch (error: any) {
      logger.error('Sign up error:', error);
      return { 
        data: null, 
        error: { 
          message: error.message,
          code: error.code
        } 
      };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      logger.log('Attempting to sign in with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      logger.log('User signed in successfully:', userCredential.user.uid);
      return { 
        data: { user: userCredential.user }, 
        error: null 
      };
    } catch (error: any) {
      logger.error('Sign in error:', error);
      return { 
        data: null, 
        error: { 
          message: error.message,
          code: error.code
        } 
      };
    }
  },

  // Sign in with OAuth (Google, GitHub, etc.)
  signInWithOAuth: async (provider: 'google' | 'github') => {
    try {
      const authProvider = provider === 'google' ? googleProvider : githubProvider;
      
      // Debug logging in development
      if ((import.meta as any).env.DEV) {
        logger.log(`Attempting ${provider} OAuth sign-in...`);
        logger.log('Auth domain:', firebaseConfig.authDomain);
        logger.log('Current domain:', window.location.hostname);
      }
      
      const result = await signInWithPopup(auth, authProvider);
      return { 
        data: { user: result.user }, 
        error: null 
      };
    } catch (error: any) {
      // Enhanced error logging
      logger.error(`${provider} OAuth Error:`, error);
      
      let errorMessage = error.message;
      let userFriendlyMessage = '';
      
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        errorMessage = `Domain not authorized: ${currentDomain}`;
        userFriendlyMessage = `Authentication not allowed on this domain. Please contact support or try accessing from the main website.`;
        
        // Log helpful information for debugging
        logger.warn('🚨 Unauthorized Domain Error:', {
          currentDomain,
          expectedDomains: [
            'localhost',
            'the-data-rhythm-academy.web.app',
            'datarhythmacademy.in'
          ],
          fixInstructions: 'Add this domain to Firebase Console → Authentication → Settings → Authorized domains'
        });
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
        userFriendlyMessage = 'Your browser blocked the sign-in popup. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in was cancelled.';
        userFriendlyMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed.';
        userFriendlyMessage = 'Sign-in was cancelled. Please try again.';
      }
      
      return { 
        data: null, 
        error: { 
          message: userFriendlyMessage || errorMessage, 
          code: error.code,
          originalMessage: error.message
        } 
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        data: { message: 'Password reset email sent' }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: { message: error.message } 
      };
    }
  }
};

// Firestore helper functions
export const dbHelpers = {
  // Create or update user profile
  createUserProfile: async (userId: string, userData: any) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get user profile
  getUserProfile: async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null };
      } else {
        return { data: null, error: 'User profile not found' };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Course Management
  // Create a new course
  createCourse: async (courseData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get all published courses
  getCourses: async (filters?: any) => {
    try {
      let q = query(
        collection(db, 'courses'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );

      // Add category filter if provided
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }

      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { data: courses, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // Get a specific course by ID
  getCourse: async (courseId: string) => {
    try {
      const docRef = doc(db, 'courses', courseId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
      } else {
        return { data: null, error: 'Course not found' };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Update course
  updateCourse: async (courseId: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Enhanced Enrollment Management for Online Classes
  // Enroll user in a course with scheduled classes
  enrollInCourse: async (userId: string, courseId: string, paymentData?: any) => {
    try {
      const enrollmentData = {
        userId,
        courseId,
        enrolledAt: new Date(),
        status: 'active',
        progress: {
          userId,
          courseId,
          completedLessons: [],
          totalLessons: 0,
          completionPercentage: 0,
          timeSpent: 0,
          lastAccessedAt: new Date(),
          quizScores: {},
          classesAttended: 0,
          totalClasses: 0
        },
        paymentData: paymentData || null,
        lastActivity: new Date()
      };

      const docRef = await addDoc(collection(db, 'enrollments'), enrollmentData);

      // Update user's enrolled courses
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const currentEnrolledCourses = userDoc.data()?.enrolledCourses || [];
      
      await updateDoc(userRef, {
        enrolledCourses: [...currentEnrolledCourses, courseId],
        updatedAt: new Date()
      });

      // Update course student count and add to scheduled classes
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      if (courseDoc.exists()) {
        const currentStudents = courseDoc.data()?.totalStudents || 0;
        await updateDoc(courseRef, {
          totalStudents: currentStudents + 1,
          updatedAt: new Date()
        });

        // Add user to all future scheduled classes
        await dbHelpers.addUserToScheduledClasses(userId, courseId);
      }

      logger.log('✅ User enrolled successfully:', { userId, courseId, enrollmentId: docRef.id });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      logger.error('❌ Enrollment failed:', error);
      return { id: null, error: error.message };
    }
  },

  // Get user's enrolled courses with full details (My Courses)
  getMyCourses: async (userId: string) => {
    try {
      logger.log('🔍 Fetching My Courses for user:', userId);
      
      // Import mock courses
      const { getMockCourses } = await import('../data/mockCourses');
      const allCourses = getMockCourses();
      
      // Get user enrollments
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('lastActivity', 'desc')
      );
      
      const enrollmentSnapshot = await getDocs(enrollmentsQuery);
      const myCourses = [];

      for (const enrollmentDoc of enrollmentSnapshot.docs) {
        const enrollment = { id: enrollmentDoc.id, ...enrollmentDoc.data() } as any;
        
        // Get course details from mock data
        const course = allCourses.find(c => c.id === enrollment.courseId);
        if (course) {
          // Get upcoming scheduled classes (mock for now)
          const upcomingClasses = [
            {
              id: `class-${course.id}-1`,
              title: `${course.title} - Live Session`,
              date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
              time: '18:00',
              duration: 90,
              status: 'scheduled',
              meetingUrl: 'https://meet.google.com/abc-def-ghi'
            }
          ];
          
          const nextClass = upcomingClasses[0];
          
          // Calculate progress summary
          const progressSummary = {
            lessonsCompleted: enrollment.progress?.completedLessons?.length || 0,
            totalLessons: course.lessons?.length || 0,
            classesAttended: enrollment.progress?.classesAttended || 0,
            totalClasses: course.scheduledClasses?.length || 12,
            overallProgress: enrollment.progress?.completionPercentage || Math.floor(Math.random() * 30) // Mock progress
          };

          myCourses.push({
            enrollment,
            course,
            nextClass,
            upcomingClasses: upcomingClasses.slice(0, 5), // Next 5 classes
            lastActivity: enrollment.lastActivity || enrollment.enrolledAt,
            progressSummary
          });
        }
      }

      logger.log('✅ My Courses fetched successfully:', myCourses.length, 'courses');
      return { data: myCourses, error: null };
    } catch (error: any) {
      logger.error('❌ Error fetching My Courses:', error);
      return { data: [], error: error.message };
    }
  },

  // Check if user is enrolled in a course
  isUserEnrolled: async (userId: string, courseId: string) => {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      return { data: !querySnapshot.empty, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  },

  // Scheduled Classes Management
  // Create scheduled classes for a course
  createScheduledClasses: async (courseId: string, classSchedule: any) => {
    try {
      const classes = [];
      const startDate = new Date(classSchedule.startDate);
      const endDate = new Date(classSchedule.endDate);
      
      let currentDate = new Date(startDate);
      let classNumber = 1;

      while (currentDate <= endDate && classes.length < classSchedule.totalClasses) {
        if (classSchedule.daysOfWeek.includes(currentDate.getDay())) {
          const startTime = new Date(currentDate);
          const [hours, minutes] = classSchedule.startTime.split(':');
          startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + classSchedule.duration);

          const scheduledClass = {
            courseId,
            title: `Class ${classNumber}`,
            startTime,
            endTime,
            instructorId: '', // Will be set based on course
            maxStudents: 50,
            enrolledStudents: [],
            status: 'scheduled',
            classType: 'lecture',
            isRecorded: true,
            timezone: classSchedule.timezone,
            reminderSent: false,
            createdAt: new Date()
          };

          const docRef = await addDoc(collection(db, 'scheduledClasses'), scheduledClass);
          classes.push({ id: docRef.id, ...scheduledClass });
          classNumber++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return { data: classes, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // Get upcoming classes for a course
  getUpcomingClasses: async (courseId: string, userId?: string) => {
    try {
      const now = new Date();
      let q = query(
        collection(db, 'scheduledClasses'),
        where('courseId', '==', courseId),
        where('startTime', '>', now),
        orderBy('startTime', 'asc')
      );

      const querySnapshot = await getDocs(q);
      let classes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Filter classes user is enrolled in if userId provided
      if (userId) {
        classes = classes.filter((cls: any) => 
          cls.enrolledStudents?.includes(userId) || cls.enrolledStudents?.length === 0
        );
      }

      return { data: classes, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // Add user to all scheduled classes of a course
  addUserToScheduledClasses: async (userId: string, courseId: string) => {
    try {
      const { data: upcomingClasses } = await dbHelpers.getUpcomingClasses(courseId);
      
      for (const cls of upcomingClasses as any[]) {
        if (!cls.enrolledStudents?.includes(userId)) {
          await updateDoc(doc(db, 'scheduledClasses', cls.id), {
            enrolledStudents: [...(cls.enrolledStudents || []), userId],
            updatedAt: new Date()
          });
        }
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Record class attendance
  recordClassAttendance: async (userId: string, classId: string, attendanceData: any) => {
    try {
      const attendance = {
        userId,
        classId,
        ...attendanceData,
        recordedAt: new Date()
      };

      await addDoc(collection(db, 'classAttendance'), attendance);

      // Update user's progress
      const enrollmentQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId)
      );
      const enrollmentSnapshot = await getDocs(enrollmentQuery);
      
      if (!enrollmentSnapshot.empty) {
        const enrollmentDoc = enrollmentSnapshot.docs[0];
        const currentProgress = enrollmentDoc.data().progress;
        
        await updateDoc(enrollmentDoc.ref, {
          progress: {
            ...currentProgress,
            classesAttended: (currentProgress.classesAttended || 0) + 1,
            lastAccessedAt: new Date()
          },
          lastActivity: new Date()
        });
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get user enrollments
  getUserEnrollments: async (userId: string) => {
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
      }));
      return { data: enrollments, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // Update course progress
  updateCourseProgress: async (userId: string, courseId: string, progressData: any) => {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const enrollmentDoc = querySnapshot.docs[0];
        await updateDoc(enrollmentDoc.ref, {
          progress: {
            ...enrollmentDoc.data().progress,
            ...progressData,
            lastAccessedAt: new Date()
          },
          updatedAt: new Date()
        });
        return { success: true, error: null };
      } else {
        return { success: false, error: 'Enrollment not found' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Create a new post
  createPost: async (postData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get all posts
  getPosts: async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { data: posts, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // Listen to posts in real-time
  listenToPosts: (callback: (posts: any[]) => void) => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(posts);
    });
  }
};