import { Router } from 'express';
import { 
  getExercises, 
  createExercise, 
  getMyRoutines, 
  createRoutine,
  createAdminTemplate 
} from '../controllers/routineController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(verifyToken);

// Ejercicios
router.get('/exercises', getExercises);
router.post('/exercises', upload.single('imagen'), createExercise);

// Rutinas
router.get('/', getMyRoutines);
router.post('/', createRoutine);
router.post('/templates', requireRole('ADMIN'), createAdminTemplate);

export default router;