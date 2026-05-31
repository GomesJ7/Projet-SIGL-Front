import api from "./axiosConfig";

// ===== USERS =====
// Le backend n'expose pas de /api/utilisateurs global.
// Les utilisateurs sont gérés par type : /api/apprenants, /api/enseignants, /api/administrateurs
// La création passe par /api/auth/register (crée l'utilisateur + la bonne sous-table JPA)

export const getApprenantsAPI = () => api.get("/apprenants");
export const getEnseignantsAPI = () => api.get("/enseignants");
export const getAdminsAPI = () => api.get("/administrateurs");

// Création unifiée via register (gère APPRENANT / ENSEIGNANT / ADMIN)
export const createUserAPI = (data: {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: "APPRENANT" | "ENSEIGNANT" | "ADMIN";
}) => api.post("/auth/register", data);

// Mise à jour selon le rôle
export const updateApprenantAPI = (id: number, data: any) =>
  api.put(`/apprenants/${id}`, data);
export const updateEnseignantAPI = (id: number, data: any) =>
  api.put(`/enseignants/${id}`, data);
export const updateAdminAPI = (id: number, data: any) =>
  api.put(`/administrateurs/${id}`, data);

// Suppression selon le rôle
export const deleteApprenantAPI = (id: number) =>
  api.delete(`/apprenants/${id}`);
export const deleteEnseignantAPI = (id: number) =>
  api.delete(`/enseignants/${id}`);
export const deleteAdminAPI = (id: number) =>
  api.delete(`/administrateurs/${id}`);

// ===== STAGES =====
export const getStagesAPI = () => api.get("/stages");
export const createStageAPI = (data: any) => api.post("/stages", data);
export const updateStageAPI = (id: number, data: any) =>
  api.put(`/stages/${id}`, data);
export const deleteStageAPI = (id: number) => api.delete(`/stages/${id}`);

// ===== COMPANIES =====
export const getCompaniesAPI = () => api.get("/entreprises");
export const createCompanyAPI = (data: any) => api.post("/entreprises", data);
export const updateCompanyAPI = (id: number, data: any) =>
  api.put(`/entreprises/${id}`, data);
export const deleteCompanyAPI = (id: number) =>
  api.delete(`/entreprises/${id}`);

// ===== DEFENSES =====
export const getDefensesAPI = () => api.get("/soutenances");
export const createDefenseAPI = (data: any) => api.post("/soutenances", data);
export const updateDefenseAPI = (id: number, data: any) =>
  api.put(`/soutenances/${id}`, data);
export const deleteDefenseAPI = (id: number) =>
  api.delete(`/soutenances/${id}`);

// ===== JURIES =====
export const getJuriesAPI = () => api.get("/juries");