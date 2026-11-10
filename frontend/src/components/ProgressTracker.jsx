import { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Plus, Calendar, Scale } from 'lucide-react';

export default function ProgressTracker() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    peso: '',
    grasa: '',
    pecho: '',
    brazo: '',
    cintura: ''
  });

  const fetchMeasurements = async () => {
    try {
      const res = await api.get('/measurements');
      setMeasurements(res.data);
    } catch (err) {
      console.error('Error cargando medidas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/measurements', formData);
      setFormData({ peso: '', grasa: '', pecho: '', brazo: '', cintura: '' });
      setShowForm(false);
      fetchMeasurements();
    } catch (err) {
      console.error('Error al registrar medidas:', err);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Activity className="w-5 h-5" />
          <span>Evolución de Medidas</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva toma
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/60 p-4 rounded-lg border border-slate-700 mb-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <input
              type="number"
              step="0.1"
              placeholder="Peso (kg)"
              value={formData.peso}
              onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              step="0.1"
              placeholder="% Grasa"
              value={formData.grasa}
              onChange={(e) => setFormData({ ...formData, grasa: e.target.value })}
              className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Pecho (cm)"
              value={formData.pecho}
              onChange={(e) => setFormData({ ...formData, pecho: e.target.value })}
              className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Brazo (cm)"
              value={formData.brazo}
              onChange={(e) => setFormData({ ...formData, brazo: e.target.value })}
              className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Cintura (cm)"
              value={formData.cintura}
              onChange={(e) => setFormData({ ...formData, cintura: e.target.value })}
              className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-colors"
          >
            Guardar Medida
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-400 text-xs">Cargando historial...</p>
      ) : measurements.length === 0 ? (
        <p className="text-slate-400 text-xs">Aún no hay registros de medidas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/40 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Fecha</th>
                <th className="p-2.5">Peso</th>
                <th className="p-2.5">% Grasa</th>
                <th className="p-2.5">Pecho</th>
                <th className="p-2.5">Brazo</th>
                <th className="p-2.5">Cintura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {measurements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-700/30">
                  <td className="p-2.5 text-slate-400">
                    {new Date(m.fecha).toLocaleDateString()}
                  </td>
                  <td className="p-2.5 font-medium text-emerald-400">
                    {m.peso ? `${m.peso} kg` : '-'}
                  </td>
                  <td className="p-2.5">{m.grasa ? `${m.grasa}%` : '-'}</td>
                  <td className="p-2.5">{m.pecho ? `${m.pecho} cm` : '-'}</td>
                  <td className="p-2.5">{m.brazo ? `${m.brazo} cm` : '-'}</td>
                  <td className="p-2.5">{m.cintura ? `${m.cintura} cm` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}