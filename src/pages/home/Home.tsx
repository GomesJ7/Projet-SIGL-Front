import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoESEO from "../../images/ESEO.png";
import "../../css/Home.css";

const ADMIN_CARDS = [
  { icon: "👥", title: "Utilisateurs", desc: "Créer, modifier et supprimer les utilisateurs (apprenants, enseignants, admins)", path: "/admin/users" },
  { icon: "💼", title: "Stages", desc: "Créer les stages, affecter apprenants/encadrants et suivre l'état", path: "/admin/stages" },
  { icon: "🏢", title: "Entreprises", desc: "Gérer les entreprises partenaires et leurs contacts", path: "/admin/companies" },
  { icon: "🎓", title: "Soutenances", desc: "Planifier les soutenances, salles, jurys et verdicts", path: "/admin/defenses" },
  { icon: "📚", title: "Filières", desc: "Créer et organiser les filières", path: "/admin/filieres" },
  { icon: "🎓", title: "Promotions", desc: "Gérer les promotions par année", path: "/admin/promotions" },
  { icon: "📖", title: "Modules", desc: "Modules, crédits et affectation d'enseignants", path: "/admin/modules" },
  { icon: "🚪", title: "Salles", desc: "Gérer les salles et localisations", path: "/admin/salles" },
  { icon: "👨‍⚖️", title: "Jurys", desc: "Composer les jurys de soutenance", path: "/admin/juries" },
];

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
      student: "🎓 Apprenant",
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="home-nav-logo">
          <img src={logoESEO} alt="Logo ES SCHOOL" />
          <h2>ES SCHOOL</h2>
        </div>
        <div className="home-nav-actions">
          {user ? (
            <div className="home-nav-user">
              <div className="home-user-info">
                <span className="home-user-name">{user.prenom} {user.nom}</span>
                <span className="home-user-role">{getRoleLabel(user.role)}</span>
              </div>
              <button onClick={handleLogout} className="home-nav-logout-button" title="Se déconnecter">
                🚪 Déconnexion
              </button>
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="home-nav-button">
              Connexion
            </button>
          )}
        </div>
      </nav>

      <section className="home-hero">
        <img src={logoESEO} alt="Logo ES SCHOOL" />
        {user ? (
          <>
            <h1>Bienvenue, {user.prenom} {user.nom}</h1>
            <p>Vous êtes connecté en tant que <strong>{getRoleLabel(user.role)}</strong></p>
            <div className="home-user-details">
            </div>
          </>
        ) : (
          <>
            <h1>Bienvenue à ES SCHOOL</h1>
            <p>Plateforme de gestion académique complète pour notre établissement</p>
          </>
        )}
        {!user && (
          <button onClick={() => navigate("/login")} className="home-hero-button">
            Accéder à la plateforme
          </button>
        )}
      </section>

      {user && user.role === "admin" && (
        <section className="home-admin-dashboard">
          <div className="home-admin-container">
            <h2>📊 Tableau de Bord Administrateur</h2>
            <p className="admin-subtitle">Gérez l'ensemble des entités de la plateforme</p>
            <div className="admin-actions-grid">
              {ADMIN_CARDS.map((c) => (
                <div
                  key={c.path}
                  className="admin-action-card"
                  onClick={() => navigate(c.path)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(c.path); }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="admin-action-icon">{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <span className="admin-action-arrow">→</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="home-footer">
        <p>© 2026 ES SCHOOL - Tous droits réservés</p>
        <p>Plateforme de Gestion Académique</p>
      </footer>
    </div>
  );
};

export default Home;
