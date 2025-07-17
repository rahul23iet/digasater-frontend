import api from './api';

export const resourceService = {
  getAll: async (params = {}) => {
    return await api.get('/resources', { params });
  },

  getById: async (id) => {
    return await api.get(`/resources/${id}`);
  },

  create: async (resourceData) => {
    return await api.post('/resources', resourceData);
  },

  update: async (id, resourceData) => {
    return await api.put(`/resources/${id}`, resourceData);
  },

  delete: async (id) => {
    return await api.delete(`/resources/${id}`);
  },

  getTypes: async () => {
    return await api.get('/resources/types');
  },

  getStats: async () => {
    return await api.get('/resources/stats');
  }
};
