import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import RoutinesView from './components/RoutinesView';
import ProgressTracker from './components/ProgressTracker';
import WorkoutTracker from './components/WorkoutTracker';
import MembershipCard from './components/MembershipCard';
import AttendanceCard from './components/AttendanceCard';
import RestTimer from './components/RestTimer';
import { Dumbbell, Activity, CalendarCheck, CreditCard, LogOut } from 'lucide-react';
import AdminPanel from './components/AdminPanel';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('entrenamiento');
  const isAdmin = user?.rol === 'ADMIN';

 const tabs = [
  { id: 'entrenamiento', label: 'Entrenar', icon: Dumbbell },
  { id: 'asistencia', label: 'Asistencia', icon: CalendarCheck },
  { id: 'medidas', label: 'Medidas', icon: Activity },
  { id: 'membresia', label: isAdmin ? 'Cobros Rápidos' : 'Membresía', icon: CreditCard },
  ...(isAdmin ? [{ id: 'admin', label: 'Administración', icon: Users }] : []),
];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Encabezado */}
        <header className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div>
            <h1 className="text-lg font-bold text-slate-100">¡Hola, {user?.nombre}!</h1>
            <p className="text-xs text-slate-400">
              Rol: <span className="text-emerald-400 font-semibold">{user?.rol}</span> • {user?.telefono}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </header>

        {/* Temporizador flotante de descanso */}
        <RestTimer />

        {/* Barra de Pestañas */}
        <nav className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Contenido según pestaña activa */}
        <main>
          {activeTab === 'admin' && isAdmin && <AdminPanel />}

          {activeTab === 'asistencia' && <AttendanceCard />}

          {activeTab === 'medidas' && <ProgressTracker />}

          {activeTab === 'membresia' && <MembershipCard user={user} />}
        </main>
      </div>
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