import React, { useRef, useState, useEffect } from 'react';
import './AmbientPlayer.css';
import musicList from '../../music.json'; // Asegúrate que music.json está en src o usa import.meta.glob para public


const AmbientPlayer = ({ track, idx, onPrev, onNext }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [progress, setProgress] = useState(0);

    const audioSrc = track && track.audioUrl
        ? (track.audioUrl.startsWith('/') ? track.audioUrl : `/${track.audioUrl}`)
        : null;

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (!audioSrc) {
            alert("No hay archivo de audio válido para reproducir.");
            return;
        }
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {});
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        // Solo reinicia el estado si la pista realmente cambió
        // Así no se reinicia el progreso ni el estado al cambiar volumen, etc.
        setIsPlaying(false);
        setProgress(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        // eslint-disable-next-line
    }, [audioSrc]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime / audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e) => {
        if (audioRef.current && audioRef.current.duration) {
            const percent = parseFloat(e.target.value);
            audioRef.current.currentTime = percent * audioRef.current.duration;
            setProgress(percent);
        }
    };

    if (!track) return <div>No hay pistas disponibles.</div>;
    if (!audioSrc) return <div>Archivo de audio no soportado o no encontrado.</div>;

    return (
        <div className="ambient-player pretty-player">
            <div className="pretty-player__artwork">
                <div className="pretty-player__cd">
                    <div className="pretty-player__cd-img" />
                </div>
            </div>
            <div className="pretty-player__info">
                <div className="pretty-player__title">{track.title || "Ambient Sound"}</div>
                <div className="pretty-player__artist">{track.artist || ""}</div>
            </div>
            <div className="pretty-player__progress">
                <div
                    className="pretty-player__progress-bg"
                    style={{
                        background: `linear-gradient(to right, #c97c41 ${progress * 100}%, #f7e1c6 ${progress * 100}%)`,
                    }}
                />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={progress}
                    onChange={handleSeek}
                    className="pretty-player__progress-bar"
                    aria-label="Progreso"
                />
            </div>
            <div className="pretty-player__controls">
                {onPrev && (
                    <button
                        className="pretty-player__button"
                        onClick={onPrev}
                        aria-label="Anterior"
                        type="button"
                    >
                        <span className="pretty-player__icon pretty-player__icon--prev"></span>
                    </button>
                )}
                <button
                    className="pretty-player__button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pausar" : "Reproducir"}
                    type="button"
                >
                    {isPlaying ? (
                        <span className="pretty-player__icon pretty-player__icon--pause" style={{justifyContent: 'center', alignItems: 'center'}}>
                            <span style={{
                                display: 'inline-block',
                                width: 6,
                                height: 22,
                                background: '#fff',
                                borderRadius: 2,
                                marginRight: 3,
                                verticalAlign: 'middle'
                            }}></span>
                            <span style={{
                                display: 'inline-block',
                                width: 6,
                                height: 22,
                                background: '#fff',
                                borderRadius: 2,
                                marginLeft: 3,
                                verticalAlign: 'middle'
                            }}></span>
                        </span>
                    ) : (
                        <span className="pretty-player__icon pretty-player__icon--play" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 22,
                            height: 22
                        }}>
                            <span style={{
                                display: 'inline-block',
                                width: 0,
                                height: 0,
                                borderTop: '11px solid transparent',
                                borderBottom: '11px solid transparent',
                                borderLeft: '18px solid #fff',
                                marginLeft: 4
                            }}></span>
                        </span>
                    )}
                </button>
                {onNext && (
                    <button
                        className="pretty-player__button"
                        onClick={onNext}
                        aria-label="Siguiente"
                        type="button"
                    >
                        <span className="pretty-player__icon pretty-player__icon--next"></span>
                    </button>
                )}
            </div>
            <div className="pretty-player__volume">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    aria-label="Volumen"
                />
            </div>
            <audio
                ref={audioRef}
                src={audioSrc}
                loop={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={onNext}
                onTimeUpdate={handleTimeUpdate}
                controls={false}
                preload="auto"
            />
        </div>
    );
};

const AmbientPlayerWrapper = () => {
    const [current, setCurrent] = useState(0);

    const handlePrev = () => setCurrent((prev) => (prev - 1 + musicList.length) % musicList.length);
    const handleNext = () => setCurrent((prev) => (prev + 1) % musicList.length);

    const track = musicList[current];

    return (
        <AmbientPlayer
            track={track}
            idx={current}
            onPrev={musicList.length > 1 ? handlePrev : undefined}
            onNext={musicList.length > 1 ? handleNext : undefined}
        />
    );
};

export default AmbientPlayerWrapper;