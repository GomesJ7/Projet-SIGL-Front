import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getStagesAPI, createStageAPI, updateStageAPI, deleteStageAPI,
  changerEtatStageAPI, affecterStageAPI, getAffectationsAPI,
  getCompaniesAPI, getApprenantsAPI, getEnseignantsAPI,
} from "../../api/adminAPI";
import "../../css/Admin.css";

// StageDto : { idStage, poste, objectif, dateDebut, dateFin, dureeSemaines, etat, idEntreprise, nomEntreprise }
const ETATS = ["EN_COURS", "TERMINE", "VALIDE", "REFUSE"] as const;
type EtatType = typeof ETATS[number];
const EMPTY = { poste: "", objectif: "", dateDebut: "", dateFin: "", dureeSemaines: "" as any, etat: "EN_COURS" as EtatType, idEntreprise: 0 };
const EMPTY_AFF = { idApprenant: 0, idEnseignant: 0 };
const etatColor: Record<string, string> = { EN_COURS: "#60a5fa", TERMINE: "#10b981", VALIDE: "#667eea", REFUSE: "#ef4444" };

const AdminStages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stages, setStages] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [apprenants, setApprenants] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [affStageId, setAffStageId] = useState<number | null>(null);
  const [affForm, setAffForm] = useState(EMPTY_AFF);
  const [affectations, setAffectations] = useState<any[]>([]);

  const notify = (msg: string, ok = true) => {
    if (ok) { setSuccess(msg); setError(null); } else { setError(msg); setSuccess(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [sR, cR, aR, eR] = await Promise.all([getStagesAPI(), getCompaniesAPI(), getApprenantsAPI(), getEnseignantsAPI()]);
      setStages(sR.data); setCompanies(cR.data); setApprenants(aR.data); setEnseignants(eR.data);
    } catch (e: any) { setError(e.response?.data?.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const payload = {
      poste: form.poste, objectif: form.objectif,
      dateDebut: form.dateDebut || null, dateFin: form.dateFin || null,
      dureeSemaines: form.dureeSemaines ? parseInt(form.dureeSemaines) : null,
      etat: form.etat, idEntreprise: form.idEntreprise || null,
    };
    try {
      if (editing) { await updateStageAPI(editing.idStage, payload); notify("✅ Stage modifié"); }
      else { await createStageAPI(payload); notify("✅ Stage créé avec succès"); }
      reset(); load();
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleEdit = (s: any) => {
    setEditing(s);
    setForm({ poste: s.poste || "", objectif: s.objectif || "", dateDebut: s.dateDebut || "", dateFin: s.dateFin || "", dureeSemaines: s.dureeSemaines ?? "", etat: s.etat || "EN_COURS", idEntreprise: s.idEntreprise || 0 });
    setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (s: any) => {
    if (!window.confirm(`Supprimer le stage "${s.poste}" ?`)) return;
    setLoading(true);
    try { await deleteStageAPI(s.idStage); notify("✅ Stage supprimé"); load(); }
    catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur"), false); }
    finally { setLoading(false); }
  };

  const handleChangerEtat = async (s: any, etat: string) => {
    setLoading(true);
    try { await changerEtatStageAPI(s.idStage, etat); notify(`✅ État → ${etat}`); load(); }
    catch (e: any) { notify("❌ " + (e.response?.data?.message || "Transition invalide"), false); }
    finally { setLoading(false); }
  };

  const openAffectation = async (s: any) => {
    setAffStageId(s.idStage); setAffForm(EMPTY_AFF);
    try { const r = await getAffectationsAPI(s.idStage); setAffectations(r.data); } catch { setAffectations([]); }
  };

  const nameOf = (list: any[], id: number) => {
    const u = list.find(x => x.idUtilisateur === id);
    return u ? `${u.prenom} ${u.nom}` : `#${id}`;
  };

  const handleAffecter = async (e: React.FormEvent) => {
    e.preventDefault(); if (!affStageId) return; setLoading(true);
    try {
      await affecterStageAPI({ idStage: affStageId, idApprenant: affForm.idApprenant, idEnseignant: affForm.idEnseignant });
      notify("✅ Affectation enregistrée");
      const r = await getAffectationsAPI(affStageId); setAffectations(r.data);
    } catch (e: any) { notify("❌ " + (e.response?.data?.message || "Erreur affectation"), false); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm(EMPTY); setEditing(null); setShowForm(false); };

  if (user?.role !== "ADMIN") return (
    <div className="admin-error"><h2>❌ Accès refusé</h2>
      <button onClick={() => navigate("/")} className="admin-back-button">← Retour</button></div>
  );

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/administrateur")} className="admin-back-button">← Retour au tableau de bord</button>
      <div className="admin-page-header">
        <h1>💼 Gestion des Stages</h1>
        <button onClick={() => { if (showForm && !editing) reset(); else { setEditing(null); setForm(EMPTY); setShowForm(true); } }} className="admin-action-btn">
          {showForm && !editing ? "❌ Fermer" : "➕ Créer un stage"}
        </button>
      </div>

      {error   && <div className="admin-error-message">{error}</div>}
      {success && <div className="admin-error-message" style={{ background: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}>{success}</div>}

      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>{editing ? `✏️ Modifier — ${editing.poste}` : "➕ Nouveau stage"}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group"><label>Poste *</label><input type="text" value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value })} placeholder="Ex : Développeur Full Stack" required /></div>
              <div className="form-group">
                <label>Entreprise *</label>
                <select value={form.idEntreprise} onChange={e => setForm({ ...form, idEntreprise: parseInt(e.target.value) })} required>
                  <option value="0">-- Sélectionner --</option>
                  {companies.map(c => <option key={c.idEntreprise} value={c.idEntreprise}>{c.nomEntreprise}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Date de début *</label><input type="date" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} required /></div>
              <div className="form-group"><label>Date de fin</label><input type="date" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })} /></div>
              <div className="form-group"><label>Durée (semaines)</label><input type="number" value={form.dureeSemaines} onChange={e => setForm({ ...form, dureeSemaines: e.target.value })} min="1" placeholder="Ex : 12" /></div>
              <div className="form-group">
                <label>État</label>
                <select value={form.etat} onChange={e => setForm({ ...form, etat: e.target.value as EtatType })}>
                  {ETATS.map(et => <option key={et} value={et}>{et.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="form-group full-width"><label>Objectif</label><textarea value={form.objectif} onChange={e => setForm({ ...form, objectif: e.target.value })} rows={3} placeholder="Description des objectifs du stage" /></div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="admin-submit-button" disabled={loading}>{loading ? "⏳..." : editing ? "✏️ Enregistrer" : "➕ Créer"}</button>
              <button type="button" onClick={reset} style={{ padding: "12px 24px", border: "2px solid #e0e0e0", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {affStageId !== null && (
        <div className="admin-form-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: "#333" }}>👥 Affectation — Stage #{affStageId}</h2>
            <button onClick={() => setAffStageId(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✖</button>
          </div>
          {affectations.length > 0 && (
            <div style={{ marginBottom: 16, padding: 12, background: "#f8f9fa", borderRadius: 8 }}>
              <strong>Affectations actuelles :</strong>
              {affectations.map((a, i) => <div key={i} style={{ fontSize: 13, color: "#555", marginTop: 4 }}>🎓 {nameOf(apprenants, a.idApprenant)} — 👨‍🏫 {nameOf(enseignants, a.idEnseignant)}</div>)}
            </div>
          )}
          <form onSubmit={handleAffecter} className="admin-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Apprenant *</label>
                <select value={affForm.idApprenant} onChange={e => setAffForm({ ...affForm, idApprenant: parseInt(e.target.value) })} required>
                  <option value="0">-- Sélectionner --</option>
                  {apprenants.map(a => <option key={a.idUtilisateur} value={a.idUtilisateur}>{a.prenom} {a.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Encadrant (Enseignant) *</label>
                <select value={affForm.idEnseignant} onChange={e => setAffForm({ ...affForm, idEnseignant: parseInt(e.target.value) })} required>
                  <option value="0">-- Sélectionner --</option>
                  {enseignants.map(e => <option key={e.idUtilisateur} value={e.idUtilisateur}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="admin-submit-button" disabled={loading}>👥 Affecter</button>
          </form>
        </div>
      )}

      <div className="admin-list-container">
        {loading && stages.length === 0 ? <p className="loading">⏳ Chargement...</p>
          : stages.length === 0 ? <p className="empty">Aucun stage trouvé</p>
          : (
            <div className="admin-table">
              <table>
                <thead><tr><th>ID</th><th>Poste</th><th>Entreprise</th><th>Début</th><th>Fin</th><th>Durée</th><th>État</th><th style={{ textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {stages.map(s => (
                    <tr key={s.idStage}>
                      <td>#{s.idStage}</td><td><strong>{s.poste}</strong></td><td>{s.nomEntreprise || "—"}</td>
                      <td>{s.dateDebut || "—"}</td><td>{s.dateFin || "—"}</td><td>{s.dureeSemaines ? `${s.dureeSemaines} sem.` : "—"}</td>
                      <td>
                        <select value={s.etat || ""} onChange={e => handleChangerEtat(s, e.target.value)} disabled={loading}
                          style={{ padding: "4px 8px", borderRadius: 6, border: `2px solid ${etatColor[s.etat] || "#ccc"}`, fontWeight: 600, fontSize: 12, background: "white", color: etatColor[s.etat] || "#555", cursor: "pointer" }}>
                          {ETATS.map(et => <option key={et} value={et}>{et.replace("_", " ")}</option>)}
                        </select>
                      </td>
                      <td className="actions">
                        <button onClick={() => openAffectation(s)} className="btn-edit" title="Affecter apprenant/encadrant" disabled={loading}>👥</button>
                        <button onClick={() => handleEdit(s)} className="btn-edit" title="Modifier" disabled={loading}>✏️</button>
                        <button onClick={() => handleDelete(s)} className="btn-delete" title="Supprimer" disabled={loading}>🗑️</button>
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

export default AdminStages;
