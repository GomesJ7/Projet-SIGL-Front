import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Administrateur from "./pages/administrateur/Administrateur";
import Enseignant from "./pages/enseignant/Enseignant";
import Apprenant from "./pages/apprenant/Apprenant";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ModulesFilieresManagement from "./pages/administrateur/ModulesFilieresManagement";
import ApprenantManagement from "./pages/administrateur/ApprenantManagement";
import EnseignantManagement from "./pages/administrateur/EnseignantManagement";
import StageManagement from "./pages/administrateur/StageManagement";
import SoutenanceManagement from "./pages/administrateur/SoutenanceManagement";
import EntrepriseManagement from "./pages/administrateur/EntrepriseManagement";
import StatsReports from "./pages/administrateur/StatsReports";

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
                        path="/administrateur/modules-filieres"
                        element={
                            <ProtectedRoute>
                                <ModulesFilieresManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/administrateur/apprenants"
                        element={
                            <ProtectedRoute>
                                <ApprenantManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/administrateur/enseignants"
                        element={
                            <ProtectedRoute>
                                <EnseignantManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/administrateur/stages"
                        element={
                            <ProtectedRoute>
                                <StageManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/administrateur/soutenances"
                        element={
                            <ProtectedRoute>
                                <SoutenanceManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/administrateur/entreprises"
                        element={
                            <ProtectedRoute>
                                <EntrepriseManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/administrateur/statistiques"
                        element={
                            <ProtectedRoute>
                                <StatsReports />
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