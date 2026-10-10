import React from 'react'
import { Link } from 'react-router'

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold text-brand">404</h1>
      <p className="text-lg text-muted">Ye page maujood nahi hai.</p>
      <Link to="/" className="rounded-xl bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark">
        Go home
      </Link>
    </div>
  )
}

export default NotFoundPage