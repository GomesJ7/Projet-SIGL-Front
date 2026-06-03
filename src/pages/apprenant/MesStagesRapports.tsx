import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import "../../css/AdminModulesFilieres.css";

interface StageItem {
  idStage: number;
  poste: string;
  objectif?: string;
  dateDebut: string;
  dateFin?: string;
  etat?: string;
  nomEntreprise?: string;
}

interface RapportItem {
  idRapport: number;
  idStage: number;
  dateDepot: string;
  titre?: string;
  fichier?: string;
  fichierPath?: string;
  nomFichier?: string;
  versionRapport?: string;
  statut?: string;
  note?: number | null;
  commentaire?: string | null;
  posteStage?: string;
  nomEntreprise?: string;
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

const MesStagesRapports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [stages, setStages] = useState<StageItem[]>([]);
  const [rapports, setRapports] = useState<RapportItem[]>([]);

  const [selectedStageId, setSelectedStageId] = useState("");
  const [titre, setTitre] = useState("");
  const [versionRapport, setVersionRapport] = useState("v1");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    const [stagesRes, rapportsRes] = await Promise.all([
      api.get<StageItem[]>(`/apprenants/${user.idUtilisateur}/stages`),
      api.get<RapportItem[]>(`/rapports/apprenant/${user.idUtilisateur}`),
    ]);
    setStages(stagesRes.data || []);
    setRapports(rapportsRes.data || []);
  };

  useEffect(() => {
    if (!user?.idUtilisateur) return;
    void (async () => {
      setLoading(true);
      try {
        await loadData();
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Impossible de charger vos stages et rapports."));
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

  const rapportByStageId = useMemo(() => {
    const map = new Map<number, RapportItem>();
    rapports.forEach((r) => map.set(r.idStage, r));
    return map;
  }, [rapports]);

  const stagesSansRapport = useMemo(
    () => stages.filter((s) => !rapportByStageId.has(s.idStage)),
    [stages, rapportByStageId]
  );

  const handleSubmitRapport = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!user?.idUtilisateur) {
      setError("Utilisateur non connecte.");
      return;
    }

    if (!selectedStageId) {
      setError("Selectionnez un stage.");
      return;
    }

    if (!titre.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    if (!versionRapport.trim()) {
      setError("La version est obligatoire.");
      return;
    }

    if (!selectedFile) {
      setError("Veuillez selectionner un fichier PDF.");
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Seuls les fichiers PDF sont autorises.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("idStage", selectedStageId);
      formData.append("idApprenant", String(user.idUtilisateur));
      formData.append("titre", titre.trim());
      formData.append("versionRapport", versionRapport.trim());
      formData.append("fichier", selectedFile);

      await api.post("/rapports", formData);
      setMessage("Rapport depose avec succes.");
      setSelectedStageId("");
      setTitre("");
      setVersionRapport("v1");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Impossible de deposer le rapport."));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRapport = async (rapport: RapportItem) => {
    try {
      const res = await api.get(`/rapports/${rapport.idRapport}/fichier`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rapport_Stage_${rapport.idStage}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Impossible de telecharger le rapport."));
    }
  };

  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-home-button" title="Retour a l'accueil">
        🏠
      </button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Mes stages et rapports</h1>
          <div className="admin-mf-actions">
            <button onClick={() => navigate("/apprenant")} className="admin-mf-back-button">Retour</button>
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
            <h3>Creer un rapport de stage</h3>
            <form onSubmit={handleSubmitRapport} className="admin-mf-form">
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                disabled={loading}
              >
                <option value="">Selectionner un stage</option>
                {stagesSansRapport.map((stage) => (
                  <option key={stage.idStage} value={stage.idStage}>
                    #{stage.idStage} - {stage.poste} {stage.nomEntreprise ? `@ ${stage.nomEntreprise}` : ""}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Titre du rapport *"
                disabled={loading}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                disabled={loading}
              />

              {selectedFile && (
                <p className="admin-mf-info" style={{ marginTop: -4 }}>
                  Fichier selectionne : <strong>{selectedFile.name}</strong>
                </p>
              )}

              <input
                type="text"
                value={versionRapport}
                onChange={(e) => setVersionRapport(e.target.value)}
                placeholder="Version (ex: v1, v2) *"
                disabled={loading}
              />

              <button type="submit" className="admin-module-button" disabled={loading || stagesSansRapport.length === 0}>
                Deposer le rapport
              </button>

              {stagesSansRapport.length === 0 && (
                <p className="admin-mf-info">Tous vos stages ont deja un rapport depose.</p>
              )}
            </form>
          </div>

          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Mes stages affectes</h3>
            {stages.length === 0 ? (
              <p>Aucun stage affecte.</p>
            ) : (
              <div className="admin-mf-stages">
                {stages.map((stage) => {
                  const rapport = rapportByStageId.get(stage.idStage);
                  return (
                    <div key={stage.idStage} className="admin-mf-stage-item">
                      <p><strong>#{stage.idStage} - {stage.poste}</strong></p>
                      <p><strong>Entreprise :</strong> {stage.nomEntreprise || "Non renseignee"}</p>
                      <p>
                        <strong>Periode :</strong> {new Date(stage.dateDebut).toLocaleDateString("fr-FR")}
                        {stage.dateFin ? ` au ${new Date(stage.dateFin).toLocaleDateString("fr-FR")}` : ""}
                      </p>
                      <p><strong>Etat :</strong> {stage.etat ? ETAT_LABELS[stage.etat] || stage.etat : "Non defini"}</p>

                      {stage.objectif && <p><strong>Objectif :</strong> {stage.objectif}</p>}

                      {rapport ? (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #ced4da" }}>
                          <p><strong>Rapport :</strong> depose le {new Date(rapport.dateDepot).toLocaleDateString("fr-FR")}</p>
                          {rapport.titre && <p><strong>Titre :</strong> {rapport.titre}</p>}
                          {rapport.versionRapport && <p><strong>Version :</strong> {rapport.versionRapport}</p>}
                          {rapport.nomFichier && <p><strong>Fichier :</strong> {rapport.nomFichier}</p>}
                          <p><strong>Statut :</strong> {rapport.statut ? STATUT_LABELS[rapport.statut] || rapport.statut : "Non defini"}</p>
                          <p><strong>Note :</strong> {rapport.note ?? "Non evalue"}</p>
                          {rapport.commentaire && <p><strong>Commentaire :</strong> {rapport.commentaire}</p>}
                          <button
                            type="button"
                            className="admin-module-button"
                            onClick={() => handleDownloadRapport(rapport)}
                            disabled={loading}
                          >
                            Telecharger le rapport
                          </button>
                        </div>
                      ) : (
                        <p style={{ marginTop: 10 }}><strong>Rapport :</strong> aucun rapport depose</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesStagesRapports;

