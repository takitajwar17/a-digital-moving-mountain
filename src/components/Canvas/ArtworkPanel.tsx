'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ArtworkPanel as ArtworkPanelType } from '@/types/artwork';
import { Comment } from '@/types/comment';
import CommentOverlay from './CommentOverlay';

interface ArtworkPanelProps {
  panel: ArtworkPanelType;
  comments: Comment[];
  onCommentAdd: (position: { x: number; y: number }, text?: string, imageData?: string) => void;
  onCommentClick: (comment: Comment) => void;
  zoomLevel: number;
  onZoomChange?: (zoom: number) => void;
  panPosition: { x: number; y: number };
  onPanChange: (position: { x: number; y: number }) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export default function ArtworkPanel({
  panel,
  comments,
  onCommentAdd,
  onCommentClick,
  zoomLevel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onZoomChange: _,
  panPosition,
  onPanChange,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}: ArtworkPanelProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Touch gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchMove, setTouchMove] = useState<{ x: number; y: number } | null>(null);

  // Reset image state when panel changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [panel.imageUrl]);

  // Handle canvas click for adding comments
  const handleCanvasClick = (event: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) return;

    // If already adding a comment, clicking outside should cancel it
    if (isAddingComment) {
      setIsAddingComment(false);
      setCommentPosition(null);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get client coordinates from either mouse or touch event
    const clientX = 'clientX' in event ? event.clientX : (event as React.TouchEvent).changedTouches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : (event as React.TouchEvent).changedTouches[0].clientY;

    const x = (clientX - rect.left - panPosition.x) / zoomLevel;
    const y = (clientY - rect.top - panPosition.y) / zoomLevel;

    // Convert to relative coordinates (0-1)
    const relativeX = x / panel.dimensions.width;
    const relativeY = y / panel.dimensions.height;

    if (relativeX >= 0 && relativeX <= 1 && relativeY >= 0 && relativeY <= 1) {
      setCommentPosition({ x: relativeX, y: relativeY });
      setIsAddingComment(true);
    }
  };

  // Handle drag to pan
  const handleMouseDown = (event: React.MouseEvent) => {
    // Don't start dragging if we're adding a comment
    if (isAddingComment) return;
    
    setIsDragging(true);
    setDragStart({ x: event.clientX - panPosition.x, y: event.clientY - panPosition.y });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || isAddingComment) return;

    const newX = event.clientX - dragStart.x;
    const newY = event.clientY - dragStart.y;
    onPanChange({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile gestures
  const handleTouchStart = (event: React.TouchEvent) => {
    if (isAddingComment || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    setTouchMove(null);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchStart || isAddingComment || event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    setTouchMove({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart || isAddingComment) return;
    
    const touchEnd = touchMove || touchStart;
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    
    // Check if it's a swipe gesture (quick and mostly horizontal)
    const isSwipe = Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 2 && deltaTime < 300;
    
    if (isSwipe) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (!touchMove || (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10)) {
      // If no significant movement, treat as a tap for comment
      handleCanvasClick(event as unknown as React.MouseEvent);
    }
    
    setTouchStart(null);
    setTouchMove(null);
  };

  // Handle comment submission
  const handleCommentSubmit = (text: string) => {
    if (commentPosition) {
      onCommentAdd(commentPosition, text, undefined);
      setIsAddingComment(false);
      setCommentPosition(null);
    }
  };

  // Handle drawing submission
  const handleDrawingSubmit = (imageData: string) => {
    if (commentPosition) {
      onCommentAdd(commentPosition, undefined, imageData);
      setIsAddingComment(false);
      setCommentPosition(null);
    }
  };

  const handleCommentCancel = () => {
    setIsAddingComment(false);
    setCommentPosition(null);
  };

  // Handle image load
  const handleImageLoad = () => {
    console.log(`✅ Image loaded for ${panel.year}: ${panel.imageUrl}`);
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image error
  const handleImageError = () => {
    console.warn(`❌ Failed to load image for ${panel.year}: ${panel.imageUrl}`);
    setImageError(true);
    setImageLoaded(false);
  };

  // Determine if we should show loading state
  const shouldShowLoading = !imageLoaded && !imageError;

  return (
    <div className={`relative overflow-hidden bg-black ${className}`} style={{ width: 'fit-content' }}>

      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className="relative h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ width: 'fit-content' }}
      >
        {/* Artwork Image */}
        <div
          className="relative"
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          <Image
            src={panel.imageUrl}
            alt={`Artwork ${panel.year}`}
            width={panel.dimensions.width}
            height={panel.dimensions.height}
            className={`block transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            priority={true}
            onLoad={handleImageLoad}
            onError={handleImageError}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
            style={{
              maxWidth: 'none',
              height: '100vh',
              width: 'auto',
              objectFit: 'contain',
            }}
          />

          {/* Minimal loading state */}
          {shouldShowLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Minimal error state */}
          {imageError && (
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

          {/* Comment Overlay - only show when image is loaded */}
          {imageLoaded && (
            <CommentOverlay
              comments={comments}
              onCommentClick={onCommentClick}
              panelDimensions={panel.dimensions}
              isAddingComment={isAddingComment}
              commentPosition={commentPosition}
              onCommentSubmit={handleCommentSubmit}
              onDrawingSubmit={handleDrawingSubmit}
              onCommentCancel={handleCommentCancel}
            />
          )}
        </div>
      </div>

    </div>
  );
}