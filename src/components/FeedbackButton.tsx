import { useState } from 'react'
import FeedbackForm from './FeedbackForm'
import './FeedbackButton.css'

interface Props {
  userId: string | null
}

export default function FeedbackButton({ userId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="feedback-fab"
        onClick={() => setOpen(true)}
        aria-label="フィードバックを送る"
      >
        💬
      </button>
      {open && <FeedbackForm userId={userId} onClose={() => setOpen(false)} />}
    </>
  )
}
