import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  DollarSign, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Edit3, 
  PlusCircle, 
  Dumbbell, 
  Search, 
  UserPlus, 
  FileDown, 
  Trash2, 
  Mail, 
  MessageSquareWarning, 
  TrendingDown, 
  X 
} from 'lucide-react';
import { generateExpiredNoticeLink } from '../utils/whatsapp';
import { generateFinancialReportPDF, exportMembersToCSV } from '../utils/pdfGenerator';
import ReceptionCheckin from './ReceptionCheckin';

export default function AdminPanel() {
  const [accounting, setAccounting] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales y formularios
  const [editingMember, setEditingMember] = useState(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Formulario Gastos
  const [expenseForm, setExpenseForm] = useState({ descripcion: '', monto: '', categoria: 'Servicios' });

  // Formulario Rutinas
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([
    { exerciseId: '', series: 4, reps: 10, descansoSeg: 60 }
  ]);

  const loadAdminData = async () => {
    try {
      const [accRes, memRes, exRes, expRes, routRes] = await Promise.all([
        api.get('/payments/accounting'),
        api.get('/payments/members'),
        api.get('/routines/exercises'),
        api.get('/payments/expenses'),
        api.get('/routines')
      ]);
      setAccounting(accRes.data);
      setMembers(memRes.data || []);
      setExercises(exRes.data || []);
      setExpenses(expRes.data || []);
      setRoutines(routRes.data || []);
    } catch (err) {
      console.error('Error cargando admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Eliminar socio
  const handleDeleteMember = async (member) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${member.nombre}? Esto borrará sus registros de medidas, asistencias y pagos.`)) return;
    try {
      await api.delete(`/payments/members/${member.id}`);
      loadAdminData();
    } catch (err) {
      alert('Error al eliminar socio');
    }
  };

  // Guardar Gasto
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments/expenses', expenseForm);
      setShowExpenseModal(false);
      setExpenseForm({ descripcion: '', monto: '', categoria: 'Servicios' });
      loadAdminData();
    } catch (err) {
      alert('Error al registrar gasto');
    }
  };

  // Eliminar Gasto
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    try {
      await api.delete(`/payments/expenses/${id}`);
      loadAdminData();
    } catch (err) {
      alert('Error al eliminar gasto');
    }
  };

  // Eliminar Rutina Plantilla
  const handleDeleteRoutine = async (id) => {
    if (!window.confirm('¿Eliminar esta rutina del catálogo?')) return;
    try {
      await api.delete(`/routines/templates/${id}`);
      loadAdminData();
    } catch (err) {
      alert('Error al eliminar rutina');
    }
  };

  // Actualizar socio
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/payments/members/${editingMember.id}`, editingMember);
      setEditingMember(null);
      loadAdminData();
    } catch (err) {
      alert('Error al actualizar datos del socio');
    }
  };

  // Crear rutina oficial
  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    const validExercises = selectedExercises.filter((ex) => ex.exerciseId);
    if (validExercises.length === 0) return alert('Agrega al menos un ejercicio');

    try {
      await api.post('/routines/templates', { nombre: routineName, ejercicios: validExercises });
      setShowRoutineModal(false);
      setRoutineName('');
      setSelectedExercises([{ exerciseId: '', series: 4, reps: 10, descansoSeg: 60 }]);
      loadAdminData();
    } catch (err) {
      alert('Error al crear rutina');
    }
  };

  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.nombre?.toLowerCase().includes(term) ||
      m.telefono?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term)
    );
  });

  if (loading) return <p className="text-slate-400 text-xs">Cargando administración...</p>;

  return (
    <div className="space-y-6">
      {/* 1. Tarjetas Financieras: Ingresos, Gastos y Balance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4" /> Ingresos Mes
          </div>
          <p className="text-xl font-bold text-slate-100">${(accounting?.monthlyRevenue || 0).toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Año: ${(accounting?.yearlyRevenue || 0).toLocaleString()}</span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
            <TrendingDown className="w-4 h-4" /> Gastos Mes
          </div>
          <p className="text-xl font-bold text-slate-100">${(accounting?.monthlyExpenses || 0).toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Total: ${(accounting?.totalExpenses || 0).toLocaleString()}</span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold mb-1">
            <CheckCircle className="w-4 h-4" /> Balance Neto Mes
          </div>
          <p className={`text-xl font-bold ${accounting?.netMonthly >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${(accounting?.netMonthly || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Ingresos menos gastos</span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <AlertCircle className="w-4 h-4" /> Cuotas Vencidas
          </div>
          <p className="text-xl font-bold text-slate-100">{accounting?.expiredCount || 0}</p>
          <span className="text-[10px] text-emerald-400">{accounting?.activeCount || 0} al día</span>
        </div>
      </div>

      {/* Control de Recepción con QR */}
      <ReceptionCheckin />

      {/* 2. Sección de Gastos del Gimnasio */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" /> Registro de Gastos y Mantenimiento
            </h3>
            <p className="text-xs text-slate-400">Máquinas, luz, agua, limpieza, arriendo, internet.</p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-xs font-bold transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Anotar Gasto
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="text-slate-500 text-xs">No hay gastos registrados este mes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Concepto</th>
                  <th className="p-2.5">Categoría</th>
                  <th className="p-2.5">Fecha</th>
                  <th className="p-2.5">Monto</th>
                  <th className="p-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-700/30">
                    <td className="p-2.5 font-medium text-slate-100">{exp.descripcion}</td>
                    <td className="p-2.5">
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">
                        {exp.categoria}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-400">{new Date(exp.fecha).toLocaleDateString()}</td>
                    <td className="p-2.5 font-bold text-rose-400">-${Number(exp.monto).toLocaleString()}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Directorio de Clientes (Editar, Eliminar y Avisar Vencimiento) */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Directorio de Clientes
          </h3>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => generateFinancialReportPDF({ summary: accounting, members })}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold"
            >
              <FileDown className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={() => exportMembersToCSV(members)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold"
            >
              <FileDown className="w-3.5 h-3.5" /> CSV
            </button>
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar socio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/40 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Atleta</th>
                <th className="p-2.5">Teléfono</th>
                <th className="p-2.5">Vencimiento</th>
                <th className="p-2.5">Estado</th>
                <th className="p-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredMembers.map((m) => {
                const dias = m.fechaVencimiento
                  ? Math.ceil((new Date(m.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24))
                  : 0;
                const isPaid = dias > 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-700/30">
                    <td className="p-2.5 font-medium text-slate-100">
                      {m.nombre}
                      {m.email && <span className="block text-[10px] text-slate-500">{m.email}</span>}
                    </td>
                    <td className="p-2.5 text-slate-400 font-mono">{m.telefono}</td>
                    <td className="p-2.5">
                      {m.fechaVencimiento ? new Date(m.fechaVencimiento).toLocaleDateString() : 'Sin registro'}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isPaid ? `${dias} días rest.` : 'Vencido'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right space-x-1.5">
                      {/* Avisar vencimiento por WhatsApp */}
                      {!isPaid && (
                        <button
                          onClick={() => {
                            const link = generateExpiredNoticeLink({
                              clienteNombre: m.nombre,
                              telefono: m.telefono,
                              diasVencidos: Math.abs(dias)
                            });
                            window.open(link, '_blank');
                          }}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded"
                          title="Avisar cuota vencida por WhatsApp"
                        >
                          <MessageSquareWarning className="w-3.5 h-3.5 inline" />
                        </button>
                      )}

                      {/* Avisar por Email */}
                      {!isPaid && m.email && (
                        <a
                          href={`mailto:${m.email}?subject=Aviso%20de%20Vencimiento%20Gym&body=Hola%20${encodeURIComponent(m.nombre)},%20te%20escribimos%20para%20recordarte%20que%20tu%20membres%C3%ADa%20ha%20vencido.`}
                          className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded inline-block"
                          title="Enviar correo"
                        >
                          <Mail className="w-3.5 h-3.5 inline" />
                        </a>
                      )}

                      {/* Editar datos y vencimiento */}
                      <button
                        onClick={() => setEditingMember(m)}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
                        title="Editar socio"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>

                      {/* Eliminar socio */}
                      <button
                        onClick={() => handleDeleteMember(m)}
                        className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded"
                        title="Eliminar socio"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Rutinas Oficiales (Crear y Eliminar) */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" /> Catálogo de Rutinas Oficiales
          </h3>
          <button
            onClick={() => setShowRoutineModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Nueva Rutina
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {routines.map((r) => (
            <div key={r.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-200 text-xs">{r.nombre}</p>
                <span className="text-[10px] text-slate-400">{r.ejercicios?.length || 0} ejercicios</span>
              </div>
              <button
                onClick={() => handleDeleteRoutine(r.id)}
                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded"
                title="Eliminar rutina del catálogo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Registrar Gasto */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl w-full max-w-sm relative">
            <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-slate-100 text-sm mb-3">Anotar Gasto del Gimnasio</h4>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Descripción</label>
                <input
                  required
                  placeholder="Ej: Factura de Luz, Compra de Mancuernas"
                  value={expenseForm.descripcion}
                  onChange={(e) => setExpenseForm({ ...expenseForm, descripcion: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400">Categoría</label>
                <select
                  value={expenseForm.categoria}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoria: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-200"
                >
                  <option value="Servicios">Servicios (Luz, Agua, Gas, Internet)</option>
                  <option value="Equipamiento">Equipamiento y Nuevas Máquinas</option>
                  <option value="Limpieza">Artículos de Limpieza y Aseo</option>
                  <option value="Mantenimiento">Mantenimiento y Reparaciones</option>
                  <option value="Arriendo">Arriendo de Local</option>
                  <option value="Otro">Otro Gasto</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Monto ($)</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 35000"
                  value={expenseForm.monto}
                  onChange={(e) => setExpenseForm({ ...expenseForm, monto: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded">
                Guardar Gasto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Datos del Atleta */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
            <button onClick={() => setEditingMember(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-slate-100 text-sm mb-4 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-emerald-400" /> Modificar Datos y Vencimiento
            </h4>
            <form onSubmit={handleUpdateMember} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Nombre completo</label>
                <input
                  required
                  value={editingMember.nombre}
                  onChange={(e) => setEditingMember({ ...editingMember, nombre: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400">Teléfono (WhatsApp)</label>
                <input
                  required
                  value={editingMember.telefono}
                  onChange={(e) => setEditingMember({ ...editingMember, telefono: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400">Email</label>
                <input
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>
              <div>
                <label className="text-slate-400">Fecha de Vencimiento de Membresía</label>
                <input
                  type="date"
                  value={editingMember.fechaVencimiento ? editingMember.fechaVencimiento.split('T')[0] : ''}
                  onChange={(e) => setEditingMember({ ...editingMember, fechaVencimiento: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Rutina Oficial */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowRoutineModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-slate-100 text-sm mb-3">Crear Rutina Oficial</h4>
            <form onSubmit={handleCreateRoutine} className="space-y-3 text-xs">
              <input
                required
                placeholder="Nombre de la Rutina (ej: Espalda y Bíceps)"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
              />
              {selectedExercises.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-900/60 p-2 rounded border border-slate-700">
                  <select
                    value={item.exerciseId}
                    onChange={(e) => {
                      const updated = [...selectedExercises];
                      updated[idx].exerciseId = e.target.value;
                      setSelectedExercises(updated);
                    }}
                    className="flex-1 p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200"
                  >
                    <option value="">Selecciona ejercicio...</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.nombre} ({ex.grupoMuscular})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Series"
                    value={item.series}
                    onChange={(e) => {
                      const updated = [...selectedExercises];
                      updated[idx].series = e.target.value;
                      setSelectedExercises(updated);
                    }}
                    className="w-16 p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={item.reps}
                    onChange={(e) => {
                      const updated = [...selectedExercises];
                      updated[idx].reps = e.target.value;
                      setSelectedExercises(updated);
                    }}
                    className="w-16 p-1.5 bg-slate-900 border border-slate-700 rounded text-center text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedExercises(selectedExercises.filter((_, i) => i !== idx))}
                    className="text-rose-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSelectedExercises([...selectedExercises, { exerciseId: '', series: 4, reps: 10, descansoSeg: 60 }])}
                className="text-emerald-400 text-xs font-semibold"
              >
                + Agregar otro ejercicio
              </button>
              <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded">
                Publicar Rutina
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}