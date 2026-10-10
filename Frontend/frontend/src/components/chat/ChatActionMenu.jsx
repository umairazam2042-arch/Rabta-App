import React, { useEffect, useRef } from 'react'

const itemClass = 'block w-full whitespace-nowrap px-4 py-2 text-left text-sm hover:bg-slate-50'

// Message ke upar khulne wala chhota menu (hold karne ke baad). Bahar click par band.
const ChatActionMenu = ({ isMine, canUpdate, allMine, onUpdate, onForward, onDelete, onClose }) => {
  const ref = useRef(null)

  useEffect(() => {
    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose])

  return (
    <div
      ref={ref}
      className={`absolute bottom-full z-20 mb-1 w-44 overflow-hidden rounded-xl border border-line bg-white py-1 text-ink shadow-lg ${
        isMine ? 'right-0' : 'left-0'
      }`}
    >
      {canUpdate && (
        <button type="button" onClick={onUpdate} className={itemClass}>
          Update
        </button>
      )}
      <button type="button" onClick={onForward} className={itemClass}>
        Forward
      </button>
      <button type="button" onClick={() => onDelete('me')} className={itemClass}>
        Mere liye delete
      </button>
      {allMine && (
        <button
          type="button"
          onClick={() => onDelete('everyone')}
          className={`${itemClass} text-red-600 hover:bg-red-50`}
        >
          Sab ke liye delete
        </button>
      )}
    </div>
  )
}

export default ChatActionMenu