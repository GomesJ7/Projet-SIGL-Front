import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/AdminModulesFilieres.css";
import 'chart.js/auto';
import { Doughnut, Bar, Line } from 'react-chartjs-2';


interface SuccessRate { totalRapports: number; valides: number; tauxPourcentage: number }
interface FiliereStat { idFiliere: number; nomFiliere: string; apprenants: number }
interface EvolutionItem { period: string; count: number }
interface EnseignantPerf { idEnseignant: number; nom: string; prenom: string; stagesEncadres: number }

const StatsReports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [successRate, setSuccessRate] = useState<SuccessRate | null>(null);
  const [byFiliere, setByFiliere] = useState<FiliereStat[]>([]);
  const [evolution, setEvolution] = useState<EvolutionItem[]>([]);
  const [enseignantsPerf, setEnseignantsPerf] = useState<EnseignantPerf[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [sr, bf, ev, ep] = await Promise.all([
        api.get("/stats/success-rate"),
        api.get("/stats/by-filiere"),
        api.get("/stats/stages-evolution"),
        api.get("/stats/enseignants-performance"),
      ]);
      setSuccessRate(sr.data as SuccessRate);
      setByFiliere(bf.data || []);
      setEvolution(ev.data || []);
      setEnseignantsPerf(ep.data || []);
    } catch {
      setError("Impossible de charger les statistiques. Vérifiez que vous êtes connecté(e).");
    }
  };

  useEffect(() => {
    const init = async () => { await load(); };
    void init();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleBack = () => { navigate('/administrateur'); };

  const maxApprenants = Math.max(1, ...(byFiliere.map((f) => f.apprenants || 0)) );

  // Chart data helpers
  const doughnutData = successRate ? {
    labels: ['Validés', 'Autres'],
    datasets: [{ data: [successRate.valides, Math.max(0, successRate.totalRapports - successRate.valides)], backgroundColor: ['#4caf50', '#e0e0e0'] }]
  } : null;

  const barFiliereData = {
    labels: byFiliere.map(f => f.nomFiliere),
    datasets: [{ label: 'Apprenants', data: byFiliere.map(f => f.apprenants), backgroundColor: '#2196f3' }]
  };

  const lineEvolutionData = {
    labels: evolution.map(e => e.period),
    datasets: [{ label: 'Nb stages', data: evolution.map(e => e.count), borderColor: '#ff9800', backgroundColor: 'rgba(255,152,0,0.2)', tension: 0.3 }]
  };

  const enseignantPerfData = {
    labels: enseignantsPerf.map(e => `${e.prenom} ${e.nom}`),
    datasets: [{ label: 'Stages encadrés', data: enseignantsPerf.map(e => e.stagesEncadres), backgroundColor: '#9c27b0' }]
  };

  return (
    <div className="admin-container">
      <button onClick={() => navigate('/')} className="admin-home-button" title="Retour à l'accueil">🏠</button>
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Statistiques & Rapports</h1>
          <div className="admin-mf-actions">
            <button onClick={handleBack} className="admin-mf-back-button">Retour</button>
            <button onClick={handleLogout} className="admin-logout-button">Logout</button>
          </div>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecté :</strong> {displayName || user?.email}</p>
          <p><strong>Rôle :</strong> {user?.role}</p>
        </div>

        {error && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">
          <div className="admin-module-card">
            <h3>Taux de réussite</h3>
            {successRate ? (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 160 }}>
                  {doughnutData && <Doughnut data={doughnutData} />}
                </div>
                <div>
                  <p style={{ fontSize: 24, margin: 0 }}><strong>{successRate.tauxPourcentage}%</strong></p>
                  <p style={{ margin: 0 }}>{successRate.valides} rapports validés sur {successRate.totalRapports} rapports</p>
                </div>
              </div>
            ) : <p>Chargement...</p>}
          </div>

          <div className="admin-module-card">
            <h3>Répartition par filière</h3>
            {byFiliere.length > 0 ? (
              <div>
                <div style={{ height: 240 }}>
                  <Bar data={barFiliereData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
                <div style={{ marginTop: 8 }}>
                  {byFiliere.map((f: FiliereStat) => (
                    <div key={f.idFiliere} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{f.nomFiliere}</span>
                        <span>{f.apprenants}</span>
                      </div>
                      <div style={{ background: '#eee', height: 10, borderRadius: 4 }}>
                        <div style={{ width: `${(f.apprenants/maxApprenants)*100}%`, height: '100%', background: '#4caf50', borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p>Chargement...</p>}
          </div>

          <div className="admin-module-card">
            <h3>Évolution des stages (12 mois)</h3>
            {evolution.length > 0 ? (
              <div style={{ height: 260 }}>
                <Line data={lineEvolutionData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            ) : <p>Chargement...</p>}
          </div>

          <div className="admin-module-card">
            <h3>Performance enseignants</h3>
            {enseignantsPerf.length > 0 ? (
              <div style={{ height: 300 }}>
                <Bar data={enseignantPerfData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} />
              </div>
            ) : <p>Chargement...</p>}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsReports;

