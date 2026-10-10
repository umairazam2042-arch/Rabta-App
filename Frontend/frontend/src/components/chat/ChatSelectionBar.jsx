import React from 'react'

// Upar wala bar: sirf count, cancel aur Forward ka username panel. Menu ab message ke paas khulta hai.
const ChatSelectionBar = ({ selection }) => {
  const {
    selectedMsgs,
    clearSelection,
    forwardOpen,
    forwardTo,
    setForwardTo,
    forwardSelected,
    closeForward,
    actionBusy,
  } = selection

  if (selectedMsgs.length === 0) return null

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-line bg-white px-4 py-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={clearSelection}
          aria-label="Selection hatao"
          className="rounded-lg px-2 py-0.5 text-lg leading-none text-muted hover:bg-slate-100"
        >
          ×
        </button>
        <span className="text-sm font-semibold">{selectedMsgs.length} selected</span>
      </div>

      {forwardOpen && (
        <div className="flex items-center gap-2">
          <input
            value={forwardTo}
            onChange={(e) => setForwardTo(e.target.value)}
            placeholder="Username (jaise: ali)"
            className="h-9 min-w-0 flex-1 rounded-lg border border-line px-3 text-sm"
          />
          <button
            type="button"
            onClick={forwardSelected}
            disabled={actionBusy || !forwardTo.trim()}
            className="h-9 rounded-lg bg-brand px-3 text-sm font-bold text-white disabled:opacity-60"
          >
            Bhejo
          </button>
          <button
            type="button"
            onClick={closeForward}
            className="h-9 rounded-lg px-3 text-sm hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatSelectionBar