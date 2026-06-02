import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCompaniesAPI, createCompanyAPI, updateCompanyAPI, deleteCompanyAPI } from "../../api/adminAPI";
import "../../css/Admin.css";

// EntrepriseDto : { idEntreprise, nomEntreprise, emailEntreprise, adresseEntreprise }
const EMPTY = { nomEntreprise: "", emailEntreprise: "", adresseEntreprise: "" };

const AdminCompanies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY);

  const notify = (msg: string, ok = true) => {
    if (ok) { setSuccess(msg); setError(null); } else { setError(msg); setSuccess(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const r = await getCompaniesAPI(); setCompanies(r.data); }
    catch (e: any) { setError(e.response?.data?.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) { await updateCompanyAPI(editing.idEntreprise, form); notify("✅ Entreprise modifiée"); }
      else { await createCompanyAPI(form); notify("✅ Entreprise créée avec succès"); }
      reset(); load();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleEdit = (c: any) => {
    setEditing(c); setForm({ nomEntreprise: c.nomEntreprise || "", emailEntreprise: c.emailEntreprise || "", adresseEntreprise: c.adresseEntreprise || "" });
    setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (c: any) => {
    if (!window.confirm(`Supprimer "${c.nomEntreprise}" ?`)) return;
    setLoading(true);
    try { await deleteCompanyAPI(c.idEntreprise); notify("✅ Entreprise supprimée"); load(); }
    catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  if (user?.role !== "admin") return (
    <div className="admin-error"><h2>❌ Accès refusé</h2>
      <button onClick={() => navigate("/")} className="admin-back-button">← Retour</button></div>
  );

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/administrateur")} className="admin-back-button">← Retour au tableau de bord</button>
      <div className="admin-page-header">
        <h1>🏢 Gestion des Entreprises</h1>
        <button onClick={() => { if (showForm && !editing) reset(); else { setEditing(null); setForm(EMPTY); setShowForm(true); } }} className="admin-action-btn">
          {showForm && !editing ? "❌ Fermer" : "➕ Ajouter une entreprise"}
        </button>
      </div>

      {error   && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-error-message" style={{ background: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}>{success}</div>}

      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>{editing ? `✏️ Modifier — ${editing.nomEntreprise}` : "➕ Nouvelle entreprise"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group"><label>Nom de l'entreprise *</label><input type="text" value={form.nomEntreprise} onChange={e => setForm({ ...form, nomEntreprise: e.target.value })} placeholder="Ex : TechCorp France" required /></div>
              <div className="form-group"><label>Email de contact</label><input type="email" value={form.emailEntreprise} onChange={e => setForm({ ...form, emailEntreprise: e.target.value })} placeholder="contact@entreprise.fr" /></div>
              <div className="form-group full-width"><label>Adresse</label><input type="text" value={form.adresseEntreprise} onChange={e => setForm({ ...form, adresseEntreprise: e.target.value })} placeholder="12 rue de la Paix, 75001 Paris" /></div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="admin-submit-button" disabled={loading}>{loading ? "⏳..." : editing ? "✏️ Enregistrer" : "➕ Créer"}</button>
              <button type="button" onClick={reset} style={{ padding: "12px 24px", border: "2px solid #e0e0e0", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-list-container">
        {loading && companies.length === 0 ? <p className="loading">⏳ Chargement...</p>
          : companies.length === 0 ? <p className="empty">Aucune entreprise trouvée</p>
          : (
            <div className="admin-table">
              <table>
                <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Adresse</th><th style={{ textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.idEntreprise}>
                      <td>#{c.idEntreprise}</td><td><strong>{c.nomEntreprise}</strong></td>
                      <td>{c.emailEntreprise || "—"}</td><td>{c.adresseEntreprise || "—"}</td>
                      <td className="actions">
                        <button onClick={() => handleEdit(c)} className="btn-edit" title="Modifier" disabled={loading}>✏️</button>
                        <button onClick={() => handleDelete(c)} className="btn-delete" title="Supprimer" disabled={loading}>🗑️</button>
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

export default AdminCompanies;
