'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ArtworkPanel as ArtworkPanelType } from '@/types/artwork';
import { Comment } from '@/types/comment';
import CommentOverlay from './CommentOverlay';
import ZoomControls from './ZoomControls';

interface ArtworkPanelProps {
  panel: ArtworkPanelType;
  comments: Comment[];
  onCommentAdd: (position: { x: number; y: number }, text: string) => void;
  onCommentClick: (comment: Comment) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  panPosition: { x: number; y: number };
  onPanChange: (position: { x: number; y: number }) => void;
  className?: string;
}

export default function ArtworkPanel({
  panel,
  comments,
  onCommentAdd,
  onCommentClick,
  zoomLevel,
  onZoomChange,
  panPosition,
  onPanChange,
  className = ''
}: ArtworkPanelProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image state when panel changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [panel.imageUrl]);

  // Handle canvas click for adding comments
  const handleCanvasClick = (event: React.MouseEvent) => {
    if (isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left - panPosition.x) / zoomLevel;
    const y = (event.clientY - rect.top - panPosition.y) / zoomLevel;

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
    setIsDragging(true);
    setDragStart({ x: event.clientX - panPosition.x, y: event.clientY - panPosition.y });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = event.clientX - dragStart.x;
    const newY = event.clientY - dragStart.y;
    onPanChange({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle comment submission
  const handleCommentSubmit = (text: string) => {
    if (commentPosition) {
      onCommentAdd(commentPosition, text);
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
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Zoom Controls */}
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomChange={onZoomChange}
        onReset={() => {
          onZoomChange(1);
          onPanChange({ x: 0, y: 0 });
        }}
        className="absolute top-4 right-4 z-10"
      />

      {/* Canvas Container */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Artwork Image */}
        <div
          className="absolute"
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0'
          }}
        >
          <Image
            src={panel.imageUrl}
            alt={`${panel.title} - ${panel.year}`}
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />

          {/* Loading overlay - only show if image is not loaded and not errored */}
          {shouldShowLoading && (
            <div 
              className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center"
              style={{
                width: panel.dimensions.width,
                height: panel.dimensions.height,
              }}
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading {panel.year}...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {imageError && (
            <div 
              className="absolute inset-0 bg-red-50 flex items-center justify-center border-2 border-red-200 border-dashed"
              style={{
                width: panel.dimensions.width,
                height: panel.dimensions.height,
              }}
            >
              <div className="text-center text-red-600">
                <div className="w-8 h-8 mx-auto mb-2">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm">Failed to load image</p>
                <p className="text-xs mt-1">{panel.year}</p>
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
              onCommentCancel={handleCommentCancel}
            />
          )}
        </div>
      </div>

      {/* Panel Info */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded backdrop-blur-sm">
        <h3 className="font-semibold">{panel.title}</h3>
        <p className="text-sm">{panel.year}</p>
        <p className="text-xs">
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
          {!imageLoaded && !imageError && (
            <span className="ml-2 text-yellow-300">⏳</span>
          )}
          {imageError && (
            <span className="ml-2 text-red-300">⚠️</span>
          )}
        </p>
      </div>
    </div>
  );
}