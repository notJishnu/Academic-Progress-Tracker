import api from "./api";

// ---------- SECTIONS ----------
export const getSections = () => api.get("/tracker/sections");
export const createSection = (data) => api.post("/tracker/sections", data);
export const deleteSection = (id) => api.delete(`/tracker/sections/${id}`);

// ---------- GOALS ----------
export const getGoals = () => api.get("/tracker/goals");
export const createGoal = (data) => api.post("/tracker/goals", data);
export const toggleGoal = (id) => api.patch(`/tracker/goals/${id}/toggle`);
export const deleteGoal = (id) => api.delete(`/tracker/goals/${id}`);
