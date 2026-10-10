import React, { useEffect, useRef, useState } from 'react'
import ShotCard from '../components/shots/ShotCard'
import Alert from '../components/common/Alert'
import useAuth from '../hooks/useAuth'
import useShots from '../hooks/useShots'

const ShotsPage = () => {
  const { user } = useAuth()
  const { shots, isLoading, isLoadingMore, error, loadMore } = useShots()

  const [muted, setMuted] = useState(true) // browser bina click ke awaaz wali video nahi chalne deta
  const scrollerRef = useRef(null)
  const sentinelRef = useRef(null)

  // Like sirf is browser mein yaad rehta hai (database mein nahi)
  const likedKey = `rabta_liked_shots_${user?._id}`
  const [liked, setLiked] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(likedKey)) || [])
    } catch {
      return new Set()
    }
  })

  const toggleLike = (id) => {
    const next = new Set(liked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setLiked(next)
    try {
      localStorage.setItem(likedKey, JSON.stringify([...next].slice(-500)))
    } catch {
      // storage band ho to bhi app chale
    }
  }

  // Aakhri shot ke qareeb pohanchte hi naye shots mangwao
  useEffect(() => {
    const target = sentinelRef.current
    const root = scrollerRef.current
    if (!target || !root || error) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { root, rootMargin: '0px 0px 100% 0px' } // ek shot pehle hi
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [shots.length, error, loadMore])

  return (
     <div className="mx-auto flex h-[calc(100dvh-14rem)] w-full max-w-md flex-col gap-3 lg:h-[calc(100dvh-3rem)]">
  
    <header>
         <h1 className="text-2xl font-bold">Shots</h1>
      </header>

      <div
        ref={scrollerRef}
        role="region"
        aria-label="Shots feed"
        tabIndex={0}
        className="no-scrollbar min-h-0 w-full flex-1 snap-y snap-mandatory overflow-y-auto overflow-x-hidden rounded-3xl bg-black outline-none"
      >
        {isLoading && (
          <div className="grid h-full place-items-center text-white">Loading shots...</div>
        )}

        {!isLoading && error && shots.length === 0 && (
          <div className="grid h-full place-items-center p-6">
            <div className="flex w-full max-w-xs flex-col items-center gap-4">
              <Alert message={error} />
              <button
                type="button"
                onClick={loadMore}
                className="h-11 rounded-xl bg-white px-6 font-bold text-ink hover:bg-slate-200"
              >
                Try again
              </button>
            </div>
          </div>
        )}

       {(Array.isArray(shots) ? shots : []).map((shot) => (
          <ShotCard
            key={shot.id}
            shot={shot}
            liked={liked.has(shot.id)}
            muted={muted}
            onToggleLike={() => toggleLike(shot.id)}
            onToggleMute={() => setMuted((prev) => !prev)}
          />
        ))}

        {shots.length > 0 && <div ref={sentinelRef} className="h-px" />}

        {isLoadingMore && (
          <div className="grid h-full snap-start place-items-center text-white">
            Loading more shots...
          </div>
        )}

        {error && shots.length > 0 && (
          <div className="grid h-full snap-start place-items-center p-6">
            <div className="flex w-full max-w-xs flex-col items-center gap-4">
              <Alert message={error} />
              <button
                type="button"
                onClick={loadMore}
                className="h-11 rounded-xl bg-white px-6 font-bold text-ink hover:bg-slate-200"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default ShotsPage