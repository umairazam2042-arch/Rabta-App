import React, { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import Avatar from '../common/Avatar'
import Alert from '../common/Alert'
import useAuth from '../../hooks/useAuth'
import { createPost } from '../../services/post.service'
import getErrorMessage from '../../utils/getErrorMessage'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB (backend ki limit jaisi)

const CreatePost = ({ onCreated }) => {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null) // chuni hui file
  const [preview, setPreview] = useState('') // file ki temporary tasveer dikhane ke liye
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Purana preview address hat jaye ya component band ho to memory saaf kar do
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const canPost = caption.trim() !== '' || image !== null

  const clearImage = () => {
    setImage(null)
    setPreview('')
    if (fileInputRef.current) fileInputRef.current.value = '' // wahi file dobara chunna mumkin ho
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      e.target.value = ''
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be smaller than 5MB')
      e.target.value = ''
      return
    }

    setError('')
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canPost) return

    setIsSubmitting(true)
    setError('')
    try {
      const post = await createPost({ caption: caption.trim(), image })

      // Backend naye post mein author sirf id bhejta hai, is liye apna username yahan jod dete hain
      onCreated({ ...post, author: { _id: user._id, username: user.username } })

      setCaption('')
      clearImage()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-5">
      <div className="flex gap-3">
          <Avatar username={user?.username} src={user?.avatar?.url} />

        <div className="min-w-0 flex-1">
          <label htmlFor="caption" className="sr-only">
            Post caption
          </label>
          <textarea
            id="caption"
            rows={2}
            maxLength={2200}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`What is on your mind, ${user?.username}?`}
            className="w-full resize-none rounded-xl bg-slate-100 px-4 py-3 text-base outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-brand/30"
          />

          {preview && (
            <div className="relative mt-3 overflow-hidden rounded-xl">
              <img src={preview} alt="Selected photo preview" className="max-h-80 w-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove photo"
                className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3">
              <Alert message={error} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 items-center gap-2 rounded-xl px-3 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ImagePlus size={22} strokeWidth={1.8} />
          Add photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="submit"
          disabled={!canPost || isSubmitting}
          className="h-10 rounded-xl bg-brand px-6 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}

export default CreatePost