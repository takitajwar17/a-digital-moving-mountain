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

// Convert Firestore document to Comment type
function convertFirestoreDoc(doc: DocumentSnapshot<DocumentData>): Comment {
  const data = doc.data();
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
    metadata: data.metadata
  };
}

// Add a new comment to Firebase
export async function addComment(commentInput: CommentInput): Promise<Comment> {
  try {
    console.log('📝 Adding comment to Firebase:', commentInput);
    
    const commentData = {
      text: commentInput.text || null,
      imageData: commentInput.imageData || null,
      type: commentInput.type,
      language: commentInput.text ? detectLanguage(commentInput.text) : null,
      position: commentInput.position,
      year: commentInput.year,
      timestamp: serverTimestamp(),
      userId: generateUserId(),
      approved: true, // Auto-approve for now
      metadata: {
        device: commentInput.device,
        inputMethod: commentInput.inputMethod,
        sessionId: generateSessionId(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        createdAt: serverTimestamp()
      }
    };
    
    console.log('📝 Comment data to save:', commentData);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), commentData);
    console.log('✅ Comment saved with ID:', docRef.id);
    
    // Return the comment with the generated ID
    return {
      id: docRef.id,
      ...commentData,
      timestamp: Date.now(),
      language: commentData.language || undefined,
      metadata: {
        ...commentData.metadata,
        createdAt: Date.now()
      }
    } as Comment;
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