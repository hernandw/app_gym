import { useState, useEffect } from 'react';
import api from '../services/api';
import { Dumbbell, Clock, Repeat, ListPlus } from 'lucide-react';
import AddExerciseModal from './AddExerciseModal';

export default function RoutinesView() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Declarar fetchRoutines directamente en el cuerpo del componente
  const fetchRoutines = async () => {
    try {
      const res = await api.get('/routines');
      setRoutines(res.data);
    } catch (err) {
      console.error('Error al cargar rutinas:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Invocarla en el montaje
  useEffect(() => {
    fetchRoutines();
  }, []);

  if (loading) {
    return <p className="text-slate-400 text-xs">Cargando rutinas disponibles...</p>;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Dumbbell className="w-5 h-5" />
          <span>Mis Rutinas y Plantillas</span>
        </div>
        {/* Ahora fetchRoutines ya existe y está disponible */}
        <AddExerciseModal onExerciseAdded={fetchRoutines} />
      </div>

      {loading ? (
        <p className="text-slate-400 text-xs">Cargando rutinas disponibles...</p>
      ) : routines.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <ListPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No hay rutinas asignadas ni plantillas creadas todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-100 text-sm">{routine.nombre}</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {routine.userId ? 'Personalizada' : 'General'}
                  </span>
                </div>

                <div className="space-y-2">
                  {routine.ejercicios.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50"
                    >
                      <div>
                        <p className="font-medium text-slate-200">{item.exercise?.nombre}</p>
                        <p className="text-[10px] text-slate-400">{item.exercise?.grupoMuscular}</p>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                          {item.series} × {item.reps}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          {item.descansoSeg}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}