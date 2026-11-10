import prisma from '../config/db.js';

// Obtener todas las medidas del usuario autenticado
export const getMyMeasurements = async (req, res) => {
  try {
    const measurements = await prisma.measurement.findMany({
      where: { userId: req.user.id },
      orderBy: { fecha: 'desc' }
    });
    res.json(measurements);
  } catch (error) {
    console.error('Error al obtener medidas:', error);
    res.status(500).json({ error: 'Error al consultar las medidas.' });
  }
};

// Crear un nuevo registro de medidas
export const addMeasurement = async (req, res) => {
  try {
    const { peso, grasa, pecho, brazo, cintura } = req.body;

    const newMeasurement = await prisma.measurement.create({
      data: {
        userId: req.user.id,
        peso: peso ? parseFloat(peso) : null,
        grasa: grasa ? parseFloat(grasa) : null,
        pecho: pecho ? parseFloat(pecho) : null,
        brazo: brazo ? parseFloat(brazo) : null,
        cintura: cintura ? parseFloat(cintura) : null
      }
    });

    res.status(201).json(newMeasurement);
  } catch (error) {
    console.error('Error al guardar medidas:', error);
    res.status(500).json({ error: 'Error al registrar las medidas.' });
  }
};