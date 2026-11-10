import prisma from '../config/db.js';

// Registrar un levantamiento (serie/ejercicio realizado)
export const logWorkout = async (req, res) => {
  try {
    const { exerciseId, pesoUsado, reps } = req.body;

    const log = await prisma.workoutLog.create({
      data: {
        userId: req.user.id,
        exerciseId,
        pesoUsado: parseFloat(pesoUsado),
        reps: parseInt(reps, 10)
      },
      include: {
        exercise: true
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error al registrar entrenamiento:', error);
    res.status(500).json({ error: 'Error al registrar el entrenamiento.' });
  }
};

// Obtener resumen de progreso (peso total acumulado, total repeticiones, historial reciente)
export const getWorkoutStats = async (req, res) => {
  try {
    const logs = await prisma.workoutLog.findMany({
      where: { userId: req.user.id },
      include: { exercise: true },
      orderBy: { fecha: 'desc' }
    });

    // Calcular tonelaje / peso total acumulado (peso x reps)
    const totalVolume = logs.reduce((acc, curr) => acc + (curr.pesoUsado * curr.reps), 0);

    // Calcular días únicos asistidos en los logs
    const uniqueDays = new Set(
      logs.map((item) => new Date(item.fecha).toISOString().split('T')[0])
    ).size;

    res.json({
      totalVolume,
      totalLogs: logs.length,
      daysAttended: uniqueDays,
      recentLogs: logs.slice(0, 10)
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de entrenamiento.' });
  }
};