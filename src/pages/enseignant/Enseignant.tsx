import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/Enseignant.css";

const Teacher = () => {
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
    <div className="enseignant-container">
      <button onClick={handleHomeClick} className="enseignant-home-button" title="Retour à l'accueil">
        🏠
      </button>
      <div className="enseignant-wrapper">
        <div className="enseignant-header">
          <h1 className="enseignant-title">Espace Enseignant</h1>
          <button onClick={handleLogout} className="enseignant-logout-button">
            Logout
          </button>
        </div>

        <div className="enseignant-user-info">
          <p><strong>Utilisateur connecté:</strong> {user?.name}</p>
          <p><strong>Login:</strong> {user?.login}</p>
          <p><strong>Rôle:</strong> {user?.role}</p>
        </div>

        <div className="enseignant-modules-grid">
          <div className="enseignant-module-card">
            <h3> Mes Modules</h3>
            <p>Gérer les modules qui me sont affectés</p>
            <button className="enseignant-module-button">
              Voir mes modules
            </button>
          </div>

          <div className="enseignant-module-card">
            <h3> Encadrement de Stages</h3>
            <p>Suivre les apprenants que j'encadre</p>
            <button className="enseignant-module-button">
              Mes stagiaires
            </button>
          </div>

          <div className="enseignant-module-card">
            <h3> Évaluation des Rapports</h3>
            <p>Évaluer et commenter les rapports de stage</p>
            <button className="enseignant-module-button">
              Rapports à évaluer
            </button>
          </div>

          <div className="enseignant-module-card">
            <h3>Jury de Soutenance</h3>
            <p>Participer aux jurys d'évaluation</p>
            <button className="enseignant-module-button">
              Mes jurys
            </button>
          </div>

          <div className="enseignant-module-card">
            <h3>Suivi Académique</h3>
            <p>Consulter les statistiques et suivi des apprenants</p>
            <button className="enseignant-module-button">
              Voir statistiques
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teacher;
