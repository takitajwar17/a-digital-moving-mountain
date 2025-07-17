'use client';

import { useState, useRef } from 'react';
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
            className="block"
            priority
          />

          {/* Comment Overlay */}
          <CommentOverlay
            comments={comments}
            onCommentClick={onCommentClick}
            panelDimensions={panel.dimensions}
            isAddingComment={isAddingComment}
            commentPosition={commentPosition}
            onCommentSubmit={handleCommentSubmit}
            onCommentCancel={handleCommentCancel}
          />
        </div>
      </div>

      {/* Panel Info */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
        <h3 className="font-semibold">{panel.title}</h3>
        <p className="text-sm">{panel.year}</p>
        <p className="text-xs">{comments.length} comments</p>
      </div>
    </div>
  );
}