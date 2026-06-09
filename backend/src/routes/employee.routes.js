import express from 'express';
import { employeeController } from '../controllers/employeeController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.patch('/me', verifyToken, employeeController.updateMyProfile);
router.patch('/me/photo', verifyToken, upload.single('photo'), employeeController.updateMyPhoto);

router.get('/', verifyToken, requireRole('hr'), employeeController.getAll);
router.get('/:id', verifyToken, employeeController.getById);
router.post('/', verifyToken, requireRole('hr'), upload.single('photo'), employeeController.create);
router.put('/:id', verifyToken, requireRole('hr'), employeeController.update);
router.patch('/:id', verifyToken, requireRole('hr'), employeeController.patch);
router.delete('/:id', verifyToken, requireRole('hr'), employeeController.remove);
router.patch('/:id/photo', verifyToken, requireRole('hr'), upload.single('photo'), employeeController.updatePhoto);

export default router;
