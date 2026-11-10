import { Router } from 'express';
import { registerPayment, getMyPayments, getMembersList } from '../controllers/paymentController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken);

// Historial personal de pagos (para el socio)
router.get('/my-history', getMyPayments);

// Rutas de administración
router.get('/members', requireRole('ADMIN'), getMembersList);
router.post('/register', requireRole('ADMIN'), registerPayment);

export default router;