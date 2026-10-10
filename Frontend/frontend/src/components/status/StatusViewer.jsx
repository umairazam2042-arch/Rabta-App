import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'
import Avatar from '../common/Avatar'
import Alert from '../common/Alert'
import useAuth from '../../hooks/useAuth'
import { deleteStatus } from '../../services/status.service'
import timeAgo from '../../utils/timeAgo'
import getErrorMessage from '../../utils/getErrorMessage'

// Awaaz ke saath chalane ki koshish; browser roke to bina awaaz ke
const playVideo = (video) => {
  video.play().catch(() => {
    video.muted = true
    video.play().catch(() => {})
  })
}

const StatusViewer = ({ group, onClose, onDeleted }) => {
  const { user } = useAuth()
  const dialogRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const total = group.statuses.length
  const safeIndex = Math.min(index, total - 1)
  const current = group.statuses[safeIndex]
  const canDelete = group.isMine || user?.role === 'admin'

  const goTo = (next) => {
    if (next < 0) return
    if (next >= total) {
      dialogRef.current?.close() // aakhri status ke baad box band
      return
    }
    setIndex(next)
    setProgress(0)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this status?')) return

    setIsDeleting(true)
    setError('')
    try {
      await deleteStatus(current._id)
      onDeleted(current._id)
      setProgress(0)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  if (!current) return null

  const { reel } = current

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label={`Status of @${group.user.username}`}
      className="m-auto h-[min(100dvh,46rem)] w-[min(100vw,26rem)] overflow-hidden rounded-2xl bg-black p-0 text-white backdrop:bg-black/80"
    >
      <div className="relative size-full">
        <video
          key={current._id}
          src={reel.videoUrl}
          poster={reel.posterUrl || undefined}
          playsInline
          onLoadedData={(e) => playVideo(e.currentTarget)}
          onTimeUpdate={(e) => {
            const video = e.currentTarget
            setProgress(video.duration ? video.currentTime / video.duration : 0)
          }}
          onEnded={() => goTo(safeIndex + 1)}
          className="absolute inset-0 size-full object-cover"
        />

        {/* Upar ki patti: har status ka ek hissa */}
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1" aria-hidden="true">
          {group.statuses.map((s, i) => (
            <span key={s._id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full bg-white"
                style={{ width: `${i < safeIndex ? 100 : i === safeIndex ? progress * 100 : 0}%` }}
              />
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 bg-linear-to-b from-black/70 to-transparent px-3 pb-8 pt-8">
          <Avatar username={group.user.username} src={group.user.avatar?.url} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">@{group.user.username}</p>
            <p className="text-xs text-white/80">{timeAgo(current.createdAt)}</p>
          </div>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete this status"
              className="flex size-11 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-60"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-full hover:bg-white/15"
          >
            <X size={22} />
          </button>
        </div>

        {safeIndex > 0 && (
          <button
            type="button"
            onClick={() => goTo(safeIndex - 1)}
            aria-label="Previous status"
            className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 hover:bg-black/60"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <button
          type="button"
          onClick={() => goTo(safeIndex + 1)}
          aria-label="Next status"
          className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 hover:bg-black/60"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/75 to-transparent p-4 pt-10">
          {error && (
            <div className="mb-2">
              <Alert message={error} />
            </div>
          )}
          <p className="text-sm">
            Video by{' '}
            <a
              href={reel.credit?.url || reel.pageUrl || 'https://www.pixabay.com'}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold underline"
            >
              {reel.credit?.name || 'Pixabay'}
            </a>{' '}
            on Pixabay
          </p>
        </div>
      </div>
    </dialog>
  )
}

export default StatusViewer