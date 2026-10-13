import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import socket from '../../services/socket'
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markRead,
} from '../../services/message.service'
import { getChatKey, encryptText, decryptMessage } from '../../utils/e2ee'
import getErrorMessage from '../../utils/getErrorMessage'

// Chat ka data: load, realtime, scroll, send / edit / delete / purane messages
const UseChatMessages = ({ username, me }) => {
  const [other, setOther] = useState(null)
  const [messages, setMessages] = useState([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [sendError, setSendError] = useState('')

  const otherIdRef = useRef(null)
  const keyRef = useRef(Promise.resolve(null))
  const listRef = useRef(null)
  const stickRef = useRef(true)
  const preserveRef = useRef(null)

  // Chat khulte hi messages, keys aur "parh liya" mark
  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    setError('')

    const load = async () => {
      try {
        const data = await getMessages(username)
        if (ignore) return
        otherIdRef.current = data.user._id

        keyRef.current = getChatKey(me._id, data.user.publicKey)
        const chatKey = await keyRef.current
        const readable = await Promise.all(data.messages.map((m) => decryptMessage(m, chatKey)))
        if (ignore) return

        setOther(data.user)
        setMessages(readable)
        setHasMore(data.hasMore)
        markRead(username).catch(() => {})
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [username, me._id])

  // Real-time: naya message, edit, delete aur "parh liya"
  useEffect(() => {
    const isThisChat = (message) => {
      const otherId = otherIdRef.current
      return otherId && (message.sender === otherId || message.receiver === otherId)
    }

    const handleNew = async ({ message }) => {
      if (!isThisChat(message)) return
      const readable = await decryptMessage(message, await keyRef.current)
      setMessages((prev) => (prev.some((m) => m._id === readable._id) ? prev : [...prev, readable]))
      if (message.sender === otherIdRef.current) markRead(username).catch(() => {})
    }

    const handleUpdated = async ({ message }) => {
      if (!isThisChat(message)) return
      const readable = await decryptMessage(message, await keyRef.current)
      setMessages((prev) => prev.map((m) => (m._id === readable._id ? readable : m)))
    }

    const handleRead = ({ by, readAt }) => {
      if (by !== otherIdRef.current) return
      setMessages((prev) =>
        prev.map((m) => (m.sender === me._id && !m.readAt ? { ...m, readAt } : m))
      )
    }

    socket.on('message:new', handleNew)
    socket.on('message:updated', handleUpdated)
    socket.on('messages:read', handleRead)
    return () => {
      socket.off('message:new', handleNew)
      socket.off('message:updated', handleUpdated)
      socket.off('messages:read', handleRead)
    }
  }, [username, me._id])

  // Scroll: naye message par neeche, purane judne par jagah barqarar
  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return

    if (preserveRef.current !== null) {
      el.scrollTop = el.scrollHeight - preserveRef.current
      preserveRef.current = null
    } else if (stickRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  const handleScroll = () => {
    const el = listRef.current
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  const handleSend = async (text) => {
    setSendError('')
    setIsSending(true)
    try {
      const encrypted = await encryptText(text, await keyRef.current)
      const message = await sendMessage(username, encrypted.text, encrypted.iv)
      stickRef.current = true
      setMessages((prev) =>
        prev.some((m) => m._id === message._id) ? prev : [...prev, { ...message, text }]
      )
    } catch (err) {
      setSendError(getErrorMessage(err))
      throw err // input ka text saaf na ho
    } finally {
      setIsSending(false)
    }
  }

  const handleEdit = async (id, text) => {
    const encrypted = await encryptText(text, await keyRef.current)
    const updated = await editMessage(id, encrypted.text, encrypted.iv)
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, text, editedAt: updated.editedAt } : m))
    )
  }

  const handleDelete = async (id, scope) => {
    await deleteMessage(id, scope)
    if (scope === 'me') {
      setMessages((prev) => prev.filter((m) => m._id !== id))
    } else {
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, deletedForEveryone: true, text: '' } : m))
      )
    }
  }

  const handleLoadOlder = async () => {
    if (messages.length === 0) return
    setIsLoadingOlder(true)
    try {
      const data = await getMessages(username, messages[0].createdAt)
      const chatKey = await keyRef.current
      const older = await Promise.all(data.messages.map((m) => decryptMessage(m, chatKey)))
      preserveRef.current = listRef.current.scrollHeight
      setMessages((prev) => [...older.filter((m) => !prev.some((p) => p._id === m._id)), ...prev])
      setHasMore(data.hasMore)
    } catch (err) {
      setSendError(getErrorMessage(err))
    } finally {
      setIsLoadingOlder(false)
    }
  }

  // "Seen" sirf meri aakhri (delete na hui) message ke neeche
  const lastMineId = [...messages]
    .reverse()
    .find((m) => m.sender === me._id && !m.deletedForEveryone)?._id

  return {
    other,
    messages,
    hasMore,
    isLoading,
    isLoadingOlder,
    isSending,
    error,
    sendError,
    listRef,
    lastMineId,
    handleScroll,
    handleSend,
    handleEdit,
    handleDelete,
    handleLoadOlder,
  }
}

export default UseChatMessages