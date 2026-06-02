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
import MyModules from "./pages/enseignant/MyModules";
import EncadrementStages from "./pages/enseignant/EncadrementStages";
import EvaluationRapports from "./pages/enseignant/EvaluationRapports";
import JurySoutenance from "./pages/enseignant/JurySoutenance";
import MonProfilAcademique from "./pages/apprenant/MonProfilAcademique";
import MesStagesRapports from "./pages/apprenant/MesStagesRapports";
import MesResultats from "./pages/apprenant/MesResultats";
import MesContacts from "./pages/apprenant/MesContacts";

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
                        path="/enseignant/mes-modules"
                        element={
                            <ProtectedRoute>
                                <MyModules />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/enseignant/encadrement-stages"
                        element={
                            <ProtectedRoute>
                                <EncadrementStages />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/enseignant/jury-soutenances"
                        element={
                            <ProtectedRoute>
                                <JurySoutenance />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/enseignant/evaluation-rapports"
                        element={
                            <ProtectedRoute>
                                <EvaluationRapports />
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

                    <Route
                        path="/apprenant/profil-academique"
                        element={
                            <ProtectedRoute>
                                <MonProfilAcademique />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/apprenant/stages-rapports"
                        element={
                            <ProtectedRoute>
                                <MesStagesRapports />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/apprenant/resultats"
                        element={
                            <ProtectedRoute>
                                <MesResultats />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/apprenant/contacts"
                        element={
                            <ProtectedRoute>
                                <MesContacts />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;