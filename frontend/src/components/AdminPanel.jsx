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
  X 
} from 'lucide-react';
import { generatePaymentReceiptLink } from '../utils/whatsapp';

export default function AdminPanel() {
  const [accounting, setAccounting] = useState(null);
  const [members, setMembers] = useState([]);
  const [exercises, setExercises] = useState([]);
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
      setMembers(memRes.data);
      setExercises(exRes.data);
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
      alert('Rutina plantilla creada exitosamente');
      setShowRoutineModal(false);
      setRoutineName('');
      setSelectedExercises([{ exerciseId: '', series: 4, reps: 10, descansoSeg: 60 }]);
    } catch (err) {
      alert('Error al guardar la rutina');
    }
  };

  if (loading) return <p className="text-slate-400 text-xs">Cargando panel de administración...</p>;

  return (
    <div className="space-y-6">
      {/* 1. KPIs Contables */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4" /> Recaudación Mes
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${(accounting?.monthlyRevenue || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4" /> Total Recaudado
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${(accounting?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <CheckCircle className="w-4 h-4" /> Socios al Día
          </div>
          <p className="text-xl font-bold text-slate-100">{accounting?.activeCount || 0}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
            <AlertCircle className="w-4 h-4" /> Socios Morosos
          </div>
          <p className="text-xl font-bold text-slate-100">{accounting?.expiredCount || 0}</p>
        </div>
      </div>

      {/* 2. Barra de acciones rápidas para el Administrador */}
      <div className="flex justify-between items-center bg-slate-800 border border-slate-700 p-4 rounded-xl">
        <h3 className="font-bold text-slate-200 text-sm">Plantillas de Entrenamiento</h3>
        <button
          onClick={() => setShowRoutineModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Nueva Rutina Oficial
        </button>
      </div>

      {/* 3. Tabla Contable y de Gestión de Socios */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" /> Control de Atletas y Cobranza
        </h3>

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
              {members.map((m) => {
                const dias = m.fechaVencimiento
                  ? Math.ceil((new Date(m.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24))
                  : 0;
                const isPaid = dias > 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-700/30">
                    <td className="p-2.5 font-medium text-slate-100">{m.nombre}</td>
                    <td className="p-2.5 text-slate-400">{m.telefono}</td>
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
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                        title="Editar datos"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
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
                        className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded"
                        title="Enviar recibo WhatsApp"
                      >
                        <Receipt className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Editar Datos del Atleta */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm relative">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-slate-100 text-sm mb-4">Modificar Datos de Atleta</h4>
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
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
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

      {/* MODAL: Crear Rutina Oficial (Ej: Día de Pecho, Espalda...) */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
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
                <label className="text-slate-400">Nombre de la Rutina / Grupo Muscular</label>
                <input
                  required
                  placeholder="Ej: Rutina Pecho y Hombro - Nivel 1"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-2">Ejercicios incluidos en la rutina:</label>
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
                  <PlusCircle className="w-3.5 h-3.5" /> Agregar otro ejercicio a la rutina
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-colors"
              >
                Publicar Rutina para Atletas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}