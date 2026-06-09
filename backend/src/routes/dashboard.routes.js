import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/stats', verifyToken, requireRole('hr'), dashboardController.getHRStats);
router.get('/my', verifyToken, dashboardController.getMyStats);

export default router;
