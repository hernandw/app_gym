import { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, UserCheck, CalendarDays } from 'lucide-react';

export default function AttendanceCard() {
  const [history, setHistory] = useState([]);
  const [checkedToday, setCheckedToday] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/my-history');
      setHistory(res.data);

      const todayStr = new Date().toDateString();
      const hasChecked = res.data.some((a) => new Date(a.fecha).toDateString() === todayStr);
      setCheckedToday(hasChecked);
    } catch (err) {
      console.error('Error cargando asistencias:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkin');
      await fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar asistencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <UserCheck className="w-5 h-5" />
          <span>Control de Acceso / Asistencia</span>
        </div>
        <span className="text-xs text-slate-400">Total asistencias: {history.length}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
        <div>
          <h4 className="text-sm font-bold text-slate-100">
            {checkedToday ? '¡Ya marcaste tu ingreso hoy!' : '¿Entrenando en el gimnasio ahora?'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {checkedToday
              ? 'Tu asistencia diaria quedó anotada en el sistema.'
              : 'Presiona el botón para validar tu acceso y sumar a tus días asistidos.'}
          </p>
        </div>

        <button
          onClick={handleCheckIn}
          disabled={checkedToday || loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors whitespace-nowrap ${
            checkedToday
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {checkedToday ? 'Ingreso Registrado' : loading ? 'Registrando...' : 'Marcar Ingreso'}
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700/40">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <span>Últimos ingresos registrados:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 7).map((item) => (
              <span
                key={item.id}
                className="text-[11px] bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-md text-slate-300"
              >
                {new Date(item.fecha).toLocaleDateString([], {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}