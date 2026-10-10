import api from './api'

// GET /admin/stats -> { total, online, offline }
export const getStats = async () => {
  const res = await api.get('/admin/stats')
  return res.data.data
}

// GET /admin/users?status=online|offline (status khali ho to sab users)
export const getUsers = async (status) => {
  const res = await api.get('/admin/users', {
    params: { status: status || undefined },
  })
  return res.data.data // { count, users }
}

// GET /admin/users/:id
export const getUserById = async (id) => {
  const res = await api.get(`/admin/users/${id}`)
  return res.data.data
}

// DELETE /admin/users/:id
export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`)
  return res.data
}