import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getJuriesAPI, createJuryAPI, updateJuryAPI, deleteJuryAPI,
  getJuryEnseignantsAPI, affecterJuryEnseignantAPI, desaffecterJuryEnseignantAPI,
  getEnseignantsAPI,
} from "../../api/adminAPI";
import "../../css/Admin.css";

// JuryDto : { idJury, nomJury }
// JuryEnseignantDto : { idJury, nomJury, idEnseignant, nomEnseignant, prenomEnseignant, roleJury }
const AdminJuries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [nomJury, setNomJury] = useState("");
  // Affectation enseignant
  const [affJury, setAffJury] = useState<any | null>(null);
  const [affEns, setAffEns] = useState(0);
  const [affRole, setAffRole] = useState("MEMBRE");
  const [juryEns, setJuryEns] = useState<any[]>([]);

  const notify = (m: string, ok = true) => { ok ? (setSuccess(m), setError(null)) : (setError(m), setSuccess(null)); setTimeout(() => { setSuccess(null); setError(null); }, 4000); };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [jR, eR] = await Promise.all([getJuriesAPI(), getEnseignantsAPI()]);
      setItems(jR.data); setEnseignants(eR.data);
    } catch (e: any) { setError(e.response?.data?.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) { await updateJuryAPI(editing.idJury, { nomJury }); notify("✅ Jury modifié"); }
      else { await createJuryAPI({ nomJury }); notify("✅ Jury créé"); }
      reset(); load();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleEdit = (j: any) => { setEditing(j); setNomJury(j.nomJury); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (j: any) => {
    if (!window.confirm(`Supprimer le jury "${j.nomJury}" ?`)) return;
    setLoading(true);
    try { await deleteJuryAPI(j.idJury); notify("✅ Jury supprimé"); load(); }
    catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const openAffectation = async (j: any) => {
    setAffJury(j); setAffEns(0); setAffRole("MEMBRE");
    try { const r = await getJuryEnseignantsAPI(j.idJury); setJuryEns(r.data); } catch { setJuryEns([]); }
  };

  const refreshJuryEns = async (idJury: number) => {
    try { const r = await getJuryEnseignantsAPI(idJury); setJuryEns(r.data); } catch { /* */ }
  };

  const handleAffecter = async () => {
    if (!affJury || !affEns) return; setLoading(true);
    try {
      await affecterJuryEnseignantAPI(affJury.idJury, affEns, affRole);
      notify("✅ Enseignant affecté au jury");
      await refreshJuryEns(affJury.idJury); setAffEns(0);
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleDesaffecter = async (idEnseignant: number) => {
    if (!affJury) return; setLoading(true);
    try {
      await desaffecterJuryEnseignantAPI(affJury.idJury, idEnseignant);
      notify("✅ Enseignant retiré du jury");
      await refreshJuryEns(affJury.idJury);
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const reset = () => { setNomJury(""); setEditing(null); setShowForm(false); };

  if (user?.role !== "ADMIN") return (
    <div className="admin-error"><h2>❌ Accès refusé</h2><button onClick={() => navigate("/")} className="admin-back-button">← Retour</button></div>
  );

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/administrateur")} className="admin-back-button">← Retour au tableau de bord</button>
      <div className="admin-page-header">
        <h1>👨‍⚖️ Gestion des Jurys</h1>
        <button onClick={() => { if (showForm && !editing) reset(); else { setEditing(null); setNomJury(""); setShowForm(true); } }} className="admin-action-btn">
          {showForm && !editing ? "❌ Fermer" : "➕ Ajouter un jury"}
        </button>
      </div>

      {error   && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-error-message" style={{ background: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}>{success}</div>}

      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>{editing ? `✏️ Modifier — ${editing.nomJury}` : "➕ Nouveau jury"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group full-width"><label>Nom du jury *</label><input type="text" value={nomJury} onChange={e => setNomJury(e.target.value)} placeholder="Ex : Jury Soutenances Session 1" required /></div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="admin-submit-button" disabled={loading}>{loading ? "⏳..." : editing ? "✏️ Enregistrer" : "➕ Créer"}</button>
              <button type="button" onClick={reset} style={{ padding: "12px 24px", border: "2px solid #e0e0e0", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {affJury && (
        <div className="admin-form-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: "#333" }}>👨‍🏫 Membres — {affJury.nomJury}</h2>
            <button onClick={() => setAffJury(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✖</button>
          </div>
          {juryEns.length > 0 && (
            <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {juryEns.map((e: any) => (
                <span key={e.idEnseignant} style={{ padding: "6px 12px", background: "#eef2ff", borderRadius: 20, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {e.prenomEnseignant} {e.nomEnseignant}{e.roleJury ? ` · ${e.roleJury}` : ""}
                  <button onClick={() => handleDesaffecter(e.idEnseignant)} style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontWeight: 700 }}>✖</button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
              <label>Enseignant</label>
              <select value={affEns} onChange={e => setAffEns(parseInt(e.target.value))}>
                <option value="0">-- Sélectionner --</option>
                {enseignants.map(e => <option key={e.idUtilisateur} value={e.idUtilisateur}>{e.prenom} {e.nom}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 160 }}>
              <label>Rôle dans le jury</label>
              <select value={affRole} onChange={e => setAffRole(e.target.value)}>
                <option value="PRESIDENT">Président</option>
                <option value="MEMBRE">Membre</option>
                <option value="RAPPORTEUR">Rapporteur</option>
              </select>
            </div>
            <button onClick={handleAffecter} className="admin-submit-button" disabled={loading || !affEns}>➕ Affecter</button>
          </div>
        </div>
      )}

      <div className="admin-list-container">
        {loading && items.length === 0 ? <p className="loading">⏳ Chargement...</p>
          : items.length === 0 ? <p className="empty">Aucun jury trouvé</p>
          : (
            <div className="admin-table">
              <table>
                <thead><tr><th>ID</th><th>Nom du jury</th><th style={{ textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {items.map(j => (
                    <tr key={j.idJury}>
                      <td>#{j.idJury}</td><td><strong>{j.nomJury}</strong></td>
                      <td className="actions">
                        <button onClick={() => openAffectation(j)} className="btn-edit" title="Gérer les membres" disabled={loading}>👨‍🏫</button>
                        <button onClick={() => handleEdit(j)} className="btn-edit" title="Modifier" disabled={loading}>✏️</button>
                        <button onClick={() => handleDelete(j)} className="btn-delete" title="Supprimer" disabled={loading}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminJuries;
