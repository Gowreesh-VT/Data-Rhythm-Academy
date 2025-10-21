import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onError?: () => void;
  onLoad?: () => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  onError,
  onLoad
}) => {
  const [hasError, setHasError] = useState(false);

  const getFallbackImage = () => {
    // Use inline SVG data URI to avoid network requests
    if (alt.toLowerCase().includes('course') || alt.toLowerCase().includes('thumbnail')) {
      // Gray placeholder with book icon for courses
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Cpath d="M150 100h100v100h-100z" fill="%239ca3af" opacity="0.5"/%3E%3Ctext x="50%25" y="60%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%239ca3af"%3ECourse Image%3C/text%3E%3C/svg%3E';
    }
    if (alt.toLowerCase().includes('instructor') || alt.toLowerCase().includes('avatar') || alt.toLowerCase().includes('profile')) {
      // Gray circle for profile images
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Crect fill="%23e5e7eb" width="150" height="150"/%3E%3Ccircle cx="75" cy="75" r="30" fill="%239ca3af" opacity="0.5"/%3E%3C/svg%3E';
    }
    // Default gray placeholder
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%239ca3af"%3EImage%3C/text%3E%3C/svg%3E';
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      onError?.();
    }
  };

  const handleLoad = () => {
    onLoad?.();
  };

  const imageSrc = hasError ? getFallbackImage() : src;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};
