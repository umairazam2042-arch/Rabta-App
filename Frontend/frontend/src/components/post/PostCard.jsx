import React, { useState } from 'react'
import { Link } from 'react-router'
import { Heart, Trash2 } from 'lucide-react'
import Avatar from '../common/Avatar'
import Alert from '../common/Alert'
import LikesModal from './LikesModal'
import useAuth from '../../hooks/useAuth'
import { deletePost, likePost, unlikePost } from '../../services/post.service'
import timeAgo from '../../utils/timeAgo'
import getErrorMessage from '../../utils/getErrorMessage'

const PostCard = ({ post, onDelete, showDelete = false }) => {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [showLikes, setShowLikes] = useState(false)

  // Like ki halat is card ke andar rehti hai (shuruaat backend ki di hui values se)
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0)
  const [isLiking, setIsLiking] = useState(false)

  // Author ka account delete ho chuka ho to backend null deta hai
  const author = post.author ?? { _id: null, username: 'deleted_user' }
  const isOwnPost = author._id === user?._id
   // Delete ka icon sirf tab jab page ne ijazat di ho (profile page), aur user malik ya admin ho
  const canDelete = showDelete && (isOwnPost || user?.role === 'admin')

  // Apni post par hamesha apni latest tasveer dikhao
  const avatarUrl = isOwnPost ? user?.avatar?.url : author.avatar?.url

  const handleLike = async () => {
    if (isLiking) return // pehla request khatam hone tak dobara click na chale

    const nextLiked = !isLiked

    // Foran badal do (optimistic update)
    setIsLiked(nextLiked)
    setLikesCount((count) => count + (nextLiked ? 1 : -1))
    setIsLiking(true)
    setError('')

    try {
      const data = nextLiked ? await likePost(post._id) : await unlikePost(post._id)
      // Server ki asli ginti rakho
      setIsLiked(data.isLiked)
      setLikesCount(data.likesCount)
    } catch (err) {
      // Fail hua to wapas purani halat
      setIsLiked(!nextLiked)
      setLikesCount((count) => count + (nextLiked ? -1 : 1))
      setError(getErrorMessage(err))
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return

    setIsDeleting(true)
    setError('')
    try {
      await deletePost(post._id)
      onDelete(post._id)
    } catch (err) {
      setError(getErrorMessage(err))
      setIsDeleting(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white">
      <header className="flex items-center gap-3 px-5 py-4">
              {author._id ? (
          <Link
            to={`/profile/${author.username}`}
            aria-label={`@${author.username} ki profile`}
            className="shrink-0 rounded-full transition-opacity hover:opacity-80"
          >
            <Avatar username={author.username} src={avatarUrl} />
          </Link>
        ) : (
          <Avatar username={author.username} src={avatarUrl} />
        )}

        <div className="min-w-0 flex-1">
          {author._id ? (
            <Link
              to={`/profile/${author.username}`}
              className="block truncate font-bold hover:text-brand-dark"
            >
              @{author.username}
            </Link>
          ) : (
            <span className="block truncate font-bold text-muted">@{author.username}</span>
          )}
          <time dateTime={post.createdAt} className="text-sm text-muted">
            {timeAgo(post.createdAt)}
          </time>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete post"
            className="flex size-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
          >
            <Trash2 size={20} />
          </button>
        )}
      </header>

      {post.caption && (
        <p className="whitespace-pre-wrap break-words px-5 pb-4 text-base leading-relaxed">
          {post.caption}
        </p>
      )}

      {post.image?.url && (
        <img
          src={post.image.url}
          alt={`Photo posted by @${author.username}`}
          loading="lazy"
          className="max-h-[560px] w-full object-cover"
        />
      )}

      <footer className="flex items-center gap-1 px-3 py-2">
        <button
          type="button"
          onClick={handleLike}
          aria-pressed={isLiked}
          aria-label="Like"
          className={`flex size-11 items-center justify-center rounded-xl transition-colors hover:bg-slate-100 ${
            isLiked ? 'text-pink-700' : 'text-slate-700'
          }`}
        >
          <Heart size={22} strokeWidth={1.8} fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        {/* Is par click karne se un users ki list khulti hai jinhon ne like kiya */}
        <button
          type="button"
          onClick={() => setShowLikes(true)}
          disabled={likesCount === 0}
          className="h-11 rounded-xl px-2 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-default disabled:text-muted disabled:hover:bg-transparent"
        >
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </button>
      </footer>

      {error && (
        <div className="px-4 pb-4">
          <Alert message={error} />
        </div>
      )}

      {showLikes && <LikesModal postId={post._id} onClose={() => setShowLikes(false)} />}
    </article>
  )
}

export default PostCard