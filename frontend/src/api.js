import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export const foundAPI = {
  report: (formData) => api.post('/found/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: (params) => api.get('/found/', { params }),
  get: (id) => api.get(`/found/${id}`),
  delete: (id) => api.delete(`/found/${id}`),
}

export const lostAPI = {
  report: (data) => api.post('/lost/', data),
  list: (params) => api.get('/lost/', { params }),
  get: (id) => api.get(`/lost/${id}`),
  delete: (id) => api.delete(`/lost/${id}`),
}

export const matchAPI = {
  run: (lostItemId) => api.post(`/matches/${lostItemId}`),
  listAll: () => api.get('/matches/'),
  forLost: (lostItemId) => api.get(`/matches/lost/${lostItemId}`),
}

export const searchAPI = {
  query: (q) => api.post('/search/', { query: q }),
}

export const claimAPI = {
  submit: (data) => api.post('/claims/', data),
  list: () => api.get('/claims/'),
  update: (id, action) => api.patch(`/claims/${id}?action=${action}`),
}

export const dashboardAPI = {
  stats: () => api.get('/dashboard/'),
}

export const adminAPI = {
  users: () => api.get('/admin/users'),
  stats: () => api.get('/admin/stats'),
  createUser: (data) => api.post('/admin/users', data),
  deleteLost: (id) => api.delete(`/admin/lost/${id}`),
  deleteFound: (id) => api.delete(`/admin/found/${id}`),
  updateLostStatus: (id, status) => api.patch(`/admin/lost/${id}/status?status=${status}`),
  updateFoundStatus: (id, status) => api.patch(`/admin/found/${id}/status?status=${status}`),
}

export const healthAPI = {
  check: () => api.get('/health'),
}

export default api
