'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Comment } from '@/types/comment';
import CommentModeSelector from '../Comments/CommentModeSelector';

interface CommentOverlayProps {
  comments: Comment[];
  onCommentClick: (comment: Comment) => void;
  panelDimensions: { width: number; height: number };
  isAddingComment: boolean;
  commentPosition: { x: number; y: number } | null;
  clickScreenPosition?: { x: number; y: number } | null;
  onCommentSubmit: (text: string, color: string) => void;
  onDrawingSubmit: (imageData: string, color: string) => void;
  onCommentCancel: () => void;
}

// Smart positioning to avoid edge cutoffs
function getModalTransform(
  position: { x: number; y: number },
  panelDimensions: { width: number; height: number },
  clickPosition?: { x: number; y: number }
): { transform: string; position: 'fixed' | 'absolute'; fixedStyles?: React.CSSProperties } {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const modalWidth = isMobile ? 320 : 400; // Smaller width on mobile
  const modalHeight = isMobile ? 240 : 300; // Smaller height on mobile
  
  // Always use fixed positioning with click position
  if (typeof window !== 'undefined' && clickPosition) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // For mobile, center in viewport
    if (isMobile) {
      return {
        position: 'fixed',
        transform: 'translate(-50%, -50%)',
        fixedStyles: {
          top: '50%',
          left: '50%',
          zIndex: 99999,
          margin: 0,
          padding: 0
        }
      };
    }
    
    // For desktop, position at click
    let left = clickPosition.x;
    let top = clickPosition.y;
    
    // Only adjust if modal would go outside viewport
    const rightEdge = left + modalWidth / 2;
    const leftEdge = left - modalWidth / 2;
    const bottomEdge = top + modalHeight / 2;
    const topEdge = top - modalHeight / 2;
    
    // Adjust horizontal position if needed
    if (rightEdge > windowWidth - 20) {
      // Too far right, shift left to fit
      left = windowWidth - modalWidth / 2 - 20;
    } else if (leftEdge < 20) {
      // Too far left, shift right to fit
      left = modalWidth / 2 + 20;
    }
    
    // Adjust vertical position if needed
    if (bottomEdge > windowHeight - 20) {
      // Too far down, shift up to fit
      top = windowHeight - modalHeight / 2 - 20;
    } else if (topEdge < 20) {
      // Too far up, shift down to fit
      top = modalHeight / 2 + 20;
    }
    
    return {
      position: 'fixed',
      transform: 'translate(-50%, -50%)',
      fixedStyles: {
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
        margin: 0,
        padding: 0
      }
    };
  }
  
  // Fallback when no click position
  return {
    position: 'fixed',
    transform: 'translate(-50%, -50%)',
    fixedStyles: {
      top: '50vh',
      left: '50vw',
      zIndex: 9999,
      margin: 0,
      padding: 0
    }
  };
}

export default function CommentOverlay({
  comments,
  onCommentClick,
  panelDimensions,
  isAddingComment,
  commentPosition,
  clickScreenPosition,
  onCommentSubmit,
  onDrawingSubmit,
  onCommentCancel
}: CommentOverlayProps) {
  const [, ] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Existing Comments */}
      {comments.map((comment) => (
        <div 
          key={comment.id} 
          className="absolute pointer-events-auto"
          style={{
            left: `${comment.position.x * panelDimensions.width}px`,
            top: `${comment.position.y * panelDimensions.height}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {comment.type === 'text' ? (
            <div 
              className="bg-transparent px-4 py-3 cursor-pointer transition-all max-w-xs touch-manipulation min-h-[44px] flex items-center"
              onClick={() => onCommentClick(comment)}
              onTouchStart={() => onCommentClick(comment)}
            >
              <p 
                className="text-lg md:text-sm leading-relaxed font-medium drop-shadow-lg"
                style={{ color: comment.color || '#000000' }}
              >
                {comment.text}
              </p>
            </div>
          ) : (
            <div 
              className="bg-transparent p-2 cursor-pointer transition-all touch-manipulation min-h-[44px] flex items-center justify-center"
              onClick={() => onCommentClick(comment)}
              onTouchStart={() => onCommentClick(comment)}
            >
              <div 
                className="rounded-lg p-1"
              >
                <Image 
                  src={comment.imageData || ''} 
                  alt="User drawing" 
                  width={96}
                  height={96}
                  className="max-w-28 max-h-28 md:max-w-20 md:max-h-20 rounded drop-shadow-lg"
                  unoptimized={true}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New Comment Input - Portal to body to escape overflow constraints */}
      {isAddingComment && commentPosition && typeof document !== 'undefined' && (() => {
        const positioning = getModalTransform(commentPosition, panelDimensions, clickScreenPosition || undefined);
        
        const modalElement = (
          <div
            className="pointer-events-auto"
            style={{
              position: 'fixed',
              left: positioning.fixedStyles?.left,
              top: positioning.fixedStyles?.top,
              transform: 'translate(-50%, -50%)',
              touchAction: 'manipulation',
              zIndex: 99999, // Very high z-index to appear above everything
              margin: 0,
              padding: 0
            }}
          >
            <CommentModeSelector
              onSubmitText={onCommentSubmit}
              onSubmitDrawing={onDrawingSubmit}
              onCancel={onCommentCancel}
            />
          </div>
        );
        
        // Use portal to render outside of the overflow:hidden containers
        return createPortal(modalElement, document.body);
      })()}
    </div>
  );
}