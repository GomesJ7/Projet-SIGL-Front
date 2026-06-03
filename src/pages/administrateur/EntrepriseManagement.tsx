// Nouveau composant pour gérer les entreprises
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import StagesModal from "../../components/StagesModal";
import "../../css/AdminModulesFilieres.css";

interface EntrepriseItem {
  idEntreprise: number;
  nomEntreprise: string;
  emailEntreprise?: string;
  adresseEntreprise?: string;
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

const EntrepriseManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [entreprises, setEntreprises] = useState<EntrepriseItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntrepriseName, setSelectedEntrepriseName] = useState("");
  const [selectedEntrepriseStages, setSelectedEntrepriseStages] = useState<StageItem[]>([]);

  const [action, setAction] = useState<ActionType>("");

  const [nomEntreprise, setNomEntreprise] = useState("");
  const [emailEntreprise, setEmailEntreprise] = useState("");
  const [adresseEntreprise, setAdresseEntreprise] = useState("");

  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState("");
  const [editNom, setEditNom] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAdresse, setEditAdresse] = useState("");

  const [deleteEntrepriseId, setDeleteEntrepriseId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const res = await api.get("/entreprises");
      setEntreprises(res.data || []);
    } catch {
      setError("Impossible de charger les entreprises.");
    }
  };

  useEffect(() => { void loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(""), 4000); return () => clearTimeout(t); } }, [message]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(""), 4000); return () => clearTimeout(t); } }, [error]);

  const resetFlash = () => { setMessage(""); setError(""); };

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr?.response?.status === 403) return "Action non autorisée.";
    return fallback;
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!nomEntreprise.trim()) { setError("Le nom de l'entreprise est requis."); return; }
    setLoading(true);
    try {
      await api.post("/entreprises", {
        nomEntreprise: nomEntreprise.trim(),
        emailEntreprise: emailEntreprise.trim() || null,
        adresseEntreprise: adresseEntreprise.trim() || null,
      });
      setNomEntreprise(""); setEmailEntreprise(""); setAdresseEntreprise("");
      setMessage("Entreprise créée avec succès.");
      await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la création.")); }
    finally { setLoading(false); }
  };

  const handleSelectToEdit = (id: string) => {
    setSelectedEntrepriseId(id);
    const s = entreprises.find((e) => String(e.idEntreprise) === id);
    if (s) { setEditNom(s.nomEntreprise); setEditEmail(s.emailEntreprise || ""); setEditAdresse(s.adresseEntreprise || ""); }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!selectedEntrepriseId) { setError("Sélectionnez une entreprise à modifier."); return; }
    if (!editNom.trim()) { setError("Le nom est requis."); return; }
    setLoading(true);
    try {
      await api.put(`/entreprises/${selectedEntrepriseId}`, {
        nomEntreprise: editNom.trim(),
        emailEntreprise: editEmail.trim() || null,
        adresseEntreprise: editAdresse.trim() || null,
      });
      setMessage("Entreprise modifiée avec succès.");
      setSelectedEntrepriseId(""); setEditNom(""); setEditEmail(""); setEditAdresse("");
      await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la modification.")); }
    finally { setLoading(false); }
  };

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!deleteEntrepriseId) { setError("Sélectionnez une entreprise à supprimer."); return; }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return;
    setLoading(true);
    try {
      await api.delete(`/entreprises/${deleteEntrepriseId}`);
      setDeleteEntrepriseId(""); setMessage("Entreprise supprimée avec succès."); await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la suppression.")); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e: FormEvent) => {
    if (action === "creer") return handleCreate(e);
    if (action === "modifier") return handleUpdate(e);
    if (action === "supprimer") return handleDelete(e);
    e.preventDefault();
  };

  const handleViewStages = async (id: number) => {
    resetFlash();
    const ent = entreprises.find((e) => e.idEntreprise === id);
    setLoading(true);
    try {
      const res = await api.get(`/entreprises/${id}/stages`);
      setSelectedEntrepriseName(ent ? ent.nomEntreprise : `Entreprise #${id}`);
      setSelectedEntrepriseStages(res.data || []);
      setModalOpen(true);
    } catch (err) { setError(getApiErrorMessage(err, "Impossible de charger l'historique des stages.")); }
    finally { setLoading(false); }
  };

  const actionLabel = (a: ActionType) => (a === "creer" ? "Créer" : a === "modifier" ? "Modifier" : a === "supprimer" ? "Supprimer" : "");

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleBack = () => { navigate("/administrateur"); };
  const handleHome = () => { navigate("/"); };

  return (
    <div className="admin-container">
      <button onClick={handleHome} className="admin-home-button" title="Retour à l'accueil">🏠</button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Entreprises</h1>
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

          <div className="admin-module-card">
            <h3>Entreprises</h3>
            <form onSubmit={handleSubmit} className="admin-mf-form">
              <select className="admin-mf-action-select" value={action} onChange={(e) => setAction(e.target.value as ActionType)} disabled={loading}>
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {action === "creer" && (
                <>
                  <input value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} placeholder="Nom entreprise *" disabled={loading} />
                  <input value={emailEntreprise} onChange={(e) => setEmailEntreprise(e.target.value)} placeholder="Email (optionnel)" disabled={loading} />
                  <input value={adresseEntreprise} onChange={(e) => setAdresseEntreprise(e.target.value)} placeholder="Adresse (optionnel)" disabled={loading} />
                </>
              )}

              {action === "modifier" && (
                <>
                  <select value={selectedEntrepriseId} onChange={(e) => handleSelectToEdit(e.target.value)} disabled={loading}>
                    <option value="">Sélectionner une entreprise</option>
                    {entreprises.map((e) => (<option key={e.idEntreprise} value={e.idEntreprise}>{e.nomEntreprise}</option>))}
                  </select>
                  <input value={editNom} onChange={(e) => setEditNom(e.target.value)} placeholder="Nom *" disabled={loading} />
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email (optionnel)" disabled={loading} />
                  <input value={editAdresse} onChange={(e) => setEditAdresse(e.target.value)} placeholder="Adresse (optionnel)" disabled={loading} />
                </>
              )}

              {action === "supprimer" && (
                <select value={deleteEntrepriseId} onChange={(e) => setDeleteEntrepriseId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner une entreprise</option>
                  {entreprises.map((e) => (<option key={e.idEntreprise} value={e.idEntreprise}>{e.nomEntreprise}</option>))}
                </select>
              )}

              {action && (
                <button type="submit" className={action === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"} disabled={loading}>
                  {actionLabel(action)}
                </button>
              )}
            </form>
          </div>

          <div className="admin-module-card">
            <h3>Historique des stages par entreprise</h3>
            <form className="admin-mf-form">
              <select onChange={(e) => e.target.value && handleViewStages(Number(e.target.value))} defaultValue="" disabled={loading}>
                <option value="">Sélectionner une entreprise</option>
                {entreprises.map((e) => (<option key={e.idEntreprise} value={e.idEntreprise}>{e.nomEntreprise}</option>))}
              </select>
            </form>
          </div>

        </div>
      </div>

      <StagesModal isOpen={modalOpen} apprenantName={selectedEntrepriseName} stages={selectedEntrepriseStages} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default EntrepriseManagement;
