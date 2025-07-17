'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInAnonymous } from '@/services/firebase';

export interface UseFirebaseReturn {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
}

export function useFirebase(): UseFirebaseReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth Error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInAnonymous();
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user && !error) {
      signIn();
    }
  }, [loading, user, error]);

  return {
    user,
    loading,
    error,
    signIn
  };
}