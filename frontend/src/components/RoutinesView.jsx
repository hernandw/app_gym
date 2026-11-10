import { useState, useEffect } from 'react';
import api from '../services/api';
import { Dumbbell, Clock, Repeat, CheckCircle2 } from 'lucide-react';

export default function RoutinesView({ onSelectRoutine, currentRoutineId }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = async () => {
    try {
      const res = await api.get('/routines');
      setRoutines(res.data || []);
      // Seleccionar la primera por defecto si no hay ninguna activa
      if (res.data?.length > 0 && !currentRoutineId && onSelectRoutine) {
        onSelectRoutine(res.data[0]);
      }
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

  const activeRoutine = routines.find((r) => r.id === currentRoutineId) || routines[0];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
        <Dumbbell className="w-5 h-5" />
        <span>Selecciona la Rutina de Hoy</span>
      </div>

      {routines.length === 0 ? (
        <p className="text-slate-500 text-xs">Aún no hay plantillas oficiales registradas por el administrador.</p>
      ) : (
        <div>
          {/* Selector de rutinas oficiales */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-700/60">
            {routines.map((r) => {
              const isSelected = (activeRoutine?.id === r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRoutine && onSelectRoutine(r)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {r.nombre}
                </button>
              );
            })}
          </div>

          {/* Lista de ejercicios sugeridos en la rutina elegida */}
          {activeRoutine && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">
                Ejercicios recomendados para <strong className="text-slate-200">{activeRoutine.nombre}</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeRoutine.ejercicios?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-100">{item.exercise?.nombre}</p>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {item.exercise?.grupoMuscular}
                      </span>
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