import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import "../../css/AdminModulesFilieres.css";

interface StageItem {
  idStage: number;
  poste: string;
  objectif?: string;
  dateDebut: string;
  dateFin?: string;
  dureeSemaines?: number;
  etat?: string;
  idEntreprise?: number;
  nomEntreprise?: string;
}

interface EntrepriseItem {
  idEntreprise: number;
  nomEntreprise: string;
}

interface ApprenantItem {
  idUtilisateur: number;
  nom: string;
  prenom: string;
}

interface EnseignantItem {
  idUtilisateur: number;
  nom: string;
  prenom: string;
}

interface AffectationItem {
  idStage: number;
  idApprenant: number;
  idEnseignant: number;
}

type ActionType = "" | "creer" | "modifier" | "supprimer";

const ETATS = ["EN_COURS", "TERMINE", "VALIDE", "REFUSE"];

const ETAT_LABELS: Record<string, string> = {
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  VALIDE: "Validé",
  REFUSE: "Refusé",
};

const StageManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [stages, setStages] = useState<StageItem[]>([]);
  const [entreprises, setEntreprises] = useState<EntrepriseItem[]>([]);
  const [apprenants, setApprenants] = useState<ApprenantItem[]>([]);
  const [enseignants, setEnseignants] = useState<EnseignantItem[]>([]);

  const [stageAction, setStageAction] = useState<ActionType>("");

  // Création stage
  const [createPoste, setCreatePoste] = useState("");
  const [createObjectif, setCreateObjectif] = useState("");
  const [createDateDebut, setCreateDateDebut] = useState("");
  const [createDateFin, setCreateDateFin] = useState("");
  const [createDureeSemaines, setCreateDureeSemaines] = useState("");
  const [createEntrepriseId, setCreateEntrepriseId] = useState("");

  // Modification stage
  const [editStageId, setEditStageId] = useState("");
  const [editPoste, setEditPoste] = useState("");
  const [editObjectif, setEditObjectif] = useState("");
  const [editDateDebut, setEditDateDebut] = useState("");
  const [editDateFin, setEditDateFin] = useState("");
  const [editDureeSemaines, setEditDureeSemaines] = useState("");
  const [editEntrepriseId, setEditEntrepriseId] = useState("");
  const [deleteStageId, setDeleteStageId] = useState("");

  // Changement d'état
  const [etatStageId, setEtatStageId] = useState("");
  const [nouvelEtat, setNouvelEtat] = useState("");

  // Affectation apprenant + encadrant
  const [affectStageId, setAffectStageId] = useState("");
  const [affectApprenantId, setAffectApprenantId] = useState("");
  const [affectEnseignantId, setAffectEnseignantId] = useState("");

  // Vue affectations
  const [viewStageId, setViewStageId] = useState("");
  const [stageAffectations, setStageAffectations] = useState<AffectationItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const [stagesRes, entreprisesRes, apprenantsRes, enseignantsRes] = await Promise.all([
      api.get("/stages"),
      api.get("/entreprises"),
      api.get("/apprenants"),
      api.get("/enseignants"),
    ]);
    setStages(stagesRes.data || []);
    setEntreprises(entreprisesRes.data || []);
    setApprenants(apprenantsRes.data || []);
    setEnseignants(enseignantsRes.data || []);
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

  const handleSelectStageToEdit = (stageId: string) => {
    setEditStageId(stageId);
    const s = stages.find((st) => String(st.idStage) === stageId);
    setEditPoste(s?.poste ?? "");
    setEditObjectif(s?.objectif ?? "");
    setEditDateDebut(s?.dateDebut ?? "");
    setEditDateFin(s?.dateFin ?? "");
    setEditDureeSemaines(s?.dureeSemaines != null ? String(s.dureeSemaines) : "");
    setEditEntrepriseId(s?.idEntreprise ? String(s.idEntreprise) : "");
  };

  const handleCreateStage = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!createPoste.trim() || !createDateDebut) {
      setError("Le poste et la date de début sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/stages", {
        poste: createPoste.trim(),
        objectif: createObjectif.trim() || null,
        dateDebut: createDateDebut,
        dateFin: createDateFin || null,
        dureeSemaines: createDureeSemaines.trim() ? Number(createDureeSemaines) : null,
        idEntreprise: createEntrepriseId ? Number(createEntrepriseId) : null,
      });
      setCreatePoste("");
      setCreateObjectif("");
      setCreateDateDebut("");
      setCreateDateFin("");
      setCreateDureeSemaines("");
      setCreateEntrepriseId("");
      setMessage("Stage créé avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la création du stage."));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!editStageId) {
      setError("Sélectionnez un stage à modifier.");
      return;
    }
    if (!editPoste.trim() || !editDateDebut) {
      setError("Le poste et la date de début sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/stages/${editStageId}`, {
        poste: editPoste.trim(),
        objectif: editObjectif.trim() || null,
        dateDebut: editDateDebut,
        dateFin: editDateFin || null,
        dureeSemaines: editDureeSemaines.trim() ? Number(editDureeSemaines) : null,
        idEntreprise: editEntrepriseId ? Number(editEntrepriseId) : null,
      });
      setMessage("Stage modifié avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la modification du stage."));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStage = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();
    if (!deleteStageId) {
      setError("Sélectionnez un stage à supprimer.");
      return;
    }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce stage ?")) return;

    setLoading(true);
    try {
      await api.delete(`/stages/${deleteStageId}`);
      setDeleteStageId("");
      setMessage("Stage supprimé avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la suppression du stage."));
    } finally {
      setLoading(false);
    }
  };

  const handleStageSubmit = (e: FormEvent) => {
    if (stageAction === "creer") return handleCreateStage(e);
    if (stageAction === "modifier") return handleUpdateStage(e);
    if (stageAction === "supprimer") return handleDeleteStage(e);
    e.preventDefault();
  };

  const actionLabel = (action: ActionType) => {
    if (action === "creer") return "Créer";
    if (action === "modifier") return "Modifier";
    if (action === "supprimer") return "Supprimer";
    return "";
  };

  const handleChangerEtat = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!etatStageId || !nouvelEtat) {
      setError("Sélectionnez un stage et un nouvel état.");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/stages/${etatStageId}/etat`, null, { params: { etat: nouvelEtat } });
      setEtatStageId("");
      setNouvelEtat("");
      setMessage(`État du stage mis à jour : ${ETAT_LABELS[nouvelEtat] ?? nouvelEtat}.`);
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la mise à jour de l'état du stage."));
    } finally {
      setLoading(false);
    }
  };

  const handleAffecter = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!affectStageId || !affectApprenantId || !affectEnseignantId) {
      setError("Sélectionnez un stage, un apprenant et un enseignant encadrant.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/stages/affectations", {
        idStage: Number(affectStageId),
        idApprenant: Number(affectApprenantId),
        idEnseignant: Number(affectEnseignantId),
      });
      setAffectStageId("");
      setAffectApprenantId("");
      setAffectEnseignantId("");
      setMessage("Affectation enregistrée avec succès.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de l'affectation."));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAffectations = async () => {
    resetFlash();
    if (!viewStageId) {
      setError("Sélectionnez un stage.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/stages/${viewStageId}/affectations`);
      setStageAffectations(res.data || []);
      if ((res.data || []).length === 0) setMessage("Aucune affectation pour ce stage.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Impossible de charger les affectations."));
    } finally {
      setLoading(false);
    }
  };

  const findApprenantName = (id: number) => {
    const a = apprenants.find((x) => x.idUtilisateur === id);
    return a ? `${a.prenom} ${a.nom}` : `Apprenant #${id}`;
  };

  const findEnseignantName = (id: number) => {
    const e = enseignants.find((x) => x.idUtilisateur === id);
    return e ? `${e.prenom} ${e.nom}` : `Enseignant #${id}`;
  };

  const selectedViewStage = stages.find((s) => String(s.idStage) === viewStageId);
  const selectedViewStageEtat = selectedViewStage?.etat ? (ETAT_LABELS[selectedViewStage.etat] ?? selectedViewStage.etat) : "Non défini";

  const stageLabel = (s: StageItem) =>
    `#${s.idStage} – ${s.poste}${s.dureeSemaines != null ? ` (${s.dureeSemaines} sem.)` : ""}${s.nomEntreprise ? ` @ ${s.nomEntreprise}` : ""}${s.etat ? ` (${ETAT_LABELS[s.etat] ?? s.etat})` : ""}`;

  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-home-button" title="Retour à l'accueil">
        🏠
      </button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Stages</h1>
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

          {/* ── Stages (Créer / Modifier / Supprimer) ── */}
          <div className="admin-module-card">
            <h3>Stages</h3>
            <form onSubmit={handleStageSubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={stageAction}
                onChange={(e) => setStageAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {stageAction === "creer" && (
                <>
                  <input
                    value={createPoste}
                    onChange={(e) => setCreatePoste(e.target.value)}
                    placeholder="Poste / intitulé *"
                    disabled={loading}
                  />
                  <textarea
                    value={createObjectif}
                    onChange={(e) => setCreateObjectif(e.target.value)}
                    placeholder="Objectif (optionnel)"
                    rows={3}
                    disabled={loading}
                    style={{ resize: "vertical", padding: "10px", borderRadius: "4px", border: "1px solid #ced4da" }}
                  />
                  <label className="admin-mf-label">Date de début *</label>
                  <input type="date" value={createDateDebut} onChange={(e) => setCreateDateDebut(e.target.value)} disabled={loading} />
                  <label className="admin-mf-label">Date de fin (optionnel)</label>
                  <input type="date" value={createDateFin} onChange={(e) => setCreateDateFin(e.target.value)} disabled={loading} />
                  <label className="admin-mf-label">Durée (semaines)</label>
                  <input type="number" min="0" value={createDureeSemaines} onChange={(e) => setCreateDureeSemaines(e.target.value)} placeholder="Ex: 12" disabled={loading} />
                  <select value={createEntrepriseId} onChange={(e) => setCreateEntrepriseId(e.target.value)} disabled={loading}>
                    <option value="">Entreprise (optionnel)</option>
                    {entreprises.map((ep) => (
                      <option key={ep.idEntreprise} value={ep.idEntreprise}>{ep.nomEntreprise}</option>
                    ))}
                  </select>
                </>
              )}

              {stageAction === "modifier" && (
                <>
                  <select
                    value={editStageId}
                    onChange={(e) => handleSelectStageToEdit(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Sélectionner un stage</option>
                    {stages.map((s) => (
                      <option key={s.idStage} value={s.idStage}>{stageLabel(s)}</option>
                    ))}
                  </select>
                  <input value={editPoste} onChange={(e) => setEditPoste(e.target.value)} placeholder="Poste / intitulé *" disabled={loading} />
                  <textarea
                    value={editObjectif}
                    onChange={(e) => setEditObjectif(e.target.value)}
                    placeholder="Objectif (optionnel)"
                    rows={3}
                    disabled={loading}
                    style={{ resize: "vertical", padding: "10px", borderRadius: "4px", border: "1px solid #ced4da" }}
                  />
                  <label className="admin-mf-label">Date de début *</label>
                  <input type="date" value={editDateDebut} onChange={(e) => setEditDateDebut(e.target.value)} disabled={loading} />
                  <label className="admin-mf-label">Date de fin (optionnel)</label>
                  <input type="date" value={editDateFin} onChange={(e) => setEditDateFin(e.target.value)} disabled={loading} />
                  <label className="admin-mf-label">Durée (semaines)</label>
                  <input type="number" min="0" value={editDureeSemaines} onChange={(e) => setEditDureeSemaines(e.target.value)} placeholder="Ex: 12" disabled={loading} />
                  <select value={editEntrepriseId} onChange={(e) => setEditEntrepriseId(e.target.value)} disabled={loading}>
                    <option value="">Entreprise (optionnel)</option>
                    {entreprises.map((ep) => (
                      <option key={ep.idEntreprise} value={ep.idEntreprise}>{ep.nomEntreprise}</option>
                    ))}
                  </select>
                </>
              )}

              {stageAction === "supprimer" && (
                <select value={deleteStageId} onChange={(e) => setDeleteStageId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner un stage</option>
                  {stages.map((s) => (
                    <option key={s.idStage} value={s.idStage}>{stageLabel(s)}</option>
                  ))}
                </select>
              )}

              {stageAction && (
                <button
                  type="submit"
                  className={stageAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(stageAction)}
                </button>
              )}
            </form>
          </div>

          {/* ── Affecter apprenant + encadrant ── */}
          <div className="admin-module-card">
            <h3>Affecter apprenant & encadrant</h3>
            <form onSubmit={handleAffecter} className="admin-mf-form">
              <select value={affectStageId} onChange={(e) => setAffectStageId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un stage</option>
                {stages.map((s) => (
                  <option key={s.idStage} value={s.idStage}>{stageLabel(s)}</option>
                ))}
              </select>
              <select value={affectApprenantId} onChange={(e) => setAffectApprenantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un apprenant</option>
                {apprenants.map((a) => (
                  <option key={a.idUtilisateur} value={a.idUtilisateur}>{a.prenom} {a.nom}</option>
                ))}
              </select>
              <select value={affectEnseignantId} onChange={(e) => setAffectEnseignantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un enseignant encadrant</option>
                {enseignants.map((ens) => (
                  <option key={ens.idUtilisateur} value={ens.idUtilisateur}>{ens.prenom} {ens.nom}</option>
                ))}
              </select>
              <button type="submit" className="admin-module-button" disabled={loading}>Affecter</button>
            </form>
          </div>

          {/* ── Changer l'état ── */}
          <div className="admin-module-card">
            <h3>Mettre à jour l'état</h3>
            <p className="admin-mf-info">En tant qu'administrateur, vous pouvez choisir librement l'état d'un stage à tout moment.</p>
            <form onSubmit={handleChangerEtat} className="admin-mf-form">
              <select value={etatStageId} onChange={(e) => setEtatStageId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un stage</option>
                {stages.map((s) => (
                  <option key={s.idStage} value={s.idStage}>{stageLabel(s)}</option>
                ))}
              </select>
              <select value={nouvelEtat} onChange={(e) => setNouvelEtat(e.target.value)} disabled={loading}>
                <option value="">Nouvel état</option>
                {ETATS.map((etat) => (
                  <option key={etat} value={etat}>{ETAT_LABELS[etat]}</option>
                ))}
              </select>
              <button type="submit" className="admin-module-button" disabled={loading}>Mettre à jour</button>
            </form>
          </div>

          {/* ── Voir les affectations d'un stage ── */}
          <div className="admin-module-card">
            <h3>Affectations d'un stage</h3>
            <form
              className="admin-mf-form"
              onSubmit={(e) => { e.preventDefault(); void handleLoadAffectations(); }}
            >
              <select value={viewStageId} onChange={(e) => { setViewStageId(e.target.value); setStageAffectations([]); }} disabled={loading}>
                <option value="">Sélectionner un stage</option>
                {stages.map((s) => (
                  <option key={s.idStage} value={s.idStage}>{stageLabel(s)}</option>
                ))}
              </select>
              <button type="submit" className="admin-module-button" disabled={loading}>Charger</button>
            </form>

            {stageAffectations.length > 0 && (
              <div className="admin-mf-stages">
                {stageAffectations.map((af, idx) => (
                  <div key={idx} className="admin-mf-stage-item">
                    <p>👤 <strong>Apprenant :</strong> {findApprenantName(af.idApprenant)}</p>
                    <p>🎓 <strong>Encadrant :</strong> {findEnseignantName(af.idEnseignant)}</p>
                    <p><strong>État du stage :</strong> {selectedViewStageEtat}</p>
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

export default StageManagement;

