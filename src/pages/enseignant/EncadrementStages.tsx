import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/AdminModulesFilieres.css";
import 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

interface StageItem {
  idStage: number;
  poste: string;
  objectif?: string;
  dateDebut: string | null;
  dateFin?: string | null;
  dureeSemaines?: number;
  etat?: string;
  nomEntreprise?: string;
}

const ETAT_LABELS: Record<string, string> = {
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  VALIDE: "Validé",
  REFUSE: "Refusé",
};

const EncadrementStages = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [stages, setStages] = useState<StageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/enseignants/${user?.idUtilisateur || 0}/stages`);
      setStages(res.data || []);
    } catch {
      setError("Impossible de charger les stages encadrés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => { await load(); };
    void init();
  }, []);

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(""), 4000); return () => clearTimeout(t); } }, [message]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(""), 4000); return () => clearTimeout(t); } }, [error]);

  const handleChangerEtat = async (idStage: number, nouvelEtat: string) => {
    if (!window.confirm("Confirmer le changement d'état ?")) return;
    setLoading(true);
    try {
      await api.patch(`/stages/${idStage}/etat`, null, { params: { etat: nouvelEtat } });
      setMessage("État du stage mis à jour.");
      await load();
    } catch (err: unknown) {
      const aErr = err as any;
      if (aErr?.response?.data?.message) setError(aErr.response.data.message);
      else setError("Échec de la mise à jour d'état.");
    } finally {
      setLoading(false);
    }
  };

  const counts = stages.reduce((acc: Record<string, number>, s) => {
    const k = s.etat || 'EN_COURS';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(ETAT_LABELS).map(k => ETAT_LABELS[k]),
    datasets: [
      {
        label: 'Nombre de stages',
        data: Object.keys(ETAT_LABELS).map(k => counts[k] || 0),
        backgroundColor: ['#2196f3', '#4caf50', '#8bc34a', '#f44336'],
      },
    ],
  };

  const allowedNextStates = (etat?: string) => {
    if (!etat) return ['TERMINE'];
    if (etat === 'EN_COURS') return ['TERMINE'];
    if (etat === 'TERMINE') return ['VALIDE', 'REFUSE'];
    return [];
  };

  return (
    <div className="admin-container">
      <button onClick={() => navigate('/')} className="admin-home-button" title="Retour à l'accueil">🏠</button>
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Encadrement des stages</h1>
          <div className="admin-mf-actions">
            <button onClick={() => navigate('/enseignant')} className="admin-mf-back-button">Retour</button>
            <button onClick={() => { logout(); navigate('/login'); }} className="admin-logout-button">Déconnexion</button>
          </div>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecté :</strong> {displayName || user?.email}</p>
          <p><strong>Rôle :</strong> {user?.role}</p>
        </div>

        {message && <p className="admin-mf-success">{message}</p>}
        {error && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">
          <div className="admin-module-card">
            <h3>Répartition par état</h3>
            <div style={{ height: 220 }}>
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="admin-module-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Stages encadrés</h3>
            {stages.length === 0 ? <p>Aucun stage encadré.</p> : (
              <div className="admin-mf-stages">
                {stages.map((s) => (
                  <div key={s.idStage} className="admin-mf-stage-item">
                    <p><strong>#{s.idStage}</strong> — {s.poste} {s.nomEntreprise ? `@ ${s.nomEntreprise}` : ''}</p>
                    <p><strong>Période :</strong> {s.dateDebut ? new Date(s.dateDebut).toLocaleDateString('fr-FR') : 'N/A'} {s.dateFin ? ` au ${new Date(s.dateFin).toLocaleDateString('fr-FR')}` : ''}</p>
                    <p><strong>État :</strong> {s.etat ? ETAT_LABELS[s.etat] ?? s.etat : 'Non défini'}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {allowedNextStates(s.etat).map(ns => (
                        <button key={ns} className="admin-module-button" disabled={loading} onClick={() => handleChangerEtat(s.idStage, ns)}>{ETAT_LABELS[ns]}</button>
                      ))}
                    </div>
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

export default EncadrementStages;

