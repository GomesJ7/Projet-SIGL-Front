import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/Admin.css";

const AdminCreateUser = () => {
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
          <h1>👤 Créer un Utilisateur</h1>
          <p>Créer de nouveaux utilisateurs pour gérer les sessions</p>
        </div>

        <form className="admin-form">
          <div className="form-group">
            <label>Prénom</label>
            <input type="text" placeholder="Entrez le prénom" required />
          </div>

          <div className="form-group">
            <label>Nom</label>
            <input type="text" placeholder="Entrez le nom" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Entrez l'email" required />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="Entrez le mot de passe" required />
          </div>

          <div className="form-group">
            <label>Rôle</label>
            <select required>
              <option value="">-- Sélectionner un rôle --</option>
              <option value="APPRENANT">Apprenant 🎓</option>
              <option value="ENSEIGNANT">Enseignant 👨‍🏫</option>
              <option value="ADMIN">Administrateur 👨‍💼</option>
            </select>
          </div>

          <button type="submit" className="admin-submit-button">
            ✅ Créer l'utilisateur
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateUser;
