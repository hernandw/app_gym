import { useState, useEffect } from 'react';
import api from '../services/api';
import { Flame, Calendar, Dumbbell, TrendingUp, Plus } from 'lucide-react';

export default function WorkoutTracker() {
  const [stats, setStats] = useState({ totalVolume: 0, daysAttended: 0, recentLogs: [] });
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ exerciseId: '', pesoUsado: '', reps: '' });

  const fetchData = async () => {
    try {
      const [statsRes, exercisesRes] = await Promise.all([
        api.get('/workouts/stats'),
        api.get('/routines/exercises')
      ]);
      setStats(statsRes.data);
      setExercises(exercisesRes.data);
      if (exercisesRes.data.length > 0 && !formData.exerciseId) {
        setFormData((prev) => ({ ...prev, exerciseId: exercisesRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error cargando datos de entrenamiento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.exerciseId || !formData.pesoUsado || !formData.reps) return;
    try {
      await api.post('/workouts/log', formData);
      setFormData({ ...formData, pesoUsado: '', reps: '' });
      fetchData();
    } catch (err) {
      console.error('Error al registrar serie:', err);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      {/* Tarjetas de Resumen / KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Días entrenados</span>
          </div>
          <p className="text-xl font-bold text-slate-100">{stats.daysAttended} días</p>
        </div>

        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Peso acumulado</span>
          </div>
          <p className="text-xl font-bold text-slate-100">{stats.totalVolume.toLocaleString()} kg</p>
        </div>

        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700/60 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Series registradas</span>
          </div>
          <p className="text-xl font-bold text-slate-100">{stats.recentLogs.length} series</p>
        </div>
      </div>

      {/* Formulario rápido para anotar levantamiento */}
      <form onSubmit={handleSubmit} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mb-5">
        <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
          <Plus className="w-4 h-4 text-emerald-400" /> Registrar carga levantada
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <select
            value={formData.exerciseId}
            onChange={(e) => setFormData({ ...formData, exerciseId: e.target.value })}
            className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500 sm:col-span-2"
          >
            {exercises.length === 0 ? (
              <option value="">Sin ejercicios disponibles</option>
            ) : (
              exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.nombre} ({ex.grupoMuscular})
                </option>
              ))
            )}
          </select>
          <input
            type="number"
            step="0.5"
            placeholder="Peso (kg)"
            value={formData.pesoUsado}
            onChange={(e) => setFormData({ ...formData, pesoUsado: e.target.value })}
            className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            placeholder="Repeticiones"
            value={formData.reps}
            onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
            className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-2 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-colors"
        >
          Anotar serie
        </button>
      </form>

      {/* Últimos registros */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-2">Últimos levantamientos</h4>
        {stats.recentLogs.length === 0 ? (
          <p className="text-slate-500 text-xs">No hay entrenamientos registrados hoy.</p>
        ) : (
          <div className="space-y-1.5">
            {stats.recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex justify-between items-center bg-slate-900/30 px-3 py-2 rounded border border-slate-700/40 text-xs"
              >
                <span className="font-medium text-slate-200">{log.exercise?.nombre}</span>
                <span className="text-emerald-400 font-semibold">
                  {log.pesoUsado} kg × {log.reps} reps
                </span>
                <span className="text-slate-500 text-[10px]">
                  {new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}