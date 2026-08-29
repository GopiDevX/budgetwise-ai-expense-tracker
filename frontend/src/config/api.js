// API Configuration
const baseUrl = process.env.NODE_ENV === 'production' ? 'https://budgetwise-ai-expense-tracker.onrender.com/api' : 'http://localhost:8081/api';
export const API_BASE_URL = baseUrl;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  SIGNIN: `${API_BASE_URL}/auth/signin`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  VALIDATE: `${API_BASE_URL}/auth/validate`
};

// AI endpoints
export const AI_ENDPOINTS = {
  ADVISOR: `${API_BASE_URL}/ai/advisor`,
  INSIGHTS: `${API_BASE_URL}/ai/insights`
};

// Common headers
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const getHeaders = () => ({
  'Content-Type': 'application/json'
});
