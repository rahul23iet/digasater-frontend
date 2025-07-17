import api from './api';

export const socialMediaService = {
  search: async (params = {}) => {
    return await api.get('/social-media/search', { params });
  },

  getTrending: async (params = {}) => {
    return await api.get('/social-media/trending', { params });
  }
};
