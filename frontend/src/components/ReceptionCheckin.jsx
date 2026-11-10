import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, UserCheck, CheckCircle2, AlertTriangle, Users, QrCode } from 'lucide-react';
import QRScannerModal from './QRScannerModal';

export default function ReceptionCheckin() {
  const [telefono, setTelefono] = useState('');
  const [todayList, setTodayList] = useState([]);
  const [lastCheckin, setLastCheckin] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchTodayList = async () => {
    try {
      const res = await api.get('/attendance/admin/today');
      setTodayList(res.data || []);
    } catch (err) {
      console.error('Error al cargar ingresos de hoy:', err);
    }
  };

  useEffect(() => {
    fetchTodayList();
  }, []);

  const executeCheckin = async (phoneToValidate) => {
    setErrorMsg('');
    setLastCheckin(null);
    setLoading(true);

    try {
      const res = await api.post('/attendance/admin/checkin', { telefono: phoneToValidate });
      setLastCheckin(res.data.member);
      setTelefono('');
      fetchTodayList();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al validar acceso.');
      if (err.response?.data?.member) {
        setLastCheckin(err.response.data.member);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!telefono.trim()) {
      setErrorMsg('Ingresa un número de teléfono.');
      return;
    }
    executeCheckin(telefono.trim());
  };

  const handleQRSuccess = (scannedText) => {
    setIsScannerOpen(false);
    executeCheckin(scannedText.trim());
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <UserCheck className="w-5 h-5" />
          <span>Control de Acceso / Recepción</span>
        </div>
        <span className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
          Hoy han ingresado: <strong className="text-emerald-400">{todayList.length}</strong>
        </span>
      </div>

      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 mb-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Buscar por teléfono..."
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              <Search className="w-4 h-4" /> {loading ? 'Validando...' : 'Dar Acceso'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <QrCode className="w-4 h-4 text-emerald-400" /> Escanear QR
          </button>
        </div>

        {errorMsg && (
          <p className="mt-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded">
            {errorMsg}
          </p>
        )}
      </div>

      {lastCheckin && (
        <div className="mb-5 p-4 bg-slate-900/80 border border-slate-700 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100">{lastCheckin.nombre}</h4>
            <p className="text-xs text-slate-400 font-mono">{lastCheckin.telefono}</p>
          </div>
          <div className="text-right">
            {lastCheckin.fechaVencimiento && new Date(lastCheckin.fechaVencimiento) >= new Date() ? (
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                <CheckCircle2 className="w-4 h-4" /> Cuota al día
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full font-bold">
                <AlertTriangle className="w-4 h-4" /> Cuota vencida
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-slate-400" /> Registro de ingresos de hoy
        </h4>
        {todayList.length === 0 ? (
          <p className="text-slate-500 text-xs">No se han registrado ingresos aún hoy.</p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {todayList.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-slate-900/40 px-3 py-2 rounded border border-slate-700/40 text-xs"
              >
                <div>
                  <span className="font-medium text-slate-200 mr-2">{item.user?.nombre}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{item.user?.telefono}</span>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">
                  {new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleQRSuccess}
      />
    </div>
  );
}