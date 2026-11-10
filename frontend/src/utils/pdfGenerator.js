import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// 1. Generar Ficha Antropométrica y Evolución del Socio
export const generateMeasurementPDF = (socio = {}, measurements = []) => {
  const doc = new jsPDF();

  // Membrete / Encabezado
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('GYM APP - FICHA DE EVOLUCIÓN FÍSICA', 14, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 28);

  // Información del Socio
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL ATLETA', 14, 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${socio.nombre || 'N/A'}`, 14, 52);
  doc.text(`Teléfono: ${socio.telefono || 'N/A'}`, 14, 58);
  doc.text(`Email: ${socio.email || 'N/A'}`, 14, 64);
  doc.text(`Estado de Membresía: ${socio.estadoMembresia || 'Activo'}`, 120, 52);

  // Tabla con historial de medidas
  const tableRows = measurements.map((m) => [
    new Date(m.fecha).toLocaleDateString(),
    m.peso ? `${m.peso} kg` : '-',
    m.grasa ? `${m.grasa}%` : '-',
    m.pecho ? `${m.pecho} cm` : '-',
    m.brazo ? `${m.brazo} cm` : '-',
    m.cintura ? `${m.cintura} cm` : '-'
  ]);

  autoTable(doc, {
    startY: 72,
    head: [['Fecha', 'Peso', '% Grasa', 'Pecho', 'Brazo', 'Cintura']],
    body: tableRows,
    headStyles: { fillColor: [16, 185, 129], textColor: [15, 23, 42], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    styles: { fontSize: 9, halign: 'center' },
  });

  doc.save(`Ficha_Medidas_${socio.nombre?.replace(/\s+/g, '_') || 'Socio'}.pdf`);
};

// 2. Generar Recibo de Pago Oficial
export const generateReceiptPDF = ({
  clienteNombre = 'Socio',
  telefono = 'N/A',
  monto = 0,
  fechaPago = new Date(),
  fechaVencimiento = new Date(),
  metodo = 'Efectivo'
}) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [148, 210] // Formato A5 horizontal
  });

  // Cabecera
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 25, 'F');

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO OFICIAL DE COBRO', 12, 16);

  // Contenido
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text(`Fecha de pago: ${new Date(fechaPago).toLocaleDateString()}`, 12, 35);
  doc.text(`Próximo vencimiento: ${new Date(fechaVencimiento).toLocaleDateString()}`, 12, 42);

  doc.setDrawColor(203, 213, 225);
  doc.line(12, 48, 136, 48);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 12, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(`${clienteNombre} (${telefono})`, 32, 56);

  doc.setFont('helvetica', 'bold');
  doc.text('Concepto:', 12, 64);
  doc.setFont('helvetica', 'normal');
  doc.text('Membresía Mensual Gimnasio', 32, 64);

  doc.setFont('helvetica', 'bold');
  doc.text('Método:', 12, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(`${metodo}`, 32, 72);

  doc.line(12, 78, 136, 78);

  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`TOTAL PAGADO: $${Number(monto).toLocaleString()}`, 12, 90);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Comprobante emitido automáticamente por la plataforma de administración.', 12, 115);

  doc.save(`Recibo_${clienteNombre?.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

// 3. Generar Reporte de Balance Financiero en PDF
export const generateFinancialReportPDF = ({ summary = {}, members = [] }) => {
  const doc = new jsPDF();

  // Cabecera institucional
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('GYM APP - INFORME GENERAL DE COBRANZAS', 14, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);

  // Resumen Financiero
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DE RECAUDACIÓN', 14, 46);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ingresos este Mes: $${Number(summary?.monthlyRevenue || 0).toLocaleString()}`, 14, 53);
  doc.text(`Ingresos del Año: $${Number(summary?.yearlyRevenue || 0).toLocaleString()}`, 14, 59);
  doc.text(`Total Histórico: $${Number(summary?.totalRevenue || 0).toLocaleString()}`, 14, 65);

  doc.text(`Nuevos Clientes (Mes): ${summary?.newMembersThisMonth || 0}`, 120, 53);
  doc.text(`Socios al Día: ${summary?.activeCount || 0}`, 120, 59);
  doc.text(`Socios Morosos: ${summary?.expiredCount || 0}`, 120, 65);

  // Tabla detallada de socios
  const tableData = members.map((m) => {
    const isPaid = m.fechaVencimiento && new Date(m.fechaVencimiento) >= new Date();
    return [
      m.nombre || 'N/A',
      m.telefono || 'N/A',
      m.fechaVencimiento ? new Date(m.fechaVencimiento).toLocaleDateString() : 'Sin registro',
      isPaid ? 'Al día' : 'Vencido'
    ];
  });

  autoTable(doc, {
    startY: 74,
    head: [['Nombre Socio', 'Teléfono', 'Vencimiento', 'Estado Cuota']],
    body: tableData,
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9 },
  });

  doc.save(`Reporte_Financiero_Gym_${Date.now()}.pdf`);
};

// 4. Exportar Directorio y Estado Contable a Excel / CSV
export const exportMembersToCSV = (members = []) => {
  const headers = ['Nombre', 'Telefono', 'Email', 'Fecha Vencimiento', 'Estado Cuota'];
  const rows = members.map((m) => {
    const isPaid = m.fechaVencimiento && new Date(m.fechaVencimiento) >= new Date();
    return [
      `"${m.nombre || ''}"`,
      `"${m.telefono || ''}"`,
      `"${m.email || ''}"`,
      `"${m.fechaVencimiento ? new Date(m.fechaVencimiento).toLocaleDateString() : 'Sin fecha'}"`,
      `"${isPaid ? 'Al día' : 'Vencido'}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `Directorio_Clientes_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};