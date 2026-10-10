import React, { useRef, useState } from 'react'
import Avatar from '../common/Avatar'
import Alert from '../common/Alert'
import useAuth from '../../hooks/useAuth'
import { updateAvatar } from '../../services/profile.service'
import formatDate from '../../utils/formatDate'
import getErrorMessage from '../../utils/getErrorMessage'
import { Link } from 'react-router'
import { MessageCircle } from 'lucide-react'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB (backend ki limit jaisi)

const ProfileHeader = ({ profile, isOwnProfile, onAvatarChange }) => {
  const { updateUser } = useAuth()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // wahi file dobara chunni ho to bhi chal sake
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be smaller than 5MB')
      return
    }

    setIsUploading(true)
    setError('')
    try {
      const updatedUser = await updateAvatar(file)
      updateUser(updatedUser) // posts aur post box mein bhi nayi tasveer aa jaye
      onAvatarChange(updatedUser.avatar)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar
          username={profile.username}
          src={profile.avatar?.url}
          size="xl"
          alt={`@${profile.username}'s profile picture`}
        />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">@{profile.username}</h1>
          <p className="mt-1 text-muted">Joined {formatDate(profile.createdAt, false)}</p>
          <p className="mt-2 font-semibold">
            {profile.postsCount} {profile.postsCount === 1 ? 'post' : 'posts'}
          </p>

          {isOwnProfile && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-4 h-10 rounded-xl border border-line px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
              >
                {isUploading ? 'Uploading...' : 'Change photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}

                    {!isOwnProfile && (
            <Link
              to={`/messages/${profile.username}`}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
            >
              <MessageCircle size={18} />
              Message
            </Link>
          )}
          
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Alert message={error} />
        </div>
      )}
    </section>
  )
}

export default ProfileHeader