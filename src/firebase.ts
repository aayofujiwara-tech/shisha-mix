import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getDatabase(app)
export const storage = getStorage(app)

let analytics: Analytics | null = null
try {
  analytics = getAnalytics(app)
} catch {}

export function trackRecipeCreate(recipeId: string, isPublic: boolean): void {
  try { if (analytics) logEvent(analytics, 'recipe_create', { recipe_id: recipeId, is_public: isPublic }) } catch {}
}

export function trackRecipeLike(recipeId: string): void {
  try { if (analytics) logEvent(analytics, 'recipe_like', { recipe_id: recipeId }) } catch {}
}

export function trackCommunityShare(recipeId: string): void {
  try { if (analytics) logEvent(analytics, 'community_share', { recipe_id: recipeId }) } catch {}
}

export function trackAIGenerate(): void {
  try { if (analytics) logEvent(analytics, 'ai_generate') } catch {}
}

export function trackStoreAdd(): void {
  try { if (analytics) logEvent(analytics, 'store_add') } catch {}
}

export function trackDiaryWrite(): void {
  try { if (analytics) logEvent(analytics, 'diary_write') } catch {}
}

export function trackPageView(pageName: string): void {
  try { if (analytics) logEvent(analytics, 'page_view', { page_name: pageName }) } catch {}
}

export default app
