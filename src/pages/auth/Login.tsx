import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logoESEO from "../../images/ESEO.png";
import "../../css/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const { login, user, loading, error } = useAuth();
  const navigate = useNavigate();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, motDePasse);
    if (success) {
      // navigate sera déclenché automatiquement par le useEffect ci-dessus
      // dès que `user` sera mis à jour dans le contexte
      navigate("/", { replace: true });
    }
  };

  const handleHomeClick = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Bouton Maison */}
        <button
          onClick={handleHomeClick}
          className="login-home-button"
          title="Retour à l'accueil"
        >
          🏠
        </button>

        <div className="login-form">
          <div className="login-logo-section">
            <img
              src={logoESEO}
              alt="Logo ES SCHOOL"
              className="login-logo"
            />
            <h2 className="login-title">Connexion</h2>
          </div>
          <form onSubmit={handleLogin} className="login-form-section">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="login-input"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
          {error && <p className="login-error">❌ {error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
