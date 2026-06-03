import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import "../../css/Enseignant.css";

interface ModuleItem {
  idModule: number;
  codeModule?: string;
  libelle: string;
  credits?: number;
}

interface StageItem {
  idStage: number;
  poste: string;
  nomEntreprise?: string;
  etat?: string;
  dateDebut?: string;
  dateFin?: string;
}

interface JuryItem {
  idJury: number;
  nomJury: string;
  roleJury?: string;
}

interface SoutenanceItem {
  idSoutenance: number;
  idStage?: number;
  dateSoutenance: string;
}

interface RapportItem {
  idRapport: number;
  idStage: number;
  posteStage?: string;
  nomEntreprise?: string;
  statut?: string;
}

const ETAT_LABELS: Record<string, string> = {
  EN_COURS: "En cours",
  TERMINE: "Termine",
  VALIDE: "Valide",
  REFUSE: "Refuse",
};

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  VALIDE: "Valide",
  REFUSE: "Refuse",
};

const Teacher = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [juries, setJuries] = useState<JuryItem[]>([]);
  const [soutenances, setSoutenances] = useState<SoutenanceItem[]>([]);
  const [rapportsAEvaluer, setRapportsAEvaluer] = useState<RapportItem[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    return fallback;
  };

  useEffect(() => {
    if (!user?.idUtilisateur) return;

    const loadDashboard = async () => {
      setLoadingDashboard(true);
      setDashboardError("");
      try {
        const [modulesRes, stagesRes, juriesRes, soutenancesRes] = await Promise.all([
          api.get<ModuleItem[]>(`/enseignants/${user.idUtilisateur}/modules`),
          api.get<StageItem[]>(`/enseignants/${user.idUtilisateur}/stages`),
          api.get<JuryItem[]>(`/juries/enseignants/${user.idUtilisateur}`),
          api.get<SoutenanceItem[]>(`/soutenances/enseignant/${user.idUtilisateur}`),
        ]);

        setModules(modulesRes.data || []);
        setStages(stagesRes.data || []);
        setJuries(juriesRes.data || []);
        setSoutenances(soutenancesRes.data || []);

        try {
          const rapportsRes = await api.get<RapportItem[]>(`/rapports/enseignant/${user.idUtilisateur}/a-evaluer`);
          setRapportsAEvaluer(rapportsRes.data || []);
        } catch {
          setRapportsAEvaluer([]);
        }
      } catch (err: unknown) {
        setDashboardError(getApiErrorMessage(err, "Impossible de charger le dashboard enseignant."));
      } finally {
        setLoadingDashboard(false);
      }
    };

    void loadDashboard();
  }, [user?.idUtilisateur]);

  const stats = useMemo(() => ({
    modules: modules.length,
    stages: stages.length,
    jurys: juries.length,
    soutenances: soutenances.length,
    rapports: rapportsAEvaluer.length,
  }), [modules.length, stages.length, juries.length, soutenances.length, rapportsAEvaluer.length]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleMyModules = () => {
    navigate("/enseignant/mes-modules");
  };

  const handleMesStagiaires = () => {
    navigate("/enseignant/encadrement-stages");
  };

  const handleEvaluationRapports = () => {
    navigate("/enseignant/evaluation-rapports");
  };

  const handleJurySoutenances = () => {
    navigate("/enseignant/jury-soutenances");
  };

  return (
    <div className="enseignant-container">
      <button onClick={handleHomeClick} className="enseignant-home-button" title="Retour à l'accueil">
        🏠
      </button>
      <div className="enseignant-wrapper">
        <div className="enseignant-header">
          <h1 className="enseignant-title">Espace Enseignant</h1>
          <button onClick={handleLogout} className="enseignant-logout-button">
            Logout
          </button>
        </div>

        <div className="enseignant-user-info">
          <p><strong>Utilisateur connecté:</strong> {displayName || user?.email}</p>
          <p><strong>Rôle:</strong> {user?.role}</p>
        </div>

        {dashboardError && <p className="enseignant-dashboard-error">{dashboardError}</p>}

        <div className="enseignant-dashboard-grid">
          <div className="enseignant-dashboard-kpi">
            <p className="enseignant-dashboard-kpi-label">Modules</p>
            <p className="enseignant-dashboard-kpi-value">{stats.modules}</p>
          </div>
          <div className="enseignant-dashboard-kpi">
            <p className="enseignant-dashboard-kpi-label">Stages encadres</p>
            <p className="enseignant-dashboard-kpi-value">{stats.stages}</p>
          </div>
          <div className="enseignant-dashboard-kpi">
            <p className="enseignant-dashboard-kpi-label">Jurys</p>
            <p className="enseignant-dashboard-kpi-value">{stats.jurys}</p>
          </div>
          <div className="enseignant-dashboard-kpi">
            <p className="enseignant-dashboard-kpi-label">Soutenances</p>
            <p className="enseignant-dashboard-kpi-value">{stats.soutenances}</p>
          </div>
          <div className="enseignant-dashboard-kpi">
            <p className="enseignant-dashboard-kpi-label">Rapports a evaluer</p>
            <p className="enseignant-dashboard-kpi-value">{stats.rapports}</p>
          </div>
        </div>

        <div className="enseignant-dashboard-sections">
          <div className="enseignant-dashboard-card">
            <h3>Mes affectations de modules</h3>
            {modules.length === 0 ? (
              <p>Aucun module affecte.</p>
            ) : (
              <div className="enseignant-dashboard-list">
                {modules.map((m) => (
                  <div key={m.idModule} className="enseignant-dashboard-item">
                    <p><strong>{m.codeModule || "Module"}</strong> - {m.libelle}</p>
                    <p>Credits: {m.credits ?? "N/A"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="enseignant-dashboard-card">
            <h3>Mes stages encadres</h3>
            {stages.length === 0 ? (
              <p>Aucun stage encadre.</p>
            ) : (
              <div className="enseignant-dashboard-list">
                {stages.map((s) => (
                  <div key={s.idStage} className="enseignant-dashboard-item">
                    <p><strong>#{s.idStage}</strong> - {s.poste} {s.nomEntreprise ? `@ ${s.nomEntreprise}` : ""}</p>
                    <p>Etat: {s.etat ? ETAT_LABELS[s.etat] || s.etat : "Non defini"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="enseignant-dashboard-card">
            <h3>Mes jurys et soutenances</h3>
            {juries.length === 0 ? (
              <p>Aucun jury affecte.</p>
            ) : (
              <div className="enseignant-dashboard-list">
                {juries.map((j) => (
                  <div key={j.idJury} className="enseignant-dashboard-item">
                    <p><strong>{j.nomJury}</strong></p>
                    <p>Role: {j.roleJury || "Membre"}</p>
                  </div>
                ))}
                {soutenances.map((sout) => (
                  <div key={`sout-${sout.idSoutenance}`} className="enseignant-dashboard-item">
                    <p><strong>Soutenance #{sout.idSoutenance}</strong> (stage #{sout.idStage ?? "?"})</p>
                    <p>Date: {new Date(sout.dateSoutenance).toLocaleDateString("fr-FR")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="enseignant-dashboard-card enseignant-dashboard-card-full">
            <h3>Rapports a evaluer</h3>
            {rapportsAEvaluer.length === 0 ? (
              <p>Aucun rapport en attente d'evaluation.</p>
            ) : (
              <div className="enseignant-dashboard-list">
                {rapportsAEvaluer.map((r) => (
                  <div key={r.idRapport} className="enseignant-dashboard-item">
                    <p><strong>Rapport #{r.idRapport}</strong> - {r.posteStage || `Stage #${r.idStage}`}</p>
                    <p>Entreprise: {r.nomEntreprise || "N/A"}</p>
                    <p>Statut: {r.statut ? STATUT_LABELS[r.statut] || r.statut : "Non defini"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loadingDashboard && <p className="enseignant-dashboard-loading">Chargement du dashboard...</p>}

        <div className="enseignant-modules-grid">
          <div className="enseignant-module-card">
            <h3> Mes Modules</h3>
            <p>Gérer les modules qui me sont affectés</p>
            <button className="enseignant-module-button" onClick={handleMyModules}>
              Voir mes modules
            </button>
          </div>

          <div className="enseignant-module-card">
            <h3> Encadrement de Stages</h3>
            <p>Suivre les apprenants que j'encadre</p>
            <button className="enseignant-module-button" onClick={handleMesStagiaires}>
              Mes stagiaires
            </button>
          </div>

          <div className="enseignant-module-card">
            <h3> Évaluation des Rapports</h3>
            <p>Évaluer et commenter les rapports de stage</p>
            <button className="enseignant-module-button" onClick={handleEvaluationRapports}>
              Rapports à évaluer
            </button>
          </div>

          <div className="enseignant-module-card">
            <h3>Jury de Soutenance</h3>
            <p>Participer aux jurys d'évaluation</p>
            <button className="enseignant-module-button" onClick={handleJurySoutenances}>
              Mes jurys
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Teacher;
