import { api } from "./client.js";

export const authApi = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateMe: (data) => api.patch("/auth/me", data).then((r) => r.data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.post("/auth/me/avatar", form).then((r) => r.data);
  },
};
