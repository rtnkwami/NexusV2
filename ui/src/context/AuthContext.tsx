"use client"

import { auth } from "@/auth";
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

interface IAuthContext {
  loginWithEmail: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  user: User | null
  getToken: () => Promise<string | null>;
  syncUserToBackend: (user: User) => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined> (undefined)

export function AuthProvider ({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Sets up a Firebase auth listener when the component loads.
   * Updates React state whenever the user logs in or logs out.
   * Cleans itself up automatically when the component is destroyed.
   * */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return unsubscribe;
  },[])

  const getToken = async () => {
    if (!user) return null
    return await user.getIdToken()
  }

  const syncUserToBackend = async () => {
    const token = await getToken()
    await fetch('http://localhost:5000/users/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
  }

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
    syncUserToBackend()
  }

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider())
    syncUserToBackend()
  }

  const logout = async () => {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{
      user,
      getToken,
      syncUserToBackend,
      loginWithEmail,
      loginWithGoogle,
      logout
    }}>
      { children }
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const authContext = useContext(AuthContext);
  if (authContext === undefined) {
    throw new Error('useAuth must be use within an AuthProvider')
  }
  return authContext;
}
