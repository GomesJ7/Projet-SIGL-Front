import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import "../../css/AdminModulesFilieres.css";

interface SoutenanceItem {
  idSoutenance: number;
  dateSoutenance: string;
  noteFinale?: number | null;
  observation?: string | null;
  idStage?: number;
  idJury?: number;
  nomSalle?: string;
}

interface StageItem {
  idStage: number;
  poste: string;
  nomEntreprise?: string;
}

interface JuryItem {
  idJury: number;
  nomJury: string;
}

interface JuryEnseignantItem {
  idJury: number;
}

const JurySoutenance = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [soutenances, setSoutenances] = useState<SoutenanceItem[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [juries, setJuries] = useState<JuryItem[]>([]);
  const [juryAssignmentsCount, setJuryAssignmentsCount] = useState(0);

  const [selectedSoutenanceId, setSelectedSoutenanceId] = useState("");
  const [noteFinale, setNoteFinale] = useState("");
  const [observation, setObservation] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr?.response?.status === 403) return "Action non autorisee.";
    return fallback;
  };

  const loadData = async () => {
    if (!user?.idUtilisateur) return;

    const [stagesRes, juriesRes, mesJuriesRes, soutenancesRes] = await Promise.all([
      api.get<StageItem[]>("/stages"),
      api.get<JuryItem[]>("/juries"),
      api.get<JuryEnseignantItem[]>(`/juries/enseignants/${user.idUtilisateur}`),
      api.get<SoutenanceItem[]>("/soutenances"),
    ]);

    setStages(stagesRes.data || []);
    setJuries(juriesRes.data || []);
    const mesJuries = mesJuriesRes.data || [];
    const juryIds = new Set(mesJuries.map((j) => j.idJury));
    setJuryAssignmentsCount(juryIds.size);

    const filteredByJury = (soutenancesRes.data || []).filter((s) => s.idJury && juryIds.has(s.idJury));

    try {
      const soutRes = await api.get<SoutenanceItem[]>(`/soutenances/enseignant/${user.idUtilisateur}`);
      const fromDedicatedEndpoint = soutRes.data || [];

      // Si l'endpoint dedie renvoie vide alors que des jurys sont affectes,
      // on utilise le fallback filtré pour eviter les faux-negatifs.
      if (fromDedicatedEndpoint.length === 0 && filteredByJury.length > 0) {
        setSoutenances(filteredByJury);
        return;
      }

      // Fusion defensive dedupee (utile si les deux sources divergent).
      const merged = new Map<number, SoutenanceItem>();
      fromDedicatedEndpoint.forEach((s) => merged.set(s.idSoutenance, s));
      filteredByJury.forEach((s) => merged.set(s.idSoutenance, s));
      setSoutenances(Array.from(merged.values()));
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr?.response?.status !== 404) throw err;
      setSoutenances(filteredByJury);
    }
  };

  useEffect(() => {
    if (!user?.idUtilisateur) return;
    // Chargement initial des soutenances de jury enseignant.
    void (async () => {
      setLoading(true);
      try {
        await loadData();
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Impossible de charger les soutenances de jury."));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.idUtilisateur]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const stageLabelById = useMemo(() => {
    const map = new Map<number, string>();
    stages.forEach((s) => {
      map.set(s.idStage, `${s.poste}${s.nomEntreprise ? ` @ ${s.nomEntreprise}` : ""}`);
    });
    return map;
  }, [stages]);

  const juryNameById = useMemo(() => {
    const map = new Map<number, string>();
    juries.forEach((j) => map.set(j.idJury, j.nomJury));
    return map;
  }, [juries]);

  const soutenanceLabel = (s: SoutenanceItem) => {
    const stageLabel = s.idStage ? stageLabelById.get(s.idStage) || `Stage #${s.idStage}` : "Stage inconnu";
    const dateStr = new Date(s.dateSoutenance).toLocaleDateString("fr-FR");
    return `#${s.idSoutenance} - ${stageLabel} (${dateStr})`;
  };

  const handleSelectSoutenance = (id: string) => {
    setSelectedSoutenanceId(id);
    const current = soutenances.find((s) => String(s.idSoutenance) === id);
    setNoteFinale(current?.noteFinale !== undefined && current?.noteFinale !== null ? String(current.noteFinale) : "");
    setObservation(current?.observation || "");
  };

  const handleUpdateVerdict = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedSoutenanceId) {
      setError("Selectionnez une soutenance.");
      return;
    }

    if (noteFinale && (Number(noteFinale) < 0 || Number(noteFinale) > 20)) {
      setError("La note doit etre comprise entre 0 et 20.");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/soutenances/${selectedSoutenanceId}/verdict`, {
        noteFinale: noteFinale ? Number(noteFinale) : null,
        observation: observation.trim() || null,
      });
      setMessage("Verdict mis a jour avec succes.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Impossible de mettre a jour le verdict."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-home-button" title="Retour a l'accueil">
        🏠
      </button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Jury de Soutenance</h1>
          <div className="admin-mf-actions">
            <button onClick={() => navigate("/enseignant")} className="admin-mf-back-button">Retour</button>
            <button onClick={() => { logout(); navigate("/login"); }} className="admin-logout-button">Logout</button>
          </div>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecte :</strong> {displayName || user?.email}</p>
          <p><strong>Role :</strong> {user?.role}</p>
        </div>

        {message && <p className="admin-mf-success">{message}</p>}
        {error && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">
          <div className="admin-module-card">
            <h3>Verdict Enseignant</h3>
            <form onSubmit={handleUpdateVerdict} className="admin-mf-form">
              <select
                value={selectedSoutenanceId}
                onChange={(e) => handleSelectSoutenance(e.target.value)}
                disabled={loading}
              >
                <option value="">Selectionner une soutenance</option>
                {soutenances.map((s) => (
                  <option key={s.idSoutenance} value={s.idSoutenance}>{soutenanceLabel(s)}</option>
                ))}
              </select>

              <label className="admin-mf-label">Note Enseignant (0-20)</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={noteFinale}
                onChange={(e) => setNoteFinale(e.target.value)}
                placeholder="Ex: 16.5"
                disabled={loading}
              />

              <label className="admin-mf-label">Observation</label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ajouter une observation"
                rows={4}
                disabled={loading}
                style={{ resize: "vertical", padding: "10px", borderRadius: "4px", border: "1px solid #ced4da" }}
              />

              <button type="submit" className="admin-module-button" disabled={loading}>
                Enregistrer
              </button>
            </form>
          </div>

          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Mes soutenances de jury</h3>
            {soutenances.length === 0 ? (
              <>
                <p>Aucune soutenance assignee a vos jurys.</p>
                {juryAssignmentsCount > 0 && (
                  <p className="admin-mf-info">
                    Diagnostic: vous etes affecte a {juryAssignmentsCount} jury(s), mais aucune soutenance ne porte
                    l'un de ces id_jury.
                  </p>
                )}
              </>
            ) : (
              <div className="admin-mf-stages">
                {soutenances.map((s) => (
                  <div key={s.idSoutenance} className="admin-mf-stage-item">
                    <p><strong>#{s.idSoutenance}</strong> - {s.idStage ? stageLabelById.get(s.idStage) || `Stage #${s.idStage}` : "Stage inconnu"}</p>
                    <p>📅 <strong>Date :</strong> {new Date(s.dateSoutenance).toLocaleDateString("fr-FR")} a {new Date(s.dateSoutenance).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p>🏛️ <strong>Salle :</strong> {s.nomSalle?.trim() ? s.nomSalle : "Non renseignee"}</p>
                    <p>👥 <strong>Jury :</strong> {s.idJury ? juryNameById.get(s.idJury) || `Jury #${s.idJury}` : "Non assigne"}</p>
                    <p>⭐ <strong>Note Enseignant :</strong> {s.noteFinale ?? "Non notee"}</p>
                    {s.observation && <p>📝 <strong>Observation :</strong> {s.observation}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JurySoutenance;

