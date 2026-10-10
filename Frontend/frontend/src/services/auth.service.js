import api from './api'

// POST /users/register/send-otp -> { otpToken, email, expiresInMinutes }
export const sendSignupOtp = async ({ username, email, dob }) => {
  const res = await api.post('/users/register/send-otp', { username, email, dob })
  return res.data.data
}

// POST /users/register (ab OTP bhi chahiye)
export const registerUser = async ({ username, email, password, dob, otp, otpToken }) => {
  const res = await api.post('/users/register', {
    username,
    email,
    password,
    dob,
    otp,
    otpToken,
  })
  return res.data.data // naya user
}

// POST /users/login -> { user, accessToken } (token cookie mein bhi set hota hai)
export const loginUser = async (identifier, password) => {
  const res = await api.post('/users/login', { identifier, password })
  return res.data.data
}

// POST /users/logout (backend username/email maangta hai)
export const logoutUser = async (identifier) => {
  const res = await api.post('/users/logout', { identifier })
  return res.data
}

// GET /users/me (cookie se pata chalta hai kaun login hai)
export const getCurrentUser = async () => {
  const res = await api.get('/users/me')
  return res.data.data
}