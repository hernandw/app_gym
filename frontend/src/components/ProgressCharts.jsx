import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp, Scale, Flame } from 'lucide-react';

export default function ProgressCharts({ measurements = [], workoutLogs = [] }) {
  const [metric, setMetric] = useState('peso'); // 'peso' | 'grasa' | 'medidas'

  // Formatear datos de medidas cronológicamente
  const measurementData = [...measurements]
    .reverse()
    .map((m) => ({
      fecha: new Date(m.fecha).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      peso: m.peso,
      grasa: m.grasa,
      pecho: m.pecho,
      brazo: m.brazo,
      cintura: m.cintura,
    }));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <TrendingUp className="w-5 h-5" />
          <span>Curva de Evolución Física</span>
        </div>

        {/* Selector de variable */}
        <div className="flex gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setMetric('peso')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              metric === 'peso' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Peso (kg)
          </button>
          <button
            onClick={() => setMetric('grasa')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              metric === 'grasa' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            % Grasa
          </button>
          <button
            onClick={() => setMetric('medidas')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              metric === 'medidas' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Perímetros (cm)
          </button>
        </div>
      </div>

      {measurementData.length < 2 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
          Registra al menos 2 tomas de medidas para trazar tu gráfica de evolución.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={measurementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {metric === 'peso' && (
                <Line
                  type="monotone"
                  dataKey="peso"
                  name="Peso corporal (kg)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {metric === 'grasa' && (
                <Line
                  type="monotone"
                  dataKey="grasa"
                  name="% Grasa Corporal"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 6 }}
                />
              )}

              {metric === 'medidas' && (
                <>
                  <Line type="monotone" dataKey="pecho" name="Pecho (cm)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="brazo" name="Brazo (cm)" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="cintura" name="Cintura (cm)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}