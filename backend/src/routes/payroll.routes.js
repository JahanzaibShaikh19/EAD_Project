import express from 'express';
import { payrollController } from '../controllers/payrollController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('hr'), payrollController.getAll);
router.get('/my', verifyToken, payrollController.getMy);
router.post('/', verifyToken, requireRole('hr'), payrollController.create);
router.patch('/:id/process', verifyToken, requireRole('hr'), payrollController.process);
router.put('/:id', verifyToken, requireRole('hr'), payrollController.update);

export default router;
