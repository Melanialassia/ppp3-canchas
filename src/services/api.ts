import axios from "axios";

const api = axios.create({
  baseURL: "https://api-gateway-reservas-cancha.vercel.app/",
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("sesion");
  if (raw) {
    try {
      const sesion = JSON.parse(raw);
      if (sesion?.token)
        config.headers.Authorization = `Bearer ${sesion.token}`;
    } catch { }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message ?? "Error en la petición";
    if (err.response?.status === 401) {
      localStorage.removeItem("sesion");
      window.location.href = "/login";
    }
    return Promise.reject(new Error(msg));
  },
);

export default api;