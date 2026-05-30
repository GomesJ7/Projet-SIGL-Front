import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoESEO from "../../images/ESEO.png";
import "../../css/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  };

  const getRoleLabel = (role: string): string => {
    const roleLabels: { [key: string]: string } = {
      admin: "👨‍💼 Administrateur",
      teacher: "👨‍🏫 Enseignant",
      student: "🎓 Apprenant"
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <img
            src={logoESEO}
            alt="Logo ES SCHOOL"
          />
          <h2>ES SCHOOL</h2>
        </div>
        <div className="home-nav-actions">
          {user ? (
            <div className="home-nav-user">
              <div className="home-user-info">
                <span className="home-user-name">{user.prenom} {user.nom}</span>
                <span className="home-user-role">{getRoleLabel(user.role)}</span>
              </div>
              <button
                onClick={handleLogout}
                className="home-nav-logout-button"
                title="Se déconnecter"
              >
                🚪 Déconnexion
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="home-nav-button"
            >
              Connexion
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <img
          src={logoESEO}
          alt="Logo ES SCHOOL"
        />
        {user ? (
          <>
            <h1>
              Bienvenue, {user.prenom} {user.nom} !
            </h1>
            <p>
              Vous êtes connecté en tant que <strong>{getRoleLabel(user.role)}</strong>
            </p>
            <div className="home-user-details">
              <div className="home-detail-card">
                <span className="detail-label">Email :</span>
                <span className="detail-value">{user.email}</span>
              </div>
              <div className="home-detail-card">
                <span className="detail-label">ID Utilisateur :</span>
                <span className="detail-value">#{user.idUtilisateur}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1>
              Bienvenue à ES SCHOOL
            </h1>
            <p>
              Plateforme de gestion académique complète pour notre établissement
            </p>
          </>
        )}
        {!user && (
          <button
            onClick={() => navigate("/login")}
            className="home-hero-button"
          >
            Accéder à la plateforme
          </button>
        )}
      </section>

      {/* Admin Dashboard Section */}
      {user && user.role === "admin" && (
        <section className="home-admin-dashboard">
          <div className="home-admin-container">
            <h2>📊 Tableau de Bord Administrateur</h2>
            <p className="admin-subtitle">Gérez les utilisateurs, stages, entreprises et soutenances</p>
            
            <div className="admin-actions-grid">
              {/* Card 1: Gestion Utilisateurs */}
              <div 
                className="admin-action-card" 
                onClick={() => navigate("/admin/users")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate("/admin/users");
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="admin-action-icon">👥</div>
                <h3>Gestion des Utilisateurs</h3>
                <p>Créer, modifier et supprimer les utilisateurs du système</p>
                <span className="admin-action-arrow">→</span>
              </div>

              {/* Card 2: Gestion Stages */}
              <div 
                className="admin-action-card" 
                onClick={() => navigate("/admin/stages")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate("/admin/stages");
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="admin-action-icon">💼</div>
                <h3>Gestion des Stages</h3>
                <p>Créer, modifier et supprimer les stages avec entreprises et apprenants</p>
                <span className="admin-action-arrow">→</span>
              </div>

              {/* Card 3: Gestion Entreprises */}
              <div 
                className="admin-action-card" 
                onClick={() => navigate("/admin/companies")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate("/admin/companies");
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="admin-action-icon">🏢</div>
                <h3>Gestion des Entreprises</h3>
                <p>Gérer les partenaires et leurs opportunités de stages</p>
                <span className="admin-action-arrow">→</span>
              </div>

              {/* Card 4: Gestion Soutenances */}
              <div 
                className="admin-action-card" 
                onClick={() => navigate("/admin/defenses")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate("/admin/defenses");
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="admin-action-icon">🎓</div>
                <h3>Gestion des Soutenances</h3>
                <p>Organiser les soutenances, jurys et évaluations</p>
                <span className="admin-action-arrow">→</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2026 ES SCHOOL - Tous droits réservés</p>
        <p>
          Plateforme de Gestion Académique
        </p>
      </footer>
    </div>
  );
};

export default Home;

