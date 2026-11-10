import { Router } from 'express';
import { 
  getExercises, 
  createExercise, 
  getMyRoutines, 
  createRoutine 
} from '../controllers/routineController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken);

// Ejercicios
router.get('/exercises', getExercises);
router.post('/exercises', createExercise);

// Rutinas
router.get('/', getMyRoutines);
router.post('/', createRoutine);

export default router;