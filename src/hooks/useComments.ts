'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment, CommentInput, CommentFilter } from '@/types/comment';
import { 
  addComment, 
  getCommentsByYear, 
  subscribeToCommentsByYear,
  getAllComments,
  subscribeToAllComments
} from '@/services/firebaseComments';

export interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addNewComment: (commentInput: CommentInput) => Promise<void>;
  refreshComments: () => Promise<void>;
  clearComments: () => void;
  filteredComments: Comment[];
}

export function useComments(filter: CommentFilter = { approved: true }): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments from Firebase on mount and subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const loadComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (filter.year) {
          // Subscribe to comments for specific year
          console.log('🔄 Subscribing to comments for year:', filter.year);
          unsubscribe = subscribeToCommentsByYear(filter.year, (comments) => {
            console.log('🔄 useComments received comments:', comments);
            setComments(comments);
            setLoading(false);
          });
        } else {
          // Subscribe to all comments (for admin use)
          console.log('🔄 Subscribing to all comments');
          unsubscribe = subscribeToAllComments((comments) => {
            console.log('🔄 useComments received all comments:', comments);
            setComments(comments);
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Failed to load comments from Firebase:', error);
        setError('Failed to load comments');
        setLoading(false);
      }
    };
    
    loadComments();
    
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [filter.year]);

  // Add new comment to Firebase
  const addNewComment = useCallback(async (commentInput: CommentInput) => {
    try {
      setLoading(true);
      setError(null);

      const newComment = await addComment(commentInput);
      console.log('✅ Comment added to Firebase:', newComment);
      
      // The real-time listener will automatically update the state
      // so we don't need to manually update the comments array
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add comment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh comments manually (fetch from Firebase)
  const refreshComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const comments = filter.year 
        ? await getCommentsByYear(filter.year)
        : await getAllComments();
        
      setComments(comments);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh comments');
    } finally {
      setLoading(false);
    }
  }, [filter.year]);

  // Clear all comments (for development - only clears local state)
  const clearComments = useCallback(() => {
    setComments([]);
    console.log('🗑️ Local comments cleared (Firebase data remains)');
  }, []);

  // Filter comments based on current filter
  const filteredComments = comments.filter(comment => {
    if (filter.year && comment.year !== filter.year) return false;
    if (filter.language && comment.language && comment.language !== filter.language) return false;
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