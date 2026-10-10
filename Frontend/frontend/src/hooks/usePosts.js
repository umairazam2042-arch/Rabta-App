import { useEffect, useState } from 'react'
import { getPosts, getUserPosts } from '../services/post.service'
import getErrorMessage from '../utils/getErrorMessage'

const LIMIT = 10 // ek baar mein kitni posts

// username ho to us user ki posts, warna sab ki feed
const fetchPage = (username, page) =>
  username ? getUserPosts(username, page, LIMIT) : getPosts(page, LIMIT)

const usePosts = (username) => {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')

  // Pehla page
  useEffect(() => {
    let ignore = false

    const loadFirstPage = async () => {
      try {
        const data = await fetchPage(username, 1)
        if (ignore) return
        setPosts(data.posts)
        setPage(data.page)
        setTotalPages(data.totalPages)
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadFirstPage()
    return () => {
      ignore = true
    }
  }, [username])

  // "Load more" button
  const loadMore = async () => {
    setIsLoadingMore(true)
    setError('')
    try {
      const data = await fetchPage(username, page + 1)
      setPosts((prev) => {
        // Jo posts pehle se list mein hain unhein dobara mat jodo
        const existing = new Set(prev.map((p) => p._id))
        return [...prev, ...data.posts.filter((p) => !existing.has(p._id))]
      })
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Naya post sab se upar
  const addPost = (post) => setPosts((prev) => [post, ...prev])

  // Delete hui post list se hata do
  const removePost = (id) => setPosts((prev) => prev.filter((p) => p._id !== id))

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore: page < totalPages,
    loadMore,
    addPost,
    removePost,
  }
}

export default usePosts