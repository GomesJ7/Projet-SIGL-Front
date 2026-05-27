import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoESEO from "../../images/ESEO.jpeg";
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
            alt="Logo HIGH SCHOOL"
          />
          <h2>HIGH SCHOOL</h2>
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
          alt="Logo HIGH SCHOOL"
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
              Bienvenue à HIGH SCHOOL
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

      {/* Features Section */}
      <section className="home-features">
        <h2>
          Caractéristiques de la Plateforme
        </h2>

        <div className="home-features-grid">
          {/* Feature 1 */}
          <div className="home-feature-card">
            <div className="emoji">🎓</div>
            <h3>Gestion des Apprenants</h3>
            <p>
              Gestion complète des apprenants avec suivi académique, affectation à des filières et promotion
            </p>
          </div>

          {/* Feature 2 */}
          <div className="home-feature-card">
            <div className="emoji">👨‍🏫</div>
            <h3>Gestion des Enseignants</h3>
            <p>
              Affectation des modules, encadrement des stages et participation aux jurys de soutenance
            </p>
          </div>

          {/* Feature 3 */}
          <div className="home-feature-card">
            <div className="emoji">💼</div>
            <h3>Gestion des Stages</h3>
            <p>
              Création et suivi des stages, affectation des apprenants et encadrants, suivi d'état en temps réel
            </p>
          </div>

          {/* Feature 4 */}
          <div className="home-feature-card">
            <div className="emoji">📄</div>
            <h3>Gestion des Rapports</h3>
            <p>
              Dépôt et consultation des rapports de stage avec évaluation et notation par les enseignants
            </p>
          </div>

          {/* Feature 5 */}
          <div className="home-feature-card">
            <div className="emoji">⚖️</div>
            <h3>Gestion des Soutenances</h3>
            <p>
              Organisation complète des jurys, planification des dates et suivi des résultats
            </p>
          </div>

          {/* Feature 6 */}
          <div className="home-feature-card">
            <div className="emoji">📊</div>
            <h3>Statistiques & Rapports</h3>
            <p>
              Tableaux de bord détaillés avec statistiques, taux de réussite et évolution des performances
            </p>
          </div>
        </div>
      </section>

      {/* About School Section */}
      <section className="home-about">
        <div className="home-about-container">
          <h2>
            À Propos de l'École
          </h2>
          <div className="home-about-grid">
            <div className="home-about-item">
              <h3>
                📍 Notre Mission
              </h3>
              <p>
                HIGH SCHOOL s'engage à fournir une éducation de qualité supérieure en combinant l'excellence académique avec
                l'expérience pratique. Nous préparons les étudiants à devenir des professionnels compétents et innovants.
              </p>
            </div>

            <div className="home-about-item">
              <h3>
                🎯 Nos Valeurs
              </h3>
              <ul>
                <li>✓ Excellence académique</li>
                <li>✓ Innovation et créativité</li>
                <li>✓ Intégrité et transparence</li>
                <li>✓ Collaboration et entraide</li>
              </ul>
            </div>

            <div className="home-about-item">
              <h3>
                🏆 Nos Atouts
              </h3>
              <ul>
                <li>✓ Enseignants expérimentés</li>
                <li>✓ Partenaires industriels</li>
                <li>✓ Équipements modernes</li>
                <li>✓ Stages internationaux</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <h2>
          {user ? "Accédez à votre tableau de bord" : "Prêt à rejoindre HIGH SCHOOL ?"}
        </h2>
        <p>
          {user 
            ? "Naviguez vers les différentes sections de la plateforme selon votre rôle"
            : "Accédez à la plateforme pour gérer votre parcours académique"
          }
        </p>
        {!user && (
          <button
            onClick={() => navigate("/login")}
            className="home-cta-button"
          >
            Se Connecter
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2026 HIGH SCHOOL - Tous droits réservés</p>
        <p>
          Plateforme de Gestion Académique
        </p>
      </footer>
    </div>
  );
};

export default Home;

