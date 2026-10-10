import api from './api'

// GET /statuses -> [{ user, isMine, statuses: [{ _id, reel, createdAt }] }]
export const getStatuses = async () => {
  const res = await api.get('/statuses')
  return res.data.data
}

// POST /statuses (ek click par shot status ban jati hai)
export const createStatus = async (reel) => {
  const res = await api.post('/statuses', { reel })
  return res.data.data
}

// DELETE /statuses/:id
export const deleteStatus = async (id) => {
  const res = await api.delete(`/statuses/${id}`)
  return res.data
}