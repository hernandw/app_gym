import { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, CheckCircle, AlertTriangle, Receipt, UserCheck, MessageSquareShare } from 'lucide-react';
import { generatePaymentReceiptLink } from '../utils/whatsapp';

export default function MembershipCard({ user }) {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [monto, setMonto] = useState('25000');
  const [metodo, setMetodo] = useState('Efectivo');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.rol === 'ADMIN';

  const fetchData = async () => {
    try {
      if (isAdmin) {
        const res = await api.get('/payments/members');
        setMembers(res.data);
      } else {
        const res = await api.get('/payments/my-history');
        setPayments(res.data);
      }
    } catch (err) {
      console.error('Error cargando pagos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      const res = await api.post('/payments/register', {
        userId: selectedMember,
        monto,
        metodo
      });

      const memberData = members.find((m) => m.id === selectedMember);

      // Abrir WhatsApp con el recibo generado
      if (memberData && memberData.telefono) {
        const link = generatePaymentReceiptLink({
          clienteNombre: memberData.nombre,
          telefono: memberData.telefono,
          monto: parseFloat(monto),
          fechaPago: new Date(),
          fechaVencimiento: res.data.payment?.user?.fechaVencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          metodo
        });
        window.open(link, '_blank');
      }

      alert('Pago registrado correctamente');
      setSelectedMember('');
      fetchData();
    } catch (err) {
      alert('Error al registrar el pago');
    }
  };

  // Cálculo de días restantes
  const diasRestantes = user?.fechaVencimiento
    ? Math.ceil((new Date(user.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
        <CreditCard className="w-5 h-5" />
        <span>{isAdmin ? 'Gestión de Membresías y Cobros' : 'Estado de Membresía'}</span>
      </div>

      {!isAdmin ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <div>
              <p className="text-xs text-slate-400">Estado de cuenta</p>
              <div className="flex items-center gap-2 mt-1">
                {diasRestantes > 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-slate-100 text-sm">Al día</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-amber-400 text-sm">Vencida / Pendiente</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Días restantes</p>
              <p className={`text-2xl font-black ${diasRestantes > 3 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diasRestantes > 0 ? diasRestantes : 0}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
              <Receipt className="w-4 h-4 text-slate-400" /> Recibos de pago
            </h4>
            {loading ? (
              <p className="text-slate-500 text-xs">Cargando recibos...</p>
            ) : payments.length === 0 ? (
              <p className="text-slate-500 text-xs">No hay recibos registrados aún.</p>
            ) : (
              <div className="space-y-1.5">
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-900/30 px-3 py-2 rounded border border-slate-700/40 text-xs">
                    <span>{new Date(p.fechaPago).toLocaleDateString()}</span>
                    <span className="text-slate-400">{p.metodo}</span>
                    <span className="font-bold text-emerald-400">${p.monto.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Formulario Administrador para renovar cuota */}
          <form onSubmit={handleRegisterPayment} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Registrar pago mensual a un socio
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Seleccionar socio...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.telefono})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
              />

              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-colors"
            >
              Registrar Cobro y Extender Membresía (+30 días)
            </button>
          </form>

          {/* Lista de socios con estado de vencimiento y acción WhatsApp */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/40 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Socio</th>
                  <th className="p-2.5">Teléfono</th>
                  <th className="p-2.5">Vencimiento</th>
                  <th className="p-2.5">Estado</th>
                  <th className="p-2.5 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {members.map((m) => {
                  const dias = m.fechaVencimiento
                    ? Math.ceil((new Date(m.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24))
                    : 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-700/30">
                      <td className="p-2.5 font-medium text-slate-100">{m.nombre}</td>
                      <td className="p-2.5 text-slate-400">{m.telefono}</td>
                      <td className="p-2.5">
                        {m.fechaVencimiento ? new Date(m.fechaVencimiento).toLocaleDateString() : 'Sin fecha'}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          dias > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {dias > 0 ? `${dias} días rest.` : 'Vencido'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const link = generatePaymentReceiptLink({
                              clienteNombre: m.nombre,
                              telefono: m.telefono,
                              monto: parseFloat(monto) || 25000,
                              fechaPago: m.fechaPago || new Date(),
                              fechaVencimiento: m.fechaVencimiento || new Date(),
                              metodo: 'Mensualidad'
                            });
                            window.open(link, '_blank');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-[11px] transition-colors"
                        >
                          <MessageSquareShare className="w-3.5 h-3.5" /> Enviar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}