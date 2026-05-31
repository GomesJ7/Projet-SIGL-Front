import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCompaniesAPI, createCompanyAPI, updateCompanyAPI, deleteCompanyAPI } from "../../api/adminAPI";
import "../../css/Admin.css";

const AdminCompanies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nomEntreprise: "",
    emailEntreprise: "",
    adresseEntreprise: "",
    telephone: ""
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
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCompaniesAPI();
      setCompanies(response.data);
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
        await updateCompanyAPI(editingId, formData);
        alert("✅ Entreprise modifiée");
      } else {
        await createCompanyAPI(formData);
        alert("✅ Entreprise créée");
      }
      resetForm();
      loadCompanies();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (companyData: any) => {
    setFormData({
      nomEntreprise: companyData.nomEntreprise,
      emailEntreprise: companyData.emailEntreprise,
      adresseEntreprise: companyData.adresseEntreprise,
      telephone: companyData.telephone
    });
    setEditingId(companyData.idEntreprise);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr ?")) {
      setLoading(true);
      try {
        await deleteCompanyAPI(id);
        alert("✅ Entreprise supprimée");
        loadCompanies();
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nomEntreprise: "",
      emailEntreprise: "",
      adresseEntreprise: "",
      telephone: ""
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
        <h1>🏢 Gestion des Entreprises</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="admin-action-btn"
        >
          {showForm ? "❌ Fermer" : "➕ Ajouter une entreprise"}
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      {showForm && (
        <div className="admin-form-container">
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                    value={formData.nomEntreprise}
                    onChange={(e) => setFormData({...formData, nomEntreprise: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Adresse</label>
                  <input
                    type="text"
                    value={formData.adresseEntreprise}
                    onChange={(e) => setFormData({...formData, adresseEntreprise: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.emailEntreprise}
                    onChange={(e) => setFormData({...formData, emailEntreprise: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}/>
                </div>
                </div>
          </form>
        </div>
      )}

      <div className="admin-list-container">
        {loading && !showForm ? (
          <p className="loading">⏳ Chargement...</p>
        ) : companies.length === 0 ? (
          <p className="empty">Aucune entreprise trouvée</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Adresse</th>
                  <th>Téléphone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.idEntreprise}>
                    <td>{c.nomEntreprise}</td>
                    <td>{c.emailEntreprise}</td>
                    <td>{c.adresseEntreprise}</td>
                    <td>{c.telephone}</td>
                    <td className="actions">
                      <button onClick={() => handleEdit(c)} className="btn-edit">✏️</button>
                      <button onClick={() => handleDelete(c.idEntreprise)} className="btn-delete">🗑️</button>
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