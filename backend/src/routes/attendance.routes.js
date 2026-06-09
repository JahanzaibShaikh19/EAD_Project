import express from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('hr'), attendanceController.getAll);
router.get('/my', verifyToken, attendanceController.getMy);
router.post('/check-in', verifyToken, attendanceController.checkIn);
router.patch('/check-out', verifyToken, attendanceController.checkOut);
router.post('/manual', verifyToken, requireRole('hr'), attendanceController.manualEntry);

export default router;
