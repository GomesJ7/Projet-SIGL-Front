import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/Administrateur.css";

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleManageModulesFilieres = () => {
    navigate("/administrateur/modules-filieres");
  };

  const handleManageApprenants = () => {
    navigate("/administrateur/apprenants");
  };

  const handleManageEnseignants = () => {
    navigate("/administrateur/enseignants");
  };

  const handleManageStages = () => {
    navigate("/administrateur/stages");
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
          <p><strong>Utilisateur connecté:</strong> {displayName || user?.email}</p>
          <p><strong>Rôle:</strong> {user?.role}</p>
        </div>

        <div className="admin-modules-grid">
          {/* Gestion des Apprenants */}
          <div className="admin-module-card">
            <h3>Gestion des Apprenants</h3>
            <ul>
              <li>• Créer/supprimer des apprenants</li>
              <li>• Affectation filière/promotion</li>
              <li>• Suivi académique</li>
              <li>• Historique des stages</li>
            </ul>
            <button className="admin-module-button" onClick={handleManageApprenants}>
              Gérer apprenants
            </button>
          </div>

          {/* Gestion des Enseignants */}
          <div className="admin-module-card">
            <h3>Gestion des Enseignants</h3>
            <ul>
              <li>• Créer/supprimer des enseignants</li>
              <li>• Affectation aux modules</li>
              <li>• Encadrement des stages</li>
              <li>• Participation aux jurys</li>
            </ul>
            <button className="admin-module-button" onClick={handleManageEnseignants}>
              Gérer enseignants
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
            <button className="admin-module-button" onClick={handleManageStages}>
              Gérer stages
            </button>
          </div>

          {/* Gestion des modules et filières */}
          <div className="admin-module-card">
            <h3>Gestion des modules et filières</h3>
            <ul>
              <li>• Créer/supprimer un module</li>
              <li>• Créer/supprimer une filière</li>
            </ul>
            <button className="admin-module-button" onClick={handleManageModulesFilieres}>
              Gérer
            </button>
          </div>

          {/* Gestion des Soutenances */}
          <div className="admin-module-card">
            <h3>Gestion des Soutenances</h3>
            <ul>
              <li>• Organisation des jurys</li>
              <li>• Planification des dates</li>
              <li>• Affectation des membres</li>
              <li>• Suivi des résultats</li>
            </ul>
            <button className="admin-module-button">
              Gérer soutenances
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
            <button className="admin-module-button">
              Gérer entreprises
            </button>
          </div>

          {/* Affectations Pédagogiques */}
          <div className="admin-module-card">
            <h3>Affectations Pédagogiques</h3>
            <ul>
              <li>• Modules ↔ Enseignants</li>
              <li>• Apprenants ↔ Filières</li>
              <li>• Stages ↔ Encadrants</li>
              <li>• Jurys ↔ Membres</li>
            </ul>
            <button className="admin-module-button">
              Gérer affectations
            </button>
          </div>

          {/* Statistiques et Rapports */}
          <div className="admin-module-card">
            <h3>Statistiques & Rapports</h3>
            <ul>
              <li>• Taux de réussite</li>
              <li>• Répartition par filière</li>
              <li>• Évolution des stages</li>
              <li>• Performance enseignants</li>
            </ul>
            <button className="admin-module-button">
              Voir statistiques
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
