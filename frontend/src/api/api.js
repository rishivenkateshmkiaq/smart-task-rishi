
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const deleteTask = (id) => {
  return api.delete(`/api/tasks/${id}`);
};

export const updateTask = (id, data) => {
  return api.put(`/api/tasks/${id}`, data);
};

export default api;

