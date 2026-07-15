import axiosClient from './axiosClient'

// Maps to the Attendance Management + AI recognition workflow.
export const attendanceApi = {
  sessions: (params) => axiosClient.get('/attendance/sessions/', { params }),
  createSession: (payload) => axiosClient.post('/attendance/sessions/', payload),
  session: (id) => axiosClient.get(`/attendance/sessions/${id}/`),
  endSession: (id) => axiosClient.post(`/attendance/sessions/${id}/end/`),

  // Live recognition frame submission — sends a captured video frame to the
  // backend for face detection, anti-spoofing and embedding comparison.
  submitFrame: (sessionId, formData) =>
    axiosClient.post(`/attendance/sessions/${sessionId}/recognize/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  records: (sessionId) => axiosClient.get(`/attendance/sessions/${sessionId}/records/`),
  manualUpdate: (recordId, payload) => axiosClient.patch(`/attendance/records/${recordId}/`, payload),
  verificationQueue: (sessionId) => axiosClient.get(`/attendance/sessions/${sessionId}/verification-queue/`),

  dailySummary: (params) => axiosClient.get('/attendance/summary/daily/', { params }),
  monthlySummary: (params) => axiosClient.get('/attendance/summary/monthly/', { params }),
  subjectWise: (params) => axiosClient.get('/attendance/summary/subject-wise/', { params }),
  heatmap: (params) => axiosClient.get('/attendance/summary/heatmap/', { params }),
  unknownFaceLogs: (params) => axiosClient.get('/attendance/unknown-faces/', { params }),
}
