import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/AdminModulesFilieres.css";
import type { AxiosError } from "axios";

interface RapportItem {
  idRapport: number;
  dateDepot: string;
  fichier: string;
  note: number | null;
  commentaire: string | null;
  statut: string;
  idStage: number;
  idApprenant: number;
  prenomApprenant: string;
  nomApprenant: string;
  posteStage: string;
  nomEntreprise: string;
}

interface StageItem {
  idStage: number;
}

interface AffectationItem {
  idStage: number;
  idEnseignant: number;
}

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  VALIDE: "Validé",
  REFUSE: "Refusé",
};

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "#ff9800",
  VALIDE: "#4caf50",
  REFUSE: "#f44336",
};

const EvaluationRapports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [rapports, setRapports] = useState<RapportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState<RapportItem | null>(null);
  const [note, setNote] = useState<string>("");
  const [commentaire, setCommentaire] = useState<string>("");

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    return fallback;
  };

  const loadViaFallback = async (idEnseignant: number) => {
    const stagesRes = await api.get<StageItem[]>("/stages");
    const stages = stagesRes.data || [];

    const affectationsParStage = await Promise.all(
      stages.map(async (stage) => {
        try {
          const res = await api.get<AffectationItem[]>(`/stages/${stage.idStage}/affectations`);
          return { idStage: stage.idStage, affectations: res.data || [] };
        } catch {
          return { idStage: stage.idStage, affectations: [] as AffectationItem[] };
        }
      })
    );

    const stageIdsAffectes = new Set(
      affectationsParStage
        .filter((item) => item.affectations.some((af) => af.idEnseignant === idEnseignant))
        .map((item) => item.idStage)
    );

    const rapportsRes = await api.get<RapportItem[]>("/rapports");
    const rapports = rapportsRes.data || [];
    setRapports(rapports.filter((r) => stageIdsAffectes.has(r.idStage)));
  };

  const load = async (idEnseignant: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/rapports/enseignant/${idEnseignant}/a-evaluer`);
      setRapports(res.data || []);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr?.response?.status === 404) {
        try {
          await loadViaFallback(idEnseignant);
          return;
        } catch (fallbackErr: unknown) {
          setError(getApiErrorMessage(fallbackErr, "Impossible de charger les rapports à évaluer."));
        }
      } else {
        setError(getApiErrorMessage(err, "Impossible de charger les rapports à évaluer."));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.idUtilisateur) return;
    // Chargement initial dépendant de l'utilisateur connecté.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(user.idUtilisateur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.idUtilisateur]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleOpenModal = (rapport: RapportItem) => {
    setSelectedRapport(rapport);
    setNote(rapport.note?.toString() || "");
    setCommentaire(rapport.commentaire || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRapport(null);
    setNote("");
    setCommentaire("");
  };

  const handleEvaluer = async () => {
    if (!selectedRapport) return;

    if (!note || parseFloat(note) < 0 || parseFloat(note) > 20) {
      setError("La note doit être entre 0 et 20.");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/rapports/${selectedRapport.idRapport}/evaluation`, {
        note: parseFloat(note),
        commentaire: commentaire || null,
      });
      setMessage("Rapport évalué avec succès.");
      handleCloseModal();
      if (user?.idUtilisateur) {
        await load(user.idUtilisateur);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de l'évaluation du rapport."));
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (idRapport: number) => {
    if (!window.confirm("Valider ce rapport ?")) return;
    setLoading(true);
    try {
      await api.patch(`/rapports/${idRapport}/valider`);
      setMessage("Rapport validé avec succès.");
      if (user?.idUtilisateur) {
        await load(user.idUtilisateur);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la validation du rapport."));
    } finally {
      setLoading(false);
    }
  };

  const handleRejeter = async (idRapport: number) => {
    if (!window.confirm("Rejeter ce rapport ?")) return;
    setLoading(true);
    try {
      await api.patch(`/rapports/${idRapport}/rejeter`);
      setMessage("Rapport rejeté.");
      if (user?.idUtilisateur) {
        await load(user.idUtilisateur);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec du rejet du rapport."));
    } finally {
      setLoading(false);
    }
  };

  const handleTelecharger = async (rapport: RapportItem) => {
    try {
      const res = await api.get(`/rapports/${rapport.idRapport}/fichier`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Rapport_${rapport.prenomApprenant}_${rapport.nomApprenant}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Impossible de télécharger le fichier.");
    }
  };

  const rapportsNonEvalues = rapports.filter((r) => r.note === null);
  const rapportsEvalues = rapports.filter((r) => r.note !== null);

  return (
    <div className="admin-container">
      <button
        onClick={() => navigate("/")}
        className="admin-home-button"
        title="Retour à l'accueil"
      >
        🏠
      </button>
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Évaluation des Rapports de Stage</h1>
          <div className="admin-mf-actions">
            <button onClick={() => navigate("/enseignant")} className="admin-mf-back-button">
              Retour
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="admin-logout-button"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="admin-user-info">
          <p>
            <strong>Utilisateur connecté :</strong> {displayName || user?.email}
          </p>
          <p>
            <strong>Rôle :</strong> {user?.role}
          </p>
        </div>

        {message && <p className="admin-mf-success">{message}</p>}
        {error && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">
          <div
            className="admin-module-card"
            style={{
              gridColumn: "1 / -1",
              backgroundColor: "#fff3cd",
              borderLeft: "4px solid #ff9800",
            }}
          >
            <h3>📋 À Évaluer</h3>
            {rapportsNonEvalues.length === 0 ? (
              <p>Aucun rapport en attente d'évaluation.</p>
            ) : (
              <div
                className="admin-mf-stages"
                style={{ maxHeight: "500px", overflowY: "auto" }}
              >
                {rapportsNonEvalues.map((r) => (
                  <div
                    key={r.idRapport}
                    className="admin-mf-stage-item"
                    style={{
                      borderLeft: `4px solid ${STATUT_COLORS[r.statut]}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <p>
                          <strong>
                            {r.prenomApprenant} {r.nomApprenant}
                          </strong>
                        </p>
                        <p>
                          <strong>Poste :</strong> {r.posteStage}
                        </p>
                        <p>
                          <strong>Entreprise :</strong> {r.nomEntreprise}
                        </p>
                        <p>
                          <strong>Dépôt :</strong>{" "}
                          {new Date(r.dateDepot).toLocaleDateString("fr-FR")} à{" "}
                          {new Date(r.dateDepot).toLocaleTimeString("fr-FR")}
                        </p>
                        <p>
                          <strong>Statut :</strong>{" "}
                          <span style={{ color: STATUT_COLORS[r.statut] }}>
                            {STATUT_LABELS[r.statut] || r.statut}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="admin-module-button"
                        disabled={loading}
                        onClick={() => handleOpenModal(r)}
                        style={{ backgroundColor: "#2196f3" }}
                      >
                        📝 Évaluer
                      </button>
                      <button
                        className="admin-module-button"
                        disabled={loading}
                        onClick={() => handleTelecharger(r)}
                        style={{ backgroundColor: "#4caf50" }}
                      >
                        📥 Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {rapportsEvalues.length > 0 && (
            <div
              className="admin-module-card"
              style={{
                gridColumn: "1 / -1",
                backgroundColor: "#e8f5e9",
                borderLeft: "4px solid #4caf50",
              }}
            >
              <h3>✓ Évalués</h3>
              <div
                className="admin-mf-stages"
                style={{ maxHeight: "500px", overflowY: "auto" }}
              >
                {rapportsEvalues.map((r) => (
                  <div
                    key={r.idRapport}
                    className="admin-mf-stage-item"
                    style={{
                      borderLeft: `4px solid ${STATUT_COLORS[r.statut]}`,
                      opacity: 0.7,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <p>
                          <strong>
                            {r.prenomApprenant} {r.nomApprenant}
                          </strong>
                        </p>
                        <p>
                          <strong>Poste :</strong> {r.posteStage}
                        </p>
                        <p>
                          <strong>Entreprise :</strong> {r.nomEntreprise}
                        </p>
                        <p>
                          <strong>Note :</strong> <strong>{r.note}/20</strong>
                        </p>
                        <p>
                          <strong>Statut :</strong>{" "}
                          <span style={{ color: STATUT_COLORS[r.statut] }}>
                            {STATUT_LABELS[r.statut] || r.statut}
                          </span>
                        </p>
                        {r.commentaire && (
                          <p>
                            <strong>Commentaire :</strong> {r.commentaire}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      {r.statut === "EN_ATTENTE" && (
                        <>
                          <button
                            className="admin-module-button"
                            disabled={loading}
                            onClick={() => handleValider(r.idRapport)}
                            style={{ backgroundColor: "#4caf50" }}
                          >
                            ✓ Valider
                          </button>
                          <button
                            className="admin-module-button"
                            disabled={loading}
                            onClick={() => handleRejeter(r.idRapport)}
                            style={{ backgroundColor: "#f44336" }}
                          >
                            ✗ Rejeter
                          </button>
                        </>
                      )}
                      <button
                        className="admin-module-button"
                        disabled={loading}
                        onClick={() => handleOpenModal(r)}
                        style={{ backgroundColor: "#2196f3" }}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        className="admin-module-button"
                        disabled={loading}
                        onClick={() => handleTelecharger(r)}
                        style={{ backgroundColor: "#4caf50" }}
                      >
                        📥 Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedRapport && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              maxWidth: "500px",
              width: "100%",
              padding: "30px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>
              Évaluer le rapport de {selectedRapport.prenomApprenant}{" "}
              {selectedRapport.nomApprenant}
            </h2>
            <div style={{ marginTop: 20 }}>
              <p>
                <strong>Poste :</strong> {selectedRapport.posteStage}
              </p>
              <p>
                <strong>Entreprise :</strong> {selectedRapport.nomEntreprise}
              </p>
              <div style={{ marginTop: 15 }}>
                <label>
                  <strong>Note (0-20) :</strong>
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: 5,
                    marginBottom: 15,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  placeholder="Entrez la note"
                />
              </div>
              <div style={{ marginTop: 15 }}>
                <label>
                  <strong>Commentaire (optionnel) :</strong>
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Entrez votre commentaire..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: 5,
                    marginBottom: 15,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                    minHeight: "100px",
                    fontFamily: "Arial, sans-serif",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <button
                  onClick={handleCloseModal}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ccc",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleEvaluer}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  disabled={loading}
                >
                  {loading ? "Évaluation..." : "Évaluer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationRapports;

