import React from 'react'
import { Navigate, Outlet } from 'react-router'
import useAuth from '../hooks/useAuth'

// Sirf admin ke liye. Normal user ho to Home par bhej do
const AdminRoute = () => {
  const { user } = useAuth()

  if (user?.role !== 'admin') return <Navigate to="/" replace />

  return <Outlet />
}

export default AdminRoute