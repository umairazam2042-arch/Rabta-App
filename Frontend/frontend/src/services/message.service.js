import api from './api'

const enc = encodeURIComponent

export const getConversations = async () => {
  const res = await api.get('/messages/conversations')
  return res.data.data
}

export const getUnreadCount = async () => {
  const res = await api.get('/messages/unread-count')
  return res.data.data.count
}

export const getMessages = async (username, before) => {
  const res = await api.get(`/messages/with/${enc(username)}`, {
    params: { before: before || undefined },
  })
  return res.data.data
}

// text aur iv dono encrypted hon
export const sendMessage = async (username, text, iv) => {
  const res = await api.post(`/messages/with/${enc(username)}`, { text, iv })
  return res.data.data
}

export const editMessage = async (id, text, iv) => {
  const res = await api.patch(`/messages/item/${id}`, { text, iv })
  return res.data.data
}

// scope: 'me' ya 'everyone'
export const deleteMessage = async (id, scope) => {
  const res = await api.delete(`/messages/item/${id}`, { params: { scope } })
  return res.data.data
}

export const markRead = async (username) => {
  const res = await api.patch(`/messages/with/${enc(username)}/read`)
  return res.data.data
}

export const getAutoDelete = async (username) => {
  const res = await api.get(`/messages/with/${enc(username)}/auto-delete`)
  return res.data.data
}

export const setAutoDelete = async (username, enabled) => {
  const res = await api.put(`/messages/with/${enc(username)}/auto-delete`, { enabled })
  return res.data.data
}

export const publishPublicKey = async (publicKey) => {
  const res = await api.put('/messages/keys', { publicKey })
  return res.data.data
}