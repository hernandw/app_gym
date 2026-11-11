import { Router } from 'express';
import { registerPayment, getMyPayments, getMembersList } from '../controllers/paymentController.js';
import { 
  getAccountingSummary, 
  updateMemberByAdmin, 
  deleteMemberByAdmin,
  updatePayment,
  deletePayment 
} from '../controllers/adminController.js';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(verifyToken);

router.get('/my-history', getMyPayments);

// Administración
router.get('/members', requireRole('ADMIN'), getMembersList);
router.post('/register', requireRole('ADMIN'), registerPayment);
router.get('/accounting', requireRole('ADMIN'), getAccountingSummary);
router.put('/members/:id', requireRole('ADMIN'), updateMemberByAdmin);
router.delete('/members/:id', requireRole('ADMIN'), deleteMemberByAdmin);

// Pagos
router.put('/payments/:id', requireRole('ADMIN'), updatePayment);
router.delete('/payments/:id', requireRole('ADMIN'), deletePayment);

// Gastos
router.get('/expenses', requireRole('ADMIN'), getExpenses);
router.post('/expenses', requireRole('ADMIN'), createExpense);
router.delete('/expenses/:id', requireRole('ADMIN'), deleteExpense);

export default router;