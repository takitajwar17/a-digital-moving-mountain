'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment, CommentInput, CommentFilter } from '@/types/comment';
import { addComment, subscribeToComments, getComments } from '@/services/firebase';

export interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addNewComment: (commentInput: CommentInput) => Promise<void>;
  refreshComments: () => Promise<void>;
  filteredComments: Comment[];
}

export function useComments(filter: CommentFilter = { approved: true }): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time comments
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToComments(
      (newComments) => {
        setComments(newComments);
        setLoading(false);
        setError(null);
      },
      filter
    );

    return unsubscribe;
  }, [filter]);

  // Add new comment
  const addNewComment = useCallback(async (commentInput: CommentInput) => {
    try {
      await addComment(commentInput);
      // Comment will be added automatically via the real-time subscription
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add comment');
      throw error;
    }
  }, []);

  // Refresh comments manually
  const refreshComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newComments = await getComments(filter);
      setComments(newComments);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh comments');
    } finally {
      setLoading(false);
    }
  }, [filter]);

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
    comments,
    loading,
    error,
    addNewComment,
    refreshComments,
    filteredComments
  };
}