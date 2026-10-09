import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { UserProfile } from '@/types'
import { firebaseService, getFriendlyAuthErrorMessage } from '@/services/firebase'

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
  isConfigured: boolean
  clearError: () => void
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, pass: string) => Promise<void>
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Listen to live Auth State Changes & session persistence
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange((currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const u = await firebaseService.signInWithGoogle()
      setUser(u)
    } catch (err) {
      const message = getFriendlyAuthErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const u = await firebaseService.signInWithEmail(email, pass)
      setUser(u)
    } catch (err) {
      const message = getFriendlyAuthErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const u = await firebaseService.signUpWithEmail(email, pass, displayName)
      setUser(u)
    } catch (err) {
      const message = getFriendlyAuthErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const sendPasswordReset = async (email: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await firebaseService.sendPasswordReset(email)
    } catch (err) {
      const message = getFriendlyAuthErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await firebaseService.signOut()
      setUser(null)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isConfigured: firebaseService.isConfigured,
        clearError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
