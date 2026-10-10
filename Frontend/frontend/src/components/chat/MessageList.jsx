import React from 'react'
import Alert from '../common/Alert'
import MessageBubble from './MessageBubble'

// Messages ka scroll wala box: purane messages, empty state aur har bubble
const MessageList = ({ chat, selection, username, meId }) => {
  const {
    messages,
    hasMore,
    isLoading,
    isLoadingOlder,
    error,
    listRef,
    lastMineId,
    handleScroll,
    handleLoadOlder,
  } = chat

  const {
    selected,
    toggleSelect,
    selectMessage,
    menuOpen,
    menuAnchorId,
    closeMenu,
    canUpdate,
    allMine,
    startEdit,
    openForward,
    deleteSelected,
    editingId,
    editDraft,
    setEditDraft,
    saveEdit,
    cancelEdit,
    actionBusy,
  } = selection

  // Menu ke handlers, sirf us message ko pass honge jis par menu khula ho
  const menuProps = {
    canUpdate,
    allMine,
    onUpdate: startEdit,
    onForward: openForward,
    onDelete: deleteSelected,
    onClose: closeMenu,
  }

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      role="log"
      aria-label="Messages"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4"
    >
      {isLoading && <p className="m-auto text-muted">Loading messages...</p>}

      {!isLoading && error && (
        <div className="m-auto">
          <Alert message={error} />
        </div>
      )}

      {!isLoading && !error && (
        <div className="mt-auto flex flex-col gap-3">
          {hasMore && (
            <button
              type="button"
              onClick={handleLoadOlder}
              disabled={isLoadingOlder}
              className="mx-auto h-10 rounded-xl border border-line px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              {isLoadingOlder ? 'Loading...' : 'Load older messages'}
            </button>
          )}

          {messages.length === 0 && (
            <p className="py-8 text-center text-muted">No messages yet. Say hi to @{username}!</p>
          )}

          {messages.map((m) => {
            const isMine = m.sender === meId
            const showMenu = menuOpen && menuAnchorId === m._id && selected.has(m._id)

            return (
              <MessageBubble
                key={m._id}
                message={m}
                isMine={isMine}
                showSeen={m._id === lastMineId && Boolean(m.readAt)}
                selected={selected.has(m._id)}
                selectionMode={selected.size > 0}
                onSelect={selectMessage}
                onToggle={toggleSelect}
                actionMenu={showMenu ? menuProps : null}
                isEditing={editingId === m._id}
                draft={editDraft}
                onDraftChange={setEditDraft}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                busy={actionBusy}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MessageList