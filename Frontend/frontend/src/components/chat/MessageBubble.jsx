import React, { useEffect, useRef } from 'react'
import ChatActionMenu from './ChatActionMenu'

// Message ko itni der dabaye rakhne par select + menu khulta hai (5 second)
const LONG_PRESS_MS = 700

// Ek message ka bubble. Hold karke select, select mode mein tap se toggle.
const MessageBubble = ({
  message,
  isMine,
  showSeen,
  selected,
  selectionMode,
  onSelect,
  onToggle,
  actionMenu,
  isEditing,
  draft,
  onDraftChange,
  onSaveEdit,
  onCancelEdit,
  busy,
}) => {
  const timerRef = useRef(null)
  const firedRef = useRef(false)

  // Unmount par timer saaf
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Sab ke liye delete hua message
  if (message.deletedForEveryone) {
    return (
      <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
        <p className="rounded-2xl border border-line px-4 py-2 text-sm italic text-muted">
          Ye message delete ho gaya
        </p>
      </div>
    )
  }

  const startPress = () => {
    if (isEditing) return
    firedRef.current = false
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      onSelect(message._id)
    }, LONG_PRESS_MS)
  }

  const cancelPress = () => clearTimeout(timerRef.current)

  const handleClick = () => {
    // Long press ke baad wala click ignore
    if (firedRef.current) {
      firedRef.current = false
      return
    }
    if (!isEditing && selectionMode) onToggle(message._id)
  }

  return (
    <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className="relative max-w-[75vw] sm:max-w-md">
        <div
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          onContextMenu={(e) => e.preventDefault()}
          onClick={handleClick}
          className={`select-none rounded-2xl px-4 py-2 ${
            isMine ? 'bg-brand text-white' : 'bg-slate-100 text-ink'
          } ${selectionMode && !isEditing ? 'cursor-pointer' : ''} ${
            selected ? 'ring-2 ring-brand ring-offset-2' : ''
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                rows={2}
                className="w-64 max-w-full resize-none rounded-lg p-2 text-ink"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancelEdit} className="rounded-lg px-3 py-1 text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={busy}
                  className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-ink disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          )}

          <p className={`mt-1 text-right text-[11px] ${isMine ? 'text-white/70' : 'text-muted'}`}>
            {message.editedAt && 'edited · '}
            {time}
            {showSeen && ' · Seen'}
          </p>
        </div>

        {/* Menu isi message ke upar khulta hai */}
        {actionMenu && <ChatActionMenu isMine={isMine} {...actionMenu} />}
      </div>
    </div>
  )
}

export default MessageBubble