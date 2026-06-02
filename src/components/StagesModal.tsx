import React from "react";
import "../css/StagesModal.css";

interface StageItem {
  idStage: number;
  poste: string;
  etat: string;
  dateDebut: string;
  dateFin?: string;
  nomEntreprise?: string;
}

interface StagesModalProps {
  isOpen: boolean;
  apprenantName: string;
  stages: StageItem[];
  onClose: () => void;
}

const StagesModal: React.FC<StagesModalProps> = ({
  isOpen,
  apprenantName,
  stages,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="stages-modal-overlay" onClick={onClose}>
      <div className="stages-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="stages-modal-header">
          <h2>Stages de {apprenantName}</h2>
          <button
            className="stages-modal-close"
            onClick={onClose}
            title="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="stages-modal-body">
          {stages && stages.length > 0 ? (
            <div className="stages-list">
              {stages.map((stage) => (
                <div key={stage.idStage} className="stage-card">
                  <div className="stage-header">
                    <h3>{stage.poste}</h3>
                    <span
                      className={`stage-badge stage-badge-${stage.etat.toLowerCase()}`}
                    >
                      {stage.etat}
                    </span>
                  </div>
                  <div className="stage-details">
                    <p>
                      <strong>Entreprise:</strong> {stage.nomEntreprise || "N/A"}
                    </p>
                    <p>
                      <strong>Période:</strong>{" "}
                      {new Date(stage.dateDebut).toLocaleDateString("fr-FR")}
                      {stage.dateFin
                        ? ` au ${new Date(stage.dateFin).toLocaleDateString("fr-FR")}`
                        : " (en cours)"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-stages">Aucun stage pour cet apprenant.</p>
          )}
        </div>

        <div className="stages-modal-footer">
          <button className="stages-modal-close-button" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default StagesModal;

