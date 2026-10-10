import { useEffect, useState } from 'react'
import socket from '../services/socket'
import { getUnreadCount } from '../services/message.service'

// Sidebar ke Messages par laal ginti ke liye
const useUnreadCount = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        const n = await getUnreadCount()
        if (!ignore) setCount(n)
      } catch {
        // sirf sahulat hai, error dikhane ki zaroorat nahi
      }
    }

    load()
    socket.on('message:new', load)
    socket.on('unread:update', load)
    socket.on('connect', load)

    return () => {
      ignore = true
      socket.off('message:new', load)
      socket.off('unread:update', load)
      socket.off('connect', load)
    }
  }, [])

  return count
}

export default useUnreadCount