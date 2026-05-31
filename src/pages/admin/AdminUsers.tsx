import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getApprenantsAPI,
  getEnseignantsAPI,
  getAdminsAPI,
  createUserAPI,
  updateApprenantAPI,
  updateEnseignantAPI,
  updateAdminAPI,
  deleteApprenantAPI,
  deleteEnseignantAPI,
  deleteAdminAPI,
} from "../../api/adminAPI";
import "../../css/Admin.css";

type RoleType = "APPRENANT" | "ENSEIGNANT" | "ADMIN";

interface UserRow {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  role: RoleType;
}

const ROLE_LABELS: Record<RoleType, string> = {
  APPRENANT: "🎓 Apprenant",
  ENSEIGNANT: "👨‍🏫 Enseignant",
  ADMIN: "👨‍💼 Administrateur",
};

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email: "",
  motDePasse: "",
  role: "APPRENANT" as RoleType,
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [filterRole, setFilterRole] = useState<RoleType | "ALL">("ALL");

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

  // --------------- Chargement ---------------
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resApprenants, resEnseignants, resAdmins] = await Promise.all([
        getApprenantsAPI(),
        getEnseignantsAPI(),
        getAdminsAPI(),
      ]);

      const normalize = (list: any[], role: RoleType): UserRow[] =>
        list.map((u: any) => ({
          idUtilisateur: u.idUtilisateur,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          role,
        }));

      setUsers([
        ...normalize(resApprenants.data, "APPRENANT"),
        ...normalize(resEnseignants.data, "ENSEIGNANT"),
        ...normalize(resAdmins.data, "ADMIN"),
      ]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des utilisateurs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // --------------- Création / Modification ---------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUser) {
        // Mise à jour : on route vers le bon endpoint selon le rôle de l'utilisateur édité
        const payload = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          ...(formData.motDePasse ? { motDePasse: formData.motDePasse } : {}),
          role: editingUser.role,
        };

        switch (editingUser.role) {
          case "APPRENANT":
            await updateApprenantAPI(editingUser.idUtilisateur, payload);
            break;
          case "ENSEIGNANT":
            await updateEnseignantAPI(editingUser.idUtilisateur, payload);
            break;
          case "ADMIN":
            await updateAdminAPI(editingUser.idUtilisateur, payload);
            break;
        }
        setSuccess("✅ Utilisateur modifié avec succès");
      } else {
        // Création via /auth/register — crée l'utilisateur ET la bonne sous-table JPA
        await createUserAPI({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          motDePasse: formData.motDePasse,
          role: formData.role,
        });
        setSuccess("✅ Utilisateur créé avec succès");
      }

      resetForm();
      loadUsers();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Erreur lors de l'opération";
      setError("❌ " + msg);
    } finally {
      setLoading(false);
    }
  };

  // --------------- Suppression ---------------
  const handleDelete = async (row: UserRow) => {
    if (
      !window.confirm(
        `Supprimer ${row.prenom} ${row.nom} ? Cette action est irréversible.`
      )
    )
      return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      switch (row.role) {
        case "APPRENANT":
          await deleteApprenantAPI(row.idUtilisateur);
          break;
        case "ENSEIGNANT":
          await deleteEnseignantAPI(row.idUtilisateur);
          break;
        case "ADMIN":
          await deleteAdminAPI(row.idUtilisateur);
          break;
      }
      setSuccess(`✅ ${row.prenom} ${row.nom} supprimé avec succès`);
      loadUsers();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erreur lors de la suppression"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------- Edition ---------------
  const handleEdit = (row: UserRow) => {
    setEditingUser(row);
    setFormData({
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      motDePasse: "",
      role: row.role,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingUser(null);
    setShowForm(false);
  };

  // --------------- Filtrage ---------------
  const filteredUsers =
    filterRole === "ALL" ? users : users.filter((u) => u.role === filterRole);

  const counts = {
    ALL: users.length,
    APPRENANT: users.filter((u) => u.role === "APPRENANT").length,
    ENSEIGNANT: users.filter((u) => u.role === "ENSEIGNANT").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  // --------------- Rendu ---------------
  return (
    <div className="admin-page-container">
      <button onClick={() => navigate("/")} className="admin-back-button">
        ← Retour à l'accueil
      </button>

      <div className="admin-page-header">
        <h1>👥 Gestion des Utilisateurs</h1>
        <button
          onClick={() => {
            if (showForm && !editingUser) {
              resetForm();
            } else {
              setEditingUser(null);
              setFormData(EMPTY_FORM);
              setShowForm(true);
            }
          }}
          className="admin-action-btn"
        >
          {showForm && !editingUser ? "❌ Fermer" : "➕ Nouvel utilisateur"}
        </button>
      </div>

      {/* Messages */}
      {error && <div className="admin-error-message">{error}</div>}
      {success && (
        <div
          className="admin-error-message"
          style={{ backgroundColor: "#d4edda", color: "#155724", borderColor: "#c3e6cb" }}
        >
          {success}
        </div>
      )}

      {/* Formulaire création / modification */}
      {showForm && (
        <div className="admin-form-container">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>
            {editingUser
              ? `✏️ Modifier — ${editingUser.prenom} ${editingUser.nom}`
              : "➕ Créer un utilisateur"}
          </h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                  placeholder="Jean"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  placeholder="Dupont"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="jean.dupont@ecole.fr"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Mot de passe {editingUser ? "(laisser vide = inchangé)" : "*"}
                </label>
                <input
                  type="password"
                  value={formData.motDePasse}
                  onChange={(e) =>
                    setFormData({ ...formData, motDePasse: e.target.value })
                  }
                  placeholder={editingUser ? "••••••••" : "Min. 6 caractères"}
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              {/* Le rôle n'est modifiable qu'à la création */}
              {!editingUser && (
                <div className="form-group">
                  <label>Rôle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as RoleType,
                      })
                    }
                    required
                  >
                    <option value="APPRENANT">🎓 Apprenant</option>
                    <option value="ENSEIGNANT">👨‍🏫 Enseignant</option>
                    <option value="ADMIN">👨‍💼 Administrateur</option>
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                className="admin-submit-button"
                disabled={loading}
              >
                {loading
                  ? "⏳ Traitement..."
                  : editingUser
                  ? "✏️ Enregistrer les modifications"
                  : "➕ Créer l'utilisateur"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "12px 24px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres par rôle */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {(["ALL", "APPRENANT", "ENSEIGNANT", "ADMIN"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "2px solid",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              transition: "all 0.2s",
              borderColor:
                filterRole === r
                  ? r === "APPRENANT"
                    ? "#f59e0b"
                    : r === "ENSEIGNANT"
                    ? "#10b981"
                    : r === "ADMIN"
                    ? "#667eea"
                    : "#667eea"
                  : "#e0e0e0",
              background:
                filterRole === r
                  ? r === "APPRENANT"
                    ? "#f59e0b"
                    : r === "ENSEIGNANT"
                    ? "#10b981"
                    : r === "ADMIN"
                    ? "#667eea"
                    : "#667eea"
                  : "white",
              color: filterRole === r ? "white" : "#555",
            }}
          >
            {r === "ALL"
              ? `Tous (${counts.ALL})`
              : r === "APPRENANT"
              ? `🎓 Apprenants (${counts.APPRENANT})`
              : r === "ENSEIGNANT"
              ? `👨‍🏫 Enseignants (${counts.ENSEIGNANT})`
              : `👨‍💼 Admins (${counts.ADMIN})`}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="admin-list-container">
        {loading && users.length === 0 ? (
          <p className="loading">⏳ Chargement des utilisateurs...</p>
        ) : filteredUsers.length === 0 ? (
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
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={`${u.role}-${u.idUtilisateur}`}>
                    <td>#{u.idUtilisateur}</td>
                    <td>{u.prenom}</td>
                    <td>{u.nom}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`role-badge role-${u.role.toLowerCase()}`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => handleEdit(u)}
                        className="btn-edit"
                        title="Modifier"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="btn-delete"
                        title="Supprimer"
                        disabled={loading}
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
