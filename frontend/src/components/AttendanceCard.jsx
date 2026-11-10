import { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, UserCheck, CalendarDays } from 'lucide-react';
import DigitalCard from './DigitalCard';
import { QrCode } from 'lucide-react';

export default function AttendanceCard({ user }) {
  const [showQR, setShowQR] = useState(false);
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
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          {showQR ? 'Ocultar Carnet' : 'Ver Carnet Digital QR'}
        </button>
      </div>

      {showQR && (
        <div className="mb-6">
          <DigitalCard user={user} />
        </div>
      )}

      {/* Bloque previo de registro de ingreso e historial de asistencias */}
      {/* ... */}
    </div>
  );
}