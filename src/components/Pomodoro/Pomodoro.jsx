import { useState, useEffect } from 'react';
import './Pomodoro.css';

export default function Pomodoro() {
  const defaultConfig = {
    WORK_TIME: 25 * 60,
    BREAK_TIME: 5 * 60,
    LONG_BREAK_TIME: 15 * 60,
    POMODOROS_BEFORE_LONG_BREAK: 4,
  };

  // Configuración editable
  const getInitialConfig = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('pomodoro-config-v1'));
      if (saved && typeof saved.WORK_TIME === 'number') {   
        return saved;
      }
    } catch (e) { /* ignorar error */ }
    return defaultConfig;
  };

  const [config, setConfig] = useState(getInitialConfig());
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Usar config en vez de constantes fijas
  const WORK_TIME = config.WORK_TIME;
  const BREAK_TIME = config.BREAK_TIME;
  const LONG_BREAK_TIME = config.LONG_BREAK_TIME;
  const POMODOROS_BEFORE_LONG_BREAK = config.POMODOROS_BEFORE_LONG_BREAK;

  // Recuperar estado inicial desde localStorage
  const getInitialState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('pomodoro-state-v3'));
      if (saved && typeof saved.pausedSecondsLeft === 'number') {
        return saved;
      }
    } catch {}
    return {
      isBreak: false,
      isRunning: false,
      duration: WORK_TIME,
      startTimestamp: null,
      pausedSecondsLeft: WORK_TIME,
      pomodorosCompleted: 0,
      isLongBreak: false,
    };
  };

  const [isBreak, setIsBreak] = useState(getInitialState().isBreak);
  const [isRunning, setIsRunning] = useState(getInitialState().isRunning);
  const [duration, setDuration] = useState(getInitialState().duration);
  const [startTimestamp, setStartTimestamp] = useState(getInitialState().startTimestamp);
  const [pausedSecondsLeft, setPausedSecondsLeft] = useState(getInitialState().pausedSecondsLeft);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(getInitialState().pomodorosCompleted || 0);
  const [isLongBreak, setIsLongBreak] = useState(getInitialState().isLongBreak || false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalLongBreaks, setTotalLongBreaks] = useState(0);
  const [pomodoroCycles, setPomodoroCycles] = useState(0);

  // Calcula segundos restantes en base a timestamp y duración
  const getSecondsLeft = () => {
    if (isRunning && startTimestamp) {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      return Math.max(duration - elapsed, 0);
    }
    return pausedSecondsLeft;
  };

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft());

  // Actualiza segundosLeft cada segundo si está corriendo
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(pausedSecondsLeft);
      return;
    }
    setSecondsLeft(getSecondsLeft());
    const interval = setInterval(() => {
      const left = getSecondsLeft();
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        handleSessionEnd();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [isRunning, startTimestamp, duration, isBreak, isLongBreak]);

  // Guarda el estado en localStorage cada vez que cambie algo relevante
  useEffect(() => {
    localStorage.setItem(
      'pomodoro-state-v3',
      JSON.stringify({
        isBreak,
        isRunning,
        duration,
        startTimestamp,
        pausedSecondsLeft,
        pomodorosCompleted,
        isLongBreak,
      })
    );
  }, [isBreak, isRunning, duration, startTimestamp, pausedSecondsLeft, pomodorosCompleted, isLongBreak]);

  // Cuando cambia la config, guardar en localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-config-v1', JSON.stringify(config));
  }, [config]);

  // Lógica para finalizar sesión y cambiar de modo
  const handleSessionEnd = () => {
    if (!isBreak) {
      // Termina pomodoro, pasa a descanso
      const nextCycles = cyclesCompleted;
      if ((nextCycles + 1) % POMODOROS_BEFORE_LONG_BREAK === 0) {
        setIsBreak(true);
        setIsLongBreak(true);
        setDuration(LONG_BREAK_TIME);
        setPausedSecondsLeft(LONG_BREAK_TIME);
      } else {
        setIsBreak(true);
        setIsLongBreak(false);
        setDuration(BREAK_TIME);
        setPausedSecondsLeft(BREAK_TIME);
      }
      setIsRunning(false);
      setStartTimestamp(null);
    } else {
      // Termina descanso, pasa a pomodoro y suma ciclo
      const nextCycles = cyclesCompleted + 1;
      setIsBreak(false);
      setIsLongBreak(false);
      setDuration(WORK_TIME);
      setPausedSecondsLeft(WORK_TIME);
      setIsRunning(false);
      setStartTimestamp(null);
      setCyclesCompleted(nextCycles);
      setPomodoroCycles((prev) => prev + 1); // Suma ciclo work+break
      if (isLongBreak) {
        setCyclesCompleted(0);
        setTotalLongBreaks((prev) => prev + 1);
      }
    }
  };

  // Pausar/Iniciar: pausa y guarda el tiempo restante, o reanuda desde donde se quedó
  const handlePauseToggle = () => {
    if (isRunning) {
      setPausedSecondsLeft(getSecondsLeft());
      setIsRunning(false);
      setStartTimestamp(null);
    } else {
      setStartTimestamp(Date.now() - (duration - pausedSecondsLeft) * 1000);
      setIsRunning(true);
    }
  };

  // Reiniciar: vuelve al inicio del modo actual y deja pausado
  const reset = () => {
    const newDuration = isBreak ? (isLongBreak ? LONG_BREAK_TIME : BREAK_TIME) : WORK_TIME;
    setDuration(newDuration);
    setPausedSecondsLeft(newDuration);
    setStartTimestamp(null);
    setIsRunning(false);
    setSecondsLeft(newDuration);
  };

  // Adelantar: avanza de pomodoro a descanso o de descanso a pomodoro
  const skipCycle = () => {
    if (!isBreak) {
      // De pomodoro a descanso
      const nextCycles = cyclesCompleted;
      if ((nextCycles + 1) % POMODOROS_BEFORE_LONG_BREAK === 0) {
        setIsBreak(true);
        setIsLongBreak(true);
        setDuration(LONG_BREAK_TIME);
        setPausedSecondsLeft(LONG_BREAK_TIME);
      } else {
        setIsBreak(true);
        setIsLongBreak(false);
        setDuration(BREAK_TIME);
        setPausedSecondsLeft(BREAK_TIME);
      }
      setIsRunning(false);
      setStartTimestamp(null);
    } else {
      // De descanso a pomodoro y suma ciclo
      const nextCycles = cyclesCompleted + 1;
      setIsBreak(false);
      setIsLongBreak(false);
      setDuration(WORK_TIME);
      setPausedSecondsLeft(WORK_TIME);
      setIsRunning(false);
      setStartTimestamp(null);
      setCyclesCompleted(nextCycles);
      setPomodoroCycles((prev) => prev + 1); // Suma ciclo work+break
      if (isLongBreak) {
        setCyclesCompleted(0);
        setTotalLongBreaks((prev) => prev + 1);
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Modal de configuración
  const [tempConfig, setTempConfig] = useState(config);
  useEffect(() => { setTempConfig(config); }, [showConfigModal]);

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setTempConfig((prev) => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleConfigSave = () => {
    setConfig(tempConfig);
    setShowConfigModal(false);
    // Reiniciar temporizador con nueva config
    setDuration(tempConfig.WORK_TIME);
    setPausedSecondsLeft(tempConfig.WORK_TIME);
    setIsBreak(false);
    setIsLongBreak(false);
    setIsRunning(false);
    setStartTimestamp(null);
    setSecondsLeft(tempConfig.WORK_TIME);
    setPomodorosCompleted(0);
  };

  const handleConfigReset = () => {
    setTempConfig(defaultConfig);
  };

  return (
    <div className={`pomodoro ${isBreak ? 'break' : 'work'}`} style={{position: 'relative', minHeight: 340}}>
      {/* Botón de configuración en la esquina superior derecha */}
      <button
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          zIndex: 20,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '10%',
          width: 10,
          height: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          boxShadow: '0 2px 8px #0002',
          cursor: 'pointer',
          transition: 'background 0.3s',
        }}
        aria-label="Configurar Pomodoro"
        onClick={() => setShowConfigModal(true)}
      >
        ⚙️
      </button>
      {/* Modal de configuración */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setShowConfigModal(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: 32,
              borderRadius: 16,
              minWidth: 320,
              maxWidth: 360,
              boxShadow: '0 8px 32px #0004',
              position: 'relative',
              animation: 'modalIn 0.2s',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowConfigModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#888',
                cursor: 'pointer',
              }}
              aria-label="Cerrar"
            >✕</button>
            <h3 style={{marginTop: 0, marginBottom: 18, color: '#a05a2c'}}>Ajustes de Pomodoro</h3>
            <div style={{marginBottom: 16}}>
              <label style={{display:'block', marginBottom:6}}>Duración Pomodoro (min):
                <input
                  type="number"
                  min={1}
                  name="WORK_TIME"
                  value={Math.round(tempConfig.WORK_TIME/60)}
                  onChange={e => handleConfigChange({
                    target: { name: 'WORK_TIME', value: Math.max(1, e.target.value) * 60 }
                  })}
                  style={{marginLeft: 8, width: 60, padding:4, borderRadius:6, border:'1px solid #ccc'}}
                />
              </label>
              <label style={{display:'block', marginBottom:6}}>Duración Break (min):
                <input
                  type="number"
                  min={1}
                  name="BREAK_TIME"
                  value={Math.round(tempConfig.BREAK_TIME/60)}
                  onChange={e => handleConfigChange({
                    target: { name: 'BREAK_TIME', value: Math.max(1, e.target.value) * 60 }
                  })}
                  style={{marginLeft: 8, width: 60, padding:4, borderRadius:6, border:'1px solid #ccc'}}
                />
              </label>
              <label style={{display:'block', marginBottom:6}}>Duración Descanso Largo (min):
                <input
                  type="number"
                  min={1}
                  name="LONG_BREAK_TIME"
                  value={Math.round(tempConfig.LONG_BREAK_TIME/60)}
                  onChange={e => handleConfigChange({
                    target: { name: 'LONG_BREAK_TIME', value: Math.max(1, e.target.value) * 60 }
                  })}
                  style={{marginLeft: 8, width: 60, padding:4, borderRadius:6, border:'1px solid #ccc'}}
                />
              </label>
              <label style={{display:'block', marginBottom:6}}>Pomodoros antes de descanso largo:
                <input
                  type="number"
                  min={1}
                  name="POMODOROS_BEFORE_LONG_BREAK"
                  value={tempConfig.POMODOROS_BEFORE_LONG_BREAK}
                  onChange={handleConfigChange}
                  style={{marginLeft: 8, width: 60, padding:4, borderRadius:6, border:'1px solid #ccc'}}
                />
              </label>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 18}}>
              <button onClick={handleConfigReset} style={{background:'#eee', border:'none', borderRadius:6, padding:'6px 14px', color:'#a05a2c'}}>Restablecer</button>
              <button onClick={() => setShowConfigModal(false)} style={{background:'#eee', border:'none', borderRadius:6, padding:'6px 14px'}}>Cancelar</button>
              <button onClick={handleConfigSave} style={{background:'#a05a2c', color:'#fff', border:'none', borderRadius:6, padding:'6px 18px'}}>Guardar</button>
            </div>
          </div>
        </div>
      )}
      <h2 style={{marginTop: 60}}>{isBreak ? (isLongBreak ? 'Descanso largo' : 'Descanso') : 'Enfoque'}</h2>
      <div className="timer">{formatTime(secondsLeft)}</div>
   
      <div className="buttons" style={{display:'flex', gap:10, justifyContent:'center'}}>
        <button onClick={handlePauseToggle} style={{padding:'8px 18px', borderRadius:6, border:'none', background:'#a05a2c', color:'#fff', fontWeight:500}}>
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        <button onClick={reset} style={{padding:'8px 18px', borderRadius:6, border:'none', background:'#eee', color:'#a05a2c', fontWeight:500}}>Reiniciar</button>
        <button onClick={skipCycle} style={{padding:'8px 18px', borderRadius:6, border:'none', background:'#f7b267', color:'#fff', fontWeight:500}}>Adelantar</button>
      </div>
      {/* Nuevo: contador de ciclos de pomodoro completados (work+break) */}
      <div style={{marginTop: 10, color: '#a05a2c', fontWeight: 500, fontSize: 15}}>
        Ciclos pomodoro completados: {pomodoroCycles}
      </div>
      {/* Nuevo: contador de breaks largos */}
      <div style={{marginTop: 2, color: '#a05a2c', fontWeight: 500, fontSize: 15}}>
        Breaks largos completados: {Math.floor(totalLongBreaks)}
      </div>
    </div>
  );
}
