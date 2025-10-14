import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle,
  Filter,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  createdAt: Date;
  helpful: number;
  notHelpful: number;
  isVerifiedPurchase: boolean;
  userProgress?: number;
}

interface ReviewsProps {
  courseId: string;
  averageRating: number;
  totalReviews: number;
  canReview?: boolean;
  onReviewSubmit?: (review: { rating: number; title: string; content: string }) => void;
}

export const CourseReviews: React.FC<ReviewsProps> = ({
  courseId,
  averageRating,
  totalReviews,
  canReview = false,
  onReviewSubmit
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful'>('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    content: ''
  });

  // Rating distribution for the progress bars
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 65,
    4: 20,
    3: 10,
    2: 3,
    1: 2
  });

  useEffect(() => {
    loadReviews();
  }, [courseId, filter, sortBy]);

  const loadReviews = async () => {
    try {
      // Mock review data - replace with Firebase call
      const mockReviews: Review[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Sarah Johnson',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e6?w=100',
          rating: 5,
          title: 'Excellent course for beginners!',
          content: 'This course is absolutely fantastic! The instructor explains everything clearly and the hands-on projects really help solidify the concepts. I went from knowing nothing about data science to building my first machine learning model. Highly recommend!',
          createdAt: new Date('2024-09-15'),
          helpful: 23,
          notHelpful: 1,
          isVerifiedPurchase: true,
          userProgress: 100
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Mike Chen',
          userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          rating: 4,
          title: 'Great content, could use more advanced topics',
          content: 'The course covers the fundamentals very well. The explanations are clear and the exercises are practical. However, I was hoping for more advanced machine learning algorithms. Overall, still a solid course.',
          createdAt: new Date('2024-09-10'),
          helpful: 15,
          notHelpful: 3,
          isVerifiedPurchase: true,
          userProgress: 85
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Emily Rodriguez',
          userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
          rating: 5,
          title: 'Perfect for career changers',
          content: 'I was switching careers from finance to tech and this course was exactly what I needed. The practical approach and real-world examples made all the difference. Now I work as a data analyst!',
          createdAt: new Date('2024-08-28'),
          helpful: 31,
          notHelpful: 0,
          isVerifiedPurchase: true,
          userProgress: 100
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'David Kumar',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          rating: 3,
          title: 'Good but moves too fast',
          content: 'The content is good but I found the pace quite fast. Some topics could use more detailed explanations. The projects are helpful though.',
          createdAt: new Date('2024-08-20'),
          helpful: 8,
          notHelpful: 5,
          isVerifiedPurchase: true,
          userProgress: 60
        }
      ];

      // Filter reviews
      let filteredReviews = mockReviews;
      if (filter !== 'all') {
        filteredReviews = mockReviews.filter(review => review.rating === parseInt(filter));
      }

      // Sort reviews
      filteredReviews.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'helpful':
            return b.helpful - a.helpful;
          default:
            return 0;
        }
      });

      setReviews(filteredReviews);
      setLoading(false);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewForm.rating === 0 || !reviewForm.title.trim() || !reviewForm.content.trim()) {
      return;
    }

    try {
      onReviewSubmit?.(reviewForm);
      setShowReviewForm(false);
      setReviewForm({ rating: 0, title: '', content: '' });
      // Reload reviews
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleHelpful = (reviewId: string, isHelpful: boolean) => {
    // Implement helpful/not helpful logic
    console.log(`Marked review ${reviewId} as ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Reviews</span>
            {canReview && (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button>Write a Review</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      {renderStars(reviewForm.rating, true, (rating) => 
                        setReviewForm(prev => ({ ...prev, rating }))
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Review Title</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Summarize your experience"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <Textarea
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your thoughts about this course"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleReviewSubmit}>
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Summary */}
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                  {renderStars(Math.round(averageRating))}
                  <p className="text-sm text-gray-600 mt-1">
                    {totalReviews.toLocaleString()} reviews
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-3">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Progress value={ratingDistribution[rating as keyof typeof ratingDistribution]} className="flex-1" />
                    <span className="text-sm text-gray-600 w-8">
                      {ratingDistribution[rating as keyof typeof ratingDistribution]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Review Highlights */}
            <div>
              <h4 className="font-medium mb-3">What students say:</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm">95% would recommend this course</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Highly rated for practical projects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Perfect pace for beginners</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by rating:</span>
            <div className="flex space-x-1">
              {['all', '5', '4', '3', '2', '1'].map((rating) => (
                <Button
                  key={rating}
                  variant={filter === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(rating as any)}
                >
                  {rating === 'all' ? 'All' : `${rating}★`}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to review this course!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{review.userName}</h4>
                          {review.isVerifiedPurchase && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                          {review.userProgress && (
                            <Badge variant="outline" className="text-xs">
                              {review.userProgress}% Complete
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {review.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <h5 className="font-medium mb-2">{review.title}</h5>
                    <p className="text-gray-700 mb-4">{review.content}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <button
                        onClick={() => handleHelpful(review.id, true)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <button
                        onClick={() => handleHelpful(review.id, false)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Not helpful ({review.notHelpful})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};