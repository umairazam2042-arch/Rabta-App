import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = ({ id, label, type = 'text', error, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-base outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 ${
            error ? 'border-red-500' : 'border-slate-300'
          } ${isPassword ? 'pr-12' : ''}`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input