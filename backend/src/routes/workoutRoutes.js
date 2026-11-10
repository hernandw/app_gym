import { Router } from 'express';
import { logWorkout, getWorkoutStats } from '../controllers/workoutController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.post('/log', logWorkout);
router.get('/stats', getWorkoutStats);

export default router;