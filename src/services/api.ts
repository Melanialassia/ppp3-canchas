import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("sesion");
  if (raw) {
    try {
      const sesion = JSON.parse(raw);
      if (sesion?.token)

        config.headers.Authorization = `Bearer ${sesion.token}`;
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message ?? "Error en la petición";
    if (err.response?.status === 401) {
      const hadSession = !!localStorage.getItem("sesion");
      localStorage.removeItem("sesion");
      if (hadSession) window.location.href = "/login";
    }
    return Promise.reject(new Error(msg));
  },
);

export default api;
