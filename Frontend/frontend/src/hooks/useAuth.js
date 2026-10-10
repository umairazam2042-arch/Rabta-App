import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

// Kisi bhi component mein: const { user, login, logout } = useAuth()
const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export default useAuth