import prisma from '../config/db.js';

// Listar ejercicios
export const getExercises = async (req, res) => {
  try {
    const { grupo } = req.query;
    const exercises = await prisma.exercise.findMany({
      where: grupo ? { grupoMuscular: grupo } : undefined,
      orderBy: { nombre: 'asc' }
    });
    res.json(exercises);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ error: 'Error al obtener ejercicios.' });
  }
};

// Crear un ejercicio
export const createExercise = async (req, res) => {
  try {
    const { nombre, grupoMuscular, descripcion, fotoUrl } = req.body;
    const exercise = await prisma.exercise.create({
      data: { nombre, grupoMuscular, descripcion, fotoUrl }
    });
    res.status(201).json(exercise);
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    res.status(500).json({ error: 'Error al crear ejercicio.' });
  }
};

// Obtener rutinas (personales y plantillas públicas)
export const getMyRoutines = async (req, res) => {
  try {
    const routines = await prisma.routine.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { userId: null }
        ]
      },
      include: {
        ejercicios: {
          include: {
            exercise: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(routines);
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    res.status(500).json({ error: 'Error al obtener rutinas.' });
  }
};

// Crear rutina con ejercicios asignados
export const createRoutine = async (req, res) => {
  try {
    const { nombre, ejercicios, isPublic } = req.body;

    const routine = await prisma.routine.create({
      data: {
        nombre,
        userId: isPublic ? null : req.user.id,
        ejercicios: {
          create: (ejercicios || []).map((item) => ({
            exerciseId: item.exerciseId,
            series: parseInt(item.series, 10),
            reps: parseInt(item.reps, 10),
            descansoSeg: item.descansoSeg ? parseInt(item.descansoSeg, 10) : 60
          }))
        }
      },
      include: {
        ejercicios: {
          include: {
            exercise: true
          }
        }
      }
    });

    res.status(201).json(routine);
  } catch (error) {
    console.error('Error al crear rutina:', error);
    res.status(500).json({ error: 'Error al crear la rutina.' });
  }
};