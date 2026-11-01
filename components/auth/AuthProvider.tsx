"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, firebaseConfigured, FIREBASE_MESSAGE } from "@/lib/firebase";

interface AuthApi {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  sendVerification: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isVerified: boolean;
}

const AuthContext = createContext<AuthApi | null>(null);

function notConfigured(): never {
  throw new Error(FIREBASE_MESSAGE);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!auth);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) notConfigured();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    return cred.user;
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) notConfigured();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) notConfigured();
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  }, []);

  const sendVerification = useCallback(async () => {
    if (!auth || !user) notConfigured();
    await sendEmailVerification(user!);
  }, [user]);

  const sendReset = useCallback(async (email: string) => {
    if (!auth) notConfigured();
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    });
  }, []);

  const logout = useCallback(async () => {
    if (!auth) notConfigured();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthApi>(
    () => ({
      user,
      loading,
      configured: firebaseConfigured,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      sendVerification,
      sendReset,
      logout,
      isVerified: user?.emailVerified ?? false,
    }),
    [user, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, sendVerification, sendReset, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
