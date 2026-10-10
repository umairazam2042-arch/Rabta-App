import React from 'react'

const Button = ({ children, type = 'button', loading = false, disabled = false, ...rest }) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="h-13 w-full rounded-xl bg-brand text-base font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      {...rest}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}

export default Button