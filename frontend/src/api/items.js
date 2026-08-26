import { api } from "./client.js";

export const itemsApi = {
  browse: (params) => api.get("/items", { params }).then((r) => r.data),
  get: (idOrSlug) => api.get(`/items/${idOrSlug}`).then((r) => r.data),
  create: (formData) =>
    api
      .post("/items", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data),
  update: (id, data) => api.patch(`/items/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/items/${id}`).then((r) => r.data),
  addImages: (id, formData) =>
    api
      .post(`/items/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data),
  removeImage: (id, imageId) => api.delete(`/items/${id}/images/${imageId}`).then((r) => r.data),
  availability: (id, startDate, endDate) =>
    api.get(`/items/${id}/availability`, { params: { startDate, endDate } }).then((r) => r.data),
  bookedRanges: (id) => api.get(`/items/${id}/booked-ranges`).then((r) => r.data),
};
