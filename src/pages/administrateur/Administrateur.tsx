import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/Administrateur.css";

const MODULES = [
  { icon: "👥", title: "Utilisateurs", desc: ["CRUD apprenants, enseignants, admins", "Affectation promotion / filière"], path: "/admin/users", btn: "Gérer les utilisateurs" },
  { icon: "💼", title: "Stages", desc: ["Création de stages", "Affectation apprenant / encadrant", "Suivi de l'état"], path: "/admin/stages", btn: "Gérer les stages" },
  { icon: "🏢", title: "Entreprises", desc: ["Entreprises partenaires", "Contacts & adresses"], path: "/admin/companies", btn: "Gérer les entreprises" },
  { icon: "🎓", title: "Soutenances", desc: ["Planification", "Salle & jury", "Verdict / note"], path: "/admin/defenses", btn: "Gérer les soutenances" },
  { icon: "📚", title: "Filières", desc: ["Créer / modifier les filières"], path: "/admin/filieres", btn: "Gérer les filières" },
  { icon: "🎓", title: "Promotions", desc: ["Créer / modifier les promotions"], path: "/admin/promotions", btn: "Gérer les promotions" },
  { icon: "📖", title: "Modules", desc: ["Modules & crédits", "Affectation d'enseignants"], path: "/admin/modules", btn: "Gérer les modules" },
  { icon: "🚪", title: "Salles", desc: ["Salles & localisations"], path: "/admin/salles", btn: "Gérer les salles" },
  { icon: "👨‍⚖️", title: "Jurys", desc: ["Jurys de soutenance", "Membres & rôles"], path: "/admin/juries", btn: "Gérer les jurys" },
];

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-home-button" title="Retour à l'accueil">🏠</button>
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Espace Administrateur</h1>
          <button onClick={handleLogout} className="admin-logout-button">Logout</button>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecté :</strong> {user?.prenom} {user?.nom}</p>
          <p><strong>Email :</strong> {user?.email}</p>
          <p><strong>Rôle :</strong> {user?.role}</p>
        </div>

        <div className="admin-modules-grid">
          {MODULES.map((m) => (
            <div className="admin-module-card" key={m.path + m.title}>
              <h3>{m.icon} {m.title}</h3>
              <ul>{m.desc.map((d, i) => <li key={i}>• {d}</li>)}</ul>
              <button className="admin-module-button" onClick={() => navigate(m.path)}>{m.btn}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
