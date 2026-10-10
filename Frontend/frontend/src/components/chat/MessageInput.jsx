import React, { useState } from 'react'
import { SendHorizontal } from 'lucide-react'

const MAX_LENGTH = 2000

const MessageInput = ({ onSend, isSending = false, disabled = false }) => {
  const [text, setText] = useState('')
  const canSend = text.trim() !== '' && !isSending && !disabled

  const submit = async () => {
    if (!canSend) return
    try {
      await onSend(text.trim())
      setText('')
    } catch {
      // error parent dikhata hai; text wahi rehne do
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex items-end gap-2"
    >
      <label htmlFor="message-text" className="sr-only">
        Message
      </label>
      <textarea
        id="message-text"
        rows={1}
        maxLength={MAX_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-line bg-white px-4 py-2.5 text-base"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SendHorizontal size={20} />
      </button>
    </form>
  )
}

export default MessageInput