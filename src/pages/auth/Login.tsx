import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logoESEO from "../../images/ESEO.jpeg";
import "../../css/Login.css";

const Login = () => {
  const [loginStr, setLoginStr] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    setError("");
    const success = login(loginStr, password);
    if (success) {
      // Redirection selon le rôle
      if (user?.role === "admin") {
        navigate("/administrateur");
      } else if (user?.role === "teacher") {
        navigate("/enseignant");
      } else if (user?.role === "student") {
        navigate("/apprenant");
      }
    } else {
      setError("Identifiants invalides. Utilisez admin/password, teacher/password ou student/password");
    }
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
          <div className="login-form-section">
            <input
              placeholder="Login"
              value={loginStr}
              onChange={(e) => setLoginStr(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              onClick={handleLogin}
              className="login-button"
            >
              Login
            </button>
          </div>
          {error && <p className="login-error">{error}</p>}
          
          <div className="login-test-accounts">
            <p><strong>Comptes de test:</strong></p>
            <p>Administrateur: <code>admin / password</code></p>
            <p>Enseignant: <code>teacher / password</code></p>
            <p>Apprenant: <code>student / password</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
