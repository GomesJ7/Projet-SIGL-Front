import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI } from "../../api/adminAPI";
import "../../css/Admin.css";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "APPRENANT"
  });

  if (user?.role !== "admin") {
    return (
      <div className="admin-error">
        <h2>❌ Accès refusé</h2>
        <p>Vous n'avez pas les permissions pour accéder à cette page.</p>
        <button onClick={() => navigate("/")} className="admin-back-button">
          ← Retour à l'accueil
        </button>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsersAPI();
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement des utilisateurs");
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
        await updateUserAPI(editingId, formData);
        alert("✅ Utilisateur modifié avec succès");
      } else {
        await createUserAPI(formData);
        alert("✅ Utilisateur créé avec succès");
      }
      resetForm();
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'opération");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userData: any) => {
    setFormData({
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      motDePasse: "",
      role: userData.role
    });
    setEditingId(userData.idUtilisateur);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setLoading(true);
      setError(null);
      try {
        await deleteUserAPI(id);
        alert("✅ Utilisateur supprimé avec succès");
        loadUsers();
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors de la suppression");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      motDePasse: "",
      role: "APPRENANT"
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
        <h1>👥 Gestion des Utilisateurs</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="admin-action-btn"
        >
          {showForm ? "❌ Fermer" : "➕ Créer un utilisateur"}
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      {showForm && (
        <div className="admin-form-container">
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={formData.motDePasse}
                  onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
                  required={!editingId}
                  placeholder={editingId ? "(laisser vide pour ne pas changer)" : ""}
                />
              </div>

              <div className="form-group">
                <label>Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="APPRENANT">Apprenant 🎓</option>
                  <option value="ENSEIGNANT">Enseignant 👨‍🏫</option>
                  <option value="ADMIN">Administrateur 👨‍💼</option>
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
        ) : users.length === 0 ? (
          <p className="empty">Aucun utilisateur trouvé</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Prénom</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.idUtilisateur}>
                    <td>#{u.idUtilisateur}</td>
                    <td>{u.prenom}</td>
                    <td>{u.nom}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="btn-edit"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(u.idUtilisateur)}
                        className="btn-delete"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
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
