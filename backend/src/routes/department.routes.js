import express from 'express';
import { departmentController } from '../controllers/departmentController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', verifyToken, departmentController.getAll);
router.get('/:id', verifyToken, departmentController.getById);
router.post('/', verifyToken, requireRole('hr'), departmentController.create);
router.put('/:id', verifyToken, requireRole('hr'), departmentController.update);
router.delete('/:id', verifyToken, requireRole('hr'), departmentController.remove);

export default router;
