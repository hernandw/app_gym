import prisma from '../config/db.js';

export const getAccountingSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const payments = await prisma.payment.findMany({
      include: { user: { select: { nombre: true, telefono: true } } },
      orderBy: { fechaPago: 'desc' }
    });

    const expenses = await prisma.expense.findMany({
      orderBy: { fecha: 'desc' }
    });

    // Ingresos asegurando conversión a número
    const totalRevenue = payments.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
    const yearlyRevenue = payments
      .filter((p) => new Date(p.fechaPago) >= startOfYear)
      .reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
    const monthlyRevenue = payments
      .filter((p) => new Date(p.fechaPago) >= startOfMonth)
      .reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);

    // Gastos
    const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
    const monthlyExpenses = expenses
      .filter((e) => new Date(e.fecha) >= startOfMonth)
      .reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);

    const members = await prisma.user.findMany({
      where: { rol: 'MEMBER' },
      select: { id: true, estadoMembresia: true, fechaVencimiento: true, createdAt: true }
    });

    const activeCount = members.filter(
      (m) => m.fechaVencimiento && new Date(m.fechaVencimiento) >= now
    ).length;
    const expiredCount = members.length - activeCount;
    const newMembersThisMonth = members.filter((m) => new Date(m.createdAt) >= startOfMonth).length;

    res.json({
      totalRevenue,
      yearlyRevenue,
      monthlyRevenue,
      totalExpenses,
      monthlyExpenses,
      netMonthly: monthlyRevenue - monthlyExpenses,
      totalMembers: members.length,
      newMembersThisMonth,
      activeCount,
      expiredCount,
      recentPayments: payments
    });
  } catch (error) {
    console.error('Error resumen contable:', error);
    res.status(500).json({ error: 'Error al obtener resumen contable.' });
  }
};

// Modificar datos del socio
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
      }
    });

    res.json({ message: 'Socio actualizado correctamente', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar datos del socio.' });
  }
};

// Eliminar socio completamente (y sus datos relacionados)
export const deleteMemberByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar en cascada
    await prisma.attendance.deleteMany({ where: { userId: id } });
    await prisma.workoutLog.deleteMany({ where: { userId: id } });
    await prisma.measurement.deleteMany({ where: { userId: id } });
    await prisma.payment.deleteMany({ where: { userId: id } });
    await prisma.routine.deleteMany({ where: { userId: id } });

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Socio eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar socio:', error);
    res.status(500).json({ error: 'Error al eliminar el socio.' });
  }
};

// Editar pago
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, fechaPago, fechaVencimiento, metodo } = req.body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        monto: monto ? parseFloat(monto) : undefined,
        fechaPago: fechaPago ? new Date(fechaPago) : undefined,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : undefined,
        metodo: metodo || undefined
      }
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el pago' });
  }
};

// Eliminar pago
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.payment.delete({ where: { id } });
    res.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el pago' });
  }
};