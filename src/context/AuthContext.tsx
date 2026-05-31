import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const convertRoleToFrontend = (backendRole: string): string => {
    const roleMap: { [key: string]: string } = {
      ADMIN: "admin",
      ENSEIGNANT: "teacher",
      APPRENANT: "student",
    };
    return roleMap[backendRole] || backendRole.toLowerCase();
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("user");
    setUser(null);
    setError(null);
  }, []);

  // Stabilisé avec useCallback pour éviter la boucle infinie dans App.tsx
  const initAuth = useCallback(() => {
    if (isInitialized) return;
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          logout();
        }
      }
    } finally {
      setIsInitialized(true);
    }
  }, [isInitialized, logout]);

  const login = async (email: string, motDePasse: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, motDePasse });

      const {
        token,
        type,
        email: userEmail,
        nom,
        prenom,
        role,
        idUtilisateur,
      } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("tokenType", type);

      const userData = {
        idUtilisateur,
        email: userEmail,
        nom,
        prenom,
        role: convertRoleToFrontend(role),
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Identifiants invalides ou serveur indisponible";
      setError(errorMsg);
      console.error("Erreur de connexion:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, error, initAuth, isInitialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
