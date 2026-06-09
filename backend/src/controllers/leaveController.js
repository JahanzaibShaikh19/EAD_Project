import { leaveService } from '../services/leaveService.js';

export const leaveController = {
  async getAll(req, res, next) {
    try {
      const { status, employee_id, page, limit } = req.query;
      const result = await leaveService.getAllLeave({
        status, employee_id,
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
      const requests = await leaveService.getMyLeave(req.user.employee_id);
      res.status(200).json({ success: true, data: requests });
    } catch (err) {
      next(err);
    }
  },

  async getCalendar(req, res, next) {
    try {
      const { month, year } = req.query;
      const employeeId = req.user.role === 'employee' ? req.user.employee_id : null;
      const calendar = await leaveService.getLeaveCalendar({ month, year, employee_id: employeeId });
      res.status(200).json({ success: true, data: calendar });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { leave_type, start_date, end_date } = req.body;
      if (!leave_type || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'leave_type, start_date, and end_date are required.' });
      }

      const request = await leaveService.createLeave(req.user.employee_id, req.body);
      res.status(201).json({ success: true, message: 'Leave request submitted successfully.', data: request });
    } catch (err) {
      next(err);
    }
  },

  async approve(req, res, next) {
    try {
      const request = await leaveService.approveLeave(req.params.id, req.user.employee_id);
      res.status(200).json({ success: true, message: 'Leave request approved.', data: request });
    } catch (err) {
      next(err);
    }
  },

  async reject(req, res, next) {
    try {
      const request = await leaveService.rejectLeave(req.params.id, req.user.employee_id);
      res.status(200).json({ success: true, message: 'Leave request rejected.', data: request });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const request = await leaveService.deleteLeave(req.params.id, req.user.employee_id);
      res.status(200).json({ success: true, message: 'Leave request deleted.', data: request });
    } catch (err) {
      next(err);
    }
  }
};
