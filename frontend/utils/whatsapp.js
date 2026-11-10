// Limpiar teléfono quitando espacios, signos + y guiones
export const sanitizePhone = (phone) => {
  return phone ? phone.replace(/[^0-9]/g, '') : '';
};

// Generar enlace con comprobante de pago mensual
export const generatePaymentReceiptLink = ({ clienteNombre, telefono, monto, fechaPago, fechaVencimiento, metodo }) => {
  const cleanPhone = sanitizePhone(telefono);
  const fechaStr = new Date(fechaPago).toLocaleDateString();
  const vencimientoStr = new Date(fechaVencimiento).toLocaleDateString();

  const mensaje = 
`🏋️ *COMPROBANTE DE PAGO - GYM APP*
Hola *${clienteNombre}*, confirmamos la recepción de tu cuota mensual.

📅 *Fecha de pago:* ${fechaStr}
💰 *Monto recibido:* $${monto.toLocaleString()} (${metodo})
⏳ *Próximo vencimiento:* ${vencimientoStr}

Tu membresía se encuentra *ACTIVA*. ¡Te esperamos en tu próximo entrenamiento! 💪`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
};

// Generar enlace con el informe de medidas corporales
export const generateMeasurementsReportLink = ({ clienteNombre, telefono, medidas }) => {
  const cleanPhone = sanitizePhone(telefono);
  const fechaStr = new Date(medidas.fecha || Date.now()).toLocaleDateString();

  const mensaje = 
`📊 *REPORTE DE EVALUACIÓN FÍSICA*
Hola *${clienteNombre}*, aquí tienes el resumen de tu última toma de medidas realizada el ${fechaStr}:

⚖️ *Peso corporal:* ${medidas.peso ? `${medidas.peso} kg` : 'N/A'}
📉 *Grasa estimada:* ${medidas.grasa ? `${medidas.grasa}%` : 'N/A'}
📐 *Pecho:* ${medidas.pecho ? `${medidas.pecho} cm` : 'N/A'}
💪 *Brazo:* ${medidas.brazo ? `${medidas.brazo} cm` : 'N/A'}
📏 *Cintura:* ${medidas.cintura ? `${medidas.cintura} cm` : 'N/A'}

Sigue registrando tus avances en la app. ¡Gran trabajo! 🔥`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
};