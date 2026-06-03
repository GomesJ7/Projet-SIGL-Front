import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getModulesAPI, createModuleAPI, updateModuleAPI, deleteModuleAPI,
  affecterModuleEnseignantAPI, desaffecterModuleEnseignantAPI,
  getEnseignantsAPI,
} from "../../api/adminAPI";
import api from "../../api/axiosConfig";
import "../../css/Admin.css";

// ModuleDto : { idModule, codeModule, libelle, credits }
const EMPTY = { codeModule: "", libelle: "", credits: "" as any };

const AdminModules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY);
  // Affectation enseignant
  const [affModule, setAffModule] = useState<any | null>(null);
  const [affEns, setAffEns] = useState(0);
  const [moduleEns, setModuleEns] = useState<any[]>([]);

  const notify = (m: string, ok = true) => { ok ? (setSuccess(m), setError(null)) : (setError(m), setSuccess(null)); setTimeout(() => { setSuccess(null); setError(null); }, 4000); };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [mR, eR] = await Promise.all([getModulesAPI(), getEnseignantsAPI()]);
      setItems(mR.data); setEnseignants(eR.data);
    } catch (e: any) { setError(e.response?.data?.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const payload = { codeModule: form.codeModule, libelle: form.libelle, credits: form.credits ? parseInt(form.credits) : null };
    try {
      if (editing) { await updateModuleAPI(editing.idModule, payload); notify("✅ Module modifié"); }
      else { await createModuleAPI(payload); notify("✅ Module créé"); }
      reset(); load();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleEdit = (m: any) => { setEditing(m); setForm({ codeModule: m.codeModule || "", libelle: m.libelle || "", credits: m.credits ?? "" }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (m: any) => {
    if (!window.confirm(`Supprimer le module "${m.libelle}" ?`)) return;
    setLoading(true);
    try { await deleteModuleAPI(m.idModule); notify("✅ Module supprimé"); load(); }
    catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  // Charge la liste des enseignants affectés à ce module (endpoint by-enseignant inverse n'existe pas,
  // donc on liste via /modules/{id} si dispo. À défaut on affiche juste l'action d'affectation.)
  const openAffectation = async (m: any) => {
    setAffModule(m); setAffEns(0);
    try { const r = await api.get(`/modules/${m.idModule}`); setModuleEns(r.data?.enseignants || []); }
    catch { setModuleEns([]); }
  };

  const handleAffecter = async () => {
    if (!affModule || !affEns) return; setLoading(true);
    try {
      await affecterModuleEnseignantAPI(affModule.idModule, affEns);
      notify("✅ Enseignant affecté au module");
      try { const r = await api.get(`/modules/${affModule.idModule}`); setModuleEns(r.data?.enseignants || []); } catch { /* */ }
      setAffEns(0);
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleDesaffecter = async (idEnseignant: number) => {
    if (!affModule) return; setLoading(true);
    try {
      await desaffecterModuleEnseignantAPI(affModule.idModule, idEnseignant);
      notify("✅ Enseignant retiré du module");
      try { const r = await api.get(`/modules/${affModule.idModule}`); setModuleEns(r.data?.enseignants || []); } catch { /* */ }
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  if (user?.role !== "admin") return (
    <div className="admin-error"><h2>❌ Accès refusé</h2><button onClick={() => navigate("/")} className="admin-back-button">← Retour</button></div>
  );

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/administrateur")} className="admin-back-button">← Retour au tableau de bord</button>
      <div className="admin-page-header">
        <h1>📖 Gestion des Modules</h1>
        <button onClick={() => { if (showForm && !editing) reset(); else { setEditing(null); setForm(EMPTY); setShowForm(true); } }} className="admin-action-btn">
          {showForm && !editing ? "❌ Fermer" : "➕ Ajouter un module"}
        </button>
      </div>

      {error   && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-error-message" style={{ background: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}>{success}</div>}

      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>{editing ? `✏️ Modifier — ${editing.libelle}` : "➕ Nouveau module"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group"><label>Code module *</label><input type="text" value={form.codeModule} onChange={e => setForm({ ...form, codeModule: e.target.value })} placeholder="Ex : INFO101" required /></div>
              <div className="form-group"><label>Libellé *</label><input type="text" value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="Ex : Programmation Java" required /></div>
              <div className="form-group"><label>Crédits (ECTS)</label><input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} min="0" placeholder="Ex : 5" /></div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="admin-submit-button" disabled={loading}>{loading ? "⏳..." : editing ? "✏️ Enregistrer" : "➕ Créer"}</button>
              <button type="button" onClick={reset} style={{ padding: "12px 24px", border: "2px solid #e0e0e0", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {affModule && (
        <div className="admin-form-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: "#333" }}>👨‍🏫 Enseignants — {affModule.libelle}</h2>
            <button onClick={() => setAffModule(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✖</button>
          </div>
          {moduleEns.length > 0 && (
            <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {moduleEns.map((e: any) => (
                <span key={e.idUtilisateur} style={{ padding: "6px 12px", background: "#eef2ff", borderRadius: 20, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {e.prenom} {e.nom}
                  <button onClick={() => handleDesaffecter(e.idUtilisateur)} style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444", fontWeight: 700 }}>✖</button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Ajouter un enseignant</label>
              <select value={affEns} onChange={e => setAffEns(parseInt(e.target.value))}>
                <option value="0">-- Sélectionner --</option>
                {enseignants.map(e => <option key={e.idUtilisateur} value={e.idUtilisateur}>{e.prenom} {e.nom}</option>)}
              </select>
            </div>
            <button onClick={handleAffecter} className="admin-submit-button" disabled={loading || !affEns}>➕ Affecter</button>
          </div>
        </div>
      )}

      <div className="admin-list-container">
        {loading && items.length === 0 ? <p className="loading">⏳ Chargement...</p>
          : items.length === 0 ? <p className="empty">Aucun module trouvé</p>
          : (
            <div className="admin-table">
              <table>
                <thead><tr><th>ID</th><th>Code</th><th>Libellé</th><th>Crédits</th><th style={{ textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {items.map(m => (
                    <tr key={m.idModule}>
                      <td>#{m.idModule}</td><td><strong>{m.codeModule}</strong></td><td>{m.libelle}</td><td>{m.credits ?? "—"}</td>
                      <td className="actions">
                        <button onClick={() => openAffectation(m)} className="btn-edit" title="Affecter des enseignants" disabled={loading}>👨‍🏫</button>
                        <button onClick={() => handleEdit(m)} className="btn-edit" title="Modifier" disabled={loading}>✏️</button>
                        <button onClick={() => handleDelete(m)} className="btn-delete" title="Supprimer" disabled={loading}>🗑️</button>
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

export default AdminModules;
