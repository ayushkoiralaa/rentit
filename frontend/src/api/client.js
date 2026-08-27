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
    // A 401 on a request that carried a token means the session itself is
    // invalid/expired (not, say, a wrong-password attempt on /login, which
    // never attaches a token in the first place). Treat that as a forced
    // logout so the app doesn't keep silently failing requests forever.
    if (err.response?.status === 401 && err.config?.headers?.Authorization) {
      localStorage.removeItem("rentit_token");
      window.dispatchEvent(new Event("auth:session-expired"));
    }

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
