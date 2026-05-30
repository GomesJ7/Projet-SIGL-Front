import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  getStagesAPI, createStageAPI, updateStageAPI, deleteStageAPI,
  getCompaniesAPI, getApprenantsAPI, getEnseignantsAPI
} from "../../api/adminAPI";
import "../../css/Admin.css";

const AdminStages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stages, setStages] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [apprenants, setApprenants] = useState<any[]>([]);
  const [encadrants, setEncadrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    poste: "",
    objectif: "",
    dateDebut: "",
    dateFin: "",
    dureeeSemaines: 0,
    etat: "EN_ATTENTE",
    idEntreprise: 0,
    idApprenant: 0,
    idEncadrant: 0
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
      const [stagesRes, companiesRes, apprenantsRes, enseignantsRes] = await Promise.all([
        getStagesAPI(),
        getCompaniesAPI(),
        getApprenantsAPI(),
        getEnseignantsAPI()
      ]);
      setStages(stagesRes.data);
      setCompanies(companiesRes.data);
      setApprenants(apprenantsRes.data);
      setEncadrants(enseignantsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateStageAPI(editingId, formData);
        alert("✅ Stage modifié avec succès");
      } else {
        await createStageAPI(formData);
        alert("✅ Stage créé avec succès");
      }
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'opération");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stageData: any) => {
    setFormData({
      poste: stageData.poste,
      objectif: stageData.objectif,
      dateDebut: stageData.dateDebut?.split('T')[0] || "",
      dateFin: stageData.dateFin?.split('T')[0] || "",
      dureeeSemaines: stageData.dureeeSemaines,
      etat: stageData.etat,
      idEntreprise: stageData.idEntreprise,
      idApprenant: stageData.idApprenant,
      idEncadrant: stageData.idEncadrant
    });
    setEditingId(stageData.idStage);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce stage ?")) {
      setLoading(true);
      try {
        await deleteStageAPI(id);
        alert("✅ Stage supprimé");
        loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors de la suppression");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      poste: "",
      objectif: "",
      dateDebut: "",
      dateFin: "",
      dureeeSemaines: 0,
      etat: "EN_ATTENTE",
      idEntreprise: 0,
      idApprenant: 0,
      idEncadrant: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/")} className="admin-back-button">
        ← Retour à l'accueil
      </button>

      <div className="admin-page-header">
        <h1>💼 Gestion des Stages</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="admin-action-btn"
        >
          {showForm ? "❌ Fermer" : "➕ Créer un stage"}
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      {showForm && (
        <div className="admin-form-container">
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Poste</label>
                <input
                  type="text"
                  value={formData.poste}
                  onChange={(e) => setFormData({...formData, poste: e.target.value})}
                  placeholder="Ex: Développeur Full Stack"
                  required
                />
              </div>

              <div className="form-group">
                <label>Objectif</label>
                <textarea
                  value={formData.objectif}
                  onChange={(e) => setFormData({...formData, objectif: e.target.value})}
                  placeholder="Description des objectifs"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date de début</label>
                <input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date de fin</label>
                <input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Durée (semaines)</label>
                <input
                  type="number"
                  value={formData.dureeeSemaines}
                  onChange={(e) => setFormData({...formData, dureeeSemaines: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>État</label>
                <select
                  value={formData.etat}
                  onChange={(e) => setFormData({...formData, etat: e.target.value})}
                >
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                  <option value="ANNULE">Annulé</option>
                </select>
              </div>

              <div className="form-group">
                <label>Entreprise</label>
                <select
                  value={formData.idEntreprise}
                  onChange={(e) => setFormData({...formData, idEntreprise: parseInt(e.target.value)})}
                  required
                >
                  <option value="0">-- Sélectionner --</option>
                  {companies.map((c) => (
                    <option key={c.idEntreprise} value={c.idEntreprise}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Apprenant</label>
                <select
                  value={formData.idApprenant}
                  onChange={(e) => setFormData({...formData, idApprenant: parseInt(e.target.value)})}
                  required
                >
                  <option value="0">-- Sélectionner --</option>
                  {apprenants.map((a) => (
                    <option key={a.idUtilisateur} value={a.idUtilisateur}>
                      {a.prenom} {a.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Encadrant</label>
                <select
                  value={formData.idEncadrant}
                  onChange={(e) => setFormData({...formData, idEncadrant: parseInt(e.target.value)})}
                  required
                >
                  <option value="0">-- Sélectionner --</option>
                  {encadrants.map((e) => (
                    <option key={e.idUtilisateur} value={e.idUtilisateur}>
                      {e.prenom} {e.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="admin-submit-button" disabled={loading}>
              {loading ? "Traitement..." : editingId ? "✏️ Modifier" : "➕ Créer"}
            </button>
          </form>
        </div>
      )}

      <div className="admin-list-container">
        {loading && !showForm ? (
          <p className="loading">⏳ Chargement...</p>
        ) : stages.length === 0 ? (
          <p className="empty">Aucun stage trouvé</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Poste</th>
                  <th>Entreprise</th>
                  <th>Apprenant</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>État</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((s) => (
                  <tr key={s.idStage}>
                    <td>{s.poste}</td>
                    <td>{s.entreprise?.nom || "N/A"}</td>
                    <td>{s.apprenant?.prenom} {s.apprenant?.nom}</td>
                    <td>{s.dateDebut?.split('T')[0]}</td>
                    <td>{s.dateFin?.split('T')[0]}</td>
                    <td><span className={`status-badge status-${s.etat.toLowerCase()}`}>{s.etat}</span></td>
                    <td className="actions">
                      <button onClick={() => handleEdit(s)} className="btn-edit">✏️</button>
                      <button onClick={() => handleDelete(s.idStage)} className="btn-delete">🗑️</button>
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
