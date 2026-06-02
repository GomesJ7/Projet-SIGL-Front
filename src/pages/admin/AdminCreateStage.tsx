import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/Admin.css";

const AdminCreateStage = () => {
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
          <h1>💼 Créer un Stage</h1>
          <p>Créer des stages et affecter les apprenants</p>
        </div>

        <form className="admin-form">
          <div className="form-group">
            <label>Titre du stage</label>
            <input type="text" placeholder="Ex: Stage Développement Web" required />
          </div>

          <div className="form-group">
            <label>Entreprise</label>
            <select required>
              <option value="">-- Sélectionner une entreprise --</option>
              <option value="1">TechCorp</option>
              <option value="2">InnovateLabs</option>
              <option value="3">Digital Solutions</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date de début</label>
            <input type="date" required />
          </div>

          <div className="form-group">
            <label>Date de fin</label>
            <input type="date" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="Décrivez le stage..."
              rows={4}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Apprenant assigné</label>
            <select required>
              <option value="">-- Sélectionner un apprenant --</option>
              <option value="1">Luc Bernard (2024)</option>
              <option value="2">Sophie Leclerc (2024)</option>
              <option value="3">Thomas Moreau (2025)</option>
            </select>
          </div>

          <button type="submit" className="admin-submit-button">
            ✅ Créer le stage
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateStage;
