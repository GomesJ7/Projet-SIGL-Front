import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDefensesAPI, createDefenseAPI, updateDefenseAPI, deleteDefenseAPI, getStagesAPI } from "../../api/adminAPI";
import "../../css/Admin.css";

// SoutenanceDto backend : { idSoutenance, dateSoutenance (LocalDateTime), noteFinale, idStage }
const EMPTY = { dateSoutenance: "", noteFinale: "", idStage: 0 };

const AdminDefenses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [defenses, setDefenses]   = useState<any[]>([]);
  const [stages, setStages]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<any | null>(null);
  const [form, setForm]           = useState(EMPTY);

  const notify = (msg: string, ok = true) => {
    if (ok) { setSuccess(msg); setError(null); } else { setError(msg); setSuccess(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [dR, sR] = await Promise.all([getDefensesAPI(), getStagesAPI()]);
      setDefenses(dR.data); setStages(sR.data);
    } catch (e: any) { setError(e.response?.data?.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    // dateSoutenance doit être au format ISO LocalDateTime : "2025-06-15T10:00:00"
    const payload = {
      dateSoutenance: form.dateSoutenance ? form.dateSoutenance + ":00" : null,
      noteFinale: form.noteFinale !== "" ? parseFloat(form.noteFinale) : null,
      idStage: form.idStage || null,
    };
    try {
      if (editing) {
        await updateDefenseAPI(editing.idSoutenance, payload);
        notify("✅ Soutenance modifiée");
      } else {
        await createDefenseAPI(payload);
        notify("✅ Soutenance planifiée avec succès");
      }
      reset(); load();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleEdit = (d: any) => {
    setEditing(d);
    setForm({
      dateSoutenance: d.dateSoutenance ? d.dateSoutenance.slice(0, 16) : "",
      noteFinale: d.noteFinale != null ? String(d.noteFinale) : "",
      idStage: d.idStage || 0,
    });
    setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (d: any) => {
    if (!window.confirm(`Supprimer la soutenance du ${d.dateSoutenance?.slice(0, 10)} ?`)) return;
    setLoading(true);
    try { await deleteDefenseAPI(d.idSoutenance); notify("✅ Soutenance supprimée"); load(); }
    catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  const stageLabel = (idStage: number) => {
    const s = stages.find(st => st.idStage === idStage);
    return s ? `#${s.idStage} — ${s.poste}` : `Stage #${idStage}`;
  };

  if (user?.role !== "admin") return (
    <div className="admin-error">
      <h2>❌ Accès refusé</h2>
      <button onClick={() => navigate("/")} className="admin-back-button">← Retour</button>
    </div>
  );

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/")} className="admin-back-button">← Retour à l'accueil</button>

      <div className="admin-page-header">
        <h1>🎓 Gestion des Soutenances</h1>
        <button onClick={() => { if (showForm && !editing) reset(); else { setEditing(null); setForm(EMPTY); setShowForm(true); } }} className="admin-action-btn">
          {showForm && !editing ? "❌ Fermer" : "➕ Planifier une soutenance"}
        </button>
      </div>

      {error   && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-error-message" style={{ background: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}>{success}</div>}

      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>{editing ? "✏️ Modifier la soutenance" : "➕ Planifier une soutenance"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Stage *</label>
                <select value={form.idStage} onChange={e => setForm({ ...form, idStage: parseInt(e.target.value) })} required>
                  <option value="0">-- Sélectionner un stage --</option>
                  {stages.map(s => <option key={s.idStage} value={s.idStage}>{stageLabel(s.idStage)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date et heure *</label>
                <input type="datetime-local" value={form.dateSoutenance} onChange={e => setForm({ ...form, dateSoutenance: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Note finale (0–20)</label>
                <input type="number" value={form.noteFinale} onChange={e => setForm({ ...form, noteFinale: e.target.value })} min="0" max="20" step="0.5" placeholder="Ex : 15.5" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="admin-submit-button" disabled={loading}>{loading ? "⏳..." : editing ? "✏️ Enregistrer" : "➕ Planifier"}</button>
              <button type="button" onClick={reset} style={{ padding: "12px 24px", border: "2px solid #e0e0e0", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-list-container">
        {loading && defenses.length === 0 ? <p className="loading">⏳ Chargement...</p>
          : defenses.length === 0 ? <p className="empty">Aucune soutenance planifiée</p>
          : (
            <div className="admin-table">
              <table>
                <thead><tr><th>ID</th><th>Stage</th><th>Date & Heure</th><th>Note finale</th><th style={{ textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {defenses.map(d => (
                    <tr key={d.idSoutenance}>
                      <td>#{d.idSoutenance}</td>
                      <td>{stageLabel(d.idStage)}</td>
                      <td>{d.dateSoutenance ? new Date(d.dateSoutenance).toLocaleString("fr-FR") : "—"}</td>
                      <td>
                        {d.noteFinale != null
                          ? <span style={{ fontWeight: 700, color: d.noteFinale >= 10 ? "#10b981" : "#ef4444" }}>{d.noteFinale}/20</span>
                          : <span style={{ color: "#aaa" }}>Non notée</span>}
                      </td>
                      <td className="actions">
                        <button onClick={() => handleEdit(d)} className="btn-edit" title="Modifier" disabled={loading}>✏️</button>
                        <button onClick={() => handleDelete(d)} className="btn-delete" title="Supprimer" disabled={loading}>🗑️</button>
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

export default AdminDefenses;
