import express from 'express';
import { performanceController } from '../controllers/performanceController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('hr'), performanceController.getAll);
router.get('/my', verifyToken, performanceController.getMy);
router.get('/:id', verifyToken, requireRole('hr'), performanceController.getById);
router.post('/', verifyToken, requireRole('hr'), performanceController.create);
router.put('/:id', verifyToken, requireRole('hr'), performanceController.update);
router.delete('/:id', verifyToken, requireRole('hr'), performanceController.remove);

export default router;
