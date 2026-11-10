import { useState, useEffect } from 'react';
import api from '../services/api';
import { Dumbbell, ImageOff, Filter } from 'lucide-react';
import AddExerciseModal from './AddExerciseModal';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function ExerciseCatalog({ user }) {
  const [exercises, setExercises] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const groups = ['Todos', 'Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazo', 'Core'];

  const fetchExercises = async () => {
    try {
      const endpoint = selectedGroup === 'Todos' ? '/routines/exercises' : `/routines/exercises?grupo=${selectedGroup}`;
      const res = await api.get(endpoint);
      setExercises(res.data || []);
    } catch (err) {
      console.error('Error cargando catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [selectedGroup]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Dumbbell className="w-5 h-5" />
          <span>Biblioteca de Máquinas y Ejercicios</span>
        </div>
        {user?.rol === 'ADMIN' && (
          <AddExerciseModal onExerciseAdded={fetchExercises} />
        )}
      </div>

      {/* Selector de Grupos Musculares */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-slate-700/60">
        <Filter className="w-4 h-4 text-slate-500 mr-1 flex-shrink-0" />
        {groups.map((grp) => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedGroup === grp
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Galería de tarjetas */}
      {loading ? (
        <p className="text-slate-400 text-xs">Cargando biblioteca...</p>
      ) : exercises.length === 0 ? (
        <p className="text-slate-500 text-xs py-4 text-center">No hay ejercicios registrados en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {exercises.map((ex) => {
            const imageUrl = ex.fotoUrl
              ? (ex.fotoUrl.startsWith('http') ? ex.fotoUrl : `${API_BASE}${ex.fotoUrl}`)
              : null;

            return (
              <div
                key={ex.id}
                className="bg-slate-900/70 border border-slate-700/70 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div className="h-36 bg-slate-950 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={ex.nombre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-600 text-xs">
                      <ImageOff className="w-6 h-6 mb-1 opacity-50" />
                      <span>Sin fotografía</span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-slate-200 text-xs truncate">{ex.nombre}</h4>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      {ex.grupoMuscular}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {ex.descripcion || 'Sin notas de postura o ajuste.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}