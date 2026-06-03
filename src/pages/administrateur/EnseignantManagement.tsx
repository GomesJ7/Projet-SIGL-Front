import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import "../../css/AdminModulesFilieres.css";

interface EnseignantItem {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  specialite?: string;
  grade?: string;
}

interface ModuleItem {
  idModule: number;
  codeModule: string;
  libelle: string;
}

interface JuryItem {
  idJury: number;
  nomJury: string;
}

interface StageItem {
  idStage: number;
  poste: string;
  etat?: string;
}

interface ApprenantItem {
  idUtilisateur: number;
  nom: string;
  prenom: string;
}

interface JuryAffectationItem {
  idJury: number;
  nomJury: string;
  roleJury?: string;
}

type ActionType = "" | "creer" | "modifier" | "supprimer";

const EnseignantManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = [user?.prenom, user?.nom].filter(Boolean).join(" ");

  const [enseignants, setEnseignants] = useState<EnseignantItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [juries, setJuries] = useState<JuryItem[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [apprenants, setApprenants] = useState<ApprenantItem[]>([]);

  const [enseignantAction, setEnseignantAction] = useState<ActionType>("");

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [grade, setGrade] = useState("");

  const [selectedEnseignantId, setSelectedEnseignantId] = useState("");
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMotDePasse, setEditMotDePasse] = useState("");
  const [editSpecialite, setEditSpecialite] = useState("");
  const [editGrade, setEditGrade] = useState("");
  const [deleteEnseignantId, setDeleteEnseignantId] = useState("");

  const [affectModuleEnseignantId, setAffectModuleEnseignantId] = useState("");
  const [affectModuleId, setAffectModuleId] = useState("");

  const [affectJuryEnseignantId, setAffectJuryEnseignantId] = useState("");
  const [affectJuryId, setAffectJuryId] = useState("");
  const [roleJury, setRoleJury] = useState("");

  const [nomJury, setNomJury] = useState("");
  const [juryAction, setJuryAction] = useState<ActionType>("");
  const [editJuryId, setEditJuryId] = useState("");
  const [editNomJury, setEditNomJury] = useState("");
  const [deleteJuryId, setDeleteJuryId] = useState("");

  const [affectStageEnseignantId, setAffectStageEnseignantId] = useState("");
  const [affectStageId, setAffectStageId] = useState("");
  const [affectStageApprenantId, setAffectStageApprenantId] = useState("");

  const [viewEnseignantId, setViewEnseignantId] = useState("");
  const [enseignantModules, setEnseignantModules] = useState<ModuleItem[]>([]);
  const [enseignantStages, setEnseignantStages] = useState<StageItem[]>([]);
  const [enseignantJuries, setEnseignantJuries] = useState<JuryAffectationItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const [enseignantsRes, modulesRes, juriesRes, stagesRes, apprenantsRes] = await Promise.all([
      api.get("/enseignants"),
      api.get("/modules"),
      api.get("/juries"),
      api.get("/stages"),
      api.get("/apprenants"),
    ]);

    setEnseignants(enseignantsRes.data || []);
    setModules(modulesRes.data || []);
    setJuries(juriesRes.data || []);
    setStages(stagesRes.data || []);
    setApprenants(apprenantsRes.data || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadData();
      } catch {
        setError("Impossible de charger les données enseignants.");
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleBack = () => {
    navigate("/administrateur");
  };

  const handleCreateEnseignant = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!nom.trim() || !prenom.trim() || !email.trim() || !motDePasse.trim()) {
      setError("Nom, prénom, email et mot de passe sont obligatoires.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/enseignants", {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        motDePasse: motDePasse.trim(),
        specialite: specialite.trim() || null,
        grade: grade.trim() || null,
      });
      setNom("");
      setPrenom("");
      setEmail("");
      setMotDePasse("");
      setSpecialite("");
      setGrade("");
      setMessage("Enseignant créé avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la création de l'enseignant."));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEnseignantToEdit = (enseignantId: string) => {
    setSelectedEnseignantId(enseignantId);
    const selected = enseignants.find((item) => String(item.idUtilisateur) === enseignantId);
    setEditNom(selected?.nom ?? "");
    setEditPrenom(selected?.prenom ?? "");
    setEditEmail(selected?.email ?? "");
    setEditSpecialite(selected?.specialite ?? "");
    setEditGrade(selected?.grade ?? "");
    setEditMotDePasse("");
  };

  const handleUpdateEnseignant = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!selectedEnseignantId) {
      setError("Sélectionnez un enseignant à modifier.");
      return;
    }
    if (!editNom.trim() || !editPrenom.trim() || !editEmail.trim()) {
      setError("Nom, prénom et email sont obligatoires pour la modification.");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/enseignants/${selectedEnseignantId}`, {
        nom: editNom.trim(),
        prenom: editPrenom.trim(),
        email: editEmail.trim(),
        motDePasse: editMotDePasse.trim() || null,
        specialite: editSpecialite.trim() || null,
        grade: editGrade.trim() || null,
      });
      setMessage("Enseignant modifié avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la modification de l'enseignant."));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnseignant = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();
    if (!deleteEnseignantId) {
      setError("Sélectionnez un enseignant à supprimer.");
      return;
    }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ?")) return;

    setLoading(true);
    try {
      await api.delete(`/enseignants/${deleteEnseignantId}`);
      setDeleteEnseignantId("");
      setMessage("Enseignant supprimé avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la suppression de l'enseignant."));
    } finally {
      setLoading(false);
    }
  };

  const handleEnseignantSubmit = (e: FormEvent) => {
    if (enseignantAction === "creer") return handleCreateEnseignant(e);
    if (enseignantAction === "modifier") return handleUpdateEnseignant(e);
    if (enseignantAction === "supprimer") return handleDeleteEnseignant(e);
    e.preventDefault();
  };

  const actionLabel = (action: ActionType) => {
    if (action === "creer") return "Créer";
    if (action === "modifier") return "Modifier";
    if (action === "supprimer") return "Supprimer";
    return "";
  };

  const handleAffectModule = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!affectModuleEnseignantId || !affectModuleId) {
      setError("Sélectionnez un enseignant et un module.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/modules/${affectModuleId}/enseignants/${affectModuleEnseignantId}`);
      setAffectModuleEnseignantId("");
      setAffectModuleId("");
      setMessage("Enseignant affecté au module avec succès.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de l'affectation au module."));
    } finally {
      setLoading(false);
    }
  };

  const handleAffectJury = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!affectJuryEnseignantId || !affectJuryId) {
      setError("Sélectionnez un enseignant et un jury.");
      return;
    }

    setLoading(true);
    try {
      const roleParam = roleJury.trim() ? `?roleJury=${encodeURIComponent(roleJury.trim())}` : "";
      await api.put(`/juries/${affectJuryId}/enseignants/${affectJuryEnseignantId}${roleParam}`);
      setAffectJuryEnseignantId("");
      setAffectJuryId("");
      setRoleJury("");
      setMessage("Enseignant affecté au jury avec succès.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de l'affectation au jury."));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJury = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!nomJury.trim()) {
      setError("Le nom du jury est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/juries", { nomJury: nomJury.trim() });
      setNomJury("");
      setMessage("Jury créé avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la création du jury."));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJuryToEdit = (juryId: string) => {
    setEditJuryId(juryId);
    const selected = juries.find((jury) => String(jury.idJury) === juryId);
    setEditNomJury(selected?.nomJury ?? "");
  };

  const handleUpdateJury = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!editJuryId) {
      setError("Sélectionnez un jury à modifier.");
      return;
    }
    if (!editNomJury.trim()) {
      setError("Le nom du jury est obligatoire pour la modification.");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/juries/${editJuryId}`, { nomJury: editNomJury.trim() });
      setMessage("Jury modifié avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la modification du jury."));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJury = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!deleteJuryId) {
      setError("Sélectionnez un jury à supprimer.");
      return;
    }
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce jury ?")) return;

    setLoading(true);
    try {
      await api.delete(`/juries/${deleteJuryId}`);
      setDeleteJuryId("");
      setMessage("Jury supprimé avec succès.");
      await loadData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de la suppression du jury."));
    } finally {
      setLoading(false);
    }
  };

  const handleJurySubmit = (e: FormEvent) => {
    if (juryAction === "creer") return handleCreateJury(e);
    if (juryAction === "modifier") return handleUpdateJury(e);
    if (juryAction === "supprimer") return handleDeleteJury(e);
    e.preventDefault();
  };

  const handleAffectStageEncadrant = async (e: FormEvent) => {
    e.preventDefault();
    resetFlash();

    if (!affectStageEnseignantId || !affectStageId || !affectStageApprenantId) {
      setError("Sélectionnez un enseignant, un stage et un apprenant.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/stages/affectations", {
        idStage: Number(affectStageId),
        idApprenant: Number(affectStageApprenantId),
        idEnseignant: Number(affectStageEnseignantId),
      });
      setAffectStageEnseignantId("");
      setAffectStageId("");
      setAffectStageApprenantId("");
      setMessage("Enseignant affecté comme encadrant de stage.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Échec de l'affectation au stage."));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAffectations = async () => {
    resetFlash();
    if (!viewEnseignantId) {
      setError("Sélectionnez un enseignant pour voir ses affectations.");
      return;
    }

    setLoading(true);
    try {
      const [modulesRes, stagesRes, juriesRes] = await Promise.all([
        api.get(`/enseignants/${viewEnseignantId}/modules`),
        api.get(`/enseignants/${viewEnseignantId}/stages`),
        api.get(`/juries/enseignants/${viewEnseignantId}`),
      ]);
      setEnseignantModules(modulesRes.data || []);
      setEnseignantStages(stagesRes.data || []);
      setEnseignantJuries(juriesRes.data || []);
      setMessage("Affectations chargées.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Impossible de charger les affectations."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <button onClick={handleHomeClick} className="admin-home-button" title="Retour à l'accueil">
        🏠
      </button>

      <div className="admin-wrapper">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des Enseignants</h1>
          <div className="admin-mf-actions">
            <button onClick={handleBack} className="admin-mf-back-button">Retour</button>
            <button onClick={handleLogout} className="admin-logout-button">Logout</button>
          </div>
        </div>

        <div className="admin-user-info">
          <p><strong>Utilisateur connecté:</strong> {displayName || user?.email}</p>
          <p><strong>Rôle:</strong> {user?.role}</p>
        </div>

        {message && <p className="admin-mf-success">{message}</p>}
        {error && <p className="admin-mf-error">{error}</p>}

        <div className="admin-mf-grid">
          <div className="admin-module-card">
            <h3>Enseignants</h3>
            <form onSubmit={handleEnseignantSubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={enseignantAction}
                onChange={(e) => setEnseignantAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {enseignantAction === "creer" && (
                <>
                  <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" disabled={loading} />
                  <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prénom" disabled={loading} />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" disabled={loading} />
                  <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="Mot de passe" disabled={loading} />
                  <input value={specialite} onChange={(e) => setSpecialite(e.target.value)} placeholder="Spécialité (optionnel)" disabled={loading} />
                  <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade (optionnel)" disabled={loading} />
                </>
              )}

              {enseignantAction === "modifier" && (
                <>
                  <select value={selectedEnseignantId} onChange={(e) => handleSelectEnseignantToEdit(e.target.value)} disabled={loading}>
                    <option value="">Sélectionner un enseignant</option>
                    {enseignants.map((item) => (
                      <option key={item.idUtilisateur} value={item.idUtilisateur}>
                        {item.prenom} {item.nom} ({item.email})
                      </option>
                    ))}
                  </select>
                  <input value={editNom} onChange={(e) => setEditNom(e.target.value)} placeholder="Nom" disabled={loading} />
                  <input value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)} placeholder="Prénom" disabled={loading} />
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" disabled={loading} />
                  <input type="password" value={editMotDePasse} onChange={(e) => setEditMotDePasse(e.target.value)} placeholder="Nouveau mot de passe (optionnel)" disabled={loading} />
                  <input value={editSpecialite} onChange={(e) => setEditSpecialite(e.target.value)} placeholder="Spécialité (optionnel)" disabled={loading} />
                  <input value={editGrade} onChange={(e) => setEditGrade(e.target.value)} placeholder="Grade (optionnel)" disabled={loading} />
                </>
              )}

              {enseignantAction === "supprimer" && (
                <select value={deleteEnseignantId} onChange={(e) => setDeleteEnseignantId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner un enseignant</option>
                  {enseignants.map((item) => (
                    <option key={item.idUtilisateur} value={item.idUtilisateur}>
                      {item.prenom} {item.nom}
                    </option>
                  ))}
                </select>
              )}

              {enseignantAction && (
                <button
                  type="submit"
                  className={enseignantAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(enseignantAction)}
                </button>
              )}
            </form>
          </div>

          <div className="admin-module-card">
            <h3>Affecter à un module</h3>
            <form onSubmit={handleAffectModule} className="admin-mf-form">
              <select value={affectModuleEnseignantId} onChange={(e) => setAffectModuleEnseignantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((item) => (
                  <option key={item.idUtilisateur} value={item.idUtilisateur}>
                    {item.prenom} {item.nom}
                  </option>
                ))}
              </select>
              <select value={affectModuleId} onChange={(e) => setAffectModuleId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un module</option>
                {modules.map((module) => (
                  <option key={module.idModule} value={module.idModule}>
                    {module.codeModule} - {module.libelle}
                  </option>
                ))}
              </select>
              <button type="submit" className="admin-module-button" disabled={loading}>Affecter</button>
            </form>
          </div>

          <div className="admin-module-card">
            <h3>Affecter à un jury</h3>
            <form onSubmit={handleAffectJury} className="admin-mf-form">
              <select value={affectJuryEnseignantId} onChange={(e) => setAffectJuryEnseignantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((item) => (
                  <option key={item.idUtilisateur} value={item.idUtilisateur}>
                    {item.prenom} {item.nom}
                  </option>
                ))}
              </select>
              <select value={affectJuryId} onChange={(e) => setAffectJuryId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un jury</option>
                {juries.map((jury) => (
                  <option key={jury.idJury} value={jury.idJury}>{jury.nomJury}</option>
                ))}
              </select>
              <input value={roleJury} onChange={(e) => setRoleJury(e.target.value)} placeholder="Rôle dans le jury (optionnel)" disabled={loading} />
              <button type="submit" className="admin-module-button" disabled={loading}>Affecter</button>
            </form>
          </div>

          <div className="admin-module-card">
            <h3>Jurys</h3>
            <form onSubmit={handleJurySubmit} className="admin-mf-form">
              <select
                className="admin-mf-action-select"
                value={juryAction}
                onChange={(e) => setJuryAction(e.target.value as ActionType)}
                disabled={loading}
              >
                <option value="">-- Choisir une action --</option>
                <option value="creer">Créer</option>
                <option value="modifier">Modifier</option>
                <option value="supprimer">Supprimer</option>
              </select>

              {juryAction === "creer" && (
                <input value={nomJury} onChange={(e) => setNomJury(e.target.value)} placeholder="Nom du jury" disabled={loading} />
              )}

              {juryAction === "modifier" && (
                <>
                  <select value={editJuryId} onChange={(e) => handleSelectJuryToEdit(e.target.value)} disabled={loading}>
                    <option value="">Sélectionner un jury</option>
                    {juries.map((jury) => (
                      <option key={jury.idJury} value={jury.idJury}>{jury.nomJury}</option>
                    ))}
                  </select>
                  <input value={editNomJury} onChange={(e) => setEditNomJury(e.target.value)} placeholder="Nouveau nom du jury" disabled={loading} />
                </>
              )}

              {juryAction === "supprimer" && (
                <select value={deleteJuryId} onChange={(e) => setDeleteJuryId(e.target.value)} disabled={loading}>
                  <option value="">Sélectionner un jury</option>
                  {juries.map((jury) => (
                    <option key={jury.idJury} value={jury.idJury}>{jury.nomJury}</option>
                  ))}
                </select>
              )}

              {juryAction && (
                <button
                  type="submit"
                  className={juryAction === "supprimer" ? "admin-mf-danger-button" : "admin-module-button"}
                  disabled={loading}
                >
                  {actionLabel(juryAction)}
                </button>
              )}
            </form>
          </div>

          <div className="admin-module-card">
            <h3>Affecter en encadrant de stage</h3>
            <form onSubmit={handleAffectStageEncadrant} className="admin-mf-form">
              <select value={affectStageEnseignantId} onChange={(e) => setAffectStageEnseignantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((item) => (
                  <option key={item.idUtilisateur} value={item.idUtilisateur}>
                    {item.prenom} {item.nom}
                  </option>
                ))}
              </select>
              <select value={affectStageId} onChange={(e) => setAffectStageId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un stage</option>
                {stages.map((stage) => (
                  <option key={stage.idStage} value={stage.idStage}>
                    #{stage.idStage} - {stage.poste} {stage.etat ? `(${stage.etat})` : ""}
                  </option>
                ))}
              </select>
              <select value={affectStageApprenantId} onChange={(e) => setAffectStageApprenantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner l'apprenant concerné</option>
                {apprenants.map((apprenant) => (
                  <option key={apprenant.idUtilisateur} value={apprenant.idUtilisateur}>
                    {apprenant.prenom} {apprenant.nom}
                  </option>
                ))}
              </select>
              <button type="submit" className="admin-module-button" disabled={loading}>Affecter</button>
            </form>
          </div>

          <div className="admin-module-card">
            <h3>Voir les affectations d'un enseignant</h3>
            <form className="admin-mf-form" onSubmit={(e) => { e.preventDefault(); void handleLoadAffectations(); }}>
              <select value={viewEnseignantId} onChange={(e) => setViewEnseignantId(e.target.value)} disabled={loading}>
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((item) => (
                  <option key={item.idUtilisateur} value={item.idUtilisateur}>
                    {item.prenom} {item.nom}
                  </option>
                ))}
              </select>
              <button type="submit" className="admin-module-button" disabled={loading}>Charger les affectations</button>
            </form>

            {enseignantModules.length > 0 && (
              <div className="admin-mf-stages">
                <p><strong>Modules :</strong></p>
                {enseignantModules.map((module) => (
                  <p key={module.idModule}>- {module.codeModule} - {module.libelle}</p>
                ))}
              </div>
            )}

            {enseignantJuries.length > 0 && (
              <div className="admin-mf-stages">
                <p><strong>Jurys :</strong></p>
                {enseignantJuries.map((jury) => (
                  <p key={jury.idJury}>- {jury.nomJury}{jury.roleJury ? ` (${jury.roleJury})` : ""}</p>
                ))}
              </div>
            )}

            {enseignantStages.length > 0 && (
              <div className="admin-mf-stages">
                <p><strong>Stages encadrés :</strong></p>
                {enseignantStages.map((stage) => (
                  <p key={stage.idStage}>- Stage #{stage.idStage}: {stage.poste}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnseignantManagement;

