import axiosClient from './axiosClient'

// Maps to the Reports module (PDF / CSV export).
export const reportsApi = {
  daily: (params) => axiosClient.get('/reports/daily/', { params }),
  weekly: (params) => axiosClient.get('/reports/weekly/', { params }),
  monthly: (params) => axiosClient.get('/reports/monthly/', { params }),
  subjectWise: (params) => axiosClient.get('/reports/subject-wise/', { params }),
  studentWise: (params) => axiosClient.get('/reports/student-wise/', { params }),
  exportPdf: (params) =>
    axiosClient.get('/reports/export/pdf/', { params, responseType: 'blob' }),
  exportCsv: (params) =>
    axiosClient.get('/reports/export/csv/', { params, responseType: 'blob' }),
}

// Maps to the Notifications module.
export const notificationsApi = {
  list: (params) => axiosClient.get('/notifications/', { params }),
  markRead: (id) => axiosClient.patch(`/notifications/${id}/`, { read: true }),
  markAllRead: () => axiosClient.post('/notifications/mark-all-read/'),
}

// Maps to Admin > Activity Logs + AI recognition settings.
export const adminApi = {
  activityLogs: (params) => axiosClient.get('/admin/activity-logs/', { params }),
  aiSettings: () => axiosClient.get('/admin/ai-settings/'),
  updateAiSettings: (payload) => axiosClient.patch('/admin/ai-settings/', payload),
  systemStats: () => axiosClient.get('/admin/stats/'),
}
