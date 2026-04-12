import api from './axios';

export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getCount: () => api.get('/notifications/count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};