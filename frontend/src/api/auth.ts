import { apiClient } from './axios'; // <-- This imports your custom config from axios.ts

export const registerUser = async (userData: any) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials: any) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const getGoogleOAuthUrl = async () => {
  const response = await apiClient.get('/auth/google/url');
  return response.data.url;
};

export const requestEmailOtp = async (email: string) => {
  const response = await apiClient.post('/auth/otp/request', { email });
  return response.data;
};

export const verifyEmailOtp = async (data: { email: string; code: string }) => {
  const response = await apiClient.post('/auth/otp/verify', data);
  return response.data;
};



export const setupTotp = async () => {
  const response = await apiClient.post('/auth/totp/generate');
  return response.data; // Returns { qrCodeUrl, secret }
};


export const loginTotp = async (data: { email: string; code: string }) => {
  const response = await apiClient.post('/auth/totp/login', data);
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await apiClient.post('/auth/password/forgot', { email });
  return response.data;
};

export const resetPassword = async (data: { email: string; token: string; newPassword: string }) => {
  const response = await apiClient.post('/auth/password/reset', data);
  return response.data;
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const response = await apiClient.post('/auth/password/change', data);
  return response.data;
};

export const verifyEmail = async (data: { email: string; token: string }) => {
  const response = await apiClient.post('/auth/verify-email', data);
  return response.data;
};

export const verifyTotpSetup = async (code: string) => {
  const response = await apiClient.post('/auth/totp/verify-setup', { code });
  return response.data;
};
export const generateTotpSecret = async () => {
  const response = await apiClient.post('/auth/totp/generate');
  return response.data;
};

export const disableTotp = async () => {
  const response = await apiClient.post('/auth/totp/disable');
  return response.data;
};