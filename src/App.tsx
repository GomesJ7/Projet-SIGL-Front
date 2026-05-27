import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Administrateur from "./pages/administrateur/Administrateur";
import Enseignant from "./pages/enseignant/Enseignant";
import Apprenant from "./pages/apprenant/Apprenant";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    const { initAuth } = useAuth();

    // Initialiser l'authentification au démarrage
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Page d'accueil */}
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route
                    path="/administrateur"
                    element={
                        <ProtectedRoute>
                            <Administrateur />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/enseignant"
                    element={
                        <ProtectedRoute>
                            <Enseignant />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/apprenant"
                    element={
                        <ProtectedRoute>
                            <Apprenant />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;