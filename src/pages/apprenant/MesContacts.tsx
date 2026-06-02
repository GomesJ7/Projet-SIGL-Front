import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import "../../css/AdminModulesFilieres.css";

interface StageItem {
  idStage: number;
  poste: string;
  nomEntreprise?: string;
}

interface AffectationItem {
  idStage: number;
  idEnseignant: number;
}

interface EnseignantItem {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  specialite?: string;
  grade?: string;
}

const MesContacts = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [stages, setStages] = useState<StageItem[]>([]);
  const [enseignants, setEnseignants] = useState<EnseignantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<{ message?: string }>;
    if (axiosErr?.response?.data?.message) return axiosErr.response.data.message;
    return fallback;
  };

  const loadData = async () => {
    if (!user?.idUtilisateur) return;

    const stagesRes = await api.get<StageItem[]>(`/apprenants/${user.idUtilisateur}/stages`);
    const myStages = stagesRes.data || [];
    setStages(myStages);

    const affectationsByStage = await Promise.all(
      myStages.map(async (stage) => {
        try {
          const res = await api.get<AffectationItem[]>(`/stages/${stage.idStage}/affectations`);
          return res.data || [];
        } catch {
          return [] as AffectationItem[];
        }
      })
    );

    const enseignantIds = Array.from(new Set(affectationsByStage.flat().map((a) => a.idEnseignant)));
    const enseignantsRes = await Promise.all(
      enseignantIds.map(async (idEnseignant) => {
        try {
          const res = await api.get<EnseignantItem>(`/enseignants/${idEnseignant}`);
          return res.data;
        } catch {
          return null;
        }
      })
    );

    setEnseignants(enseignantsRes.filter((e): e is EnseignantItem => e !== null));
  };

  useEffect(() => {
    if (!user?.idUtilisateur) return;
    void (async () => {
      setLoading(true);
      try {
        await loadData();
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Impossible de charger vos contacts enseignants."));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.idUtilisateur]);


  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")} className="admin-home-button" title="Retour a l'accueil">🏠</button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Mes contacts</h1>
          <div className="admin-mf-actions">
            <button onClick={() => navigate("/apprenant")} className="admin-mf-back-button">Retour</button>
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
            <h3>Resume</h3>
            <p><strong>Stages affectes :</strong> {stages.length}</p>
            <p><strong>Enseignants referents :</strong> {enseignants.length}</p>
          </div>

          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Contacts de mes enseignants affectes</h3>
            {enseignants.length === 0 ? (
              <p>Aucun enseignant referent trouve pour le moment.</p>
            ) : (
              <div className="admin-mf-stages">
                {enseignants.map((ens) => (
                  <div key={ens.idUtilisateur} className="admin-mf-stage-item">
                    <p><strong>{ens.prenom} {ens.nom}</strong></p>
                    <p><strong>Email :</strong> {ens.email}</p>
                    <p><strong>Specialite :</strong> {ens.specialite || "Non renseignee"}</p>
                    <p><strong>Grade :</strong> {ens.grade || "Non renseigne"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-module-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Mes stages suivis</h3>
            {stages.length === 0 ? (
              <p>Aucun stage affecte.</p>
            ) : (
              <div className="admin-mf-stages">
                {stages.map((stage) => (
                  <div key={stage.idStage} className="admin-mf-stage-item">
                    <p><strong>#{stage.idStage} - {stage.poste}</strong></p>
                    <p><strong>Entreprise :</strong> {stage.nomEntreprise || "Non renseignee"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && <p className="admin-mf-info">Chargement en cours...</p>}
      </div>
    </div>
  );
};

export default MesContacts;

