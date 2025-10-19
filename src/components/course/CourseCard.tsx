import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star, Clock, Users, Play, Heart, Download, Monitor, Award, Calendar, Video, CreditCard, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { usePayment } from '../../hooks/usePayment';
import { formatAmount } from '../../lib/razorpay';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onPreview?: (courseId: string) => void;
  onEnquire?: (courseId: string) => void;
  isEnrolled?: boolean;
  showProgress?: boolean;
  progress?: number;
  showWishlistButton?: boolean;
  onNavigate?: (path: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onPreview,
  onEnquire,
  isEnrolled = false,
  showProgress = false,
  progress = 0,
  showWishlistButton = true,
  onNavigate
}) => {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Payment hook
  const { processPayment, isProcessing } = usePayment({
    onSuccess: (paymentData, enrollmentId) => {
      // Navigate to My Courses after successful enrollment
      setTimeout(() => {
        onNavigate?.('/my-courses');
      }, 2000);
    },
    onError: (error) => {
      console.error('Payment error:', error);
    }
  });

  useEffect(() => {
    if (user) {
      const wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
      setIsInWishlist(wishlist.includes(course.id));
    }
  }, [user, course.id]);

  const toggleWishlist = () => {
    if (!user) return;
    
    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
    
    if (isInWishlist) {
      const newWishlist = wishlist.filter((id: string) => id !== course.id);
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(newWishlist));
      setIsInWishlist(false);
    } else {
      wishlist.push(course.id);
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist));
      setIsInWishlist(true);
    }
  };

  const handlePaymentEnrollment = async () => {
    if (!user) {
      onNavigate?.('/login');
      return;
    }

    try {
      await processPayment({
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.displayName || user.email || 'Student',
        userContact: undefined, // Phone number can be entered during payment
        autoEnroll: true
      });
    } catch (error) {
      console.error('Failed to initiate payment:', error);
    }
  };  const formatDuration = (hours: number) => {
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
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
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
          </div>
        </div>

        {/* Class Schedule Information */}
        {course.classSchedule && (
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900 text-sm">Live Classes</span>
            </div>
            <div className="space-y-1 text-xs text-blue-800">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {course.classSchedule.classFrequency}
              </div>
              <div className="flex items-center">
                <Video className="w-3 h-3 mr-1" />
                {course.classSchedule.duration} min sessions ({course.classSchedule.totalClasses} total)
              </div>
              {course.scheduledClasses && course.scheduledClasses.length > 0 && (
                <div className="text-green-700 font-medium">
                  Next: {new Date(course.scheduledClasses[0].startTime).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        )}

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
        ) : course.enrollmentType === 'enquiry' ? (
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Course Fee:</span>
              <span className="font-bold text-lg text-blue-600">
                {formatAmount(course.price)}
              </span>
            </div>
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700" 
              onClick={() => onEnquire?.(course.id)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enquire Now
            </Button>
          </div>
        ) : course.price > 0 ? (
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Course Fee:</span>
              <span className="font-bold text-lg text-green-600">
                {formatAmount(course.price)}
              </span>
            </div>
            <Button 
              className="w-full" 
              onClick={handlePaymentEnrollment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <CreditCard className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Enroll Now - {formatAmount(course.price)}
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onEnroll?.(course.id)}
          >
            Enroll Now - Free
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};