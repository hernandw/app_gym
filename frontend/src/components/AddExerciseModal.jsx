import { useState } from 'react';
import api from '../services/api';
import { Camera, X, Plus } from 'lucide-react';

export default function AddExerciseModal({ onExerciseAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('Pecho');
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('grupoMuscular', grupoMuscular);
    formData.append('descripcion', descripcion);
    if (file) {
      formData.append('imagen', file);
    }

    try {
      await api.post('/routines/exercises', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsOpen(false);
      setNombre('');
      setDescripcion('');
      setFile(null);
      setPreview(null);
      if (onExerciseAdded) onExerciseAdded();
    } catch (err) {
      alert('Error al subir el ejercicio o máquina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" /> Agregar Máquina / Ejercicio
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100 mb-4">Nueva Máquina o Ejercicio</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Nombre de la máquina o ejercicio</label>
                <input
                  required
                  placeholder="Ej: Prensa inclinada 45°"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400">Grupo Muscular Principal</label>
                <select
                  value={grupoMuscular}
                  onChange={(e) => setGrupoMuscular(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Pecho">Pecho</option>
                  <option value="Espalda">Espalda</option>
                  <option value="Pierna">Pierna / Glúteo</option>
                  <option value="Hombro">Hombro</option>
                  <option value="Brazo">Bíceps / Tríceps</option>
                  <option value="Core">Abdomen / Core</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400">Instrucciones o ajuste de máquina</label>
                <textarea
                  rows="2"
                  placeholder="Ej: Ajustar respaldo en posición media..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Foto de la máquina</label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-900/40">
                  {preview ? (
                    <img src={preview} alt="Vista previa" className="h-32 object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-500">
                      <Camera className="w-8 h-8 mb-1" />
                      <span>Seleccionar o tomar foto</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors text-xs"
              >
                {loading ? 'Subiendo...' : 'Guardar en Catálogo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}