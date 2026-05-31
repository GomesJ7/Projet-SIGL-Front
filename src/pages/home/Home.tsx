import { useNavigate } from "react-router-dom";
import logoESEO from "../../images/ESEO.jpeg";
import "../../css/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <img
            src={logoESEO}
            alt="Logo ESEO"
          />

        </div>
        <button
          onClick={() => navigate("/login")}
          className="home-nav-button"
        >
          Connexion
        </button>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <img
          src={logoESEO}
          alt="Logo ESEO"
        />
        <h1>
          Bienvenue à ESEO
        </h1>
        <p>
          Plateforme de gestion académique complète pour notre établissement
        </p>
        <button
          onClick={() => navigate("/login")}
          className="home-hero-button"
        >
          Accéder à la plateforme
        </button>
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
                ESEO s'engage à fournir une éducation de qualité supérieure en combinant l'excellence académique avec
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
          Prêt à rejoindre ESEO ?
        </h2>
        <p>
          Accédez à la plateforme pour gérer votre parcours académique
        </p>
        <button
          onClick={() => navigate("/login")}
          className="home-cta-button"
        >
          Se Connecter
        </button>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2026 ESEO - Tous droits réservés</p>
        <p>
          Plateforme de Gestion Académique
        </p>
      </footer>
    </div>
  );
};

export default Home;
