import prisma from '../config/db.js';

// 1. Resumen contable general (ingresos del mes, total recaudado, socios al día vs morosos)
export const getAccountingSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Pagos registrados
    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { nombre: true, telefono: true } }
      },
      orderBy: { fechaPago: 'desc' }
    });

    // Total histórico y total del mes en curso
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.monto, 0);
    const monthlyRevenue = payments
      .filter((p) => new Date(p.fechaPago) >= startOfMonth)
      .reduce((acc, curr) => acc + curr.monto, 0);

    // Conteo de socios activos vs vencidos
    const members = await prisma.user.findMany({
      where: { rol: 'MEMBER' },
      select: { id: true, estadoMembresia: true, fechaVencimiento: true }
    });

    const activeCount = members.filter(
      (m) => m.fechaVencimiento && new Date(m.fechaVencimiento) >= today
    ).length;
    const expiredCount = members.length - activeCount;

    res.json({
      totalRevenue,
      monthlyRevenue,
      totalMembers: members.length,
      activeCount,
      expiredCount,
      recentPayments: payments.slice(0, 15)
    });
  } catch (error) {
    console.error('Error en resumen contable:', error);
    res.status(500).json({ error: 'Error al obtener resumen contable.' });
  }
};

// 2. Modificar datos de un socio (nombre, teléfono, email, estado, fechas)
export const updateMemberByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, estadoMembresia, fechaVencimiento } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        nombre: nombre || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        estadoMembresia: estadoMembresia || undefined,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined
      },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        email: true,
        estadoMembresia: true,
        fechaVencimiento: true
      }
    });

    res.json({ message: 'Socio actualizado correctamente', user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar socio:', error);
    res.status(500).json({ error: 'Error al actualizar datos del socio.' });
  }
};