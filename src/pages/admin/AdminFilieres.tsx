import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getFilieresAPI, createFiliereAPI, updateFiliereAPI, deleteFiliereAPI } from "../../api/adminAPI";
import "../../css/Admin.css";

// FiliereDto : { idFiliere, nomFiliere }
const AdminFilieres = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [nomFiliere, setNomFiliere] = useState("");

  const notify = (m: string, ok = true) => { ok ? (setSuccess(m), setError(null)) : (setError(m), setSuccess(null)); setTimeout(() => { setSuccess(null); setError(null); }, 4000); };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const r = await getFilieresAPI(); setItems(r.data); }
    catch (e: any) { setError(e.response?.data?.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) { await updateFiliereAPI(editing.idFiliere, { nomFiliere }); notify("✅ Filière modifiée"); }
      else { await createFiliereAPI({ nomFiliere }); notify("✅ Filière créée"); }
      reset(); load();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleEdit = (f: any) => { setEditing(f); setNomFiliere(f.nomFiliere); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (f: any) => {
    if (!window.confirm(`Supprimer la filière "${f.nomFiliere}" ?`)) return;
    setLoading(true);
    try { await deleteFiliereAPI(f.idFiliere); notify("✅ Filière supprimée"); load(); }
    catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };
  const reset = () => { setNomFiliere(""); setEditing(null); setShowForm(false); };

  if (user?.role !== "admin") return (
    <div className="admin-error"><h2>❌ Accès refusé</h2><button onClick={() => navigate("/")} className="admin-back-button">← Retour</button></div>
  );

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/administrateur")} className="admin-back-button">← Retour au tableau de bord</button>
      <div className="admin-page-header">
        <h1>📚 Gestion des Filières</h1>
        <button onClick={() => { if (showForm && !editing) reset(); else { setEditing(null); setNomFiliere(""); setShowForm(true); } }} className="admin-action-btn">
          {showForm && !editing ? "❌ Fermer" : "➕ Ajouter une filière"}
        </button>
      </div>

      {error   && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-error-message" style={{ background: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}>{success}</div>}

      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>{editing ? `✏️ Modifier — ${editing.nomFiliere}` : "➕ Nouvelle filière"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group full-width"><label>Nom de la filière *</label><input type="text" value={nomFiliere} onChange={e => setNomFiliere(e.target.value)} placeholder="Ex : Génie Informatique" required /></div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="admin-submit-button" disabled={loading}>{loading ? "⏳..." : editing ? "✏️ Enregistrer" : "➕ Créer"}</button>
              <button type="button" onClick={reset} style={{ padding: "12px 24px", border: "2px solid #e0e0e0", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-list-container">
        {loading && items.length === 0 ? <p className="loading">⏳ Chargement...</p>
          : items.length === 0 ? <p className="empty">Aucune filière trouvée</p>
          : (
            <div className="admin-table">
              <table>
                <thead><tr><th>ID</th><th>Nom de la filière</th><th style={{ textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {items.map(f => (
                    <tr key={f.idFiliere}>
                      <td>#{f.idFiliere}</td><td><strong>{f.nomFiliere}</strong></td>
                      <td className="actions">
                        <button onClick={() => handleEdit(f)} className="btn-edit" title="Modifier" disabled={loading}>✏️</button>
                        <button onClick={() => handleDelete(f)} className="btn-delete" title="Supprimer" disabled={loading}>🗑️</button>
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

export default AdminFilieres;
