import React from 'react';
import './ModalConfig.css';

export default function ModalConfig({
  showConfigModal,
  tempConfig,
  handleConfigChange,
  handleConfigSave,
  handleConfigReset,
  onClose
}) {
  if (!showConfigModal) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >✕</button>
        <h3 className="modal-title">Ajustes de Pomodoro</h3>
        <div className="modal-body">
          <div className="row">
            <label>Duración Pomodoro (min):</label>
            <input
              type="number"
              min={1}
              name="WORK_TIME"
              value={Math.round(tempConfig.WORK_TIME / 60)}
              onChange={(e) =>
                handleConfigChange({
                  target: {
                    name: 'WORK_TIME',
                    value: Math.max(1, e.target.value) * 60
                  }
                })
              }
            />
          </div>
          <div className="row">
            <label>Duración Break (min):</label>
            <input
              type="number"
              min={1}
              name="BREAK_TIME"
              value={Math.round(tempConfig.BREAK_TIME / 60)}
              onChange={(e) =>
                handleConfigChange({
                  target: {
                    name: 'BREAK_TIME',
                    value: Math.max(1, e.target.value) * 60
                  }
                })
              }
            />
          </div>
          <div className="row">
            <label>Duración Descanso Largo (min):</label>
            <input
              type="number"
              min={1}
              name="LONG_BREAK_TIME"
              value={Math.round(tempConfig.LONG_BREAK_TIME / 60)}
              onChange={(e) =>
                handleConfigChange({
                  target: {
                    name: 'LONG_BREAK_TIME',
                    value: Math.max(1, e.target.value) * 60
                  }
                })
              }
            />
          </div>
          <div className="row">
            <label>Pomodoros antes de descanso largo:</label>
            <input
              type="number"
              min={1}
              name="POMODOROS_BEFORE_LONG_BREAK"
              value={tempConfig.POMODOROS_BEFORE_LONG_BREAK}
              onChange={handleConfigChange}
            />
          </div>
          <div className="toggle-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ marginRight: '12px', fontSize: '16px', color: '#555' }}>Auto-iniciar contadores:</label>
            <button
              className={`toggle-button ${tempConfig.autoStart ? 'active' : ''}`}
              onClick={() =>
                handleConfigChange({
                  target: { name: 'autoStart', checked: !tempConfig.autoStart },
                })
              }
            >
              <div className="toggle-circle"></div>
            </button>
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: '1px' }}>
          <button className="modal-button" onClick={handleConfigReset}>Restablecer</button>
          <button className="modal-button" onClick={onClose}>Cancelar</button>
          <button className="modal-button" onClick={handleConfigSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
