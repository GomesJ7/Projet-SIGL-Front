import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import "../../css/AdminModulesFilieres.css";

interface ModuleItem {
  idModule: number;
  codeModule: string;
  libelle: string;
  credits?: number;
}

interface FiliereItem {
  idFiliere: number;
  nomFiliere: string;
}

interface PromotionItem {
  idPromotion: number;
  nomPromotion: string;
  annee: number;
}

interface EntrepriseItem {
  idEntreprise: number;
  nomEntreprise: string;
  emailEntreprise?: string;
  adresseEntreprise?: string;
}

type ActionType = "" | "creer" | "modifier" | "supprimer";

const ModulesFilieresManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [filieres, setFilieres] = useState<FiliereItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [entreprises, setEntreprises] = useState<EntrepriseItem[]>([]);

  // Action selectors
  const [moduleAction, setModuleAction] = useState<ActionType>("");
  const [filiereAction, setFiliereAction] = useState<ActionType>("");
  const [promotionAction, setPromotionAction] = useState<ActionType>("");
  const [entrepriseAction, setEntrepriseAction] = useState<ActionType>("");

  // Module states
  const [codeModule, setCodeModule] = useState("");
  const [libelleModule, setLibelleModule] = useState("");
  const [creditsModule, setCreditsModule] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [editModuleId, setEditModuleId] = useState("");
  const [editCodeModule, setEditCodeModule] = useState("");
  const [editLibelleModule, setEditLibelleModule] = useState("");
  const [editCreditsModule, setEditCreditsModule] = useState("");

  // Filière states
  const [nomFiliere, setNomFiliere] = useState("");
  const [selectedFiliereId, setSelectedFiliereId] = useState("");
  const [editFiliereId, setEditFiliereId] = useState("");
  const [editNomFiliere, setEditNomFiliere] = useState("");

  // Promotion states
  const [nomPromotion, setNomPromotion] = useState("");
  const [anneePromotion, setAnneePromotion] = useState("");
  const [selectedPromotionId, setSelectedPromotionId] = useState("");
  const [editPromotionId, setEditPromotionId] = useState("");
  const [editNomPromotion, setEditNomPromotion] = useState("");
  const [editAnneePromotion, setEditAnneePromotion] = useState("");

  // Entreprise states
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [emailEntreprise, setEmailEntreprise] = useState("");
  const [adresseEntreprise, setAdresseEntreprise] = useState("");
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState("");
  const [editEntrepriseId, setEditEntrepriseId] = useState("");
  const [editNomEntreprise, setEditNomEntreprise] = useState("");
  const [editEmailEntreprise, setEditEmailEntreprise] = useState("");
  const [editAdresseEntreprise, setEditAdresseEntreprise] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const [modulesRes, filieresRes, promotionsRes, entreprisesRes] = await Promise.all([
      api.get("/modules"),
      api.get("/filieres"),
      api.get("/promotions"),
      api.get("/entreprises"),
    ]);
    setModules(modulesRes.data || []);
    setFilieres(filieresRes.data || []);
    setPromotions(promotionsRes.data || []);
    setEntreprises(entreprisesRes.data || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadData();
      } catch {
        setError("Impossible de charger les modules, filières, promotions et entreprises.");
      }
    };
    void init();
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleHomeClick = () => { navigate("/"); };
  const handleBack = () => { navigate("/administrateur"); };

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr?.response?.status === 403) return "Action non autorisée pour votre profil.";
    return fallback;
  };

  const resetFlash = () => { setMessage(""); setError(""); };

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(""), 4000); return () => clearTimeout(t); }
  }, [message]);

  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(""), 4000); return () => clearTimeout(t); }
  }, [error]);

  // ── Module handlers ──────────────────────────────────────────────────────
  const handleCreateModule = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!codeModule.trim() || !libelleModule.trim()) { setError("Le code et le libellé du module sont obligatoires."); return; }
    setLoading(true);
    try {
      await api.post("/modules", { codeModule: codeModule.trim(), libelle: libelleModule.trim(), credits: creditsModule.trim() ? Number(creditsModule) : null });
      setCodeModule(""); setLibelleModule(""); setCreditsModule("");
      setMessage("Module créé avec succès.");
      await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la création du module.")); }
    finally { setLoading(false); }
  };

  const handleSelectModuleToEdit = (moduleId: string) => {
    setEditModuleId(moduleId);
    const s = modules.find((m) => String(m.idModule) === moduleId);
    setEditCodeModule(s?.codeModule ?? "");
    setEditLibelleModule(s?.libelle ?? "");
    setEditCreditsModule(s?.credits != null ? String(s.credits) : "");
  };

  const handleUpdateModule = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!editModuleId) { setError("Veuillez sélectionner un module à modifier."); return; }
    if (!editCodeModule.trim() || !editLibelleModule.trim()) { setError("Le code et le libellé sont obligatoires."); return; }
    setLoading(true);
    try {
      await api.put(`/modules/${editModuleId}`, { codeModule: editCodeModule.trim(), libelle: editLibelleModule.trim(), credits: editCreditsModule.trim() ? Number(editCreditsModule) : null });
      setMessage("Module modifié avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la modification du module.")); }
    finally { setLoading(false); }
  };

  const handleDeleteModule = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!selectedModuleId) { setError("Veuillez sélectionner un module à supprimer."); return; }
    setLoading(true);
    try {
      await api.delete(`/modules/${selectedModuleId}`);
      setSelectedModuleId(""); setMessage("Module supprimé avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la suppression du module.")); }
    finally { setLoading(false); }
  };

  const handleModuleSubmit = (e: FormEvent) => {
    if (moduleAction === "creer") return handleCreateModule(e);
    if (moduleAction === "modifier") return handleUpdateModule(e);
    if (moduleAction === "supprimer") return handleDeleteModule(e);
    e.preventDefault();
  };

  // ── Filière handlers ─────────────────────────────────────────────────────
  const handleCreateFiliere = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!nomFiliere.trim()) { setError("Le nom de la filière est obligatoire."); return; }
    setLoading(true);
    try {
      await api.post("/filieres", { nomFiliere: nomFiliere.trim() });
      setNomFiliere(""); setMessage("Filière créée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la création de la filière.")); }
    finally { setLoading(false); }
  };

  const handleSelectFiliereToEdit = (filiereId: string) => {
    setEditFiliereId(filiereId);
    const s = filieres.find((f) => String(f.idFiliere) === filiereId);
    setEditNomFiliere(s?.nomFiliere ?? "");
  };

  const handleUpdateFiliere = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!editFiliereId) { setError("Veuillez sélectionner une filière à modifier."); return; }
    if (!editNomFiliere.trim()) { setError("Le nom de la filière est obligatoire."); return; }
    setLoading(true);
    try {
      await api.put(`/filieres/${editFiliereId}`, { nomFiliere: editNomFiliere.trim() });
      setMessage("Filière modifiée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la modification de la filière.")); }
    finally { setLoading(false); }
  };

  const handleDeleteFiliere = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!selectedFiliereId) { setError("Veuillez sélectionner une filière à supprimer."); return; }
    setLoading(true);
    try {
      await api.delete(`/filieres/${selectedFiliereId}`);
      setSelectedFiliereId(""); setMessage("Filière supprimée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la suppression de la filière.")); }
    finally { setLoading(false); }
  };

  const handleFiliereSubmit = (e: FormEvent) => {
    if (filiereAction === "creer") return handleCreateFiliere(e);
    if (filiereAction === "modifier") return handleUpdateFiliere(e);
    if (filiereAction === "supprimer") return handleDeleteFiliere(e);
    e.preventDefault();
  };

  // ── Promotion handlers ───────────────────────────────────────────────────
  const handleCreatePromotion = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!nomPromotion.trim() || !anneePromotion.trim()) { setError("Le nom et l'année de la promotion sont obligatoires."); return; }
    const parsedAnnee = Number(anneePromotion);
    if (Number.isNaN(parsedAnnee)) { setError("L'année doit être un nombre valide."); return; }
    setLoading(true);
    try {
      await api.post("/promotions", { nomPromotion: nomPromotion.trim(), annee: parsedAnnee });
      setNomPromotion(""); setAnneePromotion(""); setMessage("Promotion créée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la création de la promotion.")); }
    finally { setLoading(false); }
  };

  const handleSelectPromotionToEdit = (promotionId: string) => {
    setEditPromotionId(promotionId);
    const s = promotions.find((p) => String(p.idPromotion) === promotionId);
    setEditNomPromotion(s?.nomPromotion ?? "");
    setEditAnneePromotion(s?.annee != null ? String(s.annee) : "");
  };

  const handleUpdatePromotion = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!editPromotionId) { setError("Veuillez sélectionner une promotion à modifier."); return; }
    if (!editNomPromotion.trim() || !editAnneePromotion.trim()) { setError("Le nom et l'année sont obligatoires."); return; }
    const parsedAnnee = Number(editAnneePromotion);
    if (Number.isNaN(parsedAnnee)) { setError("L'année doit être un nombre valide."); return; }
    setLoading(true);
    try {
      await api.put(`/promotions/${editPromotionId}`, { nomPromotion: editNomPromotion.trim(), annee: parsedAnnee });
      setMessage("Promotion modifiée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la modification de la promotion.")); }
    finally { setLoading(false); }
  };

  const handleDeletePromotion = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!selectedPromotionId) { setError("Veuillez sélectionner une promotion à supprimer."); return; }
    setLoading(true);
    try {
      await api.delete(`/promotions/${selectedPromotionId}`);
      setSelectedPromotionId(""); setMessage("Promotion supprimée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la suppression de la promotion.")); }
    finally { setLoading(false); }
  };

  const handlePromotionSubmit = (e: FormEvent) => {
    if (promotionAction === "creer") return handleCreatePromotion(e);
    if (promotionAction === "modifier") return handleUpdatePromotion(e);
    if (promotionAction === "supprimer") return handleDeletePromotion(e);
    e.preventDefault();
  };

  // ── Entreprise handlers ──────────────────────────────────────────────────
  const handleCreateEntreprise = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!nomEntreprise.trim()) { setError("Le nom de l'entreprise est obligatoire."); return; }
    setLoading(true);
    try {
      await api.post("/entreprises", {
        nomEntreprise: nomEntreprise.trim(),
        emailEntreprise: emailEntreprise.trim() || null,
        adresseEntreprise: adresseEntreprise.trim() || null,
      });
      setNomEntreprise(""); setEmailEntreprise(""); setAdresseEntreprise("");
      setMessage("Entreprise créée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la création de l'entreprise.")); }
    finally { setLoading(false); }
  };

  const handleSelectEntrepriseToEdit = (entrepriseId: string) => {
    setEditEntrepriseId(entrepriseId);
    const s = entreprises.find((ep) => String(ep.idEntreprise) === entrepriseId);
    setEditNomEntreprise(s?.nomEntreprise ?? "");
    setEditEmailEntreprise(s?.emailEntreprise ?? "");
    setEditAdresseEntreprise(s?.adresseEntreprise ?? "");
  };

  const handleUpdateEntreprise = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!editEntrepriseId) { setError("Veuillez sélectionner une entreprise à modifier."); return; }
    if (!editNomEntreprise.trim()) { setError("Le nom de l'entreprise est obligatoire."); return; }
    setLoading(true);
    try {
      await api.put(`/entreprises/${editEntrepriseId}`, {
        nomEntreprise: editNomEntreprise.trim(),
        emailEntreprise: editEmailEntreprise.trim() || null,
        adresseEntreprise: editAdresseEntreprise.trim() || null,
      });
      setMessage("Entreprise modifiée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la modification de l'entreprise.")); }
    finally { setLoading(false); }
  };

  const handleDeleteEntreprise = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!selectedEntrepriseId) { setError("Veuillez sélectionner une entreprise à supprimer."); return; }
    setLoading(true);
    try {
      await api.delete(`/entreprises/${selectedEntrepriseId}`);
      setSelectedEntrepriseId(""); setMessage("Entreprise supprimée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la suppression de l'entreprise.")); }
    finally { setLoading(false); }
  };

  const handleEntrepriseSubmit = (e: FormEvent) => {
    if (entrepriseAction === "creer") return handleCreateEntreprise(e);
    if (entrepriseAction === "modifier") return handleUpdateEntreprise(e);
    if (entrepriseAction === "supprimer") return handleDeleteEntreprise(e);
    e.preventDefault();
  };

  const actionLabel = (action: ActionType) => {
    if (action === "creer") return "Créer";
    if (action === "modifier") return "Modifier";
    if (action === "supprimer") return "Supprimer";
    return "";
  };

  return (
    <div className="admin-container">
      <button onClick={handleHomeClick} className="admin-home-button" title="Retour à l'accueil">🏠</button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Modules, filières et entreprises</h1>
          <div className="admin-mf-actions">
            <button onClick={handleBack} className="admin-mf-back-button">Retour</button>
            <button onClick={handleLogout} className="admin-logout-button">Logout</button>
          </div>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecté :</strong> {displayName || user?.email}</p>
          <p><strong>Rôle :</strong> {user?.role}</p>
        </div>

        {message && <p className="admin-mf-success">{message}</p>}
        {error && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">

          {/* ── Modules ── */}
          <div className="admin-module-card">
            <h3>Modules</h3>
            <form onSubmit={handleModuleSubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={moduleAction}
                onChange={(e) => setModuleAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {moduleAction === "creer" && (
                <>
                  <input value={codeModule} onChange={(e) => setCodeModule(e.target.value)} placeholder="Code module (ex: SIGL101)" disabled={loading} />
                  <input value={libelleModule} onChange={(e) => setLibelleModule(e.target.value)} placeholder="Libellé du module" disabled={loading} />
                  <input type="number" min="0" value={creditsModule} onChange={(e) => setCreditsModule(e.target.value)} placeholder="Crédits (optionnel)" disabled={loading} />
                </>
              )}

              {moduleAction === "modifier" && (
                <>
                  <select value={editModuleId} onChange={(e) => handleSelectModuleToEdit(e.target.value)} disabled={loading}>
                    <option value="">Sélectionner un module</option>
                    {modules.map((m) => <option key={m.idModule} value={m.idModule}>{m.codeModule} - {m.libelle}</option>)}
                  </select>
                  <input value={editCodeModule} onChange={(e) => setEditCodeModule(e.target.value)} placeholder="Nouveau code module" disabled={loading} />
                  <input value={editLibelleModule} onChange={(e) => setEditLibelleModule(e.target.value)} placeholder="Nouveau libellé" disabled={loading} />
                  <input type="number" min="0" value={editCreditsModule} onChange={(e) => setEditCreditsModule(e.target.value)} placeholder="Nouveaux crédits (optionnel)" disabled={loading} />
                </>
              )}

              {moduleAction === "supprimer" && (
                <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner un module</option>
                  {modules.map((m) => <option key={m.idModule} value={m.idModule}>{m.codeModule} - {m.libelle}</option>)}
                </select>
              )}

              {moduleAction && (
                <button
                  type="submit"
                  className={moduleAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(moduleAction)}
                </button>
              )}
            </form>
          </div>

          {/* ── Filières ── */}
          <div className="admin-module-card">
            <h3>Filières</h3>
            <form onSubmit={handleFiliereSubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={filiereAction}
                onChange={(e) => setFiliereAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {filiereAction === "creer" && (
                <input value={nomFiliere} onChange={(e) => setNomFiliere(e.target.value)} placeholder="Nom de la filière" disabled={loading} />
              )}

              {filiereAction === "modifier" && (
                <>
                  <select value={editFiliereId} onChange={(e) => handleSelectFiliereToEdit(e.target.value)} disabled={loading}>
                    <option value="">Sélectionner une filière</option>
                    {filieres.map((f) => <option key={f.idFiliere} value={f.idFiliere}>{f.nomFiliere}</option>)}
                  </select>
                  <input value={editNomFiliere} onChange={(e) => setEditNomFiliere(e.target.value)} placeholder="Nouveau nom de filière" disabled={loading} />
                </>
              )}

              {filiereAction === "supprimer" && (
                <select value={selectedFiliereId} onChange={(e) => setSelectedFiliereId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner une filière</option>
                  {filieres.map((f) => <option key={f.idFiliere} value={f.idFiliere}>{f.nomFiliere}</option>)}
                </select>
              )}

              {filiereAction && (
                <button
                  type="submit"
                  className={filiereAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(filiereAction)}
                </button>
              )}
            </form>
          </div>

          {/* ── Promotions ── */}
          <div className="admin-module-card">
            <h3>Promotions</h3>
            <form onSubmit={handlePromotionSubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={promotionAction}
                onChange={(e) => setPromotionAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {promotionAction === "creer" && (
                <>
                  <input value={nomPromotion} onChange={(e) => setNomPromotion(e.target.value)} placeholder="Nom de la promotion" disabled={loading} />
                  <input type="number" value={anneePromotion} onChange={(e) => setAnneePromotion(e.target.value)} placeholder="Année (ex: 2026)" disabled={loading} />
                </>
              )}

              {promotionAction === "modifier" && (
                <>
                  <select value={editPromotionId} onChange={(e) => handleSelectPromotionToEdit(e.target.value)} disabled={loading}>
                    <option value="">Sélectionner une promotion</option>
                    {promotions.map((p) => <option key={p.idPromotion} value={p.idPromotion}>{p.nomPromotion} ({p.annee})</option>)}
                  </select>
                  <input value={editNomPromotion} onChange={(e) => setEditNomPromotion(e.target.value)} placeholder="Nouveau nom de promotion" disabled={loading} />
                  <input type="number" value={editAnneePromotion} onChange={(e) => setEditAnneePromotion(e.target.value)} placeholder="Nouvelle année" disabled={loading} />
                </>
              )}

              {promotionAction === "supprimer" && (
                <select value={selectedPromotionId} onChange={(e) => setSelectedPromotionId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner une promotion</option>
                  {promotions.map((p) => <option key={p.idPromotion} value={p.idPromotion}>{p.nomPromotion} ({p.annee})</option>)}
                </select>
              )}

              {promotionAction && (
                <button
                  type="submit"
                  className={promotionAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(promotionAction)}
                </button>
              )}
            </form>
          </div>

          {/* ── Entreprises ── */}
          <div className="admin-module-card">
            <h3>Entreprises</h3>
            <form onSubmit={handleEntrepriseSubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={entrepriseAction}
                onChange={(e) => setEntrepriseAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {entrepriseAction === "creer" && (
                <>
                  <input value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} placeholder="Nom de l'entreprise *" disabled={loading} />
                  <input type="email" value={emailEntreprise} onChange={(e) => setEmailEntreprise(e.target.value)} placeholder="Email (optionnel)" disabled={loading} />
                  <input value={adresseEntreprise} onChange={(e) => setAdresseEntreprise(e.target.value)} placeholder="Adresse (optionnel)" disabled={loading} />
                </>
              )}

              {entrepriseAction === "modifier" && (
                <>
                  <select value={editEntrepriseId} onChange={(e) => handleSelectEntrepriseToEdit(e.target.value)} disabled={loading}>
                    <option value="">Sélectionner une entreprise</option>
                    {entreprises.map((ep) => <option key={ep.idEntreprise} value={ep.idEntreprise}>{ep.nomEntreprise}</option>)}
                  </select>
                  <input value={editNomEntreprise} onChange={(e) => setEditNomEntreprise(e.target.value)} placeholder="Nom de l'entreprise *" disabled={loading} />
                  <input type="email" value={editEmailEntreprise} onChange={(e) => setEditEmailEntreprise(e.target.value)} placeholder="Email (optionnel)" disabled={loading} />
                  <input value={editAdresseEntreprise} onChange={(e) => setEditAdresseEntreprise(e.target.value)} placeholder="Adresse (optionnel)" disabled={loading} />
                </>
              )}

              {entrepriseAction === "supprimer" && (
                <select value={selectedEntrepriseId} onChange={(e) => setSelectedEntrepriseId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner une entreprise</option>
                  {entreprises.map((ep) => <option key={ep.idEntreprise} value={ep.idEntreprise}>{ep.nomEntreprise}</option>)}
                </select>
              )}

              {entrepriseAction && (
                <button
                  type="submit"
                  className={entrepriseAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(entrepriseAction)}
                </button>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModulesFilieresManagement;
