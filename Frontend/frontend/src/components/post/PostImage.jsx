import React from 'react'
import { Link } from 'react-router'

// Post ki picture. Click karne par alag page par full size mein khulti hai.
const PostImage = ({ src, alt = 'Post image', className = '' }) => {
  if (!src) return null

  return (
    <Link
      to={`/photo?src=${encodeURIComponent(src)}`}
      aria-label="Photo full size mein dekhein"
      className="block"
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full cursor-zoom-in object-cover ${className}`}
      />
    </Link>
  )
}

export default PostImage