'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment, CommentInput, CommentFilter } from '@/types/comment';
import { detectLanguage } from '@/utils/languageDetection';

export interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addNewComment: (commentInput: CommentInput) => Promise<void>;
  refreshComments: () => Promise<void>;
  clearComments: () => void;
  filteredComments: Comment[];
}

// Simple local storage key for comments
const STORAGE_KEY = 'footprints-comments';

// Generate a simple ID
const generateId = () => `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate a simple session ID
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function useComments(filter: CommentFilter = { approved: true }): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments from localStorage on mount
  useEffect(() => {
    try {
      setLoading(true);
      const savedComments = localStorage.getItem(STORAGE_KEY);
      if (savedComments) {
        const parsed = JSON.parse(savedComments) as Comment[];
        setComments(parsed);
      }
    } catch (error) {
      console.error('Failed to load comments from localStorage:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save comments to localStorage whenever comments change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comments to localStorage:', error);
    }
  }, [comments]);

  // Add new comment
  const addNewComment = useCallback(async (commentInput: CommentInput) => {
    try {
      setLoading(true);
      setError(null);

      const newComment: Comment = {
        id: generateId(),
        text: commentInput.text,
        language: detectLanguage(commentInput.text).language,
        position: commentInput.position,
        year: commentInput.year,
        timestamp: Date.now(),
        userId: 'anonymous-user',
        approved: true, // Auto-approve all comments for simplicity
        metadata: {
          device: commentInput.device,
          inputMethod: commentInput.inputMethod,
          sessionId: generateSessionId(),
          userAgent: navigator.userAgent
        }
      };

      setComments(prev => [...prev, newComment]);
      console.log('✅ Comment added:', newComment);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add comment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh comments manually (for compatibility, but not needed with localStorage)
  const refreshComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const savedComments = localStorage.getItem(STORAGE_KEY);
      if (savedComments) {
        const parsed = JSON.parse(savedComments) as Comment[];
        setComments(parsed);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh comments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear all comments (for development)
  const clearComments = useCallback(() => {
    setComments([]);
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ All comments cleared');
  }, []);

  // Filter comments based on current filter
  const filteredComments = comments.filter(comment => {
    if (filter.year && comment.year !== filter.year) return false;
    if (filter.language && comment.language !== filter.language) return false;
    if (filter.approved !== undefined && comment.approved !== filter.approved) return false;
    if (filter.dateRange) {
      const { start, end } = filter.dateRange;
      if (comment.timestamp < start || comment.timestamp > end) return false;
    }
    return true;
  });

  return {
    comments: filteredComments,
    loading,
    error,
    addNewComment,
    refreshComments,
    clearComments,
    filteredComments
  };
}