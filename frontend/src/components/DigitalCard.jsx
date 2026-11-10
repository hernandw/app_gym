import { QRCodeSVG } from 'qrcode.react';
import { UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';

export default function DigitalCard({ user }) {
  const isPaid = user?.fechaVencimiento
    ? new Date(user.fechaVencimiento) >= new Date()
    : false;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 text-slate-100 shadow-xl max-w-sm mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] tracking-wider text-emerald-400 font-bold uppercase">
            Membresía Oficial
          </span>
          <h3 className="text-base font-bold text-slate-100">{user?.nombre}</h3>
          <p className="text-xs text-slate-400 font-mono">{user?.telefono}</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
            isPaid
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}
        >
          {isPaid ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {isPaid ? 'Activo' : 'Vencido'}
        </span>
      </div>

      <div className="bg-white p-3 rounded-xl flex items-center justify-center my-4 shadow-inner">
        <QRCodeSVG
          value={user?.telefono || user?.id || 'GYM-USER'}
          size={140}
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="text-center">
        <p className="text-[11px] text-slate-400">
          Muestra este código en recepción al ingresar al gimnasio
        </p>
        {user?.fechaVencimiento && (
          <p className="text-[10px] text-slate-500 mt-1">
            Vence: {new Date(user.fechaVencimiento).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}