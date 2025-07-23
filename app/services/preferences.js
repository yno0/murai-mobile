import api from './api';

export const getPreferences = async () => {
  const res = await api.get('/users/preferences');
  return res.data;
};

export const updatePreferences = async (prefs) => {
  const res = await api.put('/users/preferences', prefs);
  return res.data;
}; 