import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/Admin.css";

const AdminAssignRole = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user?.role !== "ADMIN") {
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
          <h1>🔐 Attribuer un Rôle</h1>
          <p>Assigner ou modifier les rôles pour contrôler les permissions</p>
        </div>

        <form className="admin-form">
          <div className="form-group">
            <label>Sélectionner un utilisateur</label>
            <select required>
              <option value="">-- Sélectionner un utilisateur --</option>
              <option value="1">Jean Dupont (jean.dupont@eseo.fr)</option>
              <option value="2">Marie Martin (marie.martin@eseo.fr)</option>
              <option value="3">Pierre Durand (pierre.durand@eseo.fr)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Nouveau rôle</label>
            <select required>
              <option value="">-- Sélectionner un rôle --</option>
              <option value="APPRENANT">Apprenant 🎓</option>
              <option value="ENSEIGNANT">Enseignant 👨‍🏫</option>
              <option value="ADMIN">Administrateur 👨‍💼</option>
            </select>
          </div>

          <div className="form-group">
            <label>Raison du changement</label>
            <textarea 
              placeholder="Entrez la raison du changement de rôle"
              rows={4}
            ></textarea>
          </div>

          <button type="submit" className="admin-submit-button">
            ✅ Attribuer le rôle
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAssignRole;
