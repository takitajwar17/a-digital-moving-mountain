'use client';

import { useState } from 'react';
import { Comment } from '@/types/comment';
import CommentModeSelector from '../Comments/CommentModeSelector';

interface CommentOverlayProps {
  comments: Comment[];
  onCommentClick: (comment: Comment) => void;
  panelDimensions: { width: number; height: number };
  isAddingComment: boolean;
  commentPosition: { x: number; y: number } | null;
  onCommentSubmit: (text: string) => void;
  onDrawingSubmit: (imageData: string) => void;
  onCommentCancel: () => void;
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
              className="bg-transparent px-3 py-2 cursor-pointer transition-all max-w-xs"
              onClick={() => onCommentClick(comment)}
            >
              <p className="text-sm text-white leading-relaxed font-medium drop-shadow-lg">{comment.text}</p>
            </div>
          ) : (
            <div 
              className="bg-transparent p-1 cursor-pointer transition-all"
              onClick={() => onCommentClick(comment)}
            >
              <img 
                src={comment.imageData} 
                alt="User drawing" 
                className="max-w-xs max-h-32 rounded drop-shadow-lg"
              />
            </div>
          )}
        </div>
      ))}

      {/* New Comment Input */}
      {isAddingComment && commentPosition && (
        <div
          className="absolute pointer-events-auto"
          style={{
            left: `${commentPosition.x * panelDimensions.width}px`,
            top: `${commentPosition.y * panelDimensions.height}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <CommentModeSelector
            onSubmitText={onCommentSubmit}
            onSubmitDrawing={onDrawingSubmit}
            onCancel={onCommentCancel}
          />
        </div>
      )}
    </div>
  );
}