import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comment, CommentInput } from '@/types/comment';

const COLLECTION_NAME = 'comments';

// Initialize profanity filter lazily
let profanityFilter: any = null;

async function initProfanityFilter() {
  if (!profanityFilter) {
    // @ts-expect-error - leo-profanity has no type definitions
    profanityFilter = await import('leo-profanity');
    profanityFilter.loadDictionary('en');
  }
  return profanityFilter;
}

// Check if comment contains profanity
async function containsProfanity(text: string): Promise<boolean> {
  if (!text || text.trim() === '') return false;
  const filter = await initProfanityFilter();
  return filter.check(text);
}

// Convert Firestore document to Comment type
function convertFirestoreDoc(doc: DocumentSnapshot<DocumentData>): Comment {
  const data = doc.data();
  if (!data) {
    throw new Error('Document data is undefined');
  }
  return {
    id: doc.id,
    text: data.text,
    imageData: data.imageData,
    type: data.type,
    language: data.language,
    position: data.position,
    year: data.year,
    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp,
    userId: data.userId,
    approved: data.approved,
    color: normalizeColor(data.color), // Normalize color with backward compatibility
    metadata: data.metadata
  };
}

// Add a new comment to Firebase
export async function addComment(commentInput: CommentInput): Promise<Comment & { isPending?: boolean }> {
  try {
    console.log('📝 Adding comment to Firebase:', commentInput);
    
    // Check for profanity in text comments
    const hasProfanity = commentInput.text ? await containsProfanity(commentInput.text) : false;
    const isAutoApproved = !hasProfanity;
    
    const commentData = {
      text: commentInput.text || null,
      imageData: commentInput.imageData || null,
      type: commentInput.type,
      language: commentInput.text ? detectLanguage(commentInput.text) : null,
      position: commentInput.position,
      year: commentInput.year,
      timestamp: serverTimestamp(),
      userId: generateUserId(),
      approved: isAutoApproved, // Auto-approve clean comments
      color: normalizeColor(commentInput.color), // Normalize and validate color
      metadata: {
        device: commentInput.device,
        inputMethod: commentInput.inputMethod,
        sessionId: generateSessionId(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        createdAt: serverTimestamp(),
        moderationReason: hasProfanity ? 'profanity_detected' : null
      }
    };
    
    console.log('📝 Comment data to save:', commentData);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), commentData);
    console.log('✅ Comment saved with ID:', docRef.id);
    
    if (hasProfanity) {
      console.log('⚠️ Comment flagged for review due to profanity');
    } else {
      console.log('✅ Comment auto-approved');
    }
    
    // Return the comment with the generated ID and pending status
    return {
      id: docRef.id,
      ...commentData,
      timestamp: Date.now(),
      language: commentData.language || undefined,
      color: commentData.color, // Include color in returned comment
      isPending: hasProfanity, // Add pending flag for UI feedback
      metadata: {
        ...commentData.metadata,
        createdAt: Date.now()
      }
    } as Comment & { isPending?: boolean };
  } catch (error) {
    console.error('❌ Error adding comment to Firebase:', error);
    throw new Error('Failed to add comment');
  }
}

// Get all comments for a specific year
export async function getCommentsByYear(year: number): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('year', '==', year),
      where('approved', '==', true),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreDoc);
  } catch (error) {
    console.error('Error getting comments from Firebase:', error);
    throw new Error('Failed to get comments');
  }
}

// Get all comments (for admin use)
export async function getAllComments(): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertFirestoreDoc);
  } catch (error) {
    console.error('Error getting all comments from Firebase:', error);
    throw new Error('Failed to get all comments');
  }
}

// Listen to real-time comments updates for a specific year
export function subscribeToCommentsByYear(
  year: number, 
  callback: (comments: Comment[]) => void
): () => void {
  console.log('🔄 Setting up real-time listener for year:', year);
  
  // Simplified query first - let's see if we can read anything at all
  const q = query(
    collection(db, COLLECTION_NAME),
    where('year', '==', year)
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    console.log('🔄 Real-time update received. Documents:', querySnapshot.size);
    const comments = querySnapshot.docs.map(convertFirestoreDoc);
    console.log('🔄 Parsed comments:', comments);
    callback(comments);
  }, (error) => {
    console.error('❌ Error listening to comments:', error);
  });
  
  return unsubscribe;
}

// Listen to all comments (for admin use)
export function subscribeToAllComments(
  callback: (comments: Comment[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('timestamp', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const comments = querySnapshot.docs.map(convertFirestoreDoc);
    callback(comments);
  }, (error) => {
    console.error('Error listening to all comments:', error);
  });
  
  return unsubscribe;
}

// Update comment approval status
export async function updateCommentApproval(commentId: string, approved: boolean): Promise<void> {
  try {
    const commentRef = doc(db, COLLECTION_NAME, commentId);
    await updateDoc(commentRef, {
      approved,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating comment approval:', error);
    throw new Error('Failed to update comment approval');
  }
}

// Delete a comment
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const commentRef = doc(db, COLLECTION_NAME, commentId);
    await deleteDoc(commentRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment');
  }
}

// Utility functions
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate and normalize color input
function normalizeColor(color?: string): string {
  if (!color) return '#000000'; // Default to black
  
  // Remove whitespace and convert to lowercase
  const cleanColor = color.trim().toLowerCase();
  
  // If it's a named color, convert to hex
  const namedColors: Record<string, string> = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#008000',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'brown': '#a52a2a',
    'gray': '#808080',
    'grey': '#808080'
  };
  
  if (namedColors[cleanColor]) {
    return namedColors[cleanColor];
  }
  
  // If it's already a hex color, validate and return
  if (/^#[0-9a-f]{6}$/i.test(cleanColor)) {
    return cleanColor;
  }
  
  // If it's a 3-digit hex, expand to 6 digits
  if (/^#[0-9a-f]{3}$/i.test(cleanColor)) {
    const [, r, g, b] = cleanColor;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  
  // If invalid, return default black
  console.warn(`Invalid color provided: ${color}. Using default black.`);
  return '#000000';
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function detectLanguage(text: string): string {
  // Simple language detection - you can replace with a more sophisticated solution
  const languages = {
    'en': /^[a-zA-Z\s.,!?'"()-]+$/,
    'es': /[ñáéíóúü]/i,
    'fr': /[àâäçéèêëïîôöùûüÿ]/i,
    'de': /[äöüß]/i,
    'it': /[àèéìíîòóù]/i,
    'pt': /[ãâáàçéêíóôõú]/i,
    'ru': /[а-яё]/i,
    'zh': /[\u4e00-\u9fff]/,
    'ja': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/,
    'ko': /[\uac00-\ud7af]/,
    'ar': /[\u0600-\u06ff]/,
    'hi': /[\u0900-\u097f]/
  };

  for (const [lang, pattern] of Object.entries(languages)) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  return 'en'; // Default to English
}

// Bulk operations for moderation
export async function bulkUpdateComments(
  commentIds: string[], 
  action: 'approve' | 'reject' | 'delete'
): Promise<{ success: string[], failed: string[] }> {
  const results = { success: [] as string[], failed: [] as string[] };
  
  for (const commentId of commentIds) {
    try {
      if (action === 'delete') {
        await deleteComment(commentId);
      } else {
        await updateCommentApproval(commentId, action === 'approve');
      }
      results.success.push(commentId);
    } catch (error) {
      console.error(`Failed to ${action} comment ${commentId}:`, error);
      results.failed.push(commentId);
    }
  }
  
  return results;
}

// Search and filter comments
export async function searchComments(options: {
  searchTerm?: string;
  status?: 'all' | 'approved' | 'pending';
  year?: number;
  limit?: number;
}): Promise<Comment[]> {
  try {
    let q = query(collection(db, COLLECTION_NAME));
    
    // Apply status filter
    if (options.status === 'approved') {
      q = query(q, where('approved', '==', true));
    } else if (options.status === 'pending') {
      q = query(q, where('approved', '==', false));
    }
    
    // Apply year filter
    if (options.year) {
      q = query(q, where('year', '==', options.year));
    }
    
    // Order by timestamp
    q = query(q, orderBy('timestamp', 'desc'));
    
    // Apply limit
    if (options.limit) {
      // Note: Firestore limit would require importing limit function
      // For now, we'll limit after fetching
    }
    
    const querySnapshot = await getDocs(q);
    let comments = querySnapshot.docs.map(convertFirestoreDoc);
    
    // Apply text search filter (client-side for now)
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      comments = comments.filter(comment => 
        comment.text?.toLowerCase().includes(searchLower) ||
        comment.userId?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply limit after filtering
    if (options.limit) {
      comments = comments.slice(0, options.limit);
    }
    
    return comments;
  } catch (error) {
    console.error('Error searching comments:', error);
    throw new Error('Failed to search comments');
  }
}

// Export comments data
export async function exportComments(format: 'csv' | 'json' = 'csv'): Promise<string> {
  try {
    const comments = await getAllComments();
    
    if (format === 'json') {
      return JSON.stringify(comments, null, 2);
    }
    
    // CSV format
    const headers = [
      'ID', 'Text', 'Type', 'Year', 'Timestamp', 'Approved', 'Color',
      'Language', 'Device', 'Input Method', 'Position X', 'Position Y'
    ];
    
    const csvRows = [headers.join(',')];
    
    comments.forEach(comment => {
      const row = [
        comment.id,
        `"${(comment.text || '').replace(/"/g, '""')}"`, // Escape quotes
        comment.type,
        comment.year,
        new Date(comment.timestamp).toISOString(),
        comment.approved,
        comment.color || '',
        comment.language || '',
        comment.metadata?.device || '',
        comment.metadata?.inputMethod || '',
        comment.position.x,
        comment.position.y
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  } catch (error) {
    console.error('Error exporting comments:', error);
    throw new Error('Failed to export comments');
  }
}

// Get comment statistics
export async function getCommentStats(): Promise<{
  total: number;
  approved: number;
  pending: number;
  byYear: Record<number, number>;
  byType: Record<string, number>;
}> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const comments = querySnapshot.docs.map(convertFirestoreDoc);
    
    const stats = {
      total: comments.length,
      approved: comments.filter(c => c.approved).length,
      pending: comments.filter(c => !c.approved).length,
      byYear: {} as Record<number, number>,
      byType: {} as Record<string, number>
    };
    
    comments.forEach(comment => {
      // Count by year
      stats.byYear[comment.year] = (stats.byYear[comment.year] || 0) + 1;
      
      // Count by type
      stats.byType[comment.type] = (stats.byType[comment.type] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting comment stats:', error);
    throw new Error('Failed to get comment statistics');
  }
}