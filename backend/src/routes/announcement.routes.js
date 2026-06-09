import express from 'express';
import { announcementController } from '../controllers/announcementController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', verifyToken, announcementController.getAll);
router.post('/', verifyToken, requireRole('hr'), announcementController.create);
router.put('/:id', verifyToken, requireRole('hr'), announcementController.update);
router.delete('/:id', verifyToken, requireRole('hr'), announcementController.remove);

export default router;
