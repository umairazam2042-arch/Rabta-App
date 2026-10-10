import axios from 'axios'
import { API_URL } from '../config/constants'

// Backend se baat karne wala axios (sab requests isi se jayengi)
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // login ki cookie har request ke saath jaye
})

export default api