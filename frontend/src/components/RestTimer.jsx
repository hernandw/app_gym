import { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function RestTimer() {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(60);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const startTimer = (secs) => {
    setInitialTime(secs);
    setSecondsLeft(secs);
    setIsActive(true);
  };

  const togglePause = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(initialTime);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Timer className="w-5 h-5 text-emerald-400" />
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Temporizador de descanso</p>
          <span className="text-xl font-black text-slate-100 font-mono">{formatTime(secondsLeft)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => startTimer(45)}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700"
        >
          45s
        </button>
        <button
          onClick={() => startTimer(60)}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700"
        >
          60s
        </button>
        <button
          onClick={() => startTimer(90)}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700"
        >
          90s
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={togglePause}
          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs"
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}