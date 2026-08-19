import axios from 'axios';

// In dev, VITE_API_URL is unset and requests to '/api' go through the Vite proxy
// to localhost:5000. In production (frontend and backend on different domains),
// VITE_API_URL points straight at the deployed backend.
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
    return Promise.reject(err);
  }
);

export default client;
