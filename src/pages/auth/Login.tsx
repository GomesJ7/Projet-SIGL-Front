import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logoESEO from "../../images/ESEO.png";
import "../../css/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Récupérer le user depuis le localStorage car le state est mis à jour de manière async
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;

      // Redirection selon le rôle retourné par le back-end
      if (user?.role === "ADMIN") {
        navigate("/administrateur");
      } else if (user?.role === "ENSEIGNANT") {
        navigate("/enseignant");
      } else if (user?.role === "APPRENANT") {
        navigate("/apprenant");
      }
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError("Email ou mot de passe incorrect.");
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Une erreur est survenue. Vérifiez que le serveur est démarré.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
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
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="login-input"
              autoComplete="email"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="login-input"
              autoComplete="current-password"
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
