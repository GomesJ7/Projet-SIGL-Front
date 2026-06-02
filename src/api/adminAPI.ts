import api from "./axiosConfig";

/* =========================================================================
 * USERS — endpoints séparés par type (héritage JOINED côté JPA)
 * ========================================================================= */
export const getApprenantsAPI  = () => api.get("/apprenants");
export const getEnseignantsAPI = () => api.get("/enseignants");
export const getAdminsAPI      = () => api.get("/administrateurs");

// Création unifiée via /auth/register : crée l'utilisateur ET la bonne sous-table JPA
export const createUserAPI = (data: {
  nom: string; prenom: string; email: string;
  motDePasse: string; role: "APPRENANT" | "ENSEIGNANT" | "ADMIN";
}) => api.post("/auth/register", data);

// Mise à jour routée selon le rôle
export const updateApprenantAPI  = (id: number, data: any) => api.put(`/apprenants/${id}`, data);
export const updateEnseignantAPI = (id: number, data: any) => api.put(`/enseignants/${id}`, data);
export const updateAdminAPI      = (id: number, data: any) => api.put(`/administrateurs/${id}`, data);

// Suppression routée selon le rôle
export const deleteApprenantAPI  = (id: number) => api.delete(`/apprenants/${id}`);
export const deleteEnseignantAPI = (id: number) => api.delete(`/enseignants/${id}`);
export const deleteAdminAPI      = (id: number) => api.delete(`/administrateurs/${id}`);

// Affectations apprenant (suivi académique)
export const affecterPromotionAPI = (idApprenant: number, idPromotion: number) =>
  api.put(`/apprenants/${idApprenant}/promotion/${idPromotion}`);
export const affecterFiliereAPI = (idApprenant: number, idFiliere: number) =>
  api.put(`/apprenants/${idApprenant}/filiere/${idFiliere}`);

/* =========================================================================
 * STAGES — StageDto { idStage, poste, objectif, dateDebut, dateFin,
 *                     dureeSemaines, etat, idEntreprise, nomEntreprise }
 * Affectation = endpoint séparé. EtatType : EN_COURS|TERMINE|VALIDE|REFUSE
 * ========================================================================= */
export const getStagesAPI   = () => api.get("/stages");
export const createStageAPI = (data: any) => api.post("/stages", data);
export const updateStageAPI = (id: number, data: any) => api.put(`/stages/${id}`, data);
export const deleteStageAPI = (id: number) => api.delete(`/stages/${id}`);
export const changerEtatStageAPI = (id: number, etat: string) =>
  api.patch(`/stages/${id}/etat`, null, { params: { etat } });
// AffectationStageDto : { idStage, idApprenant, idEnseignant }
export const affecterStageAPI   = (data: { idStage: number; idApprenant: number; idEnseignant: number }) =>
  api.post("/stages/affectations", data);
export const getAffectationsAPI = (idStage: number) => api.get(`/stages/${idStage}/affectations`);

/* =========================================================================
 * ENTREPRISES — { idEntreprise, nomEntreprise, emailEntreprise, adresseEntreprise }
 * ========================================================================= */
export const getCompaniesAPI  = () => api.get("/entreprises");
export const createCompanyAPI = (data: any) => api.post("/entreprises", data);
export const updateCompanyAPI = (id: number, data: any) => api.put(`/entreprises/${id}`, data);
export const deleteCompanyAPI = (id: number) => api.delete(`/entreprises/${id}`);

/* =========================================================================
 * SOUTENANCES — { idSoutenance, dateSoutenance (LocalDateTime), noteFinale,
 *                 observation, idStage, idSalle, idJury }
 * ========================================================================= */
export const getDefensesAPI   = () => api.get("/soutenances");
export const createDefenseAPI = (data: any) => api.post("/soutenances", data);
export const updateDefenseAPI = (id: number, data: any) => api.put(`/soutenances/${id}`, data);
export const deleteDefenseAPI = (id: number) => api.delete(`/soutenances/${id}`);
// SoutenanceVerdictDto : { noteFinale, observation }
export const verdictDefenseAPI = (id: number, data: { noteFinale: number; observation: string }) =>
  api.patch(`/soutenances/${id}/verdict`, data);

/* =========================================================================
 * FILIÈRES — { idFiliere, nomFiliere }
 * ========================================================================= */
export const getFilieresAPI   = () => api.get("/filieres");
export const createFiliereAPI = (data: any) => api.post("/filieres", data);
export const updateFiliereAPI = (id: number, data: any) => api.put(`/filieres/${id}`, data);
export const deleteFiliereAPI = (id: number) => api.delete(`/filieres/${id}`);

/* =========================================================================
 * PROMOTIONS — { idPromotion, nomPromotion, annee }
 * ========================================================================= */
export const getPromotionsAPI   = () => api.get("/promotions");
export const createPromotionAPI = (data: any) => api.post("/promotions", data);
export const updatePromotionAPI = (id: number, data: any) => api.put(`/promotions/${id}`, data);
export const deletePromotionAPI = (id: number) => api.delete(`/promotions/${id}`);

/* =========================================================================
 * MODULES — { idModule, codeModule, libelle, credits }
 * ========================================================================= */
export const getModulesAPI   = () => api.get("/modules");
export const createModuleAPI = (data: any) => api.post("/modules", data);
export const updateModuleAPI = (id: number, data: any) => api.put(`/modules/${id}`, data);
export const deleteModuleAPI = (id: number) => api.delete(`/modules/${id}`);
export const affecterModuleEnseignantAPI   = (idModule: number, idEnseignant: number) =>
  api.post(`/modules/${idModule}/enseignants/${idEnseignant}`);
export const desaffecterModuleEnseignantAPI = (idModule: number, idEnseignant: number) =>
  api.delete(`/modules/${idModule}/enseignants/${idEnseignant}`);

/* =========================================================================
 * SALLES — { idSalle, nomSalle, localisation }
 * ========================================================================= */
export const getSallesAPI   = () => api.get("/salles");
export const createSalleAPI = (data: any) => api.post("/salles", data);
export const updateSalleAPI = (id: number, data: any) => api.put(`/salles/${id}`, data);
export const deleteSalleAPI = (id: number) => api.delete(`/salles/${id}`);

/* =========================================================================
 * JURYS — JuryDto { idJury, nomJury }
 * JuryEnseignantDto : { idJury, nomJury, idEnseignant, nomEnseignant, prenomEnseignant, roleJury }
 * ========================================================================= */
export const getJuriesAPI   = () => api.get("/juries");
export const createJuryAPI  = (data: any) => api.post("/juries", data);
export const updateJuryAPI  = (id: number, data: any) => api.put(`/juries/${id}`, data);
export const deleteJuryAPI  = (id: number) => api.delete(`/juries/${id}`);
export const getJuryEnseignantsAPI = (idJury: number) => api.get(`/juries/${idJury}/enseignants`);
export const affecterJuryEnseignantAPI = (idJury: number, idEnseignant: number, roleJury?: string) =>
  api.put(`/juries/${idJury}/enseignants/${idEnseignant}`, null, { params: roleJury ? { roleJury } : {} });
export const desaffecterJuryEnseignantAPI = (idJury: number, idEnseignant: number) =>
  api.delete(`/juries/${idJury}/enseignants/${idEnseignant}`);
