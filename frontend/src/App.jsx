import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ProgressTracker from './components/ProgressTracker';
import RoutinesView from './components/RoutinesView';
import WorkoutTracker from './components/WorkoutTracker';
import MembershipCard from './components/MembershipCard';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-xl font-bold">¡Hola, {user?.nombre}!</h2>
          <p className="text-xs text-slate-400">Rol: {user?.rol} | Estado: {user?.estadoMembresia}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-500/20 text-rose-300 rounded-lg text-sm hover:bg-rose-500/30 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
      {/* Membresía y Cobros */}
      <MembershipCard user={user} />
      {/* Métricas y Registro Diario de Cargas */}
      <WorkoutTracker />
      {/* Rutinas */}
      <RoutinesView />
      {/* Módulo de Medidas y Progreso */}
      <ProgressTracker />
    </div>
  );
}

function MainLayout() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}