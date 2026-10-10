import React from 'react'

const tones = [
  'bg-blue-100 text-blue-800',
  'bg-orange-100 text-orange-800',
  'bg-emerald-100 text-emerald-800',
  'bg-purple-100 text-purple-800',
  'bg-amber-100 text-amber-800',
]

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-28 text-3xl',
}

// Username ke harfon se ek rang chun leta hai
const getTone = (name) => {
  let sum = 0
  for (const char of name) sum += char.charCodeAt(0)
  return tones[sum % tones.length]
}

const Avatar = ({ username = '', src = '', size = 'md', alt = '' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`shrink-0 rounded-full object-cover ${sizes[size]}`}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold uppercase ${sizes[size]} ${getTone(username)}`}
    >
      {username.slice(0, 2)}
    </span>
  )
}

export default Avatar