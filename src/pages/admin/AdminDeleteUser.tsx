import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/Admin.css";

const AdminDeleteUser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-back-button">
        ← Retour à l'accueil
      </button>

      <div className="admin-card">
        <div className="admin-header">
          <h1>🗑️ Supprimer un Utilisateur</h1>
          <p>Supprimer les utilisateurs pour maintenir le système</p>
        </div>

        <form className="admin-form">
          <div className="form-group">
            <label>Sélectionner l'utilisateur à supprimer</label>
            <select required>
              <option value="">-- Sélectionner un utilisateur --</option>
              <option value="1">Jean Dupont (jean.dupont@eseo.fr)</option>
              <option value="2">Marie Martin (marie.martin@eseo.fr)</option>
              <option value="3">Pierre Durand (pierre.durand@eseo.fr)</option>
            </select>
          </div>

          <div className="form-group warning">
            <h3>⚠️ Attention</h3>
            <p>La suppression d'un utilisateur est irréversible et supprimera toutes ses données associées.</p>
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" required />
              Je comprends les conséquences et je confirme la suppression
            </label>
          </div>

          <button type="submit" className="admin-submit-button admin-danger">
            🗑️ Supprimer l'utilisateur
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDeleteUser;
