'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
}

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  onLoad,
  onError,
  style = {}
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate optimized image paths
  const getOptimizedSrc = (size: 'mobile' | 'tablet' | 'desktop') => {
    const basePath = src.replace('.jpg', '');
    const suffix = size === 'desktop' ? '' : `-${size}`;
    return `${basePath}${suffix}.jpg`;
  };

  const getWebPSrc = () => {
    return src.replace('.jpg', '.webp');
  };

  return (
    <div className="relative w-full h-full">
      <picture>
        {/* WebP format for modern browsers */}
        <source
          srcSet={`
            ${getWebPSrc()} 1x
          `}
          type="image/webp"
        />
        
        {/* Responsive JPEG fallback */}
        <source
          srcSet={`
            ${getOptimizedSrc('mobile')} 640w,
            ${getOptimizedSrc('tablet')} 1024w,
            ${getOptimizedSrc('desktop')} 2048w
          `}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
          type="image/jpeg"
        />
        
        {/* Next.js Image component as fallback */}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          style={style}
        />
      </picture>
      
      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
          <div className="text-red-600 text-center">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm">Error loading image</p>
          </div>
        </div>
      )}
    </div>
  );
}