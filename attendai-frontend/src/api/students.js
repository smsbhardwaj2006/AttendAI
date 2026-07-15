import axiosClient from './axiosClient'

// Maps to the Student Management module.
export const studentsApi = {
  list: (params) => axiosClient.get('/students/', { params }),
  get: (id) => axiosClient.get(`/students/${id}/`),
  create: (payload) => axiosClient.post('/students/', payload),
  update: (id, payload) => axiosClient.patch(`/students/${id}/`, payload),
  remove: (id) => axiosClient.delete(`/students/${id}/`),
  attendanceHistory: (id, params) => axiosClient.get(`/students/${id}/attendance/`, { params }),

  // Face enrollment
  enrollFace: (id, formData) =>
    axiosClient.post(`/students/${id}/face-enrollment/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  enrollmentStatus: (id) => axiosClient.get(`/students/${id}/face-enrollment/status/`),
}
