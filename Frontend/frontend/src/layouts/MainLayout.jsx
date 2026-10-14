import React, { useEffect } from 'react'
import { Outlet } from 'react-router'
import Sidebar from '../components/layout/Sidebar'
import Logo from '../components/common/Logo'
import useAuth from '../hooks/useAuth'
import socket from '../services/socket'
import { publishPublicKey } from '../services/message.service'
import { ensureKeys } from '../utils/e2ee'

const MainLayout = () => {
  const { user } = useAuth()

  // Login ke baad real-time connection chalu, hatte hi band
  useEffect(() => {
    socket.connect()
    return () => {
      socket.disconnect()
    }
  }, [])

  // Is browser ki encryption key taiyar karo aur public key server par rakho
       useEffect(() => {
     if (!user?._id) return

     ensureKeys(user._id)
       .then((keys) => {
         if (user.publicKey !== keys.publicKey) return publishPublicKey(keys.publicKey)
       })
       .catch((err) => console.error('E2EE setup failed:', err.message))
   }, [user?._id, user?.publicKey])

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-4 pb-24 lg:flex-row lg:p-6">
      <header className="lg:hidden">
        <Logo size={32} />
      </header>

      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout