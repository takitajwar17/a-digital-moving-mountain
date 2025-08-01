'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Comment } from '@/types/comment';
import CommentModeSelector from '../Comments/CommentModeSelector';

interface CommentOverlayProps {
  comments: Comment[];
  onCommentClick: (comment: Comment) => void;
  panelDimensions: { width: number; height: number };
  isAddingComment: boolean;
  commentPosition: { x: number; y: number } | null;
  onCommentSubmit: (text: string, color: string) => void;
  onDrawingSubmit: (imageData: string, color: string) => void;
  onCommentCancel: () => void;
}

// Smart positioning to avoid edge cutoffs
function getModalTransform(
  position: { x: number; y: number },
  panelDimensions: { width: number; height: number }
): { transform: string; position: 'fixed' | 'absolute'; fixedStyles?: React.CSSProperties } {
  const modalWidth = 320; // approximate modal width
  const modalHeight = 400; // increased for mobile touch targets
  
  // Check if we're on mobile (screen width < 768px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  if (isMobile) {
    // On mobile, use fixed positioning in the center of the viewport
    return {
      position: 'fixed',
      transform: 'translate(-50%, -50%)',
      fixedStyles: {
        top: '50vh',
        left: '50vw',
        width: '90vw',
        maxWidth: '400px',
        maxHeight: '85vh',
        zIndex: 1000,
        margin: 0,
        padding: 0,
        touchAction: 'none',
        transformOrigin: 'center center'
      }
    };
  }
  
  let transformX = '-50%';
  let transformY = '-50%';
  
  // Check if modal would go off the right edge
  if (position.x * panelDimensions.width + modalWidth / 2 > panelDimensions.width) {
    transformX = '-100%';
  }
  
  // Check if modal would go off the left edge
  if (position.x * panelDimensions.width - modalWidth / 2 < 0) {
    transformX = '0%';
  }
  
  // Check if modal would go off the bottom edge
  if (position.y * panelDimensions.height + modalHeight / 2 > panelDimensions.height) {
    transformY = '-100%';
  }
  
  // Check if modal would go off the top edge
  if (position.y * panelDimensions.height - modalHeight / 2 < 0) {
    transformY = '0%';
  }
  
  return {
    transform: `translate(${transformX}, ${transformY})`,
    position: 'absolute'
  };
}

export default function CommentOverlay({
  comments,
  onCommentClick,
  panelDimensions,
  isAddingComment,
  commentPosition,
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
              className="bg-transparent px-4 py-3 cursor-pointer transition-all max-w-xs touch-manipulation"
              onClick={() => onCommentClick(comment)}
              onTouchStart={() => onCommentClick(comment)}
            >
              <p 
                className="text-base md:text-sm leading-relaxed font-medium drop-shadow-lg"
                style={{ color: comment.color || '#000000' }}
              >
                {comment.text}
              </p>
            </div>
          ) : (
            <div 
              className="bg-transparent p-2 cursor-pointer transition-all touch-manipulation"
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
                  className="max-w-24 max-h-24 md:max-w-20 md:max-h-20 rounded drop-shadow-lg"
                  unoptimized={true}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New Comment Input */}
      {isAddingComment && commentPosition && (() => {
        const positioning = getModalTransform(commentPosition, panelDimensions);
        const isMobile = positioning.position === 'fixed';
        
        return (
          <>
            {/* Mobile backdrop */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-auto"
                onClick={onCommentCancel}
                onTouchStart={onCommentCancel}
                style={{ zIndex: 999 }}
              />
            )}
            
            <div
              className="pointer-events-auto z-50"
              style={{
                position: positioning.position,
                left: positioning.position === 'fixed' ? undefined : `${commentPosition.x * panelDimensions.width}px`,
                top: positioning.position === 'fixed' ? undefined : `${commentPosition.y * panelDimensions.height}px`,
                transform: positioning.transform,
                touchAction: 'manipulation',
                ...positioning.fixedStyles
              }}
            >
              <CommentModeSelector
                onSubmitText={onCommentSubmit}
                onSubmitDrawing={onDrawingSubmit}
                onCancel={onCommentCancel}
              />
            </div>
          </>
        );
      })()}
    </div>
  );
}