import { Router } from 'express';
import { checkIn, getMyAttendance } from '../controllers/attendanceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.post('/checkin', checkIn);
router.get('/my-history', getMyAttendance);

export default router;