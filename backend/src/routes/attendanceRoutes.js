import { Router } from 'express';
import { 
  checkIn, 
  getMyAttendance, 
  checkInByAdmin, 
  getTodayAttendances 
} from '../controllers/attendanceController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de asistencia requieren sesión iniciada
router.use(verifyToken);

// Rutas del Atleta
router.post('/checkin', checkIn);
router.get('/my-history', getMyAttendance);

// Rutas de Recepción / Administrador
router.post('/admin/checkin', requireRole('ADMIN'), checkInByAdmin);
router.get('/admin/today', requireRole('ADMIN'), getTodayAttendances);

export default router;