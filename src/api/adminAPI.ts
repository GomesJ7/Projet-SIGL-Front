import api from "./axiosConfig";

// ===== USERS =====
export const getUsersAPI = () => api.get("/api/utilisateurs");
export const createUserAPI = (data: any) => api.post("/api/auth/register", data);
export const updateUserAPI = (id: number, data: any) => api.put(`/api/utilisateurs/${id}`, data);
export const deleteUserAPI = (id: number) => api.delete(`/api/utilisateurs/${id}`);

// ===== STAGES =====
export const getStagesAPI = () => api.get("/api/stages");
export const createStageAPI = (data: any) => api.post("/api/stages", data);
export const updateStageAPI = (id: number, data: any) => api.put(`/api/stages/${id}`, data);
export const deleteStageAPI = (id: number) => api.delete(`/api/stages/${id}`);

// ===== COMPANIES =====
export const getCompaniesAPI = () => api.get("/api/entreprises");
export const createCompanyAPI = (data: any) => api.post("/api/entreprises", data);
export const updateCompanyAPI = (id: number, data: any) => api.put(`/api/entreprises/${id}`, data);
export const deleteCompanyAPI = (id: number) => api.delete(`/api/entreprises/${id}`);

// ===== DEFENSES =====
export const getDefensesAPI = () => api.get("/api/soutenances");
export const createDefenseAPI = (data: any) => api.post("/api/soutenances", data);
export const updateDefenseAPI = (id: number, data: any) => api.put(`/api/soutenances/${id}`, data);
export const deleteDefenseAPI = (id: number) => api.delete(`/api/soutenances/${id}`);

// ===== JURY =====
export const getJuriesAPI = () => api.get("/api/juries");
export const createJuryAPI = (data: any) => api.post("/api/juries", data);
export const updateJuryAPI = (id: number, data: any) => api.put(`/api/juries/${id}`, data);
export const deleteJuryAPI = (id: number) => api.delete(`/api/juries/${id}`);

// ===== JURY ENSEIGNANT =====
export const getJuryEnseignantsAPI = () => api.get("/api/jury-enseignants");
export const createJuryEnseignantAPI = (data: any) => api.post("/api/jury-enseignants", data);
export const updateJuryEnseignantAPI = (id: number, data: any) => api.put(`/api/jury-enseignants/${id}`, data);
export const deleteJuryEnseignantAPI = (id: number) => api.delete(`/api/jury-enseignants/${id}`);

// ===== UTILS =====
export const getEnseignantsAPI = () => api.get("/api/utilisateurs?role=ENSEIGNANT");
export const getApprenantsAPI = () => api.get("/api/utilisateurs?role=APPRENANT");
