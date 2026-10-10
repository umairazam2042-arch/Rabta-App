import React from 'react'
import { Navigate, Outlet } from 'react-router'
import useAuth from '../hooks/useAuth'
import Loader from '../components/common/Loader'

// Sirf login wale users ke liye. Warna /login par bhej do
const ProtectedRoute = () => {
  const { user, isAuthLoading } = useAuth()

  if (isAuthLoading) return <Loader />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

export default ProtectedRoute