'use client';

import { useState, useRef, useEffect } from 'react';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export default function CommentInput({
  onSubmit,
  onCancel,
  placeholder = 'Share your thoughts...',
  maxLength = 280,
  className = ''
}: CommentInputProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the textarea when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-4 w-full max-w-sm md:min-w-64 md:max-w-80 ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          className="w-full resize-none border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black touch-manipulation"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        />
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-base text-black">
            {text.length}/{maxLength}
          </span>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-base text-black hover:text-gray-700 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-500 text-white text-base rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}