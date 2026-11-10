import prisma from '../config/db.js';

// --- EJERCICIOS ---

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
    res.status(500).json({ error: 'Error al obtener ejercicios.' });
  }
};

// Crear un ejercicio (para el catálogo)
export const createExercise = async (req, res) => {
  try {
    const { nombre, grupoMuscular, descripcion, fotoUrl } = req.body;
    const exercise = await prisma.exercise.create({
      data: { nombre, grupoMuscular, descripcion, fotoUrl }
    });
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ejercicio.' });
  }
};

// --- RUTINAS ---

// Obtener rutinas del usuario autenticado + plantillas generales
export const getMyRoutines = async (req, res) => {
  try {
    const routines = await prisma.routine.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { userId: null } // Plantillas públicas del gimnasio
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
    res.status(500).json({ error: 'Error al obtener rutinas.' });
  }
};

// Crear una rutina con sus ejercicios vinculados
export const createRoutine = async (req, res) => {
  try {
    const { nombre, ejercicios, isPublic } = req.body; 
    // ejercicios: [{ exerciseId, series, reps, descansoSeg }]

    const routine = await prisma.routine.create({
      data: {
        nombre,
        userId: isPublic ? null : req.user.id,
        ejercicios: {
          create: ejercicios.map((item) => ({
            exerciseId: item.exerciseId,
            series: parseInt(item.series),
            reps: parseInt(item.reps),
            descansoSeg: item.descansoSeg ? parseInt(item.descansoSeg) : 60
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