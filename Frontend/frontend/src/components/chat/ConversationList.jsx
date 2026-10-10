import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Avatar from '../common/Avatar'

const ConversationList = ({ conversations, isLoading, error, activeUsername }) => {
  const navigate = useNavigate()
  const [newName, setNewName] = useState('')

  // Kisi bhi user ka username likh kar naya chat shuru karo
  const startChat = (e) => {
    e.preventDefault()
    const name = newName.trim().replace(/^@/, '').toLowerCase()
    if (!name) return
    setNewName('')
    navigate(`/messages/${encodeURIComponent(name)}`)
  }

  return (
    <>
      <form onSubmit={startChat} className="border-b border-line p-3">
        <label htmlFor="new-chat" className="sr-only">
          Username se naya chat
        </label>
        <input
          id="new-chat"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Username likho (jaise ali_khan)"
          className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm"
        />
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && <p className="p-4 text-muted">Loading...</p>}
        {error && <p className="p-4 text-red-600">{error}</p>}
        {!isLoading && !error && conversations.length === 0 && (
          <p className="p-4 text-muted">Abhi koi chat nahi.</p>
        )}

        <ul>
          {conversations.map((c) => {
            const active = c.user.username === activeUsername
            return (
              <li key={c._id}>
                <Link
                  to={`/messages/${c.user.username}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${
                    active ? 'bg-brand-soft' : ''
                  }`}
                >
                  <Avatar username={c.user.username} src={c.user.avatar?.url} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">@{c.user.username}</span>
                    <span className="block truncate text-sm text-muted">
                      {c.lastMessage?.text || 'Chat shuru karo'}
                    </span>
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

export default ConversationList