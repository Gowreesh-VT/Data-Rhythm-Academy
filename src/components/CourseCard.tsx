import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, Clock, Users, Play, Heart, Download, Monitor, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from './ImageWithFallback';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onPreview?: (courseId: string) => void;
  isEnrolled?: boolean;
  showProgress?: boolean;
  progress?: number;
  showWishlistButton?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onPreview,
  isEnrolled = false,
  showProgress = false,
  progress = 0,
  showWishlistButton = true
}) => {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (user) {
      const wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
      setIsInWishlist(wishlist.includes(course.id));
    }
  }, [user, course.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const wishlistKey = `wishlist_${user.id}`;
    const currentWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    
    let updatedWishlist;
    if (isInWishlist) {
      updatedWishlist = currentWishlist.filter((id: string) => id !== course.id);
    } else {
      updatedWishlist = [...currentWishlist, course.id];
    }
    
    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    setIsInWishlist(!isInWishlist);
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    return `${Math.round(hours)}h`;
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return `${currency}${price}`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
      <div className="relative">
        <ImageWithFallback
          src={course.thumbnailUrl}
          alt={`${course.title} course thumbnail`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Preview button */}
        {course.previewVideoUrl && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(course.id);
            }}
          >
            <Play className="w-4 h-4 mr-1" />
            Preview
          </Button>
        )}
        
        {/* Wishlist button */}
        {showWishlistButton && user && (
          <Button
            variant="outline"
            size="sm"
            className={`absolute top-2 left-2 bg-white/90 hover:bg-white transition-all ${
              isInWishlist ? 'text-red-600' : 'text-gray-600'
            }`}
            onClick={toggleWishlist}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>
        )}
        
        <Badge className="absolute bottom-2 left-2" variant="secondary">
          {course.level}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">
            {course.title}
          </h3>
          <div className="ml-2 text-right">
            <div className="font-bold text-lg">
              {formatPrice(course.price, course.currency)}
            </div>
            {course.originalPrice && course.originalPrice > course.price && (
              <div className="text-sm text-gray-500 line-through">
                {course.currency}{course.originalPrice}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {course.shortDescription}
        </p>
        <div className="text-sm text-gray-500">
          by {course.instructorName}
        </div>
      </CardHeader>

      <CardContent className="py-2">
        {/* Online Course Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {course.mobileAccess && (
            <Badge variant="outline" className="text-xs">
              <Monitor className="w-3 h-3 mr-1" />
              Mobile Access
            </Badge>
          )}
          {course.downloadableResources && (
            <Badge variant="outline" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Downloads
            </Badge>
          )}
          {course.completionCertificate && (
            <Badge variant="outline" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              Certificate
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{course.rating.toFixed(1)}</span>
              <span className="ml-1">({course.totalRatings})</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{course.totalStudents.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatDuration(course.duration)}</span>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
        </div>

        {showProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        {isEnrolled ? (
          <Button 
            className="w-full" 
            onClick={() => onPreview?.(course.id)}
          >
            Continue Learning
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onEnroll?.(course.id)}
          >
            Enroll Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};