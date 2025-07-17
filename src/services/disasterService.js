import api from './api';

export const disasterService = {
  getAll: async () => {
    return await api.get('/disasters');
  },

  getById: async (id) => {
    return await api.get(`/disasters/${id}`);
  },

  create: async (disasterData) => {
    return await api.post('/disasters', disasterData);
  },

  update: async (id, disasterData) => {
    return await api.put(`/disasters/${id}`, disasterData);
  },

  delete: async (id) => {
    return await api.delete(`/disasters/${id}`);
  },

  getSocialMedia: async (id, params = {}) => {
    return await api.get(`/disasters/${id}/social-media`, { params });
  },

  getResources: async (id, params = {}) => {
    return await api.get(`/disasters/${id}/resources`, { params });
  },

  getOfficialUpdates: async (id) => {
    return await api.get(`/disasters/${id}/official-updates`);
  },

  verifyImage: async (id, imageData) => {
    return await api.post(`/disasters/${id}/verify-image`, imageData);
  },

  verifyImagesBatch: async (id, imagesData) => {
    return await api.post(`/disasters/${id}/verify-images/batch`, imagesData);
  }
};
