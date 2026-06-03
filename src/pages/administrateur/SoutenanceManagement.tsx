import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import "../../css/AdminModulesFilieres.css";

interface SoutenanceItem {
  idSoutenance: number;
  dateSoutenance: string;
  noteFinale?: number;
  observation?: string;
  idStage?: number;
  idJury?: number;
  stagePresentationLabel?: string;
  nomSalle?: string;
  nomJury?: string;
}

interface StageItem {
  idStage: number;
  poste: string;
  nomEntreprise?: string;
  etat?: string;
}

interface JuryItem {
  idJury: number;
  nomJury: string;
}

type ActionType = "" | "creer" | "modifier" | "supprimer" | "verdict";

const SoutenanceManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [soutenances, setSoutenances] = useState<SoutenanceItem[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [juries, setJuries] = useState<JuryItem[]>([]);

  const [soutenanceAction, setSoutenanceAction] = useState<ActionType>("");

  // Création soutenance
  const [createDateSoutenance, setCreateDateSoutenance] = useState("");
  const [createStageId, setCreateStageId] = useState("");
  const [createSalleNom, setCreateSalleNom] = useState("");
  const [createJuryId, setCreateJuryId] = useState("");

  // Modification soutenance
  const [editSoutenanceId, setEditSoutenanceId] = useState("");
  const [editDateSoutenance, setEditDateSoutenance] = useState("");
  const [editStageId, setEditStageId] = useState("");
  const [editSalleNom, setEditSalleNom] = useState("");
  const [editJuryId, setEditJuryId] = useState("");
  const [deleteSoutenanceId, setDeleteSoutenanceId] = useState("");

  // Verdict
  const [verdictSoutenanceId, setVerdictSoutenanceId] = useState("");
  const [verdictNote, setVerdictNote] = useState("");
  const [verdictObservation, setVerdictObservation] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const [soutenancesRes, stagesRes, juriesRes] = await Promise.all([
      api.get("/soutenances"),
      api.get("/stages"),
      api.get("/juries"),
    ]);
    setSoutenances(soutenancesRes.data || []);
    setStages(stagesRes.data || []);
    setJuries(juriesRes.data || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadData();
      } catch {
        setError("Impossible de charger les données.");
      }
    };
    void init();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const resetFlash = () => {
    setMessage("");
    setError("");
  };

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    if (axiosErr?.response?.status === 403) return "Action non autorisée.";
    return fallback;
  };

  const handleSelectSoutenanceToEdit = (soutenanceId: string) => {
    setEditSoutenanceId(soutenanceId);
    const s = soutenances.find((st) => String(st.idSoutenance) === soutenanceId);
    if (s) {
      setEditDateSoutenance(s.dateSoutenance.split("T")[0]);
      setEditStageId(s.idStage ? String(s.idStage) : "");
      setEditSalleNom(s.nomSalle || "");
      setEditJuryId(s.idJury ? String(s.idJury) : "");
    }
  };

  const handleCreateSoutenance = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!createDateSoutenance || !createStageId) {
      setError("La date et le stage sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/soutenances", {
        dateSoutenance: createDateSoutenance + "T10:00:00",
        idStage: Number(createStageId),
        nomSalle: createSalleNom.trim() || null,
        idJury: createJuryId ? Number(createJuryId) : null,
      });
      setCreateDateSoutenance("");
      setCreateStageId("");
      setCreateSalleNom("");
      setCreateJuryId("");
      setMessage("Soutenance créée avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la création de la soutenance."));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSoutenance = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!editSoutenanceId) {
      setError("Sélectionnez une soutenance à modifier.");
      return;
    }
    if (!editDateSoutenance) {
      setError("La date est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/soutenances/${editSoutenanceId}`, {
        dateSoutenance: editDateSoutenance + "T10:00:00",
        idStage: Number(editStageId),
        nomSalle: editSalleNom.trim() || null,
        idJury: editJuryId ? Number(editJuryId) : null,
      });
      setMessage("Soutenance modifiée avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la modification de la soutenance."));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSoutenance = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();
    if (!deleteSoutenanceId) {
      setError("Sélectionnez une soutenance à supprimer.");
      return;
    }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette soutenance ?")) return;

    setLoading(true);
    try {
      await api.delete(`/soutenances/${deleteSoutenanceId}`);
      setDeleteSoutenanceId("");
      setMessage("Soutenance supprimée avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la suppression de la soutenance."));
    } finally {
      setLoading(false);
    }
  };

  const handleDonnerVerdict = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!verdictSoutenanceId) {
      setError("Sélectionnez une soutenance.");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/soutenances/${verdictSoutenanceId}/verdict`, {
        noteFinale: verdictNote ? Number(verdictNote) : null,
        observation: verdictObservation.trim() || null,
      });
      setVerdictSoutenanceId("");
      setVerdictNote("");
      setVerdictObservation("");
      setMessage("Verdict enregistré avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de l'enregistrement du verdict."));
    } finally {
      setLoading(false);
    }
  };

  const handleSoutenanceSubmit = (e: FormEvent) => {
    if (soutenanceAction === "creer") return handleCreateSoutenance(e);
    if (soutenanceAction === "modifier") return handleUpdateSoutenance(e);
    if (soutenanceAction === "supprimer") return handleDeleteSoutenance(e);
    if (soutenanceAction === "verdict") return handleDonnerVerdict(e);
    e.preventDefault();
  };

  const actionLabel = (action: ActionType) => {
    if (action === "creer") return "Créer";
    if (action === "modifier") return "Modifier";
    if (action === "supprimer") return "Supprimer";
    if (action === "verdict") return "Enregistrer le verdict";
    return "";
  };

  const soutenanceLabel = (s: SoutenanceItem) => {
    const stage = stages.find((st) => st.idStage === s.idStage);
    const stagelabel = stage ? `${stage.poste}${stage.nomEntreprise ? ` @ ${stage.nomEntreprise}` : ""}` : "Stage inconnu";
    const dateStr = new Date(s.dateSoutenance).toLocaleDateString("fr-FR");
    return `#${s.idSoutenance} – ${stagelabel} (${dateStr})`;
  };

  const getSalleName = (nomSalle?: string) => nomSalle && nomSalle.trim() ? nomSalle : "Non assignée";

  const getJuryName = (id?: number) => {
    const jury = juries.find((j) => j.idJury === id);
    return jury ? jury.nomJury : "Non assigné";
  };

  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-home-button" title="Retour à l'accueil">
        🏠
      </button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Soutenances</h1>
          <div className="admin-mf-actions">
            <button onClick={() => navigate("/administrateur")} className="admin-mf-back-button">Retour</button>
            <button onClick={() => { logout(); navigate("/login"); }} className="admin-logout-button">Logout</button>
          </div>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecté :</strong> {displayName || user?.email}</p>
          <p><strong>Rôle :</strong> {user?.role}</p>
        </div>

        {message && <p className="admin-mf-success">{message}</p>}
        {error   && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">

          {/* ── Soutenances (Créer / Modifier / Supprimer) ── */}
          <div className="admin-module-card">
            <h3>Soutenances</h3>
            <form onSubmit={handleSoutenanceSubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={soutenanceAction}
                onChange={(e) => setSoutenanceAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {soutenanceAction === "creer" && (
                <>
                  <label className="admin-mf-label">Date de soutenance *</label>
                  <input
                    type="date"
                    value={createDateSoutenance}
                    onChange={(e) => setCreateDateSoutenance(e.target.value)}
                    disabled={loading}
                  />
                  <select
                    value={createStageId}
                    onChange={(e) => setCreateStageId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Sélectionner un stage *</option>
                    {stages.map((s) => (
                      <option key={s.idStage} value={s.idStage}>
                        {s.poste} {s.nomEntreprise ? `@ ${s.nomEntreprise}` : ""}
                      </option>
                    ))}
                  </select>
                  <label className="admin-mf-label">Salle (saisie manuelle)</label>
                  <input
                    type="text"
                    value={createSalleNom}
                    onChange={(e) => setCreateSalleNom(e.target.value)}
                    placeholder="Ex: B204"
                    maxLength={100}
                    disabled={loading}
                  />
                  <select
                    value={createJuryId}
                    onChange={(e) => setCreateJuryId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Sélectionner un jury (optionnel)</option>
                    {juries.map((j) => (
                      <option key={j.idJury} value={j.idJury}>
                        {j.nomJury}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {soutenanceAction === "modifier" && (
                <>
                  <select
                    value={editSoutenanceId}
                    onChange={(e) => handleSelectSoutenanceToEdit(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Sélectionner une soutenance</option>
                    {soutenances.map((s) => (
                      <option key={s.idSoutenance} value={s.idSoutenance}>{soutenanceLabel(s)}</option>
                    ))}
                  </select>
                  <label className="admin-mf-label">Date de soutenance *</label>
                  <input
                    type="date"
                    value={editDateSoutenance}
                    onChange={(e) => setEditDateSoutenance(e.target.value)}
                    disabled={loading}
                  />
                  <select
                    value={editStageId}
                    onChange={(e) => setEditStageId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Sélectionner un stage</option>
                    {stages.map((s) => (
                      <option key={s.idStage} value={s.idStage}>
                        {s.poste} {s.nomEntreprise ? `@ ${s.nomEntreprise}` : ""}
                      </option>
                    ))}
                  </select>
                  <label className="admin-mf-label">Salle (saisie manuelle)</label>
                  <input
                    type="text"
                    value={editSalleNom}
                    onChange={(e) => setEditSalleNom(e.target.value)}
                    placeholder="Ex: B204"
                    maxLength={100}
                    disabled={loading}
                  />
                  <select
                    value={editJuryId}
                    onChange={(e) => setEditJuryId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Sélectionner un jury</option>
                    {juries.map((j) => (
                      <option key={j.idJury} value={j.idJury}>
                        {j.nomJury}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {soutenanceAction === "supprimer" && (
                <select value={deleteSoutenanceId} onChange={(e) => setDeleteSoutenanceId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner une soutenance</option>
                  {soutenances.map((s) => (
                    <option key={s.idSoutenance} value={s.idSoutenance}>{soutenanceLabel(s)}</option>
                  ))}
                </select>
              )}

              {soutenanceAction && soutenanceAction !== "verdict" && (
                <button
                  type="submit"
                  className={soutenanceAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(soutenanceAction)}
                </button>
              )}
            </form>
          </div>

          {/* ── Donner un verdict ── */}
          <div className="admin-module-card">
            <h3>Donner un verdict</h3>
            <form onSubmit={handleDonnerVerdict} className="admin-mf-form">
              <select
                value={verdictSoutenanceId}
                onChange={(e) => setVerdictSoutenanceId(e.target.value)}
                disabled={loading}
              >
                <option value="">Sélectionner une soutenance</option>
                {soutenances.map((s) => (
                  <option key={s.idSoutenance} value={s.idSoutenance}>{soutenanceLabel(s)}</option>
                ))}
              </select>
              <label className="admin-mf-label">Note finale (0-20)</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={verdictNote}
                onChange={(e) => setVerdictNote(e.target.value)}
                placeholder="Ex: 17.5"
                disabled={loading}
              />
              <textarea
                value={verdictObservation}
                onChange={(e) => setVerdictObservation(e.target.value)}
                placeholder="Observation et remarques (optionnel)"
                rows={3}
                disabled={loading}
                style={{ resize: "vertical", padding: "10px", borderRadius: "4px", border: "1px solid #ced4da" }}
              />
              <button type="submit" className="admin-module-button" disabled={loading}>
                Enregistrer le verdict
              </button>
            </form>
          </div>

          {/* ── Liste des soutenances ── */}
          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Résumé des soutenances</h3>
            {soutenances.length > 0 ? (
              <div className="admin-mf-stages">
                {soutenances.map((s) => {
                  const stage = stages.find((st) => st.idStage === s.idStage);
                  return (
                    <div key={s.idSoutenance} className="admin-mf-stage-item">
                      <p>
                        <strong>#{s.idSoutenance} – {stage?.poste || "Inconnu"}</strong>
                      </p>
                      <p>📅 <strong>Date :</strong> {new Date(s.dateSoutenance).toLocaleDateString("fr-FR")} à {new Date(s.dateSoutenance).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p>🏛️ <strong>Salle :</strong> {getSalleName(s.nomSalle)}</p>
                      <p>👥 <strong>Jury :</strong> {getJuryName(s.idJury)}</p>
                      {s.noteFinale !== undefined && s.noteFinale !== null && (
                        <p>⭐ <strong>Note :</strong> {s.noteFinale} / 20</p>
                      )}
                      {s.observation && (
                        <p>📝 <strong>Observation :</strong> {s.observation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="admin-mf-info">Aucune soutenance enregistrée.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SoutenanceManagement;

