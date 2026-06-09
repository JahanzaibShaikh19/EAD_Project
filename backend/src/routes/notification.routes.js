import express from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/unread-count', verifyToken, notificationController.getUnreadCount);
router.get('/', verifyToken, notificationController.getMy);
router.get('/my', verifyToken, notificationController.getMy);
router.patch('/my/read-all', verifyToken, notificationController.markAllRead);
router.patch('/:id/read', verifyToken, notificationController.markRead);

export default router;
