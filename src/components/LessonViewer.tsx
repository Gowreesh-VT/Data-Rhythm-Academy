import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lesson, Course } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  Settings, 
  Maximize, 
  ArrowLeft, 
  ArrowRight,
  Download,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LessonViewerProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({ onNavigate, onLogout }) => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (lessonId) {
      loadLessonData(lessonId);
    }
  }, [lessonId]);

  const loadLessonData = async (id: string) => {
    try {
      // Mock lesson data - replace with actual Firebase call
      const mockLesson: Lesson = {
        id: id,
        courseId: '1',
        title: 'Introduction to Python and Data Science',
        description: 'Get started with Python programming and understand the data science workflow. In this lesson, you\'ll learn the basics of Python syntax, variables, and how data science fits into the modern tech landscape.',
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
            title: 'Course Code Repository',
            type: 'link',
            url: 'https://github.com/example/python-course'
          },
          {
            id: '3',
            title: 'Lesson Slides',
            type: 'pdf',
            url: '#',
            size: '5.4 MB'
          }
        ]
      };

      const mockCourse: Course = {
        id: '1',
        title: 'Complete Python Data Science Bootcamp',
        description: 'Master Python for Data Science with this comprehensive bootcamp!',
        shortDescription: 'Master Python for Data Science from beginner to advanced level',
        instructorId: 'instructor1',
        instructorName: 'Dr. Sarah Johnson',
        category: 'Data Science',
        level: 'Beginner',
        language: 'English',
        price: 89.99,
        currency: '$',
        duration: 24.5,
        thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        rating: 4.7,
        totalRatings: 12543,
        totalStudents: 45632,
        lessons: [
          mockLesson,
          {
            id: '2',
            courseId: '1',
            title: 'Python Fundamentals',
            description: 'Learn variables, data types, loops, and functions',
            videoUrl: '#',
            duration: 60,
            order: 2,
            isPreview: false,
            videoQuality: '720p',
            playbackSpeed: true,
            downloadable: true
          }
        ],
        learningObjectives: [],
        prerequisites: [],
        tags: [],
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Online course specific features
        isOnline: true,
        hasLiveSupport: true,
        discussionEnabled: true,
        downloadableResources: true,
        mobileAccess: true,
        lifetimeAccess: true,
        completionCertificate: true,
        closedCaptions: true,
        // Scheduled class features
        scheduledClasses: [],
        classSchedule: {
          courseId: '1',
          pattern: 'weekly',
          daysOfWeek: [1, 3], // Monday & Wednesday
          startTime: '10:00',
          duration: 90,
          timezone: 'UTC',
          startDate: new Date(),
          endDate: new Date(),
          totalClasses: 12,
          classFrequency: 'Every Monday & Wednesday'
        },
        recordedClassesAvailable: true,
        classNotifications: true
      };

      setLesson(mockLesson);
      setCourse(mockCourse);
      setDuration(mockLesson.duration * 60); // Convert minutes to seconds
      setLoading(false);
    } catch (error) {
      console.error('Error loading lesson:', error);
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
    setCurrentTime((newProgress / 100) * duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResourceDownload = (resource: any) => {
    console.log('Downloading resource:', resource.title);
    // Implement download logic
  };

  const getNextLesson = () => {
    if (!course || !lesson) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
    return currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    if (!course || !lesson) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
    return currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  };

  const handleNextLesson = () => {
    const nextLesson = getNextLesson();
    if (nextLesson) {
      onNavigate(`/lesson/${nextLesson.id}`);
    }
  };

  const handlePreviousLesson = () => {
    const previousLesson = getPreviousLesson();
    if (previousLesson) {
      onNavigate(`/lesson/${previousLesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not found</h2>
          <p className="text-gray-600 mb-4">The lesson you're looking for doesn't exist.</p>
          <Button onClick={() => onNavigate('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate(`/course/${course.id}`)}
                className="text-white hover:text-blue-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
              <div className="text-white">
                <h1 className="font-semibold">{course.title}</h1>
                <p className="text-sm text-gray-400">{lesson.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Lesson {lesson.order} of {course.lessons.length}
              </span>
              {user && (
                <Button variant="outline" size="sm" onClick={onLogout} className="text-white border-gray-600">
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Video Player */}
        <div className="flex-1">
          <div className="relative bg-black">
            {/* Video Container */}
            <div className="aspect-video relative">
              <iframe
                src={lesson.videoUrl}
                className="w-full h-full"
                title={lesson.title}
                allowFullScreen
              />
            </div>

            {/* Custom Controls Overlay (for demo purposes) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="text-white hover:text-blue-400"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{formatTime(currentTime)}</span>
                    <Progress 
                      value={progress} 
                      className="w-96"
                    />
                    <span className="text-sm">{formatTime(duration)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-white hover:text-blue-400">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:text-blue-400">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:text-blue-400">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="bg-gray-800 text-white p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
              <p className="text-gray-300 mb-4">{lesson.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{lesson.duration} minutes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Lesson {lesson.order}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 text-white overflow-y-auto h-screen">
          {/* Course Progress */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold mb-2">Course Progress</h3>
            <Progress value={33} className="mb-2" />
            <p className="text-sm text-gray-400">1 of {course.lessons.length} lessons completed</p>
          </div>

          {/* Course Content */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold mb-4">Course Content</h3>
            <div className="space-y-2">
              {course.lessons.map((courseLesson, index) => (
                <div
                  key={courseLesson.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    courseLesson.id === lesson.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => onNavigate(`/lesson/${courseLesson.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{courseLesson.title}</p>
                      <p className="text-xs text-gray-400">{courseLesson.duration} min</p>
                    </div>
                    {courseLesson.id === lesson.id && (
                      <Play className="w-4 h-4" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold mb-4">Lesson Resources</h3>
              <div className="space-y-3">
                {lesson.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium">{resource.title}</p>
                        {resource.size && (
                          <p className="text-xs text-gray-400">{resource.size}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResourceDownload(resource)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="p-4">
            <div className="space-y-2">
              {getPreviousLesson() && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-white border-gray-600"
                  onClick={handlePreviousLesson}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Lesson
                </Button>
              )}
              {getNextLesson() && (
                <Button
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  onClick={handleNextLesson}
                >
                  Next Lesson
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};