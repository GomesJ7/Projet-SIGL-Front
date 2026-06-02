import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/Admin.css";

const AdminPlanDefense = () => {
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
          <h1>🎓 Planifier une Soutenance</h1>
          <p>Organiser les évaluations et les jurys de soutenance</p>
        </div>

        <form className="admin-form">
          <div className="form-group">
            <label>Apprenant</label>
            <select required>
              <option value="">-- Sélectionner un apprenant --</option>
              <option value="1">Luc Bernard (Promotion 2024)</option>
              <option value="2">Sophie Leclerc (Promotion 2024)</option>
              <option value="3">Thomas Moreau (Promotion 2025)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date de soutenance</label>
            <input type="date" required />
          </div>

          <div className="form-group">
            <label>Heure</label>
            <input type="time" required />
          </div>

          <div className="form-group">
            <label>Lieu</label>
            <input type="text" placeholder="Salle, Amphi, etc." required />
          </div>

          <div className="form-group">
            <label>Président du jury</label>
            <select required>
              <option value="">-- Sélectionner un enseignant --</option>
              <option value="1">Dr. Jean Dupont</option>
              <option value="2">Pr. Marie Martin</option>
              <option value="3">Dr. Pierre Bernard</option>
            </select>
          </div>

          <div className="form-group">
            <label>Membres du jury</label>
            <select multiple required>
              <option value="1">Dr. Jean Dupont</option>
              <option value="2">Pr. Marie Martin</option>
              <option value="3">Dr. Pierre Bernard</option>
              <option value="4">Mme Sophie Durand</option>
            </select>
            <small>Maintenez Ctrl pour sélectionner plusieurs membres</small>
          </div>

          <button type="submit" className="admin-submit-button">
            ✅ Planifier la soutenance
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPlanDefense;
