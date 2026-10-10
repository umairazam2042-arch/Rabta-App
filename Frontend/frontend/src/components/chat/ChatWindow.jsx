import React from 'react'
import Alert from '../common/Alert'
import ChatHeader from './ChatHeader'
import ChatSelectionBar from './ChatSelectionBar'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import useAuth from '../../hooks/useAuth'
import useChatMessages from './useChatMessages'
import useMessageSelection from './useMessageSelection'

// Sirf composition: data hooks banata hai aur props neeche bhejta hai
const ChatWindow = ({ username }) => {
  const { user: me } = useAuth()
  const chat = useChatMessages({ username, me })
  const selection = useMessageSelection({
    username,
    me,
    messages: chat.messages,
    onEdit: chat.handleEdit,
    onDelete: chat.handleDelete,
  })

  return (
    <section aria-label={`Chat with @${username}`} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ChatHeader other={chat.other} username={username} />

      <ChatSelectionBar selection={selection} />

      {selection.actionError && (
        <div className="shrink-0 px-4 pt-2">
          <Alert message={selection.actionError} />
        </div>
      )}

      <MessageList chat={chat} selection={selection} username={username} meId={me._id} />

      {!chat.error && (
        <footer className="shrink-0 border-t border-line p-3">
          {chat.sendError && (
            <div className="mb-2">
              <Alert message={chat.sendError} />
            </div>
          )}
          <MessageInput
            onSend={chat.handleSend}
            isSending={chat.isSending}
            disabled={chat.isLoading}
          />
        </footer>
      )}
    </section>
  )
}

export default ChatWindow