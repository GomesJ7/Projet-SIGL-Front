import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getApprenantsAPI, getEnseignantsAPI, getAdminsAPI,
  createUserAPI,
  updateApprenantAPI, updateEnseignantAPI, updateAdminAPI,
  deleteApprenantAPI, deleteEnseignantAPI, deleteAdminAPI,
  getPromotionsAPI, getFilieresAPI,
  affecterPromotionAPI, affecterFiliereAPI,
} from "../../api/adminAPI";
import "../../css/Admin.css";

type RoleType = "APPRENANT" | "ENSEIGNANT" | "ADMIN";
interface UserRow {
  idUtilisateur: number; nom: string; prenom: string; email: string; role: RoleType;
  matricule?: string; niveau?: string; specialite?: string; grade?: string;
  idPromotion?: number; nomPromotion?: string; idFiliere?: number; nomFiliere?: string;
}

const ROLE_LABELS: Record<RoleType, string> = { APPRENANT: "🎓 Apprenant", ENSEIGNANT: "👨‍🏫 Enseignant", ADMIN: "👨‍💼 Administrateur" };
const ROLE_COLORS: Record<string, string> = { ALL: "#667eea", APPRENANT: "#f59e0b", ENSEIGNANT: "#10b981", ADMIN: "#667eea" };
const EMPTY = { nom: "", prenom: "", email: "", motDePasse: "", role: "APPRENANT" as RoleType };

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<UserRow | null>(null);
  const [form, setForm]         = useState(EMPTY);
  const [filter, setFilter]     = useState<string>("ALL");
  // Affectation académique (apprenant)
  const [affRow, setAffRow]     = useState<UserRow | null>(null);
  const [affPromo, setAffPromo] = useState(0);
  const [affFil, setAffFil]     = useState(0);

  const notify = (msg: string, ok = true) => {
    if (ok) { setSuccess(msg); setError(null); } else { setError(msg); setSuccess(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [rA, rE, rAd, rP, rF] = await Promise.all([
        getApprenantsAPI(), getEnseignantsAPI(), getAdminsAPI(),
        getPromotionsAPI(), getFilieresAPI(),
      ]);
      const norm = (list: any[], role: RoleType): UserRow[] =>
        list.map((u: any) => ({ ...u, role }));
      setUsers([...norm(rA.data, "APPRENANT"), ...norm(rE.data, "ENSEIGNANT"), ...norm(rAd.data, "ADMIN")]);
      setPromotions(rP.data); setFilieres(rF.data);
    } catch (e: any) { setError(e.response?.data?.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) {
        const payload = { nom: form.nom, prenom: form.prenom, email: form.email, role: editing.role, ...(form.motDePasse ? { motDePasse: form.motDePasse } : {}) };
        if (editing.role === "APPRENANT") await updateApprenantAPI(editing.idUtilisateur, payload);
        else if (editing.role === "ENSEIGNANT") await updateEnseignantAPI(editing.idUtilisateur, payload);
        else await updateAdminAPI(editing.idUtilisateur, payload);
        notify(`✅ ${editing.prenom} ${editing.nom} modifié`);
      } else {
        await createUserAPI({ nom: form.nom, prenom: form.prenom, email: form.email, motDePasse: form.motDePasse, role: form.role });
        notify("✅ Utilisateur créé avec succès");
      }
      reset(); loadUsers();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || e.response?.data?.error || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleDelete = async (row: UserRow) => {
    if (!window.confirm(`Supprimer ${row.prenom} ${row.nom} ?`)) return;
    setLoading(true);
    try {
      if (row.role === "APPRENANT") await deleteApprenantAPI(row.idUtilisateur);
      else if (row.role === "ENSEIGNANT") await deleteEnseignantAPI(row.idUtilisateur);
      else await deleteAdminAPI(row.idUtilisateur);
      notify(`✅ ${row.prenom} ${row.nom} supprimé`); loadUsers();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur suppression"), false); }
    finally { setLoading(false); }
  };

  const handleEdit = (row: UserRow) => {
    setEditing(row); setForm({ nom: row.nom, prenom: row.prenom, email: row.email, motDePasse: "", role: row.role });
    setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAffectation = (row: UserRow) => {
    setAffRow(row); setAffPromo(row.idPromotion || 0); setAffFil(row.idFiliere || 0);
  };

  const handleAffecter = async () => {
    if (!affRow) return; setLoading(true);
    try {
      if (affPromo) await affecterPromotionAPI(affRow.idUtilisateur, affPromo);
      if (affFil)   await affecterFiliereAPI(affRow.idUtilisateur, affFil);
      notify(`✅ Affectation de ${affRow.prenom} ${affRow.nom} mise à jour`);
      setAffRow(null); loadUsers();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur affectation"), false); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  const visible = filter === "ALL" ? users : users.filter(u => u.role === filter);
  const counts = { ALL: users.length, APPRENANT: users.filter(u => u.role === "APPRENANT").length, ENSEIGNANT: users.filter(u => u.role === "ENSEIGNANT").length, ADMIN: users.filter(u => u.role === "ADMIN").length };

  if (user?.role !== "admin") return (
    <div className="admin-error"><h2>❌ Accès refusé</h2>
      <button onClick={() => navigate("/")} className="admin-back-button">← Retour</button></div>
  );

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/administrateur")} className="admin-back-button">← Retour au tableau de bord</button>

      <div className="admin-page-header">
        <h1>👥 Gestion des Utilisateurs</h1>
        <button onClick={() => { if (showForm && !editing) reset(); else { setEditing(null); setForm(EMPTY); setShowForm(true); } }} className="admin-action-btn">
          {showForm && !editing ? "❌ Fermer" : "➕ Nouvel utilisateur"}
        </button>
      </div>

      {error   && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-error-message" style={{ background: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}>{success}</div>}

      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>
            {editing ? `✏️ Modifier — ${editing.prenom} ${editing.nom} (${editing.role})` : "➕ Créer un utilisateur"}
          </h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group"><label>Prénom *</label><input type="text" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required /></div>
              <div className="form-group"><label>Nom *</label><input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required /></div>
              <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-group">
                <label>Mot de passe {editing ? "(vide = inchangé)" : "*"}</label>
                <input type="password" value={form.motDePasse} onChange={e => setForm({ ...form, motDePasse: e.target.value })} required={!editing} minLength={6} />
              </div>
              {!editing && (
                <div className="form-group">
                  <label>Rôle *</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as RoleType })}>
                    <option value="APPRENANT">🎓 Apprenant</option>
                    <option value="ENSEIGNANT">👨‍🏫 Enseignant</option>
                    <option value="ADMIN">👨‍💼 Administrateur</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="admin-submit-button" disabled={loading}>{loading ? "⏳..." : editing ? "✏️ Enregistrer" : "➕ Créer"}</button>
              <button type="button" onClick={reset} style={{ padding: "12px 24px", border: "2px solid #e0e0e0", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Panneau affectation académique */}
      {affRow && (
        <div className="admin-form-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: "#333" }}>🎓 Affectation — {affRow.prenom} {affRow.nom}</h2>
            <button onClick={() => setAffRow(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✖</button>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Promotion</label>
              <select value={affPromo} onChange={e => setAffPromo(parseInt(e.target.value))}>
                <option value="0">-- Aucune --</option>
                {promotions.map(p => <option key={p.idPromotion} value={p.idPromotion}>{p.nomPromotion} ({p.annee})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Filière</label>
              <select value={affFil} onChange={e => setAffFil(parseInt(e.target.value))}>
                <option value="0">-- Aucune --</option>
                {filieres.map(f => <option key={f.idFiliere} value={f.idFiliere}>{f.nomFiliere}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleAffecter} className="admin-submit-button" disabled={loading}>🎓 Enregistrer l'affectation</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {["ALL", "APPRENANT", "ENSEIGNANT", "ADMIN"].map(r => {
          const active = filter === r; const color = ROLE_COLORS[r];
          const label = r === "ALL" ? `Tous (${counts.ALL})` : r === "APPRENANT" ? `🎓 Apprenants (${counts.APPRENANT})` : r === "ENSEIGNANT" ? `👨‍🏫 Enseignants (${counts.ENSEIGNANT})` : `👨‍💼 Admins (${counts.ADMIN})`;
          return <button key={r} onClick={() => setFilter(r)} style={{ padding: "8px 16px", borderRadius: 20, border: `2px solid ${active ? color : "#e0e0e0"}`, cursor: "pointer", fontWeight: 600, fontSize: 13, background: active ? color : "white", color: active ? "white" : "#555" }}>{label}</button>;
        })}
      </div>

      <div className="admin-list-container">
        {loading && users.length === 0 ? <p className="loading">⏳ Chargement...</p>
          : visible.length === 0 ? <p className="empty">Aucun utilisateur trouvé</p>
          : (
            <div className="admin-table">
              <table>
                <thead><tr><th>ID</th><th>Prénom</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Détails</th><th style={{ textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {visible.map(u => (
                    <tr key={`${u.role}-${u.idUtilisateur}`}>
                      <td>#{u.idUtilisateur}</td><td>{u.prenom}</td><td>{u.nom}</td><td>{u.email}</td>
                      <td><span className={`role-badge role-${u.role.toLowerCase()}`}>{ROLE_LABELS[u.role]}</span></td>
                      <td style={{ fontSize: 12, color: "#777" }}>
                        {u.role === "APPRENANT" && <>{u.matricule || "—"}{u.nomPromotion ? ` · ${u.nomPromotion}` : ""}{u.nomFiliere ? ` · ${u.nomFiliere}` : ""}</>}
                        {u.role === "ENSEIGNANT" && <>{u.specialite || "—"}{u.grade ? ` · ${u.grade}` : ""}</>}
                        {u.role === "ADMIN" && "—"}
                      </td>
                      <td className="actions">
                        {u.role === "APPRENANT" && <button onClick={() => openAffectation(u)} className="btn-edit" title="Affecter promotion/filière" disabled={loading}>🎓</button>}
                        <button onClick={() => handleEdit(u)} className="btn-edit" title="Modifier" disabled={loading}>✏️</button>
                        <button onClick={() => handleDelete(u)} className="btn-delete" title="Supprimer" disabled={loading}>🗑️</button>
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

export default AdminUsers;
