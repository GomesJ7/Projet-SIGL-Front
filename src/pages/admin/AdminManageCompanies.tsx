import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/Admin.css";

const AdminManageCompanies = () => {
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
          <h1>🏢 Gestion des Entreprises</h1>
          <p>Gérer les entreprises partenaires et les stages</p>
        </div>

        <form className="admin-form">
          <div className="form-group">
            <label>Nom de l'entreprise</label>
            <input type="text" placeholder="Ex: TechCorp France" required />
          </div>

          <div className="form-group">
            <label>Secteur d'activité</label>
            <select required>
              <option value="">-- Sélectionner un secteur --</option>
              <option value="IT">Informatique</option>
              <option value="FINANCE">Finance</option>
              <option value="MARKETING">Marketing</option>
              <option value="CONSULTING">Consulting</option>
              <option value="INDUSTRIE">Industrie</option>
            </select>
          </div>

          <div className="form-group">
            <label>Adresse</label>
            <input type="text" placeholder="Adresse complète" required />
          </div>

          <div className="form-group">
            <label>Email de contact</label>
            <input type="email" placeholder="contact@entreprise.fr" required />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input type="tel" placeholder="06 XX XX XX XX" />
          </div>

          <div className="form-group">
            <label>Nombre de stages disponibles</label>
            <input type="number" placeholder="0" min="0" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              placeholder="Décrivez l'entreprise et ses opportunités de stages..."
              rows={4}
            ></textarea>
          </div>

          <button type="submit" className="admin-submit-button">
            ✅ Ajouter l'entreprise
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminManageCompanies;
