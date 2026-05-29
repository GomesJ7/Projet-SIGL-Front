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
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, motDePasse);
    if (success) {
      // Redirection à l'accueil après connexion
      navigate("/");
    }
  };

  const handleRedirection = (role: string) => {
    // Redirection toujours vers l'accueil
    navigate("/");
  };

  const handleHomeClick = () => {
    navigate("/");
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
              alt="Logo HIGH SCHOOL" 
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
          
          {/* <div className="login-test-accounts">
            <p><strong>Pour tester:</strong></p>
            <p>Créez un compte ou utilisez les identifiants de test créés dans la base de données.</p>
            <p className="login-note">💡 Le serveur doit être accessible sur <code>http://localhost:8080</code></p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
