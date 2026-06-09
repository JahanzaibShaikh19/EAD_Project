import express from 'express';
import { leaveController } from '../controllers/leaveController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('hr'), leaveController.getAll);
router.get('/my', verifyToken, leaveController.getMy);
router.get('/calendar', verifyToken, leaveController.getCalendar);
router.post('/', verifyToken, leaveController.create);
router.patch('/:id/approve', verifyToken, requireRole('hr'), leaveController.approve);
router.patch('/:id/reject', verifyToken, requireRole('hr'), leaveController.reject);
router.delete('/:id', verifyToken, leaveController.remove);

export default router;
