import { Router } from 'express';
import { registerPayment, getMyPayments, getMembersList } from '../controllers/paymentController.js';
import { getAccountingSummary, updateMemberByAdmin } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken);

// Historial personal de pagos (para el socio)
router.get('/my-history', getMyPayments);

// Administración (Solo ADMIN)
router.get('/members', requireRole('ADMIN'), getMembersList);
router.post('/register', requireRole('ADMIN'), registerPayment);
router.get('/accounting', requireRole('ADMIN'), getAccountingSummary);
router.put('/members/:id', requireRole('ADMIN'), updateMemberByAdmin);

export default router;