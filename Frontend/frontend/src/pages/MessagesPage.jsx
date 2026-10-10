import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useAuth from '../hooks/useAuth'
import socket from '../services/socket'
import { getConversations } from '../services/message.service'
import { decryptLastMessage } from '../utils/e2ee'
import getErrorMessage from '../utils/getErrorMessage'
import ConversationList from '../components/chat/ConversationList'
import ChatWindow from '../components/chat/ChatWindow'

const MessagesPage = () => {
  const { username } = useParams()
  const { user: me } = useAuth()

  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Chat list: shuru mein aur jab bhi naya message / edit / delete ho
  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        const data = await getConversations()
        const readable = await Promise.all(
          data.map(async (c) => ({
            ...c,
            lastMessage: c.lastMessage
              ? await decryptLastMessage(me._id, c.user, c.lastMessage)
              : null,
          }))
        )
        if (!ignore) {
          setConversations(readable)
          setError('')
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()
    socket.on('message:new', load)
    socket.on('message:updated', load)
    socket.on('unread:update', load)

    return () => {
      ignore = true
      socket.off('message:new', load)
      socket.off('message:updated', load)
      socket.off('unread:update', load)
    }
  }, [me._id])

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-3 lg:h-[calc(100dvh-3rem)]">
      <h1 className="text-2xl font-bold">Messages</h1>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-white">
        {/* Choti screen par: chat khuli ho to list chhup jati hai */}
        <aside
          className={`${username ? 'hidden' : 'flex'} w-full min-h-0 flex-col border-r border-line lg:flex lg:w-80`}
        >
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            error={error}
            activeUsername={username}
          />
        </aside>

        <section className={`${username ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-1 lg:flex`}>
          {username ? (
            <ChatWindow key={username} username={username} />
          ) : (
            <p className="m-auto p-6 text-center text-muted">
              Koi chat chunein, ya upar username likh kar naya message shuru karein.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default MessagesPage