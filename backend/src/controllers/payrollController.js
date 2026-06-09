import { payrollService } from '../services/payrollService.js';

export const payrollController = {
  async getAll(req, res, next) {
    try {
      const { employee_id, month, year, status, page, limit } = req.query;
      const result = await payrollService.getAllPayroll({
        employee_id, month, year, status,
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
      const records = await payrollService.getMyPayroll(req.user.employee_id);
      res.status(200).json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { employee_id, month, year, base_salary } = req.body;
      if (!employee_id || !month || !year || base_salary === undefined) {
        return res.status(400).json({ success: false, message: 'employee_id, month, year, and base_salary are required.' });
      }
      if (month < 1 || month > 12) {
        return res.status(400).json({ success: false, message: 'Month must be between 1 and 12.' });
      }
      if (parseFloat(base_salary) < 0) {
        return res.status(400).json({ success: false, message: 'base_salary must be >= 0.' });
      }

      const record = await payrollService.createPayroll(req.body);
      res.status(201).json({ success: true, message: 'Payroll record created successfully.', data: record });
    } catch (err) {
      next(err);
    }
  },

  async process(req, res, next) {
    try {
      const record = await payrollService.processPayroll(req.params.id);
      res.status(200).json({ success: true, message: 'Payroll processed.', data: record });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const record = await payrollService.updatePayroll(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Payroll updated.', data: record });
    } catch (err) {
      next(err);
    }
  }
};
