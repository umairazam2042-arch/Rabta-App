import React from 'react'
import StatusBar from '../components/status/StatusBar'
import CreatePost from '../components/post/CreatePost'
import PostList from '../components/post/PostList'
import usePosts from '../hooks/usePosts'

const HomePage = () => {
  const { posts, isLoading, isLoadingMore, error, hasMore, loadMore, addPost, removePost } =
    usePosts()

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <StatusBar />

      <CreatePost onCreated={addPost} />

      <PostList
        posts={posts}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        onDelete={removePost}
        emptyMessage="No posts yet. Be the first to share something!"
      />
    </div>
  )
}

export default HomePage