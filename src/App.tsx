import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Administrateur from "./pages/administrateur/Administrateur";
import Enseignant from "./pages/enseignant/Enseignant";
import Apprenant from "./pages/apprenant/Apprenant";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStages from "./pages/admin/AdminStages";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminDefenses from "./pages/admin/AdminDefenses";
import AdminFilieres from "./pages/admin/AdminFilieres";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminModules from "./pages/admin/AdminModules";
import AdminSalles from "./pages/admin/AdminSalles";
import AdminJuries from "./pages/admin/AdminJuries";
import ProtectedRoute from "./components/ProtectedRoute";
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Pages Admin CRUD */}
        <Route path="/admin/users"      element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/stages"     element={<ProtectedRoute><AdminStages /></ProtectedRoute>} />
        <Route path="/admin/companies"  element={<ProtectedRoute><AdminCompanies /></ProtectedRoute>} />
        <Route path="/admin/defenses"   element={<ProtectedRoute><AdminDefenses /></ProtectedRoute>} />
        <Route path="/admin/filieres"   element={<ProtectedRoute><AdminFilieres /></ProtectedRoute>} />
        <Route path="/admin/promotions" element={<ProtectedRoute><AdminPromotions /></ProtectedRoute>} />
        <Route path="/admin/modules"    element={<ProtectedRoute><AdminModules /></ProtectedRoute>} />
        <Route path="/admin/salles"     element={<ProtectedRoute><AdminSalles /></ProtectedRoute>} />
        <Route path="/admin/juries"     element={<ProtectedRoute><AdminJuries /></ProtectedRoute>} />

        {/* Pages par rôle */}
        <Route path="/administrateur" element={<ProtectedRoute><Administrateur /></ProtectedRoute>} />
        <Route path="/enseignant"     element={<ProtectedRoute><Enseignant /></ProtectedRoute>} />
        <Route path="/apprenant"      element={<ProtectedRoute><Apprenant /></ProtectedRoute>} />

        {/* Pages Enseignant */}
        <Route path="/enseignant/modules"          element={<ProtectedRoute><MyModules /></ProtectedRoute>} />
        <Route path="/enseignant/stages"           element={<ProtectedRoute><EncadrementStages /></ProtectedRoute>} />
        <Route path="/enseignant/rapports"         element={<ProtectedRoute><EvaluationRapports /></ProtectedRoute>} />
        <Route path="/enseignant/soutenances"      element={<ProtectedRoute><JurySoutenance /></ProtectedRoute>} />

        {/* Pages Apprenant */}
        <Route path="/apprenant/profil"            element={<ProtectedRoute><MonProfilAcademique /></ProtectedRoute>} />
        <Route path="/apprenant/stages"            element={<ProtectedRoute><MesStagesRapports /></ProtectedRoute>} />
        <Route path="/apprenant/resultats"         element={<ProtectedRoute><MesResultats /></ProtectedRoute>} />
        <Route path="/apprenant/contacts"          element={<ProtectedRoute><MesContacts /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
