import { Router } from 'express';
import { 
  checkIn, 
  getMyAttendance, 
  checkInByAdmin, 
  getTodayAttendances 
} from '../controllers/attendanceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken);

// Socio
router.post('/checkin', checkIn);
router.get('/my-history', getMyAttendance);

// Recepción / Administrador
router.post('/admin/checkin', requireRole('ADMIN'), checkInByAdmin);
router.get('/admin/today', requireRole('ADMIN'), getTodayAttendances);;

export default router;