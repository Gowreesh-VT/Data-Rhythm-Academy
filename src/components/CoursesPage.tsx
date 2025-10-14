import React, { useState, useEffect } from 'react';
import { Course, CourseFilter, CourseCategory, CourseLevel } from '../types';
import { CourseCard } from './CourseCard';
import { SearchWithAutocomplete } from './SearchWithAutocomplete';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search, Filter, Grid, List, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMockCourses } from '../data/mockCourses';

interface CoursesPageProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CourseFilter>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  // Categories for filtering
  const categories: CourseCategory[] = [
    'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development',
    'Database', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'AI',
    'Business Analytics', 'Design', 'Marketing'
  ];

  const levels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Load courses data
  useEffect(() => {
    try {
      const mockCourses = getMockCourses();
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }

    // Level filter
    if (filters.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }

    // Price filter
    if (filters.priceRange) {
      filtered = filtered.filter(course =>
        course.price >= filters.priceRange![0] && course.price <= filters.priceRange![1]
      );
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(course => course.rating >= filters.rating!);
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'popularity':
            return b.totalStudents - a.totalStudents;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          default:
            return 0;
        }
      });
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, filters]);

  const handleEnroll = (courseId: string) => {
    if (!user) {
      onNavigate('/login');
      return;
    }
    // Implement enrollment logic
    console.log('Enrolling in course:', courseId);
    onNavigate(`/course/${courseId}`);
  };

  const handlePreview = (courseId: string) => {
    onNavigate(`/course/${courseId}`);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
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
              <button onClick={() => onNavigate('/courses')} className="text-blue-600 font-medium">
                Courses
              </button>
              {user && (
                <>
                  <button onClick={() => onNavigate('/my-courses')} className="text-gray-700 hover:text-blue-600">
                    My Courses
                  </button>
                  <button onClick={() => onNavigate('/wishlist')} className="text-gray-700 hover:text-blue-600 flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    Wishlist
                  </button>
                </>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <SearchWithAutocomplete
              courses={courses}
              onSearch={setSearchTerm}
              onCourseSelect={handlePreview}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Select value={filters.category || ''} onValueChange={(value) => setFilters({...filters, category: value as CourseCategory})}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.level || ''} onValueChange={(value) => setFilters({...filters, level: value as CourseLevel})}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.sortBy || ''} onValueChange={(value) => setFilters({...filters, sortBy: value as any})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </span>
              {(filters.category || filters.level || searchTerm) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              onPreview={handlePreview}
              isEnrolled={user?.enrolledCourses?.includes(course.id)}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all courses.</p>
            <Button className="mt-4" onClick={clearFilters}>
              View All Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};