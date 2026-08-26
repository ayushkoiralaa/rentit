import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rentit_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors so components can just read `err.message`.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "Something went wrong. Please try again.";
    const details = err.response?.data?.details;
    const normalized = new Error(message);
    normalized.status = err.response?.status;
    normalized.details = details;
    return Promise.reject(normalized);
  }
);

export function resolveAssetUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, "") : "";
  return `${base}${pathOrUrl}`;
}
