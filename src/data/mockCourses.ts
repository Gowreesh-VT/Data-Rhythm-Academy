// Mock course data with reliable placeholder images
import { Course, CourseCategory, CourseLevel } from '../types';

// Helper function to add online course features with scheduled classes
const addOnlineFeatures = (course: Omit<Course, 'isOnline' | 'hasLiveSupport' | 'discussionEnabled' | 'downloadableResources' | 'mobileAccess' | 'lifetimeAccess' | 'completionCertificate' | 'closedCaptions' | 'scheduledClasses' | 'classSchedule' | 'liveClassUrl' | 'recordedClassesAvailable' | 'classNotifications' | 'maxStudentsPerClass'>): Course => {
  const startDate = new Date();
  const scheduledClasses = [];
  
  // Generate next 8 upcoming classes (Mon, Wed, Fri schedule)
  const classdays = [1, 3, 5]; // Monday, Wednesday, Friday
  let currentDate = new Date(startDate);
  let classCount = 0;
  
  while (classCount < 8) {
    const dayOfWeek = currentDate.getDay();
    if (classdays.includes(dayOfWeek)) {
      scheduledClasses.push({
        id: `class-${course.id}-${classCount + 1}`,
        courseId: course.id,
        title: `${course.title} - Session ${classCount + 1}`,
        description: `Interactive live session covering core concepts of ${course.title}`,
        startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 18, 0), // 6 PM
        endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 19, 30), // 7:30 PM
        instructorId: course.instructorId,
        maxStudents: 50,
        enrolledStudents: [], // Will be populated when students enroll
        status: classCount === 0 ? 'scheduled' as const : 'scheduled' as const,
        classType: 'lecture' as const,
        meetingUrl: `https://meet.google.com/${course.id}-session-${classCount + 1}`,
        recordingUrl: undefined, // Will be available after class
        isRecorded: true,
        timezone: 'Asia/Kolkata',
        reminderSent: false
      });
      classCount++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    ...course,
    isOnline: true as const,
    hasLiveSupport: true,
    discussionEnabled: true,
    downloadableResources: true,
    mobileAccess: true,
    lifetimeAccess: true,
    completionCertificate: true,
    closedCaptions: true,
    scheduledClasses,
    classSchedule: {
      courseId: course.id,
      pattern: 'weekly',
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      startTime: '18:00', // 6 PM
      duration: 90, // 90 minutes
      timezone: 'Asia/Kolkata',
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      totalClasses: 8,
      classFrequency: 'Every Monday, Wednesday & Friday at 6:00 PM IST'
    },
    liveClassUrl: `https://meet.google.com/${course.id}-live`,
    recordedClassesAvailable: true,
    classNotifications: true,
    maxStudentsPerClass: 50
  };
};

export const getMockCourses = (): Course[] => [
  addOnlineFeatures({
    id: '1',
    title: 'Introduction To Python',
    description: 'Master Python programming from Basics and get started with programming',
    shortDescription: 'Master Python programming from Basics and get started with programming',
    instructorId: 'instructor1',
    instructorName: 'Dr. Sarah Johnson',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4',
    instructorBio: 'Data Scientist with 8+ years experience at Google and Microsoft',
    category: 'Python' as CourseCategory,
    level: 'Beginner' as CourseLevel,
    language: 'English',
    price: 1000,
    originalPrice: 3500,
    currency: '₹',
    enrollmentType: 'enquiry' as const,
    duration: 4,
    thumbnailUrl: 'https://images.unsplash.com/photo-1649180556628-9ba704115795?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    previewVideoUrl: 'https://example.com/preview1.mp4',
    rating: 4.9,
    totalRatings: 970,
    totalStudents: 5670,
    lessons: [
      {
        id: 'lesson-1-1',
        courseId: '1',
        title: 'Introduction to Python',
        description: 'Learn the basics of Python programming language',
        duration: 15,
        videoUrl: 'https://example.com/video1.mp4',
        order: 1,
        isPreview: true,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      },
      {
        id: 'lesson-1-2',
        courseId: '1', 
        title: 'Python Syntax and Variables',
        description: 'Understanding Python syntax and working with variables',
        duration: 20,
        videoUrl: 'https://example.com/video2.mp4',
        order: 2,
        isPreview: false,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      },
      {
        id: 'lesson-1-3',
        courseId: '1',
        title: 'Data Types and Structures',
        description: 'Working with lists, dictionaries, and other data structures',
        duration: 25,
        videoUrl: 'https://example.com/video3.mp4',
        order: 3,
        isPreview: false,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      }
    ],
    learningObjectives: [
      'Master Python programming fundamentals',
      'Learn data manipulation with Pandas',
      'Create visualizations with Matplotlib and Seaborn',
      'Build machine learning models with Scikit-learn'
    ],
    prerequisites: ['Basic computer literacy'],
    tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas'],
    isPublished: true,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-09-15')
  }),
  addOnlineFeatures({
    id: '2',
    title: 'Python Programming Adv.',
    description: 'Complete Python bootcamp from basics to advanced web scraping and automation',
    shortDescription: 'Build scalable Python applications with advanced patterns',
    instructorId: 'instructor2',
    instructorName: 'Alex Chen',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=c084fc',
    category: 'Python' as CourseCategory,
    level: 'Advanced' as CourseLevel,
    language: 'English',
    price: 2999,
    originalPrice: 4999,
    currency: '₹',
    enrollmentType: 'direct' as const,
    duration: 8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    previewVideoUrl: 'https://example.com/preview2.mp4',
    rating: 4.85,
    totalRatings: 890,
    totalStudents: 3876,
    lessons: [
      {
        id: 'lesson-2-1',
        courseId: '2',
        title: 'Advanced Python Concepts',
        description: 'Master object-oriented programming and advanced features',
        duration: 30,
        videoUrl: 'https://example.com/python-adv1.mp4',
        order: 1,
        isPreview: true,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      },
      {
        id: 'lesson-2-2',
        courseId: '2',
        title: 'Web Scraping and Automation',
        description: 'Learn to scrape websites and automate tasks with Python',
        duration: 35,
        videoUrl: 'https://example.com/python-adv2.mp4',
        order: 2,
        isPreview: false,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      }
    ],
    learningObjectives: [
      'Master advanced Python programming concepts',
      'Learn web scraping techniques',
      'Build automation scripts',
      'Work with APIs and databases'
    ],
    prerequisites: ['Python basics', 'Programming fundamentals'],
    tags: ['Python', 'Web Scraping', 'Automation', 'Advanced'],
    isPublished: true,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-09-10')
  }),
  addOnlineFeatures({
    id: '3',
    title: 'DSA in Python',
    description: 'Comprehensive guide to data structures and algorithms using Python',
    shortDescription: 'Learn data structures and algorithms with Python implementation',
    instructorId: 'instructor3',
    instructorName: 'Dr. Michael Rodriguez',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael&backgroundColor=34d399',
    category: 'Python' as CourseCategory,
    level: 'Intermediate' as CourseLevel,
    language: 'English',
    price: 1250,
    originalPrice: 3750,
    currency: '₹',
    enrollmentType: 'direct' as const,
    duration: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    previewVideoUrl: 'https://example.com/preview3.mp4',
    rating: 4.5,
    totalRatings: 210,
    totalStudents: 475,
    lessons: [
      {
        id: 'lesson-3-1',
        courseId: '3',
        title: 'Introduction to Data Structures',
        description: 'Understanding arrays, linked lists, and basic data structures',
        duration: 25,
        videoUrl: 'https://example.com/dsa1.mp4',
        order: 1,
        isPreview: true,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      }
    ],
    learningObjectives: [
      'Master fundamental data structures',
      'Implement efficient algorithms',
      'Solve complex programming problems',
      'Optimize code performance'
    ],
    prerequisites: ['Python basics', 'Programming fundamentals'],
    tags: ['Data Structures', 'Algorithms', 'Python', 'Problem Solving'],
    isPublished: true,
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date('2024-09-05')
  }),
  addOnlineFeatures({
    id: '4',
    title: 'Introduction to SQL',
    description: 'Master SQL for data analysis and manipulation',
    shortDescription: 'Learn SQL fundamentals for database management',
    instructorId: 'instructor4',
    instructorName: 'Emma Thompson',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma&backgroundColor=f87171',
    category: 'Database' as CourseCategory,
    level: 'Beginner' as CourseLevel,
    language: 'English',
    price: 1000,
    originalPrice: 3000,
    currency: '₹',
    enrollmentType: 'direct' as const,
    duration: 8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2021&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    previewVideoUrl: 'https://example.com/preview4.mp4',
    rating: 4.75,
    totalRatings: 580,
    totalStudents: 1296,
    lessons: [
      {
        id: 'lesson-4-1',
        courseId: '4',
        title: 'Introduction to Databases',
        description: 'Understanding relational databases and SQL basics',
        duration: 20,
        videoUrl: 'https://example.com/sql1.mp4',
        order: 1,
        isPreview: true,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      }
    ],
    learningObjectives: [
      'Master SQL query fundamentals',
      'Learn database design principles',
      'Perform complex data analysis',
      'Optimize database performance'
    ],
    prerequisites: ['Basic computer knowledge'],
    tags: ['SQL', 'Database', 'Data Analysis', 'MySQL'],
    isPublished: true,
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date('2024-08-28')
  }),
  addOnlineFeatures({
    id: '5',
    title: 'Data Science and Analytics',
    description: 'Comprehensive data science course with Python, R, and real-world datasets',
    shortDescription: 'Master data science with practical applications',
    instructorId: 'instructor5',
    instructorName: 'David Kumar',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=fbbf24',
    category: 'Data Science' as CourseCategory,
    level: 'Intermediate' as CourseLevel,
    language: 'English',
    price: 2500,
    originalPrice: 3500,
    currency: '₹',
    enrollmentType: 'direct' as const,
    duration: 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    previewVideoUrl: 'https://example.com/preview5.mp4',
    rating: 4.7,
    totalRatings: 920,
    totalStudents: 1890,
    lessons: [
      {
        id: 'lesson-5-1',
        courseId: '5',
        title: 'Introduction to Data Science',
        description: 'Understanding data science fundamentals and workflow',
        duration: 18,
        videoUrl: 'https://example.com/datascience1.mp4',
        order: 1,
        isPreview: true,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      }
    ],
    learningObjectives: [
      'Master data analysis with Python and R',
      'Learn statistical analysis techniques',
      'Work with real-world datasets',
      'Build predictive models'
    ],
    prerequisites: ['Python basics', 'Statistics knowledge'],
    tags: ['Data Science', 'Python', 'R', 'Analytics', 'Statistics'],
    isPublished: true,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-08-20')
  }),
  addOnlineFeatures({
    id: '6',
    title: 'Foundation in Machine Learning',
    description: 'Deep dive into ML algorithms, neural networks, and artificial intelligence',
    shortDescription: 'Learn machine learning algorithms and AI fundamentals',
    instructorId: 'instructor6',
    instructorName: 'Lisa Park',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa&backgroundColor=a78bfa',
    category: 'Data Science' as CourseCategory,
    level: 'Intermediate' as CourseLevel,
    language: 'English',
    price: 1250,
    originalPrice: 3750,
    currency: '₹',
    enrollmentType: 'enquiry' as const,
    duration: 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    previewVideoUrl: 'https://example.com/preview6.mp4',
    rating: 4.75,
    totalRatings: 1350,
    totalStudents: 1567,
    lessons: [
      {
        id: 'lesson-6-1',
        courseId: '6',
        title: 'Introduction to Machine Learning',
        description: 'Understanding ML concepts, algorithms, and applications',
        duration: 22,
        videoUrl: 'https://example.com/ml1.mp4',
        order: 1,
        isPreview: true,
        videoQuality: '1080p' as const,
        playbackSpeed: true,
        downloadable: true
      }
    ],
    learningObjectives: [
      'Understand machine learning fundamentals',
      'Implement popular ML algorithms',
      'Work with neural networks',
      'Deploy ML models in production'
    ],
    prerequisites: ['Python basics', 'Statistics knowledge'],
    tags: ['Machine Learning', 'AI', 'Neural Networks', 'Python'],
    isPublished: true,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-08-15')
  })
];

export const getPopularCourses = () => {
  const courses = getMockCourses();
  return courses.sort((a, b) => b.totalStudents - a.totalStudents).slice(0, 3);
};

export const getFeaturedCourses = () => {
  const courses = getMockCourses();
  return courses.sort((a, b) => b.rating - a.rating).slice(0, 4);
};