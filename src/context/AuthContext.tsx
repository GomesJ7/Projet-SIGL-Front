import { createContext, useContext, useState } from "react";

const AuthContext = createContext<any>(null);

// Mock users database
const USERS = {
  admin: {
    login: "admin",
    password: "password",
    role: "admin",
    name: "Administrateur"
  },
  teacher: {
    login: "teacher",
    password: "password",
    role: "teacher",
    name: "Enseignant"
  },
  student: {
    login: "student",
    password: "password",
    role: "student",
    name: "Étudiant"
  }
};

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);

  const login = (loginStr: string, password: string) => {
    // Vérifier les identifiants
    const userKey = Object.keys(USERS).find(
      key => USERS[key as keyof typeof USERS].login === loginStr && 
             USERS[key as keyof typeof USERS].password === password
    );

    if (userKey) {
      const foundUser = USERS[userKey as keyof typeof USERS];
      const userData = {
        login: foundUser.login,
        role: foundUser.role,
        name: foundUser.name
      };
      localStorage.setItem("token", "mock-token-" + foundUser.login);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
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

export const useAuth = () => useContext(AuthContext);
