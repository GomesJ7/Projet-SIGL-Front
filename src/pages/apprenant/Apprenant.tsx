import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/Apprenant.css";

const StudentSpace = () => {
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
    <div className="apprenant-container">
      <button onClick={handleHomeClick} className="apprenant-home-button" title="Retour à l'accueil">
        🏠
      </button>
      <div className="apprenant-wrapper">
        <div className="apprenant-header">
          <h1 className="apprenant-title">Espace Apprenant</h1>
          <button onClick={handleLogout} className="apprenant-logout-button">
            Logout
          </button>
        </div>

        <div className="apprenant-user-info">
          <p><strong>Utilisateur connecté:</strong> {user?.name}</p>
          <p><strong>Login:</strong> {user?.login}</p>
          <p><strong>Rôle:</strong> {user?.role}</p>
        </div>

        <div className="apprenant-modules-grid">
          <div className="apprenant-module-card">
            <h3>Mon Profil Académique</h3>
            <p>Consulter mes informations personnelles et académiques</p>
            <button className="apprenant-module-button">
              Voir mon profil
            </button>
          </div>

          <div className="apprenant-module-card">
            <h3>Mes Stages</h3>
            <p>Suivre mes stages en cours et passés</p>
            <button className="apprenant-module-button">
              Mes stages
            </button>
          </div>

          <div className="apprenant-module-card">
            <h3>Mes Rapports</h3>
            <p>Déposer et consulter mes rapports de stage</p>
            <button className="apprenant-module-button">
              Gérer rapports
            </button>
          </div>

          <div className="apprenant-module-card">
            <h3>Mes Soutenances</h3>
            <p>Consulter les dates de mes soutenances</p>
            <button className="apprenant-module-button">
              Mes soutenances
            </button>
          </div>

          <div className="apprenant-module-card">
            <h3>Mes Résultats</h3>
            <p>Consulter mes notes et évaluations</p>
            <button className="apprenant-module-button">
              Voir résultats
            </button>
          </div>

          <div className="apprenant-module-card">
            <h3>Contact Enseignants</h3>
            <p>Contacter mes enseignants référents</p>
            <button className="apprenant-module-button">
              Mes contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSpace;
