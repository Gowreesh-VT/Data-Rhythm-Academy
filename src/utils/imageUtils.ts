// Reliable image URLs that we know work
export const FALLBACK_IMAGES = {
  courseThumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format',
  instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format',
  userProfile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format',
  loginBackground: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1080&h=720&fit=crop&auto=format',
  heroBackground: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop&auto=format'
};

// Function to get a reliable image URL with fallback
export const getReliableImageUrl = (originalUrl: string, fallbackType: keyof typeof FALLBACK_IMAGES): string => {
  // If the original URL is from via.placeholder.com or seems problematic, use fallback immediately
  if (originalUrl.includes('via.placeholder.com') || originalUrl.includes('placeholder')) {
    return FALLBACK_IMAGES[fallbackType];
  }
  
  return originalUrl;
};

// Function to generate a data URL placeholder for immediate display
export const generatePlaceholderDataUrl = (width: number = 400, height: number = 300, text: string = 'Image'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#3B82F6');
  gradient.addColorStop(1, '#1E40AF');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

// Enhanced image component props
export interface ReliableImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackType?: keyof typeof FALLBACK_IMAGES;
  width?: number;
  height?: number;
  onError?: () => void;
  onLoad?: () => void;
}

// Course category to image mapping
export const CATEGORY_IMAGES = {
  'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format',
  'Machine Learning': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop&auto=format',
  'Web Development': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop&auto=format',
  'Mobile Development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop&auto=format',
  'Database': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop&auto=format',
  'Cloud Computing': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop&auto=format',
  'DevOps': 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop&auto=format',
  'Cybersecurity': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop&auto=format',
  'AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&auto=format',
  'Business Analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&auto=format',
  'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop&auto=format',
  'Marketing': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&auto=format'
};

export const getCategoryImage = (category: string): string => {
  return CATEGORY_IMAGES[category as keyof typeof CATEGORY_IMAGES] || FALLBACK_IMAGES.courseThumbnail;
};