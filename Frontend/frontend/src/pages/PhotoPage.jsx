import React from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { X } from 'lucide-react'

// Full size photo page. URL: /photo?src=<image url>
const PhotoPage = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const src = params.get('src')

  // Wapas jaane ka logic: history ho to pichle page par, warna home par
  const goBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  if (!src) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-black text-white">
        <p>Photo nahi mili.</p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-black">
      <button
        type="button"
        onClick={goBack}
        aria-label="Band karo"
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
      >
        <X size={22} />
      </button>

      <img
        src={src}
        alt="Full size"
        className="max-h-[100dvh] max-w-full object-contain"
      />
    </div>
  )
}

export default PhotoPage