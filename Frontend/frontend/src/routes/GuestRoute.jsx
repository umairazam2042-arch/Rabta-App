import React from 'react'
import { Navigate, Outlet } from 'react-router'
import useAuth from '../hooks/useAuth'
import Loader from '../components/common/Loader'

// Login/Register pages sirf un ke liye jo login nahi hain. Login ho to Home par bhej do
const GuestRoute = () => {
  const { user, isAuthLoading } = useAuth()

  if (isAuthLoading) return <Loader />
  if (user) return <Navigate to="/" replace />

  return <Outlet />
}

export default GuestRoute