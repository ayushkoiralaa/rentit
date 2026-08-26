import { api } from "./client.js";

export const categoriesApi = {
  list: () => api.get("/categories").then((r) => r.data),
  create: (data) => api.post("/categories", data).then((r) => r.data),
  update: (id, data) => api.patch(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const bookingsApi = {
  create: (data) => api.post("/bookings", data).then((r) => r.data),
  mine: (params) => api.get("/bookings/mine", { params }).then((r) => r.data),
  accept: (id) => api.patch(`/bookings/${id}/accept`).then((r) => r.data),
  reject: (id, reason) => api.patch(`/bookings/${id}/reject`, { reason }).then((r) => r.data),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }).then((r) => r.data),
  activate: (id) => api.patch(`/bookings/${id}/activate`).then((r) => r.data),
  complete: (id) => api.patch(`/bookings/${id}/complete`).then((r) => r.data),
  pay: (id) => api.post(`/bookings/${id}/pay`).then((r) => r.data),
};

export const reviewsApi = {
  forItem: (itemId) => api.get(`/reviews/item/${itemId}`).then((r) => r.data),
  create: (data) => api.post("/reviews", data).then((r) => r.data),
};

export const favoritesApi = {
  list: () => api.get("/favorites").then((r) => r.data),
  add: (itemId) => api.post(`/favorites/${itemId}`).then((r) => r.data),
  remove: (itemId) => api.delete(`/favorites/${itemId}`).then((r) => r.data),
};

export const messagesApi = {
  threads: () => api.get("/messages/threads").then((r) => r.data),
  with: (userId, itemId) => api.get(`/messages/with/${userId}`, { params: { itemId } }).then((r) => r.data),
  send: (data) => api.post("/messages", data).then((r) => r.data),
};

export const notificationsApi = {
  list: () => api.get("/notifications").then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};

export const reportsApi = {
  create: (data) => api.post("/reports", data).then((r) => r.data),
};

export const adminApi = {
  analytics: () => api.get("/admin/analytics").then((r) => r.data),
  users: (params) => api.get("/admin/users", { params }).then((r) => r.data),
  setUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }).then((r) => r.data),
  listings: (params) => api.get("/admin/listings", { params }).then((r) => r.data),
  moderateListing: (id, data) => api.patch(`/admin/listings/${id}/moderate`, data).then((r) => r.data),
  bookings: (params) => api.get("/admin/bookings", { params }).then((r) => r.data),
  reports: (params) => api.get("/admin/reports", { params }).then((r) => r.data),
  updateReport: (id, status) => api.patch(`/admin/reports/${id}`, { status }).then((r) => r.data),
  auditLogs: () => api.get("/admin/audit-logs").then((r) => r.data),
};
