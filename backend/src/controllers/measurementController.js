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

    const hasValue = [peso, grasa, pecho, brazo, cintura].some(
      (v) => v !== undefined && v !== null && v !== '' && !isNaN(parseFloat(v))
    );

    if (!hasValue) {
      return res.status(400).json({ error: 'Debes proporcionar al menos una medida corporal válida.' });
    }

    const newMeasurement = await prisma.measurement.create({
      data: {
        userId: req.user.id,
        peso: peso && !isNaN(parseFloat(peso)) ? parseFloat(peso) : null,
        grasa: grasa && !isNaN(parseFloat(grasa)) ? parseFloat(grasa) : null,
        pecho: pecho && !isNaN(parseFloat(pecho)) ? parseFloat(pecho) : null,
        brazo: brazo && !isNaN(parseFloat(brazo)) ? parseFloat(brazo) : null,
        cintura: cintura && !isNaN(parseFloat(cintura)) ? parseFloat(cintura) : null
      }
    });

    res.status(201).json(newMeasurement);
  } catch (error) {
    console.error('Error al guardar medidas:', error);
    res.status(500).json({ error: 'Error al registrar las medidas.' });
  }
};