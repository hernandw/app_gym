import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        // Ignorar errores continuos de escaneo por cuadro
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3 text-sm">
          <Camera className="w-4 h-4" />
          <span>Escanear Carnet Digital</span>
        </div>

        <div id="qr-reader" className="overflow-hidden rounded-xl bg-slate-900 border border-slate-700" />

        <p className="text-[11px] text-slate-400 text-center mt-3">
          Apunta con la cámara al código QR del atleta para registrar su ingreso.
        </p>
      </div>
    </div>
  );
}