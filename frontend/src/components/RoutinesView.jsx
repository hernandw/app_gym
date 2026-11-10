import { useState, useEffect } from 'react';
import api from '../services/api';
import { Dumbbell, Clock, Repeat, CheckCircle } from 'lucide-react';

export default function RoutinesView({ onSelectRoutineForWorkout }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoutineId, setActiveRoutineId] = useState(null);

  const fetchRoutines = async () => {
    try {
      const res = await api.get('/routines');
      setRoutines(res.data);
      if (res.data.length > 0) setActiveRoutineId(res.data[0].id);
    } catch (err) {
      console.error('Error al cargar rutinas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  if (loading) return <p className="text-slate-400 text-xs">Cargando catálogo de rutinas...</p>;

  const selectedRoutine = routines.find((r) => r.id === activeRoutineId);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
        <Dumbbell className="w-5 h-5" />
        <span>Elige tu Rutina de Hoy</span>
      </div>

      {routines.length === 0 ? (
        <p className="text-slate-500 text-xs">El administrador aún no ha cargado rutinas oficiales.</p>
      ) : (
        <div>
          {/* Selector tipo pastillas/chips para elegir grupo muscular */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-700/60">
            {routines.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRoutineId(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeRoutineId === r.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {r.nombre}
              </button>
            ))}
          </div>

          {/* Detalle de ejercicios de la rutina seleccionada */}
          {selectedRoutine && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">Ejercicios sugeridos para esta sesión:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRoutine.ejercicios.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-100">{item.exercise?.nombre}</p>
                      <p className="text-[10px] text-emerald-400">{item.exercise?.grupoMuscular}</p>
                    </div>
                    <div className="text-right text-slate-400 text-[11px]">
                      <p className="font-semibold text-slate-200">{item.series} series × {item.reps} reps</p>
                      <p className="text-[10px] text-slate-500">{item.descansoSeg}s descanso</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}