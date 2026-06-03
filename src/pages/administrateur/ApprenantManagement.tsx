import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import StagesModal from "../../components/StagesModal";
import "../../css/AdminModulesFilieres.css";

interface ApprenantItem {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  niveau?: string;
  idPromotion?: number;
  nomPromotion?: string;
  idFiliere?: number;
  nomFiliere?: string;
}

interface PromotionItem {
  idPromotion: number;
  nomPromotion: string;
  annee: number;
}

interface FiliereItem {
  idFiliere: number;
  nomFiliere: string;
}

interface StageItem {
  idStage: number;
  poste: string;
  etat: string;
  dateDebut: string;
  dateFin?: string;
  nomEntreprise?: string;
}

type ActionType = "" | "creer" | "modifier" | "supprimer";

const ApprenantManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [apprenants, setApprenants] = useState<ApprenantItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [filieres, setFilieres] = useState<FiliereItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApprenantForStages, setSelectedApprenantForStages] = useState<ApprenantItem | null>(null);
  const [selectedApprenantStages, setSelectedApprenantStages] = useState<StageItem[]>([]);

  // Action selector
  const [apprenantAction, setApprenantAction] = useState<ActionType>("");

  // Create fields
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [matricule, setMatricule] = useState("");
  const [niveau, setNiveau] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");

  // Edit fields
  const [selectedApprenantId, setSelectedApprenantId] = useState("");
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMatricule, setEditMatricule] = useState("");
  const [editNiveau, setEditNiveau] = useState("");

  // Delete field
  const [deleteApprenantId, setDeleteApprenantId] = useState("");

  // Affectation fields
  const [affectApprenantId, setAffectApprenantId] = useState("");
  const [affectPromotionId, setAffectPromotionId] = useState("");
  const [affectFiliereApprenantId, setAffectFiliereApprenantId] = useState("");
  const [affectFiliereId, setAffectFiliereId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [apprenantsRes, promotionsRes, filieresRes] = await Promise.all([
        api.get("/apprenants"),
        api.get("/promotions"),
        api.get("/filieres"),
      ]);
      setApprenants(apprenantsRes.data || []);
      setPromotions(promotionsRes.data || []);
      setFilieres(filieresRes.data || []);
    } catch {
      setError("Impossible de charger les données.");
    }
  };

  useEffect(() => {
    void loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleHomeClick = () => { navigate("/"); };
  const handleBack = () => { navigate("/administrateur"); };

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr?.response?.status === 403) return "Action non autorisée.";
    return fallback;
  };

  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(""), 4000); return () => clearTimeout(t); }
  }, [message]);

  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(""), 4000); return () => clearTimeout(t); }
  }, [error]);

  const resetFlash = () => { setMessage(""); setError(""); };

  // ── Apprenant handlers ───────────────────────────────────────────────────
  const handleCreateApprenant = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!nom.trim() || !prenom.trim() || !email.trim() || !motDePasse.trim()) {
      setError("Tous les champs obligatoires doivent être remplis."); return;
    }
    setLoading(true);
    try {
      await api.post("/apprenants", {
        nom: nom.trim(), prenom: prenom.trim(), email: email.trim(),
        motDePasse: motDePasse.trim(),
        matricule: matricule.trim() || null,
        niveau: niveau.trim() || null,
        dateNaissance: dateNaissance || null,
      });
      setNom(""); setPrenom(""); setEmail(""); setMotDePasse("");
      setMatricule(""); setNiveau(""); setDateNaissance("");
      setMessage("Apprenant créé avec succès.");
      await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la création.")); }
    finally { setLoading(false); }
  };

  const handleSelectApprenantToEdit = (appId: string) => {
    setSelectedApprenantId(appId);
    const s = apprenants.find((a) => String(a.idUtilisateur) === appId);
    if (s) {
      setEditNom(s.nom); setEditPrenom(s.prenom); setEditEmail(s.email);
      setEditMatricule(s.matricule || ""); setEditNiveau(s.niveau || "");
    }
  };

  const handleUpdateApprenant = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!selectedApprenantId) { setError("Sélectionnez un apprenant à modifier."); return; }
    if (!editNom.trim() || !editPrenom.trim() || !editEmail.trim()) { setError("Les champs obligatoires doivent être remplis."); return; }
    setLoading(true);
    try {
      await api.put(`/apprenants/${selectedApprenantId}`, {
        nom: editNom.trim(), prenom: editPrenom.trim(), email: editEmail.trim(),
        matricule: editMatricule.trim() || null, niveau: editNiveau.trim() || null,
      });
      setMessage("Apprenant modifié avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la modification.")); }
    finally { setLoading(false); }
  };

  const handleDeleteApprenant = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!deleteApprenantId) { setError("Sélectionnez un apprenant à supprimer."); return; }
    setLoading(true);
    try {
      await api.delete(`/apprenants/${deleteApprenantId}`);
      setDeleteApprenantId(""); setMessage("Apprenant supprimé avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la suppression.")); }
    finally { setLoading(false); }
  };

  const handleApprenantSubmit = (e: FormEvent) => {
    if (apprenantAction === "creer") return handleCreateApprenant(e);
    if (apprenantAction === "modifier") return handleUpdateApprenant(e);
    if (apprenantAction === "supprimer") return handleDeleteApprenant(e);
    e.preventDefault();
  };

  const actionLabel = (action: ActionType) => {
    if (action === "creer") return "Créer";
    if (action === "modifier") return "Modifier";
    if (action === "supprimer") return "Supprimer";
    return "";
  };

  // ── Affectation handlers ─────────────────────────────────────────────────
  const handleAffectPromotion = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!affectApprenantId || !affectPromotionId) { setError("Sélectionnez un apprenant et une promotion."); return; }
    setLoading(true);
    try {
      await api.put(`/apprenants/${affectApprenantId}/promotion/${affectPromotionId}`);
      setMessage("Apprenant affecté à la promotion avec succès.");
      setAffectApprenantId(""); setAffectPromotionId(""); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de l'affectation.")); }
    finally { setLoading(false); }
  };

  const handleAffectFiliere = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!affectFiliereApprenantId || !affectFiliereId) { setError("Sélectionnez un apprenant et une filière."); return; }
    setLoading(true);
    try {
      await api.put(`/apprenants/${affectFiliereApprenantId}/filiere/${affectFiliereId}`);
      setMessage("Apprenant affecté à la filière avec succès.");
      setAffectFiliereApprenantId(""); setAffectFiliereId(""); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de l'affectation.")); }
    finally { setLoading(false); }
  };

  const handleViewStages = async (appId: number) => {
    resetFlash();
    const apprenant = apprenants.find((a) => a.idUtilisateur === appId);
    setLoading(true);
    try {
      const res = await api.get(`/apprenants/${appId}/stages`);
      setSelectedApprenantForStages(apprenant || null);
      setSelectedApprenantStages(res.data || []);
      setModalOpen(true);
    } catch (err) { setError(getApiErrorMessage(err, "Impossible de charger les stages.")); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-container">
      <button onClick={handleHomeClick} className="admin-home-button" title="Retour à l'accueil">🏠</button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Apprenants</h1>
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

          {/* ── Apprenants ── */}
          <div className="admin-module-card">
            <h3>Apprenants</h3>
            <form onSubmit={handleApprenantSubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={apprenantAction}
                onChange={(e) => setApprenantAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {apprenantAction === "creer" && (
                <>
                  <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" disabled={loading} />
                  <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prénom" disabled={loading} />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" disabled={loading} />
                  <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="Mot de passe" disabled={loading} />
                  <input value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder="Matricule (optionnel)" disabled={loading} />
                  <input value={niveau} onChange={(e) => setNiveau(e.target.value)} placeholder="Niveau (optionnel)" disabled={loading} />
                  <label className="admin-mf-label">Date de naissance (optionnel)</label>
                  <input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} disabled={loading} />
                </>
              )}

              {apprenantAction === "modifier" && (
                <>
                  <select value={selectedApprenantId} onChange={(e) => handleSelectApprenantToEdit(e.target.value)} disabled={loading}>
                    <option value="">Sélectionner un apprenant</option>
                    {apprenants.map((a) => (
                      <option key={a.idUtilisateur} value={a.idUtilisateur}>{a.prenom} {a.nom} ({a.email})</option>
                    ))}
                  </select>
                  <input value={editNom} onChange={(e) => setEditNom(e.target.value)} placeholder="Nom" disabled={loading} />
                  <input value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)} placeholder="Prénom" disabled={loading} />
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" disabled={loading} />
                  <input value={editMatricule} onChange={(e) => setEditMatricule(e.target.value)} placeholder="Matricule (optionnel)" disabled={loading} />
                  <input value={editNiveau} onChange={(e) => setEditNiveau(e.target.value)} placeholder="Niveau (optionnel)" disabled={loading} />
                </>
              )}

              {apprenantAction === "supprimer" && (
                <select value={deleteApprenantId} onChange={(e) => setDeleteApprenantId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner un apprenant</option>
                  {apprenants.map((a) => (
                    <option key={a.idUtilisateur} value={a.idUtilisateur}>{a.prenom} {a.nom}</option>
                  ))}
                </select>
              )}

              {apprenantAction && (
                <button
                  type="submit"
                  className={apprenantAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(apprenantAction)}
                </button>
              )}
            </form>
          </div>

          {/* ── Affecter à une promotion ── */}
          <div className="admin-module-card">
            <h3>Affecter à une promotion</h3>
            <form onSubmit={handleAffectPromotion} className="admin-mf-form">
              <select value={affectApprenantId} onChange={(e) => setAffectApprenantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un apprenant</option>
                {apprenants.map((a) => (
                  <option key={a.idUtilisateur} value={a.idUtilisateur}>{a.prenom} {a.nom}</option>
                ))}
              </select>
              <select value={affectPromotionId} onChange={(e) => setAffectPromotionId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner une promotion</option>
                {promotions.map((p) => (
                  <option key={p.idPromotion} value={p.idPromotion}>{p.nomPromotion} ({p.annee})</option>
                ))}
              </select>
              <button type="submit" className="admin-module-button" disabled={loading}>Affecter</button>
            </form>
          </div>

          {/* ── Affecter à une filière ── */}
          <div className="admin-module-card">
            <h3>Affecter à une filière</h3>
            <form onSubmit={handleAffectFiliere} className="admin-mf-form">
              <select value={affectFiliereApprenantId} onChange={(e) => setAffectFiliereApprenantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un apprenant</option>
                {apprenants.map((a) => (
                  <option key={a.idUtilisateur} value={a.idUtilisateur}>{a.prenom} {a.nom}{a.nomFiliere ? ` (${a.nomFiliere})` : ""}</option>
                ))}
              </select>
              <select value={affectFiliereId} onChange={(e) => setAffectFiliereId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner une filière</option>
                {filieres.map((f) => (
                  <option key={f.idFiliere} value={f.idFiliere}>{f.nomFiliere}</option>
                ))}
              </select>
              <button type="submit" className="admin-module-button" disabled={loading}>Affecter</button>
            </form>
          </div>

          {/* ── Voir les stages ── */}
          <div className="admin-module-card">
            <h3>Voir les stages</h3>
            <form className="admin-mf-form">
              <select
                onChange={(e) => e.target.value && handleViewStages(Number(e.target.value))}
                disabled={loading}
                defaultValue=""
              >
                <option value="">Sélectionner un apprenant</option>
                {apprenants.map((a) => (
                  <option key={a.idUtilisateur} value={a.idUtilisateur}>{a.prenom} {a.nom}</option>
                ))}
              </select>
            </form>
          </div>

        </div>
      </div>

      <StagesModal
        isOpen={modalOpen}
        apprenantName={selectedApprenantForStages ? `${selectedApprenantForStages.prenom} ${selectedApprenantForStages.nom}` : ""}
        stages={selectedApprenantStages}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default ApprenantManagement;
