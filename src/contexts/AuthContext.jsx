import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to sync Firestore profile with Auth state
  const syncProfile = async (u, roleIfNew = 'developer') => {
  const docRef = doc(db, "users", u.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    setProfile(docSnap.data());
  } else {
    // NEW USERS GET A STARTER GIFT
    const newProfile = { 
      uid: u.uid, 
      email: u.email, 
      role: roleIfNew, 
      walletBalance: 200.00, // <--- Free starter credits!
      createdAt: new Date() 
    };
    await setDoc(docRef, newProfile);
    setProfile(newProfile);
  }
};
  

  useEffect(() => {
    // 1. Handle Redirect Result (for Google Login)
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Retrieve the role stored before redirecting
          const storedRole = sessionStorage.getItem('pendingRole') || 'developer';
          await syncProfile(result.user, storedRole);
          sessionStorage.removeItem('pendingRole');
        }
      } catch (error) {
        console.error("Auth Redirect Error:", error);
      }
    };
    checkRedirect();

    // 2. Listen for Auth State Changes
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await syncProfile(u);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Login using Redirect (More stable for modern browsers)
  const loginWithGoogle = async (role) => {
    sessionStorage.setItem('pendingRole', role); // Save role to persist through redirect
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const registerEmail = async (email, pass, role) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await syncProfile(res.user, role);
  };

  const loginEmail = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
  
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loginWithGoogle, 
      registerEmail, 
      loginEmail, 
      logout, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);