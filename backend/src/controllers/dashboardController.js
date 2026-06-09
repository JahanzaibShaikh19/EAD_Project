import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  async getHRStats(req, res, next) {
    try {
      const { month, year } = req.query;
      const stats = await dashboardService.getHRStats(month, year);
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  async getMyStats(req, res, next) {
    try {
      const { month, year } = req.query;
      const stats = await dashboardService.getMyStats(req.user.employee_id, month, year);
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
};
