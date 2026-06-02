import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/LogoutButton.css";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button" title="Se déconnecter">
      🚪 Déconnexion
    </button>
  );
};

export default LogoutButton;
