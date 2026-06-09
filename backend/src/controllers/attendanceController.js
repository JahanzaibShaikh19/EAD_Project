import { attendanceService } from '../services/attendanceService.js';

export const attendanceController = {
  async getAll(req, res, next) {
    try {
      const { employee_id, month, year, search, page, limit } = req.query;
      const result = await attendanceService.getAllAttendance({
        employee_id, month, year, search,
        page: page || 1,
        limit: limit || 10
      });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getMy(req, res, next) {
    try {
      const { month, year } = req.query;
      const records = await attendanceService.getMyAttendance(req.user.employee_id, month, year);
      res.status(200).json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  },

  async checkIn(req, res, next) {
    try {
      const record = await attendanceService.checkIn(req.user.employee_id);
      res.status(201).json({ success: true, message: 'Checked in successfully.', data: record });
    } catch (err) {
      next(err);
    }
  },

  async checkOut(req, res, next) {
    try {
      const record = await attendanceService.checkOut(req.user.employee_id);
      res.status(200).json({ success: true, message: 'Checked out successfully.', data: record });
    } catch (err) {
      next(err);
    }
  },

  async manualEntry(req, res, next) {
    try {
      const { employee_id, work_date, check_in, check_out, status } = req.body;
      if (!employee_id || !work_date || !status) {
        return res.status(400).json({ success: false, message: 'employee_id, work_date, and status are required.' });
      }

      const record = await attendanceService.manualEntry(req.body);
      res.status(201).json({ success: true, message: 'Manual entry added successfully.', data: record });
    } catch (err) {
      next(err);
    }
  }
};
