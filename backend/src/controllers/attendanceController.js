import prisma from '../config/db.js';

// Registrar asistencia del usuario autenticado (Check-in propio)
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        fecha: { gte: todayStart, lte: todayEnd },
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Ya has registrado tu asistencia por hoy.' });
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

// Historial personal del socio
export const getMyAttendance = async (req, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { userId: req.user.id },
      orderBy: { fecha: 'desc' },
      take: 30,
    });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar asistencias.' });
  }
};

// --- FUNCIONES DE RECEPCIÓN (ADMIN) ---

// Marcar asistencia desde recepción ingresando el teléfono del socio
export const checkInByAdmin = async (req, res) => {
  try {
    const { telefono } = req.body;
    if (!telefono) {
      return res.status(400).json({ error: 'Ingresa el número de teléfono del socio.' });
    }

    const member = await prisma.user.findFirst({
      where: { telefono },
      select: { id: true, nombre: true, telefono: true, fechaVencimiento: true, estadoMembresia: true }
    });

    if (!member) {
      return res.status(404).json({ error: 'No se encontró ningún socio con ese teléfono.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        userId: member.id,
        fecha: { gte: todayStart, lte: todayEnd },
      },
    });

    if (existing) {
      return res.status(400).json({ 
        error: `El socio ${member.nombre} ya registró su ingreso el día de hoy.`,
        member 
      });
    }

    const attendance = await prisma.attendance.create({
      data: { userId: member.id },
      include: {
        user: { select: { nombre: true, telefono: true, fechaVencimiento: true } }
      }
    });

    res.status(201).json({ message: 'Ingreso registrado correctamente.', attendance, member });
  } catch (error) {
    console.error('Error en check-in recepción:', error);
    res.status(500).json({ error: 'Error al registrar ingreso en recepción.' });
  }
};

// Listar todas las asistencias del día de hoy (Para el monitor de recepción)
export const getTodayAttendances = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const list = await prisma.attendance.findMany({
      where: {
        fecha: { gte: todayStart, lte: todayEnd }
      },
      include: {
        user: { select: { nombre: true, telefono: true, fechaVencimiento: true } }
      },
      orderBy: { fecha: 'desc' }
    });

    res.json(list);
  } catch (error) {
    console.error('Error al obtener asistencias de hoy:', error);
    res.status(500).json({ error: 'Error al consultar asistencias de hoy.' });
  }
};