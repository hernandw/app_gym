import prisma from '../config/db.js';

// Registrar un pago mensual y renovar vencimiento (+30 días)
export const registerPayment = async (req, res) => {
  try {
    const { userId, monto, metodo, comprobanteUrl } = req.body;

    if (!userId || !monto || !metodo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (userId, monto, metodo).' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el registro de pago
      const payment = await tx.payment.create({
        data: {
          userId,
          monto: parseFloat(monto),
          metodo,
          comprobanteUrl: comprobanteUrl || null,
        }
      });

      // 2. Calcular nueva fecha de vencimiento (+30 días desde hoy o desde su vencimiento previo)
      const user = await tx.user.findUnique({ where: { id: userId } });
      const baseDate = (user.fechaVencimiento && new Date(user.fechaVencimiento) > new Date())
        ? new Date(user.fechaVencimiento)
        : new Date();

      const nuevaFechaVencimiento = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // 3. Actualizar estado y fechas del usuario
      await tx.user.update({
        where: { id: userId },
        data: {
          estadoMembresia: 'ACTIVE',
          fechaPago: new Date(),
          fechaVencimiento: nuevaFechaVencimiento
        }
      });

      return payment;
    });

    res.status(201).json({ message: 'Pago registrado y membresía actualizada', payment: result });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar el pago.' });
  }
};

// Obtener historial de pagos del usuario actual
export const getMyPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { fechaPago: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial de pagos.' });
  }
};

// Listar todos los socios y su estado de membresía (Solo ADMIN/COACH)
export const getMembersList = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { rol: 'MEMBER' },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        email: true,
        estadoMembresia: true,
        fechaVencimiento: true,
        fechaPago: true
      },
      orderBy: { nombre: 'asc' }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar socios.' });
  }
};