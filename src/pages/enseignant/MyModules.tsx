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

const MyModules = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [modules, setModules] = useState<ModuleItem[]>([]);

  // Edit fields
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editLibelle, setEditLibelle] = useState("");
  const [editCredits, setEditCredits] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const res = await api.get(`/modules/by-enseignant/${user?.idUtilisateur || 0}`);
      setModules(res.data || []);
    } catch {
      setError("Impossible de charger vos modules.");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get(`/modules/by-enseignant/${user?.idUtilisateur || 0}`);
        setModules(res.data || []);
      } catch {
        setError("Impossible de charger vos modules.");
      }
    };
    void init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(""), 4000); return () => clearTimeout(t); } }, [message]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(""), 4000); return () => clearTimeout(t); } }, [error]);

  const resetFlash = () => { setMessage(""); setError(""); };

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr?.response?.status === 403) return "Action non autorisée.";
    return fallback;
  };

  const handleSelectToEdit = (id: string) => {
    setSelectedModuleId(id);
    const m = modules.find((mod) => String(mod.idModule) === id);
    if (m) {
      setEditCode(m.codeModule);
      setEditLibelle(m.libelle);
      setEditCredits(m.credits ? String(m.credits) : "");
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault(); resetFlash();
    if (!selectedModuleId) { setError("Sélectionnez un module à modifier."); return; }
    if (!editCode.trim() || !editLibelle.trim()) { setError("Le code et le libellé sont requis."); return; }
    setLoading(true);
    try {
      await api.put(`/modules/${selectedModuleId}`, {
        codeModule: editCode.trim(),
        libelle: editLibelle.trim(),
        credits: editCredits.trim() ? Number(editCredits) : null,
      });
      setMessage("Module modifié avec succès.");
      setSelectedModuleId(""); setEditCode(""); setEditLibelle(""); setEditCredits("");
      await loadData();
    } catch (err) { setError(getApiErrorMessage(err, "Échec de la modification.")); }
    finally { setLoading(false); }
  };


  const handleLogout = () => { logout(); navigate("/login"); };
  const handleBack = () => { navigate("/enseignant"); };

  return (
    <div className="admin-container">
      <button onClick={() => navigate('/')} className="admin-home-button" title="Retour à l'accueil">🏠</button>
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Mes Modules</h1>
          <div className="admin-mf-actions">
            <button onClick={handleBack} className="admin-mf-back-button">Retour</button>
            <button onClick={handleLogout} className="admin-logout-button">Déconnexion</button>
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
            <h3>Modifier mes modules</h3>
            {modules.length > 0 ? (
              <form onSubmit={handleUpdate} className="admin-mf-form">
                <label style={{ display: 'block', marginBottom: '8px' }}><strong>Sélectionner un module :</strong></label>
                <select value={selectedModuleId} onChange={(e) => handleSelectToEdit(e.target.value)} disabled={loading} style={{ marginBottom: '16px' }}>
                  <option value="">-- Choisir un module --</option>
                  {modules.map((m) => (<option key={m.idModule} value={m.idModule}>{m.codeModule} - {m.libelle}</option>))}
                </select>

                {selectedModuleId && (
                  <>
                    <label style={{ display: 'block', marginBottom: '4px' }}><strong>Code module :</strong></label>
                    <input value={editCode} onChange={(e) => setEditCode(e.target.value)} placeholder="Code module *" disabled={loading} style={{ marginBottom: '8px' }} />
                    <label style={{ display: 'block', marginBottom: '4px' }}><strong>Libellé :</strong></label>
                    <input value={editLibelle} onChange={(e) => setEditLibelle(e.target.value)} placeholder="Libellé *" disabled={loading} style={{ marginBottom: '8px' }} />
                    <label style={{ display: 'block', marginBottom: '4px' }}><strong>Crédits :</strong></label>
                    <input type="number" min="0" value={editCredits} onChange={(e) => setEditCredits(e.target.value)} placeholder="Crédits (optionnel)" disabled={loading} style={{ marginBottom: '16px' }} />
                    <button type="submit" className="admin-module-button" disabled={loading}>
                      Enregistrer les modifications
                    </button>
                  </>
                )}
              </form>
            ) : <p>Aucun module affecté à votre compte.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyModules;

