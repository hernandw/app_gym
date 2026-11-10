import { Router } from 'express';
import { getMyMeasurements, addMeasurement } from '../controllers/measurementController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de medidas requieren sesión activa
router.use(verifyToken);

router.get('/', getMyMeasurements);
router.post('/', addMeasurement);

export default router;