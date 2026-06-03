import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import "../../css/AdminModulesFilieres.css";

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

const MonProfilEnseignant = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [juries, setJuries] = useState<JuryItem[]>([]);
  const [soutenances, setSoutenances] = useState<SoutenanceItem[]>([]);
  const [rapportsAEvaluer, setRapportsAEvaluer] = useState<RapportItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    return fallback;
  };

  useEffect(() => {
    if (!user?.idUtilisateur) return;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [modulesRes, stagesRes, juriesRes] = await Promise.all([
          api.get<ModuleItem[]>(`/enseignants/${user.idUtilisateur}/modules`),
          api.get<StageItem[]>(`/enseignants/${user.idUtilisateur}/stages`),
          api.get<JuryItem[]>(`/juries/enseignants/${user.idUtilisateur}`),
        ]);

        setModules(modulesRes.data || []);
        setStages(stagesRes.data || []);
        setJuries(juriesRes.data || []);

        try {
          const soutenancesRes = await api.get<SoutenanceItem[]>(`/soutenances/enseignant/${user.idUtilisateur}`);
          setSoutenances(soutenancesRes.data || []);
        } catch {
          setSoutenances([]);
        }

        try {
          const rapportsRes = await api.get<RapportItem[]>(`/rapports/enseignant/${user.idUtilisateur}/a-evaluer`);
          setRapportsAEvaluer(rapportsRes.data || []);
        } catch {
          setRapportsAEvaluer([]);
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Impossible de charger votre profil enseignant."));
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user?.idUtilisateur]);

  const stats = useMemo(() => ({
    modules: modules.length,
    stages: stages.length,
    jurys: juries.length,
    soutenances: soutenances.length,
    rapports: rapportsAEvaluer.length,
  }), [modules.length, stages.length, juries.length, soutenances.length, rapportsAEvaluer.length]);

  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-home-button" title="Retour a l'accueil">🏠</button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Mon profil enseignant</h1>
          <div className="admin-mf-actions">
            <button onClick={() => navigate("/enseignant")} className="admin-mf-back-button">Retour</button>
            <button onClick={() => { logout(); navigate("/login"); }} className="admin-logout-button">Logout</button>
          </div>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecte :</strong> {displayName || user?.email}</p>
          <p><strong>Role :</strong> {user?.role}</p>
        </div>

        {error && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">
          <div className="admin-module-card">
            <h3>Dashboard affectations</h3>
            <p><strong>Modules :</strong> {stats.modules}</p>
            <p><strong>Stages encadres :</strong> {stats.stages}</p>
            <p><strong>Jurys :</strong> {stats.jurys}</p>
            <p><strong>Soutenances :</strong> {stats.soutenances}</p>
            <p><strong>Rapports a evaluer :</strong> {stats.rapports}</p>
          </div>

          <div className="admin-module-card">
            <h3>Mes modules affectes</h3>
            {modules.length === 0 ? (
              <p>Aucun module affecte.</p>
            ) : (
              <div className="admin-mf-stages">
                {modules.map((m) => (
                  <div key={m.idModule} className="admin-mf-stage-item">
                    <p><strong>{m.codeModule || "Module"}</strong> - {m.libelle}</p>
                    <p><strong>Credits :</strong> {m.credits ?? "N/A"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Mes stages encadres</h3>
            {stages.length === 0 ? (
              <p>Aucun stage encadre.</p>
            ) : (
              <div className="admin-mf-stages">
                {stages.map((s) => (
                  <div key={s.idStage} className="admin-mf-stage-item">
                    <p><strong>#{s.idStage}</strong> - {s.poste} {s.nomEntreprise ? `@ ${s.nomEntreprise}` : ""}</p>
                    <p><strong>Etat :</strong> {s.etat ? ETAT_LABELS[s.etat] || s.etat : "Non defini"}</p>
                    {s.dateDebut && <p><strong>Debut :</strong> {new Date(s.dateDebut).toLocaleDateString("fr-FR")}</p>}
                    {s.dateFin && <p><strong>Fin :</strong> {new Date(s.dateFin).toLocaleDateString("fr-FR")}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-module-card">
            <h3>Mes jurys</h3>
            {juries.length === 0 ? (
              <p>Aucun jury affecte.</p>
            ) : (
              <div className="admin-mf-stages">
                {juries.map((j) => (
                  <div key={j.idJury} className="admin-mf-stage-item">
                    <p><strong>{j.nomJury}</strong></p>
                    <p><strong>Role :</strong> {j.roleJury || "Membre"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-module-card">
            <h3>Mes soutenances de jury</h3>
            {soutenances.length === 0 ? (
              <p>Aucune soutenance de jury.</p>
            ) : (
              <div className="admin-mf-stages">
                {soutenances.map((sout) => (
                  <div key={sout.idSoutenance} className="admin-mf-stage-item">
                    <p><strong>Soutenance #{sout.idSoutenance}</strong></p>
                    <p><strong>Stage :</strong> #{sout.idStage ?? "?"}</p>
                    <p><strong>Date :</strong> {new Date(sout.dateSoutenance).toLocaleDateString("fr-FR")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Rapports a evaluer</h3>
            {rapportsAEvaluer.length === 0 ? (
              <p>Aucun rapport en attente.</p>
            ) : (
              <div className="admin-mf-stages">
                {rapportsAEvaluer.map((r) => (
                  <div key={r.idRapport} className="admin-mf-stage-item">
                    <p><strong>Rapport #{r.idRapport}</strong> - {r.posteStage || `Stage #${r.idStage}`}</p>
                    <p><strong>Entreprise :</strong> {r.nomEntreprise || "N/A"}</p>
                    <p><strong>Statut :</strong> {r.statut ? STATUT_LABELS[r.statut] || r.statut : "Non defini"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && <p className="admin-mf-info">Chargement du profil enseignant...</p>}
      </div>
    </div>
  );
};

export default MonProfilEnseignant;

