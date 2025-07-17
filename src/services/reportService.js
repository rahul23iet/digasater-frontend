import api from './api';

export const reportService = {
  getAll: async (params = {}) => {
    return await api.get('/reports', { params });
  },

  getById: async (id) => {
    return await api.get(`/reports/${id}`);
  },

  create: async (reportData) => {
    return await api.post('/reports', reportData);
  },

  update: async (id, reportData) => {
    return await api.put(`/reports/${id}`, reportData);
  },

  delete: async (id) => {
    return await api.delete(`/reports/${id}`);
  }
};
