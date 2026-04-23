import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Administrateur from "./pages/administrateur/Administrateur";
import Enseignant from "./pages/enseignant/Enseignant";
import Apprenant from "./pages/apprenant/Apprenant";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
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