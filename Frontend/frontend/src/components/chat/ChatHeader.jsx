import React from 'react'
import { Link } from 'react-router'
import Avatar from '../common/Avatar'
import ChatMenu from './ChatMenu'

// Chat ka header: user ka avatar/naam aur auto-delete wala menu
const ChatHeader = ({ other, username }) => (
  <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-3">
    {other ? (
      <>
        <Avatar username={other.username} src={other.avatar?.url} />
        <h2 className="min-w-0 flex-1 truncate font-bold">
          <Link to={`/profile/${other.username}`} className="hover:underline">
            @{other.username}
          </Link>
        </h2>
      </>
    ) : (
      <h2 className="flex-1 truncate font-bold">@{username}</h2>
    )}

    {/* Auto-delete ka menu (header wala) */}
    <ChatMenu username={username} />
  </header>
)

export default ChatHeader