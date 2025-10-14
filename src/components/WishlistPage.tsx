import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CourseCard } from './CourseCard';
import { Course } from '../types';
import { Heart, BookOpen, Search, Filter, SortAsc, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMockCourses } from '../data/mockCourses';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'added' | 'price' | 'rating'>('added');

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      // Get wishlist course IDs from localStorage or Firebase
      const wishlistIds = JSON.parse(localStorage.getItem(`wishlist_${user?.id}`) || '[]');
      
      // Get all courses and filter by wishlist IDs
      const allCourses = getMockCourses();
      const wishlistCourses = allCourses.filter(course => wishlistIds.includes(course.id));
      
      setWishlist(wishlistCourses);
      setLoading(false);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setLoading(false);
    }
  };

  const removeFromWishlist = (courseId: string) => {
    if (!user) return;
    
    // Remove from state
    setWishlist(prev => prev.filter(course => course.id !== courseId));
    
    // Update localStorage
    const currentWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
    const updatedWishlist = currentWishlist.filter((id: string) => id !== courseId);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updatedWishlist));
  };

  const clearWishlist = () => {
    if (!user) return;
    
    setWishlist([]);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify([]));
  };

  // Filter and sort courses
  const filteredCourses = wishlist
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'added':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const categories = Array.from(new Set(wishlist.map(course => course.category)));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          <Heart className="w-8 h-8 text-red-500 mr-3" />
          My Wishlist
        </h1>
        <p className="text-gray-600">
          Save courses for later and never lose track of what you want to learn
        </p>
      </div>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Browse our courses and add your favorites to your wishlist. Click the heart icon on any course to save it here.
            </p>
            <Button onClick={() => onNavigate('/courses')} className="inline-flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters and Controls */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search your wishlist..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center space-x-2">
                    <SortAsc className="w-4 h-4 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="added">Recently Added</option>
                      <option value="price">Price: Low to High</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>

                {/* Clear All */}
                <Button
                  variant="outline"
                  onClick={clearWishlist}
                  className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredCourses.length} of {wishlist.length} courses
                </p>
                <p className="text-sm text-gray-600">
                  Total value: ${wishlist.reduce((sum, course) => sum + course.price, 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="relative">
                  <CourseCard
                    course={course}
                    onPreview={(courseId) => onNavigate(`/course/${courseId}`)}
                    onEnroll={(courseId) => console.log('Enroll in course:', courseId)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromWishlist(course.id)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 text-center">
            <Button onClick={() => onNavigate('/courses')} variant="outline" className="mr-4">
              <BookOpen className="w-4 h-4 mr-2" />
              Continue Browsing
            </Button>
            <Button onClick={() => onNavigate('/my-courses')}>
              View My Courses
            </Button>
          </div>
        </>
      )}
    </div>
  );
};