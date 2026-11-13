
import { useEffect, useRef, useState } from 'react'

export default function useMessages(conversation, onSend) {
  const [message, setMessage] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [conversation?.messages])

  function handleSend(e) {
    e.preventDefault()

    if (!message.trim() || !conversation) return

    onSend(message.trim())
    setMessage('')
  }

  return {
    message,
    setMessage,
    handleSend,
    bottomRef,
  }
}
