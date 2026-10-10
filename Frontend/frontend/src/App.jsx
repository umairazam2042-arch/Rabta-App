import React from 'react'
import { RouterProvider } from 'react-router/dom'
import router from './routes'
import AuthProvider from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeContext'

const App = () => {
  return (
    <ThemeProvider>
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
</ThemeProvider>
  )
}

export default App