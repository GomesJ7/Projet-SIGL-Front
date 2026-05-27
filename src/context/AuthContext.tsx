import { createContext, useContext, useState } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, motDePasse: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", {
        email,
        motDePasse
      });

      const { token, type, email: userEmail, nom, prenom, role, idUtilisateur } = response.data;

      // Sauvegarder le token
      localStorage.setItem("token", token);
      localStorage.setItem("tokenType", type);

      // Préparer les données utilisateur
      const userData = {
        idUtilisateur,
        email: userEmail,
        nom,
        prenom,
        role: convertRoleToFrontend(role) // Convertir le rôle backend au format frontend
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      "Identifiants invalides ou serveur indisponible";
      setError(errorMsg);
      console.error("Erreur de connexion:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const convertRoleToFrontend = (backendRole: string): string => {
    // Convertir les rôles du backend (ADMIN, ENSEIGNANT, APPRENANT) 
    // au format frontend (admin, teacher, student)
    const roleMap: { [key: string]: string } = {
      "ADMIN": "admin",
      "ENSEIGNANT": "teacher",
      "APPRENANT": "student"
    };
    return roleMap[backendRole] || backendRole.toLowerCase();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("user");
    setUser(null);
    setError(null);
  };

  // Charger l'utilisateur depuis le localStorage au démarrage
  const initAuth = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, initAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
