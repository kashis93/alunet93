import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification
} from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getDoc as getDocFn } from "firebase/firestore";
import { sendWelcomeEmail } from "@/services/emailService";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // If user exists in Auth but not in Firestore (e.g., first Google login)
          const userData = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "User",
            email: firebaseUser.email,
            role: "alumni",
            photoURL: firebaseUser.photoURL || "",
            emailVerified: firebaseUser.emailVerified,
            createdAt: serverTimestamp()
          };
          await setDoc(doc(db, "users", firebaseUser.uid), userData);
          setUser(userData);
        } else {
          const data = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
            ...data,
            // Prefer Firestore profile fields if present (custom uploads), otherwise fall back to Auth
            photoURL: data?.photoURL || firebaseUser.photoURL,
            name: data?.name || firebaseUser.displayName || data?.displayName
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Allows other components to refresh the cached user data from Firestore
  const refreshUser = useCallback(async (uid) => {
    try {
      const targetUid = uid || (auth.currentUser && auth.currentUser.uid);
      if (!targetUid) return null;
      const userDoc = await getDoc(doc(db, "users", targetUid));
      if (userDoc.exists()) {
        const firebaseUser = auth.currentUser;
        const data = userDoc.data();
        const userData = {
          uid: targetUid,
          email: firebaseUser?.email,
          displayName: firebaseUser?.displayName,
          emailVerified: !!firebaseUser?.emailVerified,
          ...data,
          photoURL: data?.photoURL || firebaseUser?.photoURL,
          name: data?.name || firebaseUser?.displayName || data?.displayName
        };
        setUser(userData);
        return true;
      }
      return null;
    } catch (err) {
      console.warn("refreshUser failed:", err);
      return null;
    }
  }, []);

  const signup = async (email, password, name, role = "alumni") => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUser, { displayName: name });

      const userData = {
        uid: firebaseUser.uid,
        name,
        email,
        role,
        emailVerified: false,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      setUser(userData);
      setShowLoginModal(false);

      // Send welcome email
      await sendWelcomeEmail(email, name);

      // Send email verification
      await firebaseSendEmailVerification(firebaseUser);
      
      return { success: true, needsVerification: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoginModal(false);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
      return { success: true };
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const resetPassword = async (email) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: error.message };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: "No user logged in" };
      }
      await firebaseSendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (error) {
      console.error("Resend verification error:", error);
      return { success: false, error: error.message };
    }
  };

  const requireAuth = useCallback((_action) => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  }, [user]);

  const checkProfileComplete = useCallback((userData) => {
    if (!userData) return false;
    return !!(userData.graduationYear && userData.department && userData.company && userData.achievement);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isProfileComplete: checkProfileComplete(user),
      refreshUser,
      loading,
      signup,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      resendVerificationEmail,
      showLoginModal,
      setShowLoginModal,
      requireAuth
    }}>
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading your session...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
