import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createCourse } from '../../lib/database';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { Course, CourseCategory, CourseLevel } from '../../types';

interface CourseCreationPageProps {
  onNavigate: (path: string) => void;
}

export function CourseCreationPage({ onNavigate }: CourseCreationPageProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">Only administrators can create courses.</p>
            <Button onClick={() => onNavigate('/')} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '' as CourseCategory,
    level: '' as CourseLevel,
    language: 'English',
    price: 0,
    originalPrice: 0,
    enrollmentType: 'direct' as const,
    duration: 0,
    thumbnailUrl: '',
    previewVideoUrl: '',
    learningObjectives: [''],
    prerequisites: [''],
    tags: [''],
    hasLiveSupport: true,
    discussionEnabled: true,
    downloadableResources: true,
    mobileAccess: true,
    lifetimeAccess: true,
    completionCertificate: true,
    closedCaptions: false,
    recordedClassesAvailable: true,
    classNotifications: true,
    isPublished: false
  });

  const categories: CourseCategory[] = [
    'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development',
    'Database', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'AI',
    'Business Analytics', 'Design', 'Marketing'
  ];

  const levels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const handleInputChange = (field: string, value: any) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'learningObjectives' | 'prerequisites' | 'tags', index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: 'learningObjectives' | 'prerequisites' | 'tags') => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'learningObjectives' | 'prerequisites' | 'tags', index: number) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      error('Authentication required', 'Please log in to create a course');
      return;
    }

    if (!courseData.title || !courseData.description || !courseData.category || !courseData.level) {
      error('Missing required fields', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newCourse: Omit<Course, 'id' | 'createdAt' | 'updatedAt'> = {
        ...courseData,
        instructorId: user.id,
        instructorName: user.displayName || user.email || 'Unknown Instructor',
        instructorImage: user.photoURL,
        instructorBio: user.bio || '',
        currency: 'USD',
        rating: 0,
        totalRatings: 0,
        totalStudents: 0,
        lessons: [],
        isPublished: courseData.isPublished,
        isOnline: true,
        scheduledClasses: [],
        classSchedule: {
          courseId: '',
          pattern: 'weekly' as const,
          daysOfWeek: [],
          startTime: '',
          duration: 60,
          timezone: 'UTC',
          startDate: new Date(),
          endDate: new Date(),
          totalClasses: 0,
          classFrequency: ''
        },
        learningObjectives: courseData.learningObjectives.filter(obj => obj.trim() !== ''),
        prerequisites: courseData.prerequisites.filter(req => req.trim() !== ''),
        tags: courseData.tags.filter(tag => tag.trim() !== ''),
        multipleLanguageSubtitles: []
      };

      const result = await createCourse(newCourse, user.id);
      
      if (result.error) {
        throw result.error;
      }

      success('Course created successfully!', 
        courseData.isPublished 
          ? 'Your course has been created and published. Students can now enroll!'
          : 'Your course has been created and saved as a draft'
      );
      onNavigate('/admin-dashboard');
    } catch (err: any) {
      console.error('Error creating course:', err);
      error('Failed to create course', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('/instructor-dashboard')}
                className="text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Textarea
                  id="shortDescription"
                  value={courseData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief description for course cards"
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed course description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={courseData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select value={courseData.level} onValueChange={(value) => handleInputChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={courseData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={courseData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (Hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={courseData.duration}
                    onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courseData.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={objective}
                      onChange={(e) => handleArrayChange('learningObjectives', index, e.target.value)}
                      placeholder="What will students learn?"
                      className="flex-1"
                    />
                    {courseData.learningObjectives.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('learningObjectives', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('learningObjectives')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Objective
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courseData.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={prereq}
                      onChange={(e) => handleArrayChange('prerequisites', index, e.target.value)}
                      placeholder="What should students know beforehand?"
                      className="flex-1"
                    />
                    {courseData.prerequisites.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('prerequisites', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('prerequisites')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Prerequisite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isPublished"
                    checked={courseData.isPublished}
                    onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                  />
                  <Label htmlFor="isPublished" className="text-sm font-medium">
                    Publish course immediately
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  {courseData.isPublished 
                    ? "Course will be published and visible to students immediately upon creation."
                    : "Course will be saved as a draft. You can publish it later from the admin dashboard."
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('/instructor-dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}