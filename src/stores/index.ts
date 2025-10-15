import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, User, Enrollment } from '../types';

// App State Store
interface AppState {
  // UI State
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Course State
  courses: Course[];
  enrolledCourses: Course[];
  currentCourse: Course | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  
  setCourses: (courses: Course[]) => void;
  setEnrolledCourses: (courses: Course[]) => void;
  setCurrentCourse: (course: Course | null) => void;
  addEnrolledCourse: (course: Course) => void;
  
  // TODO: Add computed values when CourseProgress is integrated
  // favoritesCourses: Course[];
  // completedCourses: Course[];
  // inProgressCourses: Course[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      theme: 'system',
      sidebarCollapsed: false,
      
      user: null,
      isAuthenticated: false,
      
      courses: [],
      enrolledCourses: [],
      currentCourse: null,
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      
      setCourses: (courses) => set({ courses }),
      setEnrolledCourses: (enrolledCourses) => set({ enrolledCourses }),
      setCurrentCourse: (currentCourse) => set({ currentCourse }),
      addEnrolledCourse: (course) => set((state) => ({
        enrolledCourses: [...state.enrolledCourses, course]
      }))
      
      // TODO: Add computed values for favorites and progress when CourseProgress is integrated
      // get favoritesCourses() {
      //   return get().enrolledCourses.filter(course => course.isFavorite);
      // },
      // 
      // get completedCourses() {
      //   return get().enrolledCourses.filter(course => course.progress === 100);
      // },
      // 
      // get inProgressCourses() {
      //   return get().enrolledCourses.filter(course => course.progress > 0 && course.progress < 100);
      // }
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Course Progress Store
interface CourseProgressState {
  progress: Record<string, {
    courseId: string;
    completedLessons: string[];
    currentLesson: string | null;
    totalTime: number;
    lastAccessed: number;
    progress: number;
  }>;
  
  updateProgress: (courseId: string, lessonId: string, timeSpent: number) => void;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  setCurrentLesson: (courseId: string, lessonId: string) => void;
  getCourseProgress: (courseId: string) => number;
  getLessonProgress: (courseId: string, lessonId: string) => boolean;
}

export const useCourseProgressStore = create<CourseProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      
      updateProgress: (courseId, lessonId, timeSpent) => {
        set((state) => {
          const courseProgress = state.progress[courseId] || {
            courseId,
            completedLessons: [],
            currentLesson: null,
            totalTime: 0,
            lastAccessed: Date.now(),
            progress: 0
          };
          
          return {
            progress: {
              ...state.progress,
              [courseId]: {
                ...courseProgress,
                currentLesson: lessonId,
                totalTime: courseProgress.totalTime + timeSpent,
                lastAccessed: Date.now()
              }
            }
          };
        });
      },
      
      markLessonComplete: (courseId, lessonId) => {
        set((state) => {
          const courseProgress = state.progress[courseId] || {
            courseId,
            completedLessons: [],
            currentLesson: null,
            totalTime: 0,
            lastAccessed: Date.now(),
            progress: 0
          };
          
          const completedLessons = [...courseProgress.completedLessons];
          if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
          }
          
          // Calculate progress percentage (assuming 10 lessons per course)
          const progress = Math.min((completedLessons.length / 10) * 100, 100);
          
          return {
            progress: {
              ...state.progress,
              [courseId]: {
                ...courseProgress,
                completedLessons,
                progress,
                lastAccessed: Date.now()
              }
            }
          };
        });
      },
      
      setCurrentLesson: (courseId, lessonId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [courseId]: {
              ...state.progress[courseId],
              currentLesson: lessonId,
              lastAccessed: Date.now()
            }
          }
        }));
      },
      
      getCourseProgress: (courseId) => {
        return get().progress[courseId]?.progress || 0;
      },
      
      getLessonProgress: (courseId, lessonId) => {
        return get().progress[courseId]?.completedLessons.includes(lessonId) || false;
      }
    }),
    {
      name: 'course-progress-store'
    }
  )
);

// Notifications Store
interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    timestamp: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      notifications: [{
        ...notification,
        id,
        timestamp: Date.now()
      }, ...state.notifications]
    }));
  },
  
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    }));
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }));
  },
  
  clearAll: () => set({ notifications: [] }),
  
  get unreadCount() {
    return get().notifications.filter(n => !n.read).length;
  }
}));