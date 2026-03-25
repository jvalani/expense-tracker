import { computed, reactive, readonly } from 'vue';

const readStoredUser = () => {
  try {
    const value = localStorage.getItem('user');
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

const state = reactive({
  token: localStorage.getItem('token') || '',
  user: readStoredUser(),
});

export const setAuth = ({ token, user }) => {
  state.token = token;
  state.user = user;
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  state.token = '';
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getToken = () => state.token || localStorage.getItem('token') || '';

export const isAuthenticated = () => Boolean(getToken());

export const authState = readonly(state);

export const useAuth = () => ({
  user: computed(() => state.user),
  token: computed(() => state.token),
  isAuthenticated: computed(() => !!state.token),
});

export const useAuthStore = () => ({
  authState,
  setAuth,
  clearAuth,
  isAuthenticated,
});
