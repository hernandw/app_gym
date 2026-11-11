import { useState, useEffect } from 'react';
import api from '../services/api';
import { Dumbbell, ImageOff, Filter, Trash2, Edit3, X } from 'lucide-react';
import AddExerciseModal from './AddExerciseModal';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function ExerciseCatalog({ user }) {
  const [exercises, setExercises] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [editingExercise, setEditingExercise] = useState(null);

  const isAdmin = user?.rol === 'ADMIN';
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

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ejercicio de la biblioteca?')) return;
    try {
      await api.delete(`/routines/exercises/${id}`);
      fetchExercises();
    } catch (err) {
      alert('Error al eliminar ejercicio');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/routines/exercises/${editingExercise.id}`, editingExercise);
      setEditingExercise(null);
      fetchExercises();
    } catch (err) {
      alert('Error al editar ejercicio');
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Dumbbell className="w-5 h-5" />
          <span>Biblioteca de Máquinas y Ejercicios</span>
        </div>
        {isAdmin && <AddExerciseModal onExerciseAdded={fetchExercises} />}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-slate-700/60">
        <Filter className="w-4 h-4 text-slate-500 mr-1 flex-shrink-0" />
        {groups.map((grp) => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedGroup === grp
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-400 text-xs">Cargando biblioteca...</p>
      ) : exercises.length === 0 ? (
        <p className="text-slate-500 text-xs py-4 text-center">No hay ejercicios registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {exercises.map((ex) => {
            const imageUrl = ex.fotoUrl
              ? (ex.fotoUrl.startsWith('http') ? ex.fotoUrl : `${API_BASE}${ex.fotoUrl}`)
              : null;

            return (
              <div key={ex.id} className="bg-slate-900/70 border border-slate-700/70 rounded-xl overflow-hidden flex flex-col justify-between">
                <div className="h-36 bg-slate-950 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={ex.nombre} className="w-full h-full object-cover" />
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
                  <p className="text-[11px] text-slate-400 line-clamp-2">{ex.descripcion || 'Sin notas.'}</p>

                  {isAdmin && (
                    <div className="flex justify-end gap-1.5 mt-3 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setEditingExercise(ex)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Editar máquina"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                        title="Eliminar máquina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Editar Ejercicio */}
      {editingExercise && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl w-full max-w-sm relative">
            <button onClick={() => setEditingExercise(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-slate-100 text-sm mb-3">Modificar Ejercicio</h4>
            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <input
                required
                value={editingExercise.nombre}
                onChange={(e) => setEditingExercise({ ...editingExercise, nombre: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
              />
              <select
                value={editingExercise.grupoMuscular}
                onChange={(e) => setEditingExercise({ ...editingExercise, grupoMuscular: e.target.value })}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
              >
                {groups.filter((g) => g !== 'Todos').map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <textarea
                value={editingExercise.descripcion || ''}
                onChange={(e) => setEditingExercise({ ...editingExercise, descripcion: e.target.value })}
                placeholder="Instrucciones o postura"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
              />
              <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}