import React from 'react'
import PostCard from './PostCard'
import Alert from '../common/Alert'

const PostList = ({
  posts,
  isLoading,
  error,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onDelete,
  showDelete = false,
  emptyMessage,
}) => {
  return (
    <div className="flex flex-col gap-5">
      <Alert message={error} />

      {isLoading && <p className="text-muted">Loading posts...</p>}

      {!isLoading && !error && posts.length === 0 && (
        <p className="rounded-2xl border border-line bg-white p-6 text-center text-muted">
          {emptyMessage}
        </p>
      )}

      {posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={onDelete} showDelete={showDelete} />
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="h-12 rounded-xl border border-line bg-white font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
        >
          {isLoadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}

export default PostList