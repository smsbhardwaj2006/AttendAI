import axiosClient from './axiosClient'

// Maps to the Faculty Management + Department/Course Management modules.
export const facultyApi = {
  list: (params) => axiosClient.get('/faculty/', { params }),
  get: (id) => axiosClient.get(`/faculty/${id}/`),
  create: (payload) => axiosClient.post('/faculty/', payload),
  update: (id, payload) => axiosClient.patch(`/faculty/${id}/`, payload),
  remove: (id) => axiosClient.delete(`/faculty/${id}/`),
  assignSubjects: (id, subjectIds) => axiosClient.post(`/faculty/${id}/subjects/`, { subjects: subjectIds }),
}

export const academicsApi = {
  departments: () => axiosClient.get('/departments/'),
  createDepartment: (payload) => axiosClient.post('/departments/', payload),
  courses: (params) => axiosClient.get('/courses/', { params }),
  subjects: (params) => axiosClient.get('/subjects/', { params }),
  sections: (params) => axiosClient.get('/sections/', { params }),
  classrooms: () => axiosClient.get('/classrooms/'),
}
