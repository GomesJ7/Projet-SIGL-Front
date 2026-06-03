import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPromotionsAPI, createPromotionAPI, updatePromotionAPI, deletePromotionAPI } from "../../api/adminAPI";
import "../../css/Admin.css";

// PromotionDto : { idPromotion, nomPromotion, annee }
const EMPTY = { nomPromotion: "", annee: new Date().getFullYear() as any };

const AdminPromotions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY);

  const notify = (m: string, ok = true) => { ok ? (setSuccess(m), setError(null)) : (setError(m), setSuccess(null)); setTimeout(() => { setSuccess(null); setError(null); }, 4000); };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const r = await getPromotionsAPI(); setItems(r.data); }
    catch (e: any) { setError(e.response?.data?.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const payload = { nomPromotion: form.nomPromotion, annee: parseInt(form.annee) };
    try {
      if (editing) { await updatePromotionAPI(editing.idPromotion, payload); notify("✅ Promotion modifiée"); }
      else { await createPromotionAPI(payload); notify("✅ Promotion créée"); }
      reset(); load();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleEdit = (p: any) => { setEditing(p); setForm({ nomPromotion: p.nomPromotion, annee: p.annee }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleDelete = async (p: any) => {
    if (!window.confirm(`Supprimer la promotion "${p.nomPromotion}" ?`)) return;
    setLoading(true);
    try { await deletePromotionAPI(p.idPromotion); notify("✅ Promotion supprimée"); load(); }
    catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
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
        <h1>🎓 Gestion des Promotions</h1>
        <button onClick={() => { if (showForm && !editing) reset(); else { setEditing(null); setForm(EMPTY); setShowForm(true); } }} className="admin-action-btn">
          {showForm && !editing ? "❌ Fermer" : "➕ Ajouter une promotion"}
        </button>
      </div>

      {error   && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-error-message" style={{ background: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}>{success}</div>}

      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>{editing ? `✏️ Modifier — ${editing.nomPromotion}` : "➕ Nouvelle promotion"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group"><label>Nom de la promotion *</label><input type="text" value={form.nomPromotion} onChange={e => setForm({ ...form, nomPromotion: e.target.value })} placeholder="Ex : Promo 2025" required /></div>
              <div className="form-group"><label>Année *</label><input type="number" value={form.annee} onChange={e => setForm({ ...form, annee: e.target.value })} min="2000" max="2100" required /></div>
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
          : items.length === 0 ? <p className="empty">Aucune promotion trouvée</p>
          : (
            <div className="admin-table">
              <table>
                <thead><tr><th>ID</th><th>Nom</th><th>Année</th><th style={{ textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {items.map(p => (
                    <tr key={p.idPromotion}>
                      <td>#{p.idPromotion}</td><td><strong>{p.nomPromotion}</strong></td><td>{p.annee}</td>
                      <td className="actions">
                        <button onClick={() => handleEdit(p)} className="btn-edit" title="Modifier" disabled={loading}>✏️</button>
                        <button onClick={() => handleDelete(p)} className="btn-delete" title="Supprimer" disabled={loading}>🗑️</button>
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

export default AdminPromotions;
