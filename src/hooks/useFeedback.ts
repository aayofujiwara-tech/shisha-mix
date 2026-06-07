import { ref, push } from 'firebase/database'
import { db } from '../firebase'

export interface FeedbackData {
  userId: string | null
  overall: number
  usability: number | null
  features: number | null
  design: number | null
  willPay: 'yes' | 'maybe' | 'no'
  priceRange: '~300' | '~500' | '~1000' | '1000+' | null
  comment: string | null
  createdAt: number
}

export function useFeedback() {
  async function submitFeedback(data: FeedbackData): Promise<void> {
    const feedbacksRef = ref(db, 'feedbacks')
    await push(feedbacksRef, data)
  }

  return { submitFeedback }
}
