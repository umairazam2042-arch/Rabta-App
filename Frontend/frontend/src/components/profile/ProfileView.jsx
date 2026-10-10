import React, { useEffect, useState } from 'react'
import ProfileHeader from './ProfileHeader'
import PostList from '../post/PostList'
import Alert from '../common/Alert'
import useAuth from '../../hooks/useAuth'
import usePosts from '../../hooks/usePosts'
import { getProfile } from '../../services/profile.service'
import getErrorMessage from '../../utils/getErrorMessage'

const ProfileView = ({ username }) => {
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Is user ki posts
  const { posts, isLoading: isPostsLoading, isLoadingMore, error: postsError, hasMore, loadMore, removePost } =
    usePosts(username)

  useEffect(() => {
    let ignore = false

    const loadProfile = async () => {
      try {
        const data = await getProfile(username)
        if (!ignore) setProfile(data)
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadProfile()
    return () => {
      ignore = true
    }
  }, [username])

  if (isLoading) return <p className="text-muted">Loading profile...</p>
  if (!profile) return <Alert message={error || 'User not found'} />

  const isOwnProfile = user?._id === profile._id

  // Post delete ho to posts ki ginti bhi ek kam karo
  const handleDelete = (id) => {
    removePost(id)
    setProfile((prev) => ({ ...prev, postsCount: Math.max(prev.postsCount - 1, 0) }))
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onAvatarChange={(avatar) => setProfile((prev) => ({ ...prev, avatar }))}
      />

      <h2 className="text-lg font-bold">{isOwnProfile ? 'Your posts' : 'Posts'}</h2>

      <PostList
        posts={posts}
        isLoading={isPostsLoading}
        error={postsError}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        onDelete={handleDelete}
        emptyMessage={isOwnProfile ? "You haven't posted anything yet." : 'No posts yet.'}
      />
              {/* onDelete={handleDelete}
        showDelete  */}
    </div>
  )
}

export default ProfileView