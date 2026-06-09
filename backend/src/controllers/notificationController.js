import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async getMy(req, res, next) {
    try {
      const notifications = await notificationService.getMyNotifications(req.user.id);
      res.status(200).json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      res.status(200).json({ success: true, data: { count } });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }
};
