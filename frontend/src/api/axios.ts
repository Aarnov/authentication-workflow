import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  // CRITICAL: This setting instructs the browser to attach the HttpOnly cookie 
  // to your requests, allowing the backend to verify the session.
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});