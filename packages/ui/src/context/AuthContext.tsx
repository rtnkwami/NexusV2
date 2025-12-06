"use client"

import { auth } from "@/auth";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface IAuthContext {
  signUpWithEmailAndPassword: (
    email: string,
    password: string,
    name: string,
  ) => Promise<FirebaseError | undefined>
  loginWithEmail: (email: string, password: string) => Promise<FirebaseError | undefined>
  continueWithGoogle: () => Promise<FirebaseError | undefined>
  logout: () => Promise<void>
  user: User | null
  getToken: () => Promise<string | null>;
  syncUserToBackend: (user: User) => Promise<void>;
  authError: FirebaseError | null
}

const AuthContext = createContext<IAuthContext | undefined> (undefined)

export function AuthProvider ({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authError, setError] = useState<FirebaseError | null>(null)
  const router = useRouter()

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

  const syncUserToBackend = async (user: User) => {
    const token = await user.getIdToken()
    await fetch('http://localhost:5000/users/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    })
  }

  const signUpWithEmailAndPassword = async (email: string, password: string, name: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      updateProfile(user, {
        displayName: name
      })
      await syncUserToBackend(user)
    } catch (error) {
      setError(error as FirebaseError)
      return error as FirebaseError;
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      await syncUserToBackend(user)
    } catch (error) {
      setError(error as FirebaseError)
      console.log(error)
      return error as FirebaseError
    }
  }

  const continueWithGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
      await syncUserToBackend(user)
      router.push('/')
    } catch (error) {
      return error as FirebaseError
    }
  }

  const logout = async () => {
    await signOut(auth);
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{
      user,
      getToken,
      syncUserToBackend,
      signUpWithEmailAndPassword,
      loginWithEmail,
      continueWithGoogle,
      logout,
      authError,
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
