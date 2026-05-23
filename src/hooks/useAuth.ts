import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    await upsertUserProfile(cred.user)
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await upsertUserProfile(cred.user, displayName)
  }

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => signOut(auth)

  return { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, logout }
}

async function upsertUserProfile(user: User, displayName?: string) {
  const userRef = ref(db, `users/${user.uid}`)
  const snap = await get(userRef)
  if (!snap.exists()) {
    await set(userRef, {
      displayName: displayName || user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: Date.now(),
      recipeCount: 0,
    })
  }
}
