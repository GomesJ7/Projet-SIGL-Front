import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  getDefensesAPI, createDefenseAPI, updateDefenseAPI, deleteDefenseAPI,
  getStagesAPI, getJuriesAPI, createJuryAPI, updateJuryAPI, deleteJuryAPI,
  getJuryEnseignantsAPI, createJuryEnseignantAPI, deleteJuryEnseignantAPI,
  getEnseignantsAPI
} from "../../api/adminAPI";
import "../../css/Admin.css";

const AdminDefenses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [defenses, setDefenses] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [juries, setJuries] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDefenseForm, setShowDefenseForm] = useState(false);
  const [showJuryForm, setShowJuryForm] = useState(false);
  const [editingDefenseId, setEditingDefenseId] = useState<number | null>(null);
  const [editingJuryId, setEditingJuryId] = useState<number | null>(null);
  
  const [defenseFormData, setDefenseFormData] = useState({
    dateSoutenance: "",
    salle: "",
    idStage: 0,
    idJury: 0
  });

  const [juryFormData, setJuryFormData] = useState({
    president: "",
    description: ""
  });

  if (user?.role !== "admin") {
    return (
      <div className="admin-error">
        <h2>❌ Accès refusé</h2>
        <button onClick={() => navigate("/")} className="admin-back-button">
          ← Retour à l'accueil
        </button>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [defensesRes, stagesRes, juriesRes, enseignantsRes] = await Promise.all([
        getDefensesAPI(),
        getStagesAPI(),
        getJuriesAPI(),
        getEnseignantsAPI()
      ]);
      setDefenses(defensesRes.data);
      setStages(stagesRes.data);
      setJuries(juriesRes.data);
      setEnseignants(enseignantsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleDefenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingDefenseId) {
        await updateDefenseAPI(editingDefenseId, defenseFormData);
        alert("✅ Soutenance modifiée");
      } else {
        await createDefenseAPI(defenseFormData);
        alert("✅ Soutenance créée");
      }
      resetDefenseForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleJurySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingJuryId) {
        await updateJuryAPI(editingJuryId, juryFormData);
        alert("✅ Jury modifié");
      } else {
        await createJuryAPI(juryFormData);
        alert("✅ Jury créé");
      }
      resetJuryForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDefense = async (id: number) => {
    if (window.confirm("Êtes-vous sûr ?")) {
      setLoading(true);
      try {
        await deleteDefenseAPI(id);
        alert("✅ Soutenance supprimée");
        loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteJury = async (id: number) => {
    if (window.confirm("Êtes-vous sûr ?")) {
      setLoading(true);
      try {
        await deleteJuryAPI(id);
        alert("✅ Jury supprimé");
        loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetDefenseForm = () => {
    setDefenseFormData({
      dateSoutenance: "",
      salle: "",
      idStage: 0,
      idJury: 0
    });
    setEditingDefenseId(null);
    setShowDefenseForm(false);
  };

  const resetJuryForm = () => {
    setJuryFormData({
      president: "",
      description: ""
    });
    setEditingJuryId(null);
    setShowJuryForm(false);
  };

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/")} className="admin-back-button">
        ← Retour à l'accueil
      </button>

      <div className="admin-page-header">
        <h1>🎓 Gestion des Soutenances</h1>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      {/* Section Soutenances */}
      <div className="admin-section">
        <div className="section-header">
          <h2>📋 Soutenances</h2>
          <button 
            onClick={() => setShowDefenseForm(!showDefenseForm)}
            className="admin-action-btn"
          >
            {showDefenseForm ? "❌ Fermer" : "➕ Ajouter une soutenance"}
          </button>
        </div>

        {showDefenseForm && (
          <div className="admin-form-container">
            <form onSubmit={handleDefenseSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date de soutenance</label>
                  <input
                    type="datetime-local"
                    value={defenseFormData.dateSoutenance}
                    onChange={(e) => setDefenseFormData({...defenseFormData, dateSoutenance: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Salle</label>
                  <input
                    type="text"
                    value={defenseFormData.salle}
                    onChange={(e) => setDefenseFormData({...defenseFormData, salle: e.target.value})}
                    placeholder="Ex: Salle 101"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stage</label>
                  <select
                    value={defenseFormData.idStage}
                    onChange={(e) => setDefenseFormData({...defenseFormData, idStage: parseInt(e.target.value)})}
                    required
                  >
                    <option value="0">-- Sélectionner --</option>
                    {stages.map((s) => (
                      <option key={s.idStage} value={s.idStage}>
                        {s.poste} - {s.apprenant?.prenom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Jury</label>
                  <select
                    value={defenseFormData.idJury}
                    onChange={(e) => setDefenseFormData({...defenseFormData, idJury: parseInt(e.target.value)})}
                    required
                  >
                    <option value="0">-- Sélectionner --</option>
                    {juries.map((j) => (
                      <option key={j.idJury} value={j.idJury}>
                        {j.president} - {j.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="admin-submit-button" disabled={loading}>
                {loading ? "Traitement..." : editingDefenseId ? "✏️ Modifier" : "➕ Créer"}
              </button>
            </form>
          </div>
        )}

        <div className="admin-list-container">
          {loading && !showDefenseForm ? (
            <p className="loading">⏳ Chargement...</p>
          ) : defenses.length === 0 ? (
            <p className="empty">Aucune soutenance trouvée</p>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Salle</th>
                    <th>Apprenant</th>
                    <th>Jury</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {defenses.map((d) => (
                    <tr key={d.idSoutenance}>
                      <td>{d.dateSoutenance?.split('T')[0]}</td>
                      <td>{d.salle}</td>
                      <td>{d.stage?.apprenant?.prenom}</td>
                      <td>{d.jury?.president}</td>
                      <td className="actions">
                        <button onClick={() => handleDeleteDefense(d.idSoutenance)} className="btn-delete">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section Jurys */}
      <div className="admin-section">
        <div className="section-header">
          <h2>👨‍⚖️ Jurys</h2>
          <button 
            onClick={() => setShowJuryForm(!showJuryForm)}
            className="admin-action-btn"
          >
            {showJuryForm ? "❌ Fermer" : "➕ Ajouter un jury"}
          </button>
        </div>

        {showJuryForm && (
          <div className="admin-form-container">
            <form onSubmit={handleJurySubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Président</label>
                  <select
                    value={juryFormData.president}
                    onChange={(e) => setJuryFormData({...juryFormData, president: e.target.value})}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {enseignants.map((e) => (
                      <option key={e.idUtilisateur} value={e.idUtilisateur}>
                        {e.prenom} {e.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={juryFormData.description}
                    onChange={(e) => setJuryFormData({...juryFormData, description: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>

              <button type="submit" className="admin-submit-button" disabled={loading}>
                {loading ? "Traitement..." : editingJuryId ? "✏️ Modifier" : "➕ Créer"}
              </button>
            </form>
          </div>
        )}

        <div className="admin-list-container">
          {loading && !showJuryForm ? (
            <p className="loading">⏳ Chargement...</p>
          ) : juries.length === 0 ? (
            <p className="empty">Aucun jury trouvé</p>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Président</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {juries.map((j) => (
                    <tr key={j.idJury}>
                      <td>{j.president}</td>
                      <td>{j.description}</td>
                      <td className="actions">
                        <button onClick={() => handleDeleteJury(j.idJury)} className="btn-delete">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDefenses;
