import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Administrateur from "./pages/administrateur/Administrateur";
import Enseignant from "./pages/enseignant/Enseignant";
import Apprenant from "./pages/apprenant/Apprenant";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
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
        </AuthProvider>
    );
}

export default App;