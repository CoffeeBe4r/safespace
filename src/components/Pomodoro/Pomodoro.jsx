import { useState, useEffect } from 'react';
import './Pomodoro.css';

export default function Pomodoro() {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [secondsLeft, setSecondsLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isRunning) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsBreak(!isBreak);
            return isBreak ? WORK_TIME : BREAK_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isBreak]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(isBreak ? BREAK_TIME : WORK_TIME);
  };

  return (
    <div className={`pomodoro ${isBreak ? 'break' : 'work'}`}>
      <h2>{isBreak ? 'Descanso' : 'Enfoque'}</h2>
      <div className="timer">{formatTime(secondsLeft)}</div>
      <div className="buttons">
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        <button onClick={reset}>Reiniciar</button>
      </div>
    </div>
  );
}
