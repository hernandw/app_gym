import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, User, Phone, Mail, Lock, Activity } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    password: '',
    peso: '',
    grasa: '',
    pecho: '',
    brazo: '',
    cintura: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.telefono || formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error en la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400 mb-2">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Gym App</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? 'Accede a tu cuenta' : 'Registra tu perfil y medidas'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs text-slate-400">Nombre Completo</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                <input
                  required
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Carlos Pérez"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400">
              {isLogin ? 'Teléfono o Email' : 'Teléfono (WhatsApp)'}
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <input
                required
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56912345678"
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs text-slate-400">Email (Opcional)</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="carlos@gym.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="pt-2 border-t border-slate-700/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                <Activity className="w-4 h-4" /> Medidas Iniciales (Opcional)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="number"
                  step="0.1"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  placeholder="Peso (kg)"
                  className="p-2 bg-slate-900 border border-slate-700 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  name="grasa"
                  value={formData.grasa}
                  onChange={handleChange}
                  placeholder="% Grasa"
                  className="p-2 bg-slate-900 border border-slate-700 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  name="pecho"
                  value={formData.pecho}
                  onChange={handleChange}
                  placeholder="Pecho (cm)"
                  className="p-2 bg-slate-900 border border-slate-700 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.1"
                  name="brazo"
                  value={formData.brazo}
                  onChange={handleChange}
                  placeholder="Brazo (cm)"
                  className="p-2 bg-slate-900 border border-slate-700 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors text-sm mt-2"
          >
            {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? '¿No tienes cuenta registrada?' : '¿Ya tienes una cuenta?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-emerald-400 hover:underline font-semibold"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}