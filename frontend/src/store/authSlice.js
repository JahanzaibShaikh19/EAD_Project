// frontend/src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const savedToken = localStorage.getItem('hrflow_token');
const savedUser = (() => {
  try {
    const u = localStorage.getItem('hrflow_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  token: savedToken || null,
  user: savedUser || null,
  isAuthenticated: !!savedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('hrflow_token', token);
      localStorage.setItem('hrflow_user', JSON.stringify(user));
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('hrflow_token');
      localStorage.removeItem('hrflow_user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('hrflow_user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;

// Selectors
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectRole = (state) => state.auth.user?.role;
export const selectIsHR = (state) => state.auth.user?.role === 'hr';

export default authSlice.reducer;
