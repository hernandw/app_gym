import { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, DollarSign, Calendar, MessageSquare, FileDown, Trash2, Edit3, X } from 'lucide-react';
import { generatePaymentReceiptLink, generateExpiredNoticeLink } from '../utils/whatsapp';
import { generateReceiptPDF } from '../utils/pdfGenerator';

export default function MembershipCard({ user }) {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [monto, setMonto] = useState('25000');
  const [meses, setMeses] = useState('1');
  const [loading, setLoading] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);

  const isAdmin = user?.rol === 'ADMIN';

  const loadData = async () => {
    try {
      if (isAdmin) {
        const [memRes, accRes] = await Promise.all([
          api.get('/payments/members'),
          api.get('/payments/accounting')
        ]);
        setMembers(memRes.data || []);
        setRecentPayments(accRes.data?.recentPayments || []);
        if (memRes.data?.length > 0 && !selectedMember) {
          setSelectedMember(memRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error cargando cobranza:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments/register', {
        userId: selectedMember,
        monto: parseFloat(monto),
        meses: parseInt(meses, 10),
        metodo: 'Efectivo / Transferencia'
      });
      alert('Pago registrado correctamente');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este registro de pago?')) return;
    try {
      await api.delete(`/payments/payments/${paymentId}`);
      loadData();
    } catch (err) {
      alert('Error al eliminar el pago');
    }
  };

  const handleSavePaymentEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/payments/payments/${editingPayment.id}`, {
        monto: parseFloat(editingPayment.monto),
        fechaPago: editingPayment.fechaPago,
        fechaVencimiento: editingPayment.fechaVencimiento
      });
      setEditingPayment(null);
      loadData();
    } catch (err) {
      alert('Error al actualizar el pago');
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Cobro Rápido */}
      {isAdmin && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Registrar Nuevo Pago / Renovar Membresía
          </h3>
          <form onSubmit={handleRegisterPayment} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.telefono})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Monto ($)"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              required
            />

            <select
              value={meses}
              onChange={(e) => setMeses(e.target.value)}
              className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
            >
              <option value="1">1 Mes (+30 días)</option>
              <option value="3">3 Meses (+90 días)</option>
              <option value="6">6 Meses (+180 días)</option>
              <option value="12">1 Año (+365 días)</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Registrar Cobro'}
            </button>
          </form>
        </div>
      )}

      {/* Historial de Pagos y Emisión de Recibos */}
      {isAdmin && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Historial de Cobros Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Socio</th>
                  <th className="p-2.5">Monto</th>
                  <th className="p-2.5">Fecha Pago</th>
                  <th className="p-2.5">Vigencia Hasta</th>
                  <th className="p-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/30">
                    <td className="p-2.5 font-semibold text-slate-100">{p.user?.nombre || 'Socio'}</td>
                    <td className="p-2.5 text-emerald-400 font-bold">${Number(p.monto).toLocaleString()}</td>
                    <td className="p-2.5 text-slate-400">{new Date(p.fechaPago).toLocaleDateString()}</td>
                    <td className="p-2.5 text-slate-300">{new Date(p.fechaVencimiento).toLocaleDateString()}</td>
                    <td className="p-2.5 text-right space-x-1">
                      <button
                        onClick={() =>
                          generateReceiptPDF({
                            clienteNombre: p.user?.nombre || 'Socio',
                            telefono: p.user?.telefono || 'N/A',
                            monto: p.monto,
                            fechaPago: p.fechaPago,
                            fechaVencimiento: p.fechaVencimiento,
                            metodo: p.metodo || 'Efectivo'
                          })
                        }
                        title="Descargar PDF"
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
                      >
                        <FileDown className="w-3.5 h-3.5 inline" />
                      </button>

                      <button
                        onClick={() => {
                          const link = generatePaymentReceiptLink({
                            clienteNombre: p.user?.nombre || 'Socio',
                            telefono: p.user?.telefono,
                            monto: p.monto,
                            fechaPago: p.fechaPago,
                            fechaVencimiento: p.fechaVencimiento,
                            metodo: p.metodo || 'Efectivo'
                          });
                          window.open(link, '_blank');
                        }}
                        title="Enviar Recibo por WhatsApp"
                        className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded"
                      >
                        <MessageSquare className="w-3.5 h-3.5 inline" />
                      </button>

                      <button
                        onClick={() => setEditingPayment(p)}
                        title="Editar Pago"
                        className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>

                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        title="Eliminar Pago"
                        className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Editar Pago */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl w-full max-w-sm relative">
            <button
              onClick={() => setEditingPayment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-slate-100 text-sm mb-3">Modificar Pago</h4>
            <form onSubmit={handleSavePaymentEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Monto ($)</label>
                <input
                  type="number"
                  value={editingPayment.monto}
                  onChange={(e) => setEditingPayment({ ...editingPayment, monto: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400">Fecha de Pago</label>
                <input
                  type="date"
                  value={editingPayment.fechaPago ? editingPayment.fechaPago.split('T')[0] : ''}
                  onChange={(e) => setEditingPayment({ ...editingPayment, fechaPago: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400">Vigencia Hasta</label>
                <input
                  type="date"
                  value={editingPayment.fechaVencimiento ? editingPayment.fechaVencimiento.split('T')[0] : ''}
                  onChange={(e) => setEditingPayment({ ...editingPayment, fechaVencimiento: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded"
              >
                Actualizar Pago
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}