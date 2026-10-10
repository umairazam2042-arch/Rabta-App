import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme ko ThemeProvider ke andar use karo')
  return ctx
}

export default useTheme