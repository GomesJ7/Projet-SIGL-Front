import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import "../../css/AdminModulesFilieres.css";

interface StageItem {
  idStage: number;
  poste: string;
  nomEntreprise?: string;
  etat?: string;
}

interface RapportItem {
  idRapport: number;
  idStage: number;
  note?: number | null;
  commentaire?: string | null;
  statut?: string;
  dateDepot: string;
  titre?: string;
}

interface SoutenanceItem {
  idSoutenance: number;
  idStage: number;
  dateSoutenance: string;
  noteFinale?: number | null;
  observation?: string | null;
}

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  VALIDE: "Valide",
  REFUSE: "Refuse",
};

const ETAT_LABELS: Record<string, string> = {
  EN_COURS: "En cours",
  TERMINE: "Termine",
  VALIDE: "Valide",
  REFUSE: "Refuse",
};

const MesResultats = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [stages, setStages] = useState<StageItem[]>([]);
  const [rapports, setRapports] = useState<RapportItem[]>([]);
  const [soutenances, setSoutenances] = useState<SoutenanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    return fallback;
  };

  const loadData = async () => {
    if (!user?.idUtilisateur) return;
    const [stagesRes, rapportsRes, soutenancesRes] = await Promise.all([
      api.get<StageItem[]>(`/apprenants/${user.idUtilisateur}/stages`),
      api.get<RapportItem[]>(`/rapports/apprenant/${user.idUtilisateur}`),
      api.get<SoutenanceItem[]>("/soutenances"),
    ]);

    const myStages = stagesRes.data || [];
    const stageIds = new Set(myStages.map((s) => s.idStage));

    setStages(myStages);
    setRapports((rapportsRes.data || []).filter((r) => stageIds.has(r.idStage)));
    setSoutenances((soutenancesRes.data || []).filter((s) => stageIds.has(s.idStage)));
  };

  useEffect(() => {
    if (!user?.idUtilisateur) return;
    void (async () => {
      setLoading(true);
      try {
        await loadData();
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Impossible de charger vos resultats."));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.idUtilisateur]);

  const moyenneRapports = useMemo(() => {
    const notes = rapports
      .map((r) => (r.note !== null && r.note !== undefined ? Number(r.note) : null))
      .filter((n): n is number => n !== null);
    if (notes.length === 0) return "-";
    const avg = notes.reduce((sum, n) => sum + n, 0) / notes.length;
    return avg.toFixed(2);
  }, [rapports]);

  const moyenneSoutenances = useMemo(() => {
    const notes = soutenances
      .map((s) => (s.noteFinale !== null && s.noteFinale !== undefined ? Number(s.noteFinale) : null))
      .filter((n): n is number => n !== null);
    if (notes.length === 0) return "-";
    const avg = notes.reduce((sum, n) => sum + n, 0) / notes.length;
    return avg.toFixed(2);
  }, [soutenances]);

  const stageLabel = (idStage: number) => {
    const stage = stages.find((s) => s.idStage === idStage);
    if (!stage) return `Stage #${idStage}`;
    return `${stage.poste}${stage.nomEntreprise ? ` @ ${stage.nomEntreprise}` : ""}`;
  };

  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-home-button" title="Retour a l'accueil">🏠</button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Mes resultats</h1>
          <div className="admin-mf-actions">
            <button onClick={() => navigate("/apprenant")} className="admin-mf-back-button">Retour</button>
            <button onClick={() => { logout(); navigate("/login"); }} className="admin-logout-button">Déconnexion</button>
          </div>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecte :</strong> {displayName || user?.email}</p>
          <p><strong>Role :</strong> {user?.role}</p>
        </div>

        {error && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">
          <div className="admin-module-card">
            <h3>Vue d'ensemble</h3>
            <p><strong>Moyenne rapports :</strong> {moyenneRapports}</p>
            <p><strong>Moyenne soutenances :</strong> {moyenneSoutenances}</p>
            <p><strong>Stages valides :</strong> {stages.filter((s) => s.etat === "VALIDE").length}</p>
            <p><strong>Stages refuses :</strong> {stages.filter((s) => s.etat === "REFUSE").length}</p>
          </div>

          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Notes et verdicts des rapports</h3>
            {rapports.length === 0 ? (
              <p>Aucun rapport disponible.</p>
            ) : (
              <div className="admin-mf-stages">
                {rapports.map((r) => (
                  <div key={r.idRapport} className="admin-mf-stage-item">
                    <p><strong>{stageLabel(r.idStage)}</strong></p>
                    <p><strong>Titre :</strong> {r.titre || `Rapport #${r.idRapport}`}</p>
                    <p><strong>Date depot :</strong> {new Date(r.dateDepot).toLocaleDateString("fr-FR")}</p>
                    <p><strong>Note rapport :</strong> {r.note ?? "Non evalue"}</p>
                    <p><strong>Verdict rapport :</strong> {r.statut ? STATUT_LABELS[r.statut] || r.statut : "Non defini"}</p>
                    {r.commentaire && <p><strong>Commentaire enseignant :</strong> {r.commentaire}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Notes et verdicts de soutenance</h3>
            {soutenances.length === 0 ? (
              <p>Aucune soutenance disponible.</p>
            ) : (
              <div className="admin-mf-stages">
                {soutenances
                  .slice()
                  .sort((a, b) => new Date(a.dateSoutenance).getTime() - new Date(b.dateSoutenance).getTime())
                  .map((s) => {
                    const stage = stages.find((st) => st.idStage === s.idStage);
                    return (
                      <div key={s.idSoutenance} className="admin-mf-stage-item">
                        <p><strong>{stageLabel(s.idStage)}</strong></p>
                        <p><strong>Date soutenance :</strong> {new Date(s.dateSoutenance).toLocaleDateString("fr-FR")}</p>
                        <p><strong>Note soutenance :</strong> {s.noteFinale ?? "Non notee"}</p>
                        <p><strong>Verdict stage :</strong> {stage?.etat ? ETAT_LABELS[stage.etat] || stage.etat : "Non defini"}</p>
                        {s.observation && <p><strong>Observation jury :</strong> {s.observation}</p>}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {loading && <p className="admin-mf-info">Chargement en cours...</p>}
      </div>
    </div>
  );
};

export default MesResultats;

