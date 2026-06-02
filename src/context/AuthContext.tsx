import { createContext, useContext, useState } from "react";
import api from "../api/axiosConfig";

export type RoleType = "ADMIN" | "ENSEIGNANT" | "APPRENANT";

export interface AuthUser {
  idUtilisateur: number;
  email: string;
  nom: string;
  prenom: string;
  role: RoleType;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const getUserFromStorage = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getUserFromStorage);

  const login = async (email: string, motDePasse: string): Promise<void> => {
    // Appel réel au back-end Spring Boot
    const response = await api.post("/auth/login", { email, motDePasse });
    const data = response.data;

    // Stockage du token JWT pour les requêtes suivantes
    localStorage.setItem("token", data.token);

    const userData: AuthUser = {
      idUtilisateur: data.idUtilisateur,
      email: data.email,
      nom: data.nom,
      prenom: data.prenom,
      role: data.role as RoleType,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
};
