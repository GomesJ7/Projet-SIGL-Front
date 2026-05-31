import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/Administrateur.css";

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="admin-container">
      <button onClick={handleHomeClick} className="admin-home-button" title="Retour à l'accueil">
        🏠
      </button>
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Espace Administrateur</h1>
          <button onClick={handleLogout} className="admin-logout-button">
            Logout
          </button>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecté:</strong> {user?.name}</p>
          <p><strong>Login:</strong> {user?.login}</p>
          <p><strong>Rôle:</strong> {user?.role}</p>
        </div>

        <div className="admin-modules-grid">
          {/* Gestion des Utilisateurs */}
          <div className="admin-module-card">
            <h3>Gestion des Utilisateurs</h3>
            <ul>
              <li>• CRUD complet des utilisateurs</li>
              <li>• Modification des rôles</li>
              <li>• Gestion des permissions</li>
              <li>• Apprenants, Enseignants, Admins</li>
            </ul>
            <button 
              className="admin-module-button"
              onClick={() => navigate("/admin/users")}
            >
              Gérer utilisateurs
            </button>
          </div>

          {/* Gestion des Stages */}
          <div className="admin-module-card">
            <h3>Gestion des Stages</h3>
            <ul>
              <li>• Création de stages</li>
              <li>• Affectation apprenants</li>
              <li>• Affectation encadrants</li>
              <li>• Suivi état (En cours/Terminé/Validé)</li>
            </ul>
            <button 
              className="admin-module-button"
              onClick={() => navigate("/admin/stages")}
            >
              Gérer stages
            </button>
          </div>

          {/* Gestion des Entreprises */}
          <div className="admin-module-card">
            <h3>Entreprises Partenaires</h3>
            <ul>
              <li>• Ajouter/supprimer les entreprises</li>
              <li>• Gestion des contacts</li>
              <li>• Suivi des partenariats</li>
              <li>• Historique des stages</li>
            </ul>
            <button 
              className="admin-module-button"
              onClick={() => navigate("/admin/companies")}
            >
              Gérer entreprises
            </button>
          </div>

          {/* Gestion des Soutenances */}
          <div className="admin-module-card">
            <h3>Gestion des Soutenances</h3>
            <ul>
              <li>• Planification des soutenances</li>
              <li>• Affectation des jurys</li>
              <li>• Gestion des dates et salles</li>
              <li>• Suivi des résultats</li>
            </ul>
            <button 
              className="admin-module-button"
              onClick={() => navigate("/admin/defenses")}
            >
              Gérer soutenances
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
