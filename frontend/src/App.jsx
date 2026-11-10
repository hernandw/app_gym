import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import RoutinesView from './components/RoutinesView';
import ProgressTracker from './components/ProgressTracker';
import WorkoutTracker from './components/WorkoutTracker';
import MembershipCard from './components/MembershipCard';
import AttendanceCard from './components/AttendanceCard';
import RestTimer from './components/RestTimer';
import ExerciseCatalog from './components/ExerciseCatalog';
import AdminPanel from './components/AdminPanel';
import { 
  Dumbbell, 
  Activity, 
  CalendarCheck, 
  CreditCard, 
  LogOut, 
  BookOpen, 
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  // Pestaña inicial según el rol
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin' : 'inicio');
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  // Pestañas diferenciadas
  const tabs = isAdmin
    ? [
        { id: 'admin', label: 'Gestión y Contabilidad', icon: LayoutDashboard },
        { id: 'cobros', label: 'Cobros y Recibos', icon: CreditCard },
        { id: 'catalogo', label: 'Biblioteca de Máquinas', icon: BookOpen },
      ]
    : [
        { id: 'inicio', label: 'Mi Membresía', icon: ShieldCheck },
        { id: 'entrenamiento', label: 'Entrenar', icon: Dumbbell },
        { id: 'asistencia', label: 'Mi Acceso (QR)', icon: CalendarCheck },
        { id: 'medidas', label: 'Mis Medidas', icon: Activity },
        { id: 'catalogo', label: 'Máquinas', icon: BookOpen },
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

        {/* Solo el atleta necesita cronómetro para entrenar */}
        {!isAdmin && <RestTimer />}

        {/* Barra de Navegación por pestañas */}
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
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Contenido de vistas */}
        <main>
          {/* Vistas exclusivas de ADMIN */}
          {isAdmin && activeTab === 'admin' && <AdminPanel />}
          {isAdmin && activeTab === 'cobros' && <MembershipCard user={user} />}

          {/* Vistas para MEMBER */}
          {!isAdmin && activeTab === 'inicio' && (
            <div className="space-y-5">
              <MembershipCard user={user} />
              <AttendanceCard user={user} />
            </div>
          )}

          {!isAdmin && activeTab === 'entrenamiento' && (
            <div className="space-y-5">
              <RoutinesView 
                onSelectRoutine={(routine) => setSelectedRoutine(routine)} 
                currentRoutineId={selectedRoutine?.id} 
              />
              <WorkoutTracker selectedRoutine={selectedRoutine} />
            </div>
          )}

          {!isAdmin && activeTab === 'asistencia' && <AttendanceCard user={user} />}
          {!isAdmin && activeTab === 'medidas' && <ProgressTracker />}

          {/* Vista compartida */}
          {activeTab === 'catalogo' && <ExerciseCatalog user={user} />}
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