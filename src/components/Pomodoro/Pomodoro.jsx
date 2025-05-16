import { useState, useEffect } from 'react';
import './Pomodoro.css';

export default function Pomodoro() {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  // Recuperar estado inicial desde localStorage
  const getInitialState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('pomodoro-state-v2'));
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
    };
  };

  const [isBreak, setIsBreak] = useState(getInitialState().isBreak);
  const [isRunning, setIsRunning] = useState(getInitialState().isRunning);
  const [duration, setDuration] = useState(getInitialState().duration);
  const [startTimestamp, setStartTimestamp] = useState(getInitialState().startTimestamp);
  const [pausedSecondsLeft, setPausedSecondsLeft] = useState(getInitialState().pausedSecondsLeft);

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
        // Cambia de modo automáticamente
        const nextIsBreak = !isBreak;
        const nextDuration = nextIsBreak ? BREAK_TIME : WORK_TIME;
        setIsBreak(nextIsBreak);
        setDuration(nextDuration);
        setPausedSecondsLeft(nextDuration);
        setIsRunning(false);
        setStartTimestamp(null);
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [isRunning, startTimestamp, duration, isBreak]);

  // Guarda el estado en localStorage cada vez que cambie algo relevante
  useEffect(() => {
    localStorage.setItem(
      'pomodoro-state-v2',
      JSON.stringify({
        isBreak,
        isRunning,
        duration,
        startTimestamp,
        pausedSecondsLeft,
      })
    );
  }, [isBreak, isRunning, duration, startTimestamp, pausedSecondsLeft]);

  // Pausar/Iniciar: pausa y guarda el tiempo restante, o reanuda desde donde se quedó
  const handlePauseToggle = () => {
    if (isRunning) {
      // Pausar: guarda el tiempo restante y detiene el timer
      setPausedSecondsLeft(getSecondsLeft());
      setIsRunning(false);
      setStartTimestamp(null);
    } else {
      // Reanudar: inicia desde donde se pausó, NO reinicia el timer
      setStartTimestamp(Date.now() - (duration - pausedSecondsLeft) * 1000);
      setIsRunning(true);
    }
  };

  // Reiniciar: vuelve al inicio del modo actual y deja pausado
  const reset = () => {
    const newDuration = isBreak ? BREAK_TIME : WORK_TIME;
    setDuration(newDuration);
    setPausedSecondsLeft(newDuration);
    setStartTimestamp(null);
    setIsRunning(false);
    setSecondsLeft(newDuration);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`pomodoro ${isBreak ? 'break' : 'work'}`}>
      <h2>{isBreak ? 'Descanso' : 'Enfoque'}</h2>
      <div className="timer">{formatTime(secondsLeft)}</div>
      <div className="buttons">
        <button onClick={handlePauseToggle}>
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        <button onClick={reset}>Reiniciar</button>
      </div>
    </div>
  );
}
