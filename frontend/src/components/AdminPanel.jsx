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
  Receipt,
  Search,
  UserPlus,
  X 
} from 'lucide-react';
import { generatePaymentReceiptLink } from '../utils/whatsapp';
import ReceptionCheckin from './ReceptionCheckin';

export default function AdminPanel() {
  const [accounting, setAccounting] = useState(null);
  const [members, setMembers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [editingMember, setEditingMember] = useState(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  // Formulario de nueva rutina
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([
    { exerciseId: '', series: 4, reps: 10, descansoSeg: 60 }
  ]);

  const loadAdminData = async () => {
    try {
      const [accRes, memRes, exRes] = await Promise.all([
        api.get('/payments/accounting'),
        api.get('/payments/members'),
        api.get('/routines/exercises')
      ]);
      setAccounting(accRes.data);
      setMembers(memRes.data || []);
      setExercises(exRes.data || []);
    } catch (err) {
      console.error('Error cargando datos de admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Actualizar datos del socio
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/payments/members/${editingMember.id}`, {
        nombre: editingMember.nombre,
        telefono: editingMember.telefono,
        email: editingMember.email,
        estadoMembresia: editingMember.estadoMembresia,
        fechaVencimiento: editingMember.fechaVencimiento
      });
      setEditingMember(null);
      loadAdminData();
    } catch (err) {
      alert('Error al actualizar datos del socio');
    }
  };

  // Crear rutina plantilla oficial
  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    const validExercises = selectedExercises.filter((ex) => ex.exerciseId);
    if (validExercises.length === 0) {
      alert('Agrega al menos un ejercicio a la rutina');
      return;
    }

    try {
      await api.post('/routines/templates', {
        nombre: routineName,
        ejercicios: validExercises
      });
      alert('Rutina oficial creada exitosamente');
      setShowRoutineModal(false);
      setRoutineName('');
      setSelectedExercises([{ exerciseId: '', series: 4, reps: 10, descansoSeg: 60 }]);
    } catch (err) {
      alert('Error al guardar la rutina');
    }
  };

  // Filtrado de socios por el buscador
  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.nombre?.toLowerCase().includes(term) ||
      m.telefono?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term)
    );
  });

  if (loading) return <p className="text-slate-400 text-xs">Cargando panel de administración...</p>;

  return (
    <div className="space-y-6">
      {/* 1. Métricas Contables y de Clientes */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4" /> Ingresos Mes
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${(accounting?.monthlyRevenue || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4" /> Ingresos Año
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${(accounting?.yearlyRevenue || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold mb-1">
            <UserPlus className="w-4 h-4" /> Nuevos (Mes)
          </div>
          <p className="text-xl font-bold text-slate-100">{accounting?.newMembersThisMonth || 0}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <CheckCircle className="w-4 h-4" /> Al Día
          </div>
          <p className="text-xl font-bold text-slate-100">{accounting?.activeCount || 0}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
            <AlertCircle className="w-4 h-4" /> Morosos
          </div>
          <p className="text-xl font-bold text-slate-100">{accounting?.expiredCount || 0}</p>
        </div>
      </div>

      {/* Control de Recepción */}
      <ReceptionCheckin />

      {/* Acciones de Rutinas Oficiales */}
      <div className="flex justify-between items-center bg-slate-800 border border-slate-700 p-4 rounded-xl">
        <div>
          <h3 className="font-bold text-slate-200 text-sm">Catálogo de Rutinas del Gimnasio</h3>
          <p className="text-xs text-slate-400">Crea las plantillas que verán los atletas en su app.</p>
        </div>
        <button
          onClick={() => setShowRoutineModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Nueva Rutina Oficial
        </button>
      </div>

      {/* Tabla Contable y Directorio de Atletas con Buscador */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Directorio de Clientes y Estado de Cuotas
          </h3>

          {/* Barra de búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
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
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500 text-xs">
                    No se encontraron clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
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
                          {isPaid ? `${dias} días rest.` : 'Debe cuota'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right space-x-1.5">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors"
                          title="Editar datos del socio"
                        >
                          <Edit3 className="w-3.5 h-3.5 inline" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            const link = generatePaymentReceiptLink({
                              clienteNombre: m.nombre,
                              telefono: m.telefono,
                              monto: 25000,
                              fechaPago: m.fechaPago || new Date(),
                              fechaVencimiento: m.fechaVencimiento || new Date(),
                              metodo: 'Mensualidad'
                            });
                            window.open(link, '_blank');
                          }}
                          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded transition-colors"
                          title="Enviar recibo WhatsApp"
                        >
                          <Receipt className="w-3.5 h-3.5 inline" /> Recibo
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Editar Datos del Atleta */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-slate-100 text-sm mb-4 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-emerald-400" /> Modificar Datos del Socio
            </h4>
            <form onSubmit={handleUpdateMember} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Nombre completo</label>
                <input
                  required
                  value={editingMember.nombre}
                  onChange={(e) => setEditingMember({ ...editingMember, nombre: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400">Teléfono (WhatsApp)</label>
                <input
                  required
                  value={editingMember.telefono}
                  onChange={(e) => setEditingMember({ ...editingMember, telefono: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400">Email</label>
                <input
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400">Estado de Membresía</label>
                <select
                  value={editingMember.estadoMembresia || 'ACTIVE'}
                  onChange={(e) => setEditingMember({ ...editingMember, estadoMembresia: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="EXPIRED">Vencido / Inactivo</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={editingMember.fechaVencimiento ? editingMember.fechaVencimiento.split('T')[0] : ''}
                  onChange={(e) => setEditingMember({ ...editingMember, fechaVencimiento: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-colors mt-2"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Crear Rutina Oficial */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowRoutineModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-slate-100 text-sm mb-3 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" /> Crear Rutina Oficial para Atletas
            </h4>

            <form onSubmit={handleCreateRoutine} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400">Nombre de la Rutina</label>
                <input
                  required
                  placeholder="Ej: Rutina Pecho y Tríceps - Nivel 1"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-2">Ejercicios incluidos:</label>
                <div className="space-y-2">
                  {selectedExercises.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-900/60 p-2 rounded border border-slate-700">
                      <select
                        required
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
                          <option key={ex.id} value={ex.id}>
                            {ex.nombre} ({ex.grupoMuscular})
                          </option>
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
                        className="w-16 p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-center"
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
                        className="w-16 p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-center"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedExercises(selectedExercises.filter((_, i) => i !== idx));
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedExercises([
                      ...selectedExercises,
                      { exerciseId: '', series: 4, reps: 10, descansoSeg: 60 }
                    ])
                  }
                  className="mt-2 text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Agregar otro ejercicio
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-colors"
              >
                Publicar Rutina
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}