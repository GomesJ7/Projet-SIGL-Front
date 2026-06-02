import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import "../../css/MonProfilAcademique.css";

interface ApprenantItem {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  niveau?: string;
  dateNaissance?: string;
  nomPromotion?: string;
  nomFiliere?: string;
}

interface StageItem {
  idStage: number;
  poste: string;
  objectif?: string;
  dateDebut: string;
  dateFin?: string;
  dureeSemaines?: number;
  etat?: string;
  nomEntreprise?: string;
}

interface RapportItem {
  idRapport: number;
  dateDepot: string;
  note?: number | null;
  commentaire?: string | null;
  statut?: string;
  idStage: number;
  posteStage?: string;
  nomEntreprise?: string;
}

interface SoutenanceItem {
  idSoutenance: number;
  dateSoutenance: string;
  noteFinale?: number | null;
  observation?: string | null;
  idStage: number;
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

const MonProfilAcademique = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profil, setProfil] = useState<ApprenantItem | null>(null);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [rapports, setRapports] = useState<RapportItem[]>([]);
  const [soutenances, setSoutenances] = useState<SoutenanceItem[]>([]);
  const [enseignants, setEnseignants] = useState<EnseignantItem[]>([]);

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
        const [profilRes, stagesRes, rapportsRes, soutenancesRes] = await Promise.all([
          api.get<ApprenantItem>(`/apprenants/${user.idUtilisateur}`),
          api.get<StageItem[]>(`/apprenants/${user.idUtilisateur}/stages`),
          api.get<RapportItem[]>(`/rapports/apprenant/${user.idUtilisateur}`),
          api.get<SoutenanceItem[]>("/soutenances"),
        ]);

        const myStages = stagesRes.data || [];
        const myStageIds = new Set(myStages.map((s) => s.idStage));

        setProfil(profilRes.data);
        setStages(myStages);
        setRapports(rapportsRes.data || []);
        setSoutenances((soutenancesRes.data || []).filter((s) => myStageIds.has(s.idStage)));

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

        const enseignantIds = Array.from(
          new Set(affectationsByStage.flat().map((a) => a.idEnseignant))
        );

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

        setEnseignants(enseignantsRes.filter((item): item is EnseignantItem => item !== null));
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Impossible de charger votre profil academique."));
      } finally {
        setLoading(false);
      }
    };

    // Chargement centralise des informations etudiant.
    void loadData();
  }, [user?.idUtilisateur]);

  const prochainEvenement = useMemo(() => {
    const now = new Date();
    const upcomingSoutenances = soutenances
      .filter((s) => new Date(s.dateSoutenance) >= now)
      .sort((a, b) => new Date(a.dateSoutenance).getTime() - new Date(b.dateSoutenance).getTime());

    if (upcomingSoutenances.length > 0) {
      const s = upcomingSoutenances[0];
      const stage = stages.find((st) => st.idStage === s.idStage);
      return {
        titre: "Soutenance a venir",
        description: `${new Date(s.dateSoutenance).toLocaleDateString("fr-FR")} - ${stage?.poste || `Stage #${s.idStage}`}`,
      };
    }

    const upcomingStage = stages
      .filter((s) => new Date(s.dateDebut) >= now)
      .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())[0];

    if (upcomingStage) {
      return {
        titre: "Prochain stage",
        description: `${new Date(upcomingStage.dateDebut).toLocaleDateString("fr-FR")} - ${upcomingStage.poste}`,
      };
    }

    return {
      titre: "Aucun evenement planifie",
      description: "Vos prochaines activites apparaitront ici automatiquement.",
    };
  }, [soutenances, stages]);

  const stats = useMemo(() => {
    const stagesEnCours = stages.filter((s) => s.etat === "EN_COURS").length;
    const rapportsNotes = rapports.filter((r) => r.note !== null && r.note !== undefined).map((r) => Number(r.note));
    const moyenneRapports = rapportsNotes.length > 0
      ? (rapportsNotes.reduce((sum, value) => sum + value, 0) / rapportsNotes.length).toFixed(2)
      : "-";

    return {
      totalStages: stages.length,
      stagesEnCours,
      totalRapports: rapports.length,
      moyenneRapports,
    };
  }, [stages, rapports]);

  return (
    <div className="profil-container">
      <button onClick={() => navigate("/")} className="profil-home-button" title="Retour a l'accueil">
        🏠
      </button>

      <div className="profil-wrapper">
        <div className="profil-header">
          <div>
            <h1>Mon Profil Academique</h1>
            <p>Vue complete de votre parcours: cursus, stages, rapports, soutenances et contacts utiles.</p>
          </div>
          <div className="profil-actions">
            <button onClick={() => navigate("/apprenant")} className="profil-back-button">Retour</button>
            <button onClick={() => { logout(); navigate("/login"); }} className="profil-logout-button">Logout</button>
          </div>
        </div>

        {error && <p className="profil-error">{error}</p>}

        <div className="profil-hero-card">
          <h2>{profil ? `${profil.prenom} ${profil.nom}` : "Apprenant"}</h2>
          <p>{profil?.email || user?.email}</p>
          <div className="profil-badges">
            <span>{profil?.nomFiliere || "Filiere non renseignee"}</span>
            <span>{profil?.nomPromotion || "Promotion non renseignee"}</span>
            <span>{profil?.niveau || "Niveau non renseigne"}</span>
          </div>
        </div>

        <div className="profil-stats-grid">
          <div className="profil-stat-card">
            <p className="profil-stat-label">Stages</p>
            <p className="profil-stat-value">{stats.totalStages}</p>
          </div>
          <div className="profil-stat-card">
            <p className="profil-stat-label">Stages en cours</p>
            <p className="profil-stat-value">{stats.stagesEnCours}</p>
          </div>
          <div className="profil-stat-card">
            <p className="profil-stat-label">Rapports deposés</p>
            <p className="profil-stat-value">{stats.totalRapports}</p>
          </div>
          <div className="profil-stat-card">
            <p className="profil-stat-label">Moyenne rapports</p>
            <p className="profil-stat-value">{stats.moyenneRapports}</p>
          </div>
        </div>

        <div className="profil-grid">
          <section className="profil-card">
            <h3>Informations académiques</h3>
            <ul>
              <li><strong>Matricule:</strong> {profil?.matricule || "Non renseigne"}</li>
              <li><strong>Date de naissance:</strong> {profil?.dateNaissance ? new Date(profil.dateNaissance).toLocaleDateString("fr-FR") : "Non renseignee"}</li>
              <li><strong>Filiere:</strong> {profil?.nomFiliere || "Non renseignee"}</li>
              <li><strong>Promotion:</strong> {profil?.nomPromotion || "Non renseignee"}</li>
              <li><strong>Niveau:</strong> {profil?.niveau || "Non renseigne"}</li>
            </ul>
          </section>

          <section className="profil-card profil-highlight">
            <h3>{prochainEvenement.titre}</h3>
            <p>{prochainEvenement.description}</p>
          </section>

          <section className="profil-card profil-full">
            <h3>Mes stages</h3>
            {stages.length === 0 ? (
              <p>Aucun stage associe a votre profil pour le moment.</p>
            ) : (
              <div className="profil-list">
                {stages.map((stage) => (
                  <article key={stage.idStage} className="profil-list-item">
                    <h4>{stage.poste}</h4>
                    <p><strong>Entreprise:</strong> {stage.nomEntreprise || "Non renseignee"}</p>
                    <p><strong>Periode:</strong> {new Date(stage.dateDebut).toLocaleDateString("fr-FR")} {stage.dateFin ? `au ${new Date(stage.dateFin).toLocaleDateString("fr-FR")}` : ""}</p>
                    <p><strong>Etat:</strong> {stage.etat ? ETAT_LABELS[stage.etat] || stage.etat : "Non defini"}</p>
                    {stage.objectif && <p><strong>Objectif:</strong> {stage.objectif}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="profil-card">
            <h3>Mes rapports</h3>
            {rapports.length === 0 ? (
              <p>Aucun rapport depose.</p>
            ) : (
              <div className="profil-list compact">
                {rapports.map((rapport) => (
                  <article key={rapport.idRapport} className="profil-list-item">
                    <h4>{rapport.posteStage || `Rapport #${rapport.idRapport}`}</h4>
                    <p><strong>Statut:</strong> {rapport.statut ? STATUT_LABELS[rapport.statut] || rapport.statut : "Non defini"}</p>
                    <p><strong>Depose le:</strong> {new Date(rapport.dateDepot).toLocaleDateString("fr-FR")}</p>
                    <p><strong>Note:</strong> {rapport.note ?? "Non evalue"}</p>
                    {rapport.commentaire && <p><strong>Commentaire:</strong> {rapport.commentaire}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="profil-card">
            <h3>Mes soutenances</h3>
            {soutenances.length === 0 ? (
              <p>Aucune soutenance planifiee.</p>
            ) : (
              <div className="profil-list compact">
                {soutenances
                  .slice()
                  .sort((a, b) => new Date(a.dateSoutenance).getTime() - new Date(b.dateSoutenance).getTime())
                  .map((soutenance) => (
                    <article key={soutenance.idSoutenance} className="profil-list-item">
                      <h4>
                        {stages.find((stage) => stage.idStage === soutenance.idStage)?.poste || `Stage #${soutenance.idStage}`}
                      </h4>
                      <p><strong>Date:</strong> {new Date(soutenance.dateSoutenance).toLocaleDateString("fr-FR")} a {new Date(soutenance.dateSoutenance).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p><strong>Note finale:</strong> {soutenance.noteFinale ?? "A venir"}</p>
                      {soutenance.observation && <p><strong>Observation:</strong> {soutenance.observation}</p>}
                    </article>
                  ))}
              </div>
            )}
          </section>

          <section className="profil-card profil-full">
            <h3>Mes contacts pedagogiques</h3>
            {enseignants.length === 0 ? (
              <p>Aucun enseignant referent detecte sur vos stages.</p>
            ) : (
              <div className="profil-contacts-grid">
                {enseignants.map((enseignant) => (
                  <article key={enseignant.idUtilisateur} className="profil-contact-item">
                    <h4>{enseignant.prenom} {enseignant.nom}</h4>
                    <p>{enseignant.email}</p>
                    <p>{enseignant.specialite || "Specialite non renseignee"}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {loading && <p className="profil-loading">Chargement des informations...</p>}
      </div>
    </div>
  );
};

export default MonProfilAcademique;

