import axios from 'axios';
import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth/';

// Signup user
const signup = async (userData: any) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

// Verify OTP after signup
const verifyOtp = async (otpData: any) => {
  const response = await api.post('/auth/verify-otp', otpData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Generate OTP for login
const generateLoginOtp = async (email: string) => {
  const response = await api.post('/auth/generate-login-otp', { email });
  return response.data;
}

// Login with OTP
const loginWithOtp = async (loginData: any) => {
  const response = await api.post('/auth/login-with-otp', loginData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
}

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  signup,
  verifyOtp,
  generateLoginOtp,
  loginWithOtp,
  logout,
};

export default authService;