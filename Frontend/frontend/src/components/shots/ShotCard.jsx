import React, { useEffect, useRef, useState } from 'react'
import { Check, Heart, Plus, Send, Volume2, VolumeX } from 'lucide-react'
import { createStatus } from '../../services/status.service'
import getErrorMessage from '../../utils/getErrorMessage'

const railButton =
  'flex size-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 disabled:cursor-default'

const ShotCard = ({ shot, liked, muted, onToggleLike, onToggleMute,  }) => {
  const cardRef = useRef(null)
  const videoRef = useRef(null)
  const [statusState, setStatusState] = useState('idle') // idle | saving | done
  const [statusError, setStatusError] = useState('')

  // Sirf wahi video chale jo screen par saamne ho
  useEffect(() => {
    const card = cardRef.current
    const video = videoRef.current
    if (!card || !video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: [0, 0.7] }
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }

  // Ek click par status
  const handleStatus = async () => {
    if (statusState !== 'idle') return

    setStatusState('saving')
    setStatusError('')
    try {
      await createStatus(shot)
      setStatusState('done')
    } catch (err) {
      setStatusError(getErrorMessage(err))
      setStatusState('idle')
    }
  }

  const creditUrl = shot.credit?.url || shot.pageUrl || 'https://www.pixabay.com'

  return (
    <article
      ref={cardRef}
      aria-label="Shot"
      className="relative h-full w-full snap-start snap-always overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={shot.videoUrl}
        poster={shot.posterUrl || undefined}
        loop
        muted={muted}
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />

      {/* Poori video par click = play / pause */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label="Play or pause"
        className="absolute inset-0 z-0"
      />

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute shots' : 'Mute shots'}
        className={`${railButton} absolute right-3 top-3 z-10`}
      >
        {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
      </button>

      <div className="absolute bottom-24 right-3 z-10 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onToggleLike}
            aria-pressed={liked}
            aria-label="Like"
            className={`${railButton} ${liked ? 'text-pink-400' : ''}`}
          >
            <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <span aria-hidden="true" className="text-xs font-semibold text-white drop-shadow">
            Like
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleStatus}
            disabled={statusState !== 'idle'}
            aria-label={statusState === 'done' ? 'Added to your status' : 'Add to my status for 24 hours'}
            className={railButton}
          >
            {statusState === 'done' ? <Check size={24} /> : <Plus size={26} />}
          </button>
          <span aria-hidden="true" className="text-xs font-semibold text-white drop-shadow">
            {statusState === 'done' ? 'Added' : statusState === 'saving' ? '...' : 'Status'}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button type="button" aria-label="Send to a friend" className={railButton}>
            <Send size={22} />
          </button>
          <span aria-hidden="true" className="text-xs font-semibold text-white drop-shadow">
            Send
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/75 to-transparent p-4 pr-20 pt-10 text-white">
        {statusError && (
          <p role="alert" className="mb-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold">
            {statusError}
          </p>
        )}
        <p className="text-sm">
          Video by{' '}
          <a href={creditUrl} target="_blank" rel="noreferrer noopener" className="font-semibold underline">
            {shot.credit?.name || 'Pixabay'}
          </a>{' '}
          on{' '}
          <a
            href="https://www.pixabay.com"
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold underline"
          >
            Pixabay
          </a>
        </p>
      </div>
    </article>
  )
}

export default ShotCard