import React, { useEffect, useState } from 'react'
import AuthContext from './AuthContext'
import { getCurrentUser, loginUser, logoutUser } from '../services/auth.service'

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null) // null = login nahi hai
  const [isAuthLoading, setIsAuthLoading] = useState(true) // shuru mein check chal raha hota hai

  // App khulte hi backend se pooch lo ke cookie wala banda kaun hai (refresh par bhi login rahe)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null) // login nahi hai (401)
      } finally {
        setIsAuthLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (identifier, password) => {
    const data = await loginUser(identifier, password)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await logoutUser(user.username)
    } catch {
      // token pehle hi expire ho chuka ho to bhi neeche local logout kar do
    }
    setUser(null)
  }
  // Profile badalne par (jaise nayi tasveer) login user ki information update karo
  const updateUser = (updatedUser) => setUser(updatedUser)
  return (
       <AuthContext.Provider value={{ user, isAuthLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider