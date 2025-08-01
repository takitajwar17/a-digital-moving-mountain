'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  embedded?: boolean; // New prop to control modal vs embedded mode
}

export default function CommentModal({
  onSubmit,
  onCancel,
  placeholder = 'Share your thoughts...',
  maxLength = 280,
  className = '',
  embedded = false
}: CommentInputProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the textarea after a brief delay to ensure modal is fully rendered
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
      if (!embedded) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (embedded) {
      onCancel();
    } else {
      setIsOpen(false);
      setTimeout(onCancel, 200); // Wait for modal close animation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const remainingChars = maxLength - text.length;
  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;

  // Embedded mode - render without Dialog wrapper
  if (embedded) {
    return (
      <div className={cn("space-y-4", className)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Textarea with enhanced styling */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={4}
              className={cn(
                "resize-none border-2 transition-all duration-200 text-base",
                "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                "placeholder:text-gray-400",
                isOverLimit && "border-red-400 focus:border-red-500 focus:ring-red-500/20"
              )}
              maxLength={maxLength + 50} // Allow slight overflow for better UX
            />
            
            {/* Character count */}
            <div className="absolute -bottom-6 right-2 text-sm font-medium">
              <span className={cn(
                "transition-colors duration-200",
                isOverLimit ? "text-red-500" : 
                isNearLimit ? "text-amber-500" : "text-gray-500"
              )}>
                {text.length}
              </span>
              <span className="text-gray-400">/{maxLength}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!text.trim() || isSubmitting || isOverLimit}
              className={cn(
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105",
                "disabled:from-gray-400 disabled:to-gray-400 disabled:hover:scale-100"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Full modal mode
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className={cn(
          "sm:max-w-md w-[95vw] max-w-[420px] p-0 gap-0 overflow-hidden bg-gradient-to-br from-white via-white to-gray-50 border-0 shadow-2xl",
          className
        )}
        onPointerDownOutside={handleCancel}
        onEscapeKeyDown={handleCancel}
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 pb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-semibold text-white">
                Add Your Comment
              </DialogTitle>
            </div>
            <DialogDescription className="text-blue-100">
              Share your thoughts about this artwork with the community
            </DialogDescription>
          </DialogHeader>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-400/20 rounded-full blur-lg"></div>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Textarea with enhanced styling */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={4}
                className={cn(
                  "resize-none border-2 transition-all duration-200 text-base bg-white/80 backdrop-blur-sm",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  "placeholder:text-gray-400",
                  isOverLimit && "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                )}
                maxLength={maxLength + 50} // Allow slight overflow for better UX
              />
              
              {/* Character count with smooth animation */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-6 right-2 text-sm font-medium"
                >
                  <span className={cn(
                    "transition-colors duration-200",
                    isOverLimit ? "text-red-500" : 
                    isNearLimit ? "text-amber-500" : "text-gray-500"
                  )}>
                    {text.length}
                  </span>
                  <span className="text-gray-400">/{maxLength}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action buttons with enhanced styling */}
            <div className="flex justify-between items-center pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!text.trim() || isSubmitting || isOverLimit}
                className={cn(
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105",
                  "disabled:from-gray-400 disabled:to-gray-400 disabled:hover:scale-100"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Helpful hint */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Press Cmd/Ctrl + Enter to post quickly
          </div>
        </div>

        {/* Subtle bottom gradient */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700"></div>
      </DialogContent>
    </Dialog>
  );
}