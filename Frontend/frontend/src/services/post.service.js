import api from './api'

// GET /posts?page=1&limit=10 -> { posts, page, limit, total, totalPages }
export const getPosts = async (page = 1, limit = 10) => {
  const res = await api.get('/posts', { params: { page, limit } })
  return res.data.data
}

// GET /posts/user/:username -> kisi ek user ki posts (wahi shape)
export const getUserPosts = async (username, page = 1, limit = 10) => {
  const res = await api.get(`/posts/user/${encodeURIComponent(username)}`, {
    params: { page, limit },
  })
  return res.data.data
}

// POST /posts (image bhejne ke liye JSON nahi, FormData chahiye)
export const createPost = async ({ caption, image }) => {
  const formData = new FormData()
  formData.append('caption', caption)
  if (image) formData.append('image', image) // "image" naam backend ke upload.single("image") se match karta hai

  const res = await api.post('/posts', formData)
  return res.data.data
}

// GET /posts/:id/likes -> un users ki list jinhon ne like kiya
export const getPostLikes = async (id) => {
  const res = await api.get(`/posts/${id}/likes`)
  return res.data.data.users
}

// POST /posts/:id/like -> { isLiked, likesCount }
export const likePost = async (id) => {
  const res = await api.post(`/posts/${id}/like`)
  return res.data.data
}

// DELETE /posts/:id/like -> { isLiked, likesCount }
export const unlikePost = async (id) => {
  const res = await api.delete(`/posts/${id}/like`)
  return res.data.data
}

// DELETE /posts/:id
export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`)
  return res.data
}