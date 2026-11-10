import prisma from '../config/db.js';

// Registrar asistencia del usuario autenticado (Check-in hoy)
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;

    // Rango del día actual (00:00:00 a 23:59:59)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Verificar si ya registró asistencia hoy
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        fecha: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Ya has registrado tu asistencia por el día de hoy.' });
    }

    const attendance = await prisma.attendance.create({
      data: { userId },
    });

    res.status(201).json({ message: '¡Asistencia registrada con éxito!', attendance });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ error: 'Error al registrar la asistencia.' });
  }
};

// Obtener historial de asistencias del socio
export const getMyAttendance = async (req, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { userId: req.user.id },
      orderBy: { fecha: 'desc' },
      take: 30, // Últimos 30 días
    });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar asistencias.' });
  }
};