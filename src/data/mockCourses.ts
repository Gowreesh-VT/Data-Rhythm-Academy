// Mock course data with reliable placeholder images
import { Course, CourseCategory, CourseLevel } from '../types';

// Helper function to add online course features
const addOnlineFeatures = (course: Omit<Course, 'isOnline' | 'hasLiveSupport' | 'discussionEnabled' | 'downloadableResources' | 'mobileAccess' | 'lifetimeAccess' | 'completionCertificate' | 'closedCaptions' | 'multipleLanguageSubtitles' | 'scheduledClasses' | 'classSchedule' | 'liveClassUrl' | 'recordedClassesAvailable' | 'classNotifications' | 'maxStudentsPerClass'>): Course => ({
  ...course,
  isOnline: true as const,
  hasLiveSupport: true,
  discussionEnabled: true,
  downloadableResources: true,
  mobileAccess: true,
  lifetimeAccess: true,
  completionCertificate: true,
  closedCaptions: true,
  multipleLanguageSubtitles: ['en', 'es', 'fr'],
  scheduledClasses: [],
  classSchedule: {
    courseId: course.id,
    pattern: 'weekly',
    daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    startTime: '18:00', // 6 PM
    duration: 90, // 90 minutes
    timezone: 'UTC',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    totalClasses: 12,
    classFrequency: 'Every Monday, Wednesday & Friday'
  },
  liveClassUrl: 'https://meet.google.com/generated-link',
  recordedClassesAvailable: true,
  classNotifications: true,
  maxStudentsPerClass: 50
});

export const getMockCourses = (): Course[] => [
  addOnlineFeatures({
    id: '1',
    title: 'Complete Python Data Science Bootcamp',
    description: 'Learn Python programming, data analysis, machine learning, and data visualization in this comprehensive bootcamp.',
    shortDescription: 'Master Python for data science with hands-on projects',
    instructorId: 'instructor1',
    instructorName: 'Dr. Sarah Johnson',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4',
    instructorBio: 'Data Scientist with 8+ years experience at Google and Microsoft',
    category: 'Data Science' as CourseCategory,
    level: 'Beginner' as CourseLevel,
    language: 'English',
    price: 89.99,
    originalPrice: 199.99,
    currency: 'USD',
    duration: 40,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop&auto=format',
    previewVideoUrl: 'https://example.com/preview1.mp4',
    rating: 4.8,
    totalRatings: 1250,
    totalStudents: 15420,
    lessons: [],
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
    title: 'Advanced React Development',
    description: 'Master advanced React concepts including hooks, context, performance optimization, and testing.',
    shortDescription: 'Build scalable React applications with advanced patterns',
    instructorId: 'instructor2',
    instructorName: 'Alex Chen',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=c084fc',
    category: 'Web Development' as CourseCategory,
    level: 'Advanced' as CourseLevel,
    language: 'English',
    price: 129.99,
    originalPrice: 249.99,
    currency: 'USD',
    duration: 35,
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&auto=format',
    previewVideoUrl: 'https://example.com/preview2.mp4',
    rating: 4.9,
    totalRatings: 890,
    totalStudents: 8350,
    lessons: [],
    learningObjectives: [
      'Master React hooks and custom hooks',
      'Implement complex state management',
      'Optimize React app performance',
      'Write comprehensive tests'
    ],
    prerequisites: ['React basics', 'JavaScript ES6+'],
    tags: ['React', 'JavaScript', 'Frontend', 'Testing'],
    isPublished: true,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-09-10')
  }),
  addOnlineFeatures({
    id: '3',
    title: 'Machine Learning Fundamentals',
    description: 'Comprehensive introduction to machine learning algorithms, model evaluation, and practical implementation.',
    shortDescription: 'Learn ML algorithms and build predictive models',
    instructorId: 'instructor3',
    instructorName: 'Dr. Michael Rodriguez',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael&backgroundColor=34d399',
    category: 'Data Science' as CourseCategory,
    level: 'Intermediate' as CourseLevel,
    language: 'English',
    price: 99.99,
    originalPrice: 179.99,
    currency: 'USD',
    duration: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop&auto=format',
    previewVideoUrl: 'https://example.com/preview3.mp4',
    rating: 4.7,
    totalRatings: 2100,
    totalStudents: 12800,
    lessons: [],
    learningObjectives: [
      'Understand key ML algorithms',
      'Evaluate model performance',
      'Handle real-world datasets',
      'Deploy ML models'
    ],
    prerequisites: ['Python basics', 'Statistics knowledge'],
    tags: ['Machine Learning', 'Python', 'AI', 'Statistics'],
    isPublished: true,
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date('2024-09-05')
  }),
  addOnlineFeatures({
    id: '4',
    title: 'Full-Stack JavaScript Development',
    description: 'Build complete web applications using Node.js, Express, MongoDB, and React.',
    shortDescription: 'Become a full-stack developer with the MERN stack',
    instructorId: 'instructor4',
    instructorName: 'Emma Thompson',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma&backgroundColor=f87171',
    category: 'Web Development' as CourseCategory,
    level: 'Intermediate' as CourseLevel,
    language: 'English',
    price: 149.99,
    originalPrice: 299.99,
    currency: 'USD',
    duration: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=300&fit=crop&auto=format',
    previewVideoUrl: 'https://example.com/preview4.mp4',
    rating: 4.6,
    totalRatings: 1580,
    totalStudents: 9240,
    lessons: [],
    learningObjectives: [
      'Build RESTful APIs with Node.js and Express',
      'Work with MongoDB and Mongoose',
      'Create responsive frontends with React',
      'Deploy applications to production'
    ],
    prerequisites: ['JavaScript fundamentals', 'HTML/CSS basics'],
    tags: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Full Stack'],
    isPublished: true,
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date('2024-08-28')
  }),
  addOnlineFeatures({
    id: '5',
    title: 'Digital Marketing Mastery',
    description: 'Learn SEO, social media marketing, content marketing, and paid advertising strategies.',
    shortDescription: 'Master digital marketing across all platforms',
    instructorId: 'instructor5',
    instructorName: 'David Kumar',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=fbbf24',
    category: 'Marketing' as CourseCategory,
    level: 'Beginner' as CourseLevel,
    language: 'English',
    price: 79.99,
    originalPrice: 159.99,
    currency: 'USD',
    duration: 25,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&auto=format',
    previewVideoUrl: 'https://example.com/preview5.mp4',
    rating: 4.5,
    totalRatings: 920,
    totalStudents: 6780,
    lessons: [],
    learningObjectives: [
      'Master SEO and content marketing',
      'Create effective social media campaigns',
      'Understand Google Ads and Facebook Ads',
      'Analyze marketing metrics and ROI'
    ],
    prerequisites: ['Basic computer skills'],
    tags: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
    isPublished: true,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-08-20')
  }),
  addOnlineFeatures({
    id: '6',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn user interface and user experience design principles, tools, and best practices.',
    shortDescription: 'Create beautiful and user-friendly digital experiences',
    instructorId: 'instructor6',
    instructorName: 'Lisa Park',
    instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa&backgroundColor=a78bfa',
    category: 'Design' as CourseCategory,
    level: 'Beginner' as CourseLevel,
    language: 'English',
    price: 109.99,
    originalPrice: 219.99,
    currency: 'USD',
    duration: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop&auto=format',
    previewVideoUrl: 'https://example.com/preview6.mp4',
    rating: 4.8,
    totalRatings: 1350,
    totalStudents: 8900,
    lessons: [],
    learningObjectives: [
      'Understand design principles and psychology',
      'Create wireframes and prototypes',
      'Master Figma and design tools',
      'Conduct user research and testing'
    ],
    prerequisites: ['Creative mindset', 'Basic computer skills'],
    tags: ['UI Design', 'UX Design', 'Figma', 'Prototyping'],
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