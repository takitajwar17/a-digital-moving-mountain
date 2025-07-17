import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Comment, CommentInput, CommentFilter } from '@/types/comment';
import { ArtworkPanel } from '@/types/artwork';
import { User } from '@/types/user';
import { detectLanguage } from '@/utils/languageDetection';

// Comments Collection
export const commentsCollection = collection(db, 'comments');
export const artworkPanelsCollection = collection(db, 'artworkPanels');
export const usersCollection = collection(db, 'users');

// Authentication
export const signInAnonymous = async (): Promise<FirebaseUser> => {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

// Comment Operations
export const addComment = async (commentInput: CommentInput): Promise<Comment> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const comment: Omit<Comment, 'id'> = {
    text: commentInput.text,
    language: detectLanguage(commentInput.text).language,
    position: commentInput.position,
    year: commentInput.year,
    timestamp: Date.now(),
    userId: user.uid,
    approved: true, // Auto-approve for now, implement moderation later
    metadata: {
      device: commentInput.device,
      inputMethod: commentInput.inputMethod,
      sessionId: generateSessionId(),
      userAgent: navigator.userAgent
    }
  };

  const docRef = await addDoc(commentsCollection, comment);
  return { id: docRef.id, ...comment };
};

export const getComments = async (filter?: CommentFilter): Promise<Comment[]> => {
  let q = query(commentsCollection, orderBy('timestamp', 'desc'));

  if (filter?.year) {
    q = query(q, where('year', '==', filter.year));
  }

  if (filter?.language) {
    q = query(q, where('language', '==', filter.language));
  }

  if (filter?.approved !== undefined) {
    q = query(q, where('approved', '==', filter.approved));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

export const subscribeToComments = (
  callback: (comments: Comment[]) => void,
  filter?: CommentFilter
): (() => void) => {
  let q = query(commentsCollection, orderBy('timestamp', 'desc'));

  if (filter?.year) {
    q = query(q, where('year', '==', filter.year));
  }

  if (filter?.language) {
    q = query(q, where('language', '==', filter.language));
  }

  if (filter?.approved !== undefined) {
    q = query(q, where('approved', '==', filter.approved));
  }

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    callback(comments);
  });
};

export const updateComment = async (commentId: string, updates: Partial<Comment>): Promise<void> => {
  const commentRef = doc(db, 'comments', commentId);
  await updateDoc(commentRef, updates);
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const commentRef = doc(db, 'comments', commentId);
  await deleteDoc(commentRef);
};

// Artwork Panel Operations
export const getArtworkPanels = async (): Promise<ArtworkPanel[]> => {
  const q = query(artworkPanelsCollection, orderBy('year', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArtworkPanel));
};

export const getArtworkPanel = async (year: number): Promise<ArtworkPanel | null> => {
  const q = query(artworkPanelsCollection, where('year', '==', year), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as ArtworkPanel;
};

// User Operations
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const docRef = await addDoc(usersCollection, userData);
  return { id: docRef.id, ...userData };
};

export const getUser = async (userId: string): Promise<User | null> => {
  const q = query(usersCollection, where('id', '==', userId), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
};

// Utility Functions

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Analytics and Monitoring
export const logUserActivity = async (activity: {
  userId: string;
  sessionId: string;
  type: string;
  data: Record<string, any>;
}): Promise<void> => {
  const activityCollection = collection(db, 'userActivities');
  await addDoc(activityCollection, {
    ...activity,
    timestamp: Date.now()
  });
};