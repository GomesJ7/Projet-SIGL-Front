import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/Apprenant.css";

const StudentSpace = () => {
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

  const handleProfilAcademique = () => {
    navigate("/apprenant/profil-academique");
  };

  const handleStagesRapports = () => {
    navigate("/apprenant/stages-rapports");
  };

  const handleMesResultats = () => {
    navigate("/apprenant/resultats");
  };

  const handleMesContacts = () => {
    navigate("/apprenant/contacts");
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
          <p><strong>Utilisateur connecté:</strong> {displayName || user?.email}</p>
          <p><strong>Rôle:</strong> {user?.role}</p>
        </div>

        <div className="apprenant-modules-grid">
          <div className="apprenant-module-card">
            <h3>Mon Profil Académique</h3>
            <p>Consulter mes informations personnelles et académiques</p>
            <button className="apprenant-module-button" onClick={handleProfilAcademique}>
              Voir mon profil
            </button>
          </div>

          <div className="apprenant-module-card">
            <h3>Mes Stages et Rapports</h3>
            <p>Visualiser mes stages et deposer mes rapports de stage</p>
            <button className="apprenant-module-button" onClick={handleStagesRapports}>
              Mes stages et rapports
            </button>
          </div>

          <div className="apprenant-module-card">
            <h3>Mes Résultats</h3>
            <p>Consulter mes notes et évaluations</p>
            <button className="apprenant-module-button" onClick={handleMesResultats}>
              Voir résultats
            </button>
          </div>

          <div className="apprenant-module-card">
            <h3>Mes Contacts</h3>
            <p>Contacter mes enseignants référents</p>
            <button className="apprenant-module-button" onClick={handleMesContacts}>
              Mes contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSpace;
