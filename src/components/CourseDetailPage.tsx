import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Course, Lesson } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Award, 
  FileText, 
  CheckCircle,
  Globe,
  Calendar,
  Target,
  BookOpen,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CourseReviews } from './CourseReviews';
import { trackCourseView, trackCourseEnrollment } from '../lib/analytics';
import { dbHelpers } from '../lib/firebase';

interface CourseDetailPageProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ onNavigate, onLogout }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (courseId) {
      loadCourseData(courseId);
    }
  }, [courseId]);

  const loadCourseData = async (id: string) => {
    try {
      // Mock course data - replace with actual Firebase call
      const mockCourse: Course = {
        id: id,
        title: 'Complete Python Data Science Bootcamp',
        description: `Master Python for Data Science with this comprehensive bootcamp! Learn Python programming fundamentals, data manipulation with Pandas, data visualization with Matplotlib and Seaborn, and machine learning with Scikit-Learn.

This course is designed for beginners who want to break into the field of data science. You'll start with Python basics and progressively move to advanced topics including statistical analysis, machine learning algorithms, and real-world projects.

By the end of this course, you'll have the skills to analyze complex datasets, create beautiful visualizations, and build predictive models that can solve real business problems.`,
        shortDescription: 'Master Python for Data Science from beginner to advanced level',
        instructorId: 'instructor1',
        instructorName: 'Dr. Sarah Johnson',
        instructorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e6?w=150',
        category: 'Data Science',
        level: 'Beginner',
        language: 'English',
        price: 89.99,
        originalPrice: 199.99,
        currency: '$',
        duration: 24.5,
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        previewVideoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
        rating: 4.7,
        totalRatings: 12543,
        totalStudents: 45632,
        lessons: [
          {
            id: '1',
            courseId: id,
            title: 'Introduction to Python and Data Science',
            description: 'Get started with Python programming and understand the data science workflow',
            videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
            duration: 45,
            order: 1,
            isPreview: true,
            videoQuality: '1080p',
            playbackSpeed: true,
            downloadable: false,
            resources: [
              {
                id: '1',
                title: 'Python Installation Guide',
                type: 'pdf',
                url: '#',
                size: '2.1 MB'
              },
              {
                id: '2',
                title: 'Course Resources',
                type: 'link',
                url: '#'
              }
            ]
          },
          {
            id: '2',
            courseId: id,
            title: 'Python Fundamentals',
            description: 'Learn variables, data types, loops, and functions',
            videoUrl: '#',
            duration: 60,
            order: 2,
            isPreview: false,
            videoQuality: '1080p',
            playbackSpeed: true,
            downloadable: true
          },
          {
            id: '3',
            courseId: id,
            title: 'Introduction to NumPy',
            description: 'Master numerical computing with NumPy arrays',
            videoUrl: '#',
            duration: 75,
            order: 3,
            isPreview: false,
            videoQuality: '720p',
            playbackSpeed: true,
            downloadable: true
          },
          {
            id: '4',
            courseId: id,
            title: 'Data Manipulation with Pandas',
            description: 'Learn to clean, transform, and analyze data',
            videoUrl: '#',
            duration: 90,
            order: 4,
            isPreview: false,
            videoQuality: '1080p',
            playbackSpeed: true,
            downloadable: false
          }
        ],
        learningObjectives: [
          'Master Python programming fundamentals',
          'Learn data analysis with Pandas and NumPy',
          'Create stunning visualizations with Matplotlib and Seaborn',
          'Build machine learning models with Scikit-Learn',
          'Work with real-world datasets and projects',
          'Understand statistical concepts for data science'
        ],
        prerequisites: [
          'Basic computer skills',
          'No prior programming experience required',
          'High school level mathematics'
        ],
        tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas', 'NumPy'],
        isPublished: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-10-01'),
        // Online course specific features
        isOnline: true,
        hasLiveSupport: true,
        discussionEnabled: true,
        downloadableResources: true,
        mobileAccess: true,
        lifetimeAccess: true,
        completionCertificate: true,
        closedCaptions: true,
        multipleLanguageSubtitles: ['en', 'es', 'fr'],
        // Scheduled class features
        scheduledClasses: [],
        classSchedule: {
          courseId: id,
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
      };

      setCourse(mockCourse);
      setIsEnrolled(user?.enrolledCourses?.includes(id) || false);
      setProgress(isEnrolled ? Math.random() * 100 : 0);
      setLoading(false);
      
      // Track course view
      trackCourseView(mockCourse.id, mockCourse.title);
    } catch (error) {
      console.error('Error loading course:', error);
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      onNavigate('/login');
      return;
    }

    if (!courseId) {
      console.error('❌ Course ID not found');
      return;
    }

    setEnrolling(true);
    try {
      console.log('🎯 Enrolling user in course:', { userId: user.id, courseId });
      
      // Enroll user in course using Firebase
      const { id: enrollmentId, error } = await dbHelpers.enrollInCourse(user.id, courseId);
      
      if (error) {
        console.error('❌ Enrollment failed:', error);
        alert('Failed to enroll in course. Please try again.');
        return;
      }

      console.log('✅ Successfully enrolled in course:', enrollmentId);
      setIsEnrolled(true);
      
      // Track course enrollment
      if (course) {
        trackCourseEnrollment(course.id, course.title, course.price);
      }
      
      // Show success message and redirect to My Courses
      alert('🎉 Successfully enrolled! Redirecting to your courses...');
      setTimeout(() => {
        onNavigate('/my-courses');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error enrolling:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (course && course.lessons.length > 0) {
      onNavigate(`/lesson/${course.lessons[0].id}`);
    }
  };

  const handlePreviewLesson = (lessonId: string) => {
    onNavigate(`/lesson/${lessonId}`);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => onNavigate('/courses')}>Browse Courses</Button>
        </div>
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
                Data Rhythm Academy
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => onNavigate('/courses')} className="text-gray-700 hover:text-blue-600">
                Browse Courses
              </button>
              {user && (
                <button onClick={() => onNavigate('/my-courses')} className="text-gray-700 hover:text-blue-600">
                  My Courses
                </button>
              )}
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Hello, {user.displayName || user.email}</span>
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onNavigate('/login')}>
                    Login
                  </Button>
                  <Button size="sm" onClick={() => onNavigate('/register')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Course Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge className="mb-2">{course.category}</Badge>
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-gray-300 mb-6">{course.shortDescription}</p>
              </div>

              <div className="flex items-center space-x-6 text-sm mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-gray-300 ml-1">({course.totalRatings.toLocaleString()} ratings)</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-1" />
                  <span>{course.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-1" />
                  <span>{course.duration}h total</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-1" />
                  <span>{course.language}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={course.instructorImage} />
                  <AvatarFallback>{course.instructorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Created by {course.instructorName}</p>
                  <p className="text-sm text-gray-300">Updated {course.updatedAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-0">
                  {course.previewVideoUrl ? (
                    <div className="relative">
                      <iframe
                        src={course.previewVideoUrl}
                        className="w-full h-48 rounded-t-lg"
                        title="Course Preview"
                        allowFullScreen
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-t-lg">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">
                        {course.currency}{course.price}
                      </div>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <div className="text-lg text-gray-500 line-through">
                          {course.currency}{course.originalPrice}
                        </div>
                      )}
                    </div>

                    {isEnrolled ? (
                      <div className="space-y-4">
                        {progress > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Your Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} />
                          </div>
                        )}
                        <Button className="w-full" onClick={handleStartLearning}>
                          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleEnroll}
                        disabled={enrolling}
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Certificate of completion
                      </div>
                      <div className="flex items-center">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        {course.lessons.length} lessons
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {course.duration} hours of content
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.learningObjectives.map((objective, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {course.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <p className="text-gray-600">
                      {course.lessons.length} lessons • {course.duration} hours total
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.lessons.map((lesson, index) => (
                        <div 
                          key={lesson.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-sm text-gray-600">{lesson.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatDuration(lesson.duration)}
                                </span>
                                {lesson.resources && lesson.resources.length > 0 && (
                                  <span className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    {lesson.resources.length} resource{lesson.resources.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {lesson.isPreview ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePreviewLesson(lesson.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          ) : isEnrolled ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePreviewLesson(lesson.id)}
                            >
                              <PlayCircle className="w-4 h-4 mr-1" />
                              Watch
                            </Button>
                          ) : (
                            <Badge variant="secondary">Locked</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={course.instructorImage} />
                        <AvatarFallback>{course.instructorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{course.instructorName}</h3>
                        <p className="text-gray-600 mb-4">Data Science Expert & Educator</p>
                        <p className="text-gray-700">
                          Dr. Sarah Johnson is a renowned data scientist with over 10 years of experience 
                          in machine learning and artificial intelligence. She has worked at top tech companies 
                          and has published numerous research papers in the field of data science.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <CourseReviews 
                  courseId={course.id}
                  averageRating={course.rating}
                  totalReviews={course.totalRatings}
                  canReview={isEnrolled}
                  onReviewSubmit={(review) => {
                    console.log('New review submitted:', review);
                    // TODO: Save to Firebase
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Course Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Downloadable resources</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Certificate of completion</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};