import axiosClient from './axiosClient'

// Maps to the Authentication & Authorization module (JWT auth, RBAC).
export const authApi = {
  login: (email, password) => axiosClient.post('/auth/login/', { email, password }),
  logout: (refresh) => axiosClient.post('/auth/logout/', { refresh }),
  me: () => axiosClient.get('/auth/me/'),
  refresh: (refresh) => axiosClient.post('/auth/token/refresh/', { refresh }),
  changePassword: (payload) => axiosClient.post('/auth/change-password/', payload),
}
