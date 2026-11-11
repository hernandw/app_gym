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
    const { nombre, grupoMuscular, descripcion } = req.body;
    const fotoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fotoUrl || null;

    if (!nombre || !grupoMuscular) {
      return res.status(400).json({ error: 'El nombre y el grupo muscular son obligatorios.' });
    }

    const exercise = await prisma.exercise.create({
      data: {
        nombre,
        grupoMuscular,
        descripcion: descripcion || null,
        fotoUrl
      }
    });

    res.status(201).json(exercise);
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    res.status(500).json({ error: 'Error al registrar el ejercicio.' });
  }
};

// Obtener rutinas (personales y plantillas públicas del gimnasio)
export const getMyRoutines = async (req, res) => {
  try {
    const routines = await prisma.routine.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { userId: null } // Plantillas oficiales creadas por el admin
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

// Crear rutina general / personal
export const createRoutine = async (req, res) => {
  try {
    const { nombre, ejercicios, isPublic } = req.body;

    if (!nombre || !ejercicios || ejercicios.length === 0) {
      return res.status(400).json({ error: 'Debes indicar el nombre y al menos un ejercicio.' });
    }

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

// Crear plantilla oficial del gimnasio (Para uso del Administrador)
export const createAdminTemplate = async (req, res) => {
  try {
    const { nombre, ejercicios } = req.body;

    if (!nombre || !ejercicios || ejercicios.length === 0) {
      return res.status(400).json({ error: 'Debes indicar el nombre de la rutina y al menos un ejercicio.' });
    }

    const template = await prisma.routine.create({
      data: {
        nombre,
        userId: null, // userId nulo define que es una plantilla pública para todos los atletas
        ejercicios: {
          create: ejercicios.map((item) => ({
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

    res.status(201).json(template);
  } catch (error) {
    console.error('Error al crear plantilla oficial:', error);
    res.status(500).json({ error: 'Error al crear la plantilla de rutina.' });
  }
};

// Eliminar un ejercicio del catálogo
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    // Eliminar relaciones previas en rutinas
    await prisma.routineExercise.deleteMany({ where: { exerciseId: id } });
    await prisma.workoutLog.deleteMany({ where: { exerciseId: id } });
    await prisma.exercise.delete({ where: { id } });
    res.json({ message: 'Ejercicio eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ejercicio' });
  }
};

// Editar datos de un ejercicio
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, grupoMuscular, descripcion } = req.body;
    const exercise = await prisma.exercise.update({
      where: { id },
      data: { nombre, grupoMuscular, descripcion }
    });
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar ejercicio' });
  }
};

// Eliminar una rutina completa
export const deleteRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.routineExercise.deleteMany({ where: { routineId: id } });
    await prisma.routine.delete({ where: { id } });
    res.json({ message: 'Rutina eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar rutina' });
  }
};