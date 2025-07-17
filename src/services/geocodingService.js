import api from './api';

export const geocodingService = {
  extractLocation: async (text) => {
    return await api.post('/geocode/extract', { text });
  },

  geocodeLocation: async (locationName) => {
    return await api.post('/geocode/location', { location_name: locationName });
  },

  fullGeocode: async (text) => {
    return await api.post('/geocode', { text });
  }
};
