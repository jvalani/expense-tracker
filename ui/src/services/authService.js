import api from './api';

export const registerUser = (payload) => api.post('/auth/register', payload);

export const loginUser = (payload) => api.post('/auth/login', payload);

export const sendOtp = (email) => api.post('/auth/send-otp', { email });

export const updateProfile = (payload) => api.patch('/auth/profile', payload);
