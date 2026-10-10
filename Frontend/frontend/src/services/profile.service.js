import api from './api'

// GET /profile/:username -> { _id, username, avatar, createdAt, postsCount }
export const getProfile = async (username) => {
  const res = await api.get(`/profile/${encodeURIComponent(username)}`)
  return res.data.data
}

// PATCH /profile/avatar -> update hua user
export const updateAvatar = async (file) => {
  const formData = new FormData()
  formData.append('avatar', file) // "avatar" naam backend ke upload.single("avatar") se match karta hai

  const res = await api.patch('/profile/avatar', formData)
  return res.data.data
}