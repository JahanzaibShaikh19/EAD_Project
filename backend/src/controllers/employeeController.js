import { employeeService } from '../services/employeeService.js';

export const employeeController = {
  async getAll(req, res, next) {
    try {
      const { search, department_id, status, contract_type, page, limit } = req.query;
      const result = await employeeService.getAllEmployees({
        search, department_id, status, contract_type,
        page: page || 1,
        limit: limit || 10
      });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      res.status(200).json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const data = req.body;
      if (!data.firstName || !data.lastName || !data.email) {
        return res.status(400).json({ success: false, message: 'firstName, lastName, and email are required.' });
      }
      if (data.salary && parseFloat(data.salary) < 0) {
        return res.status(400).json({ success: false, message: 'Salary must be >= 0' });
      }
      
      const employee = await employeeService.createEmployee(data, req.file);
      res.status(201).json({ success: true, message: 'Employee created successfully.', data: employee });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Employee updated successfully.', data: employee });
    } catch (err) {
      next(err);
    }
  },

  async patch(req, res, next) {
    try {
      const employee = await employeeService.patchEmployee(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Employee updated successfully.', data: employee });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const employee = await employeeService.deleteEmployee(req.params.id);
      res.status(200).json({ success: true, message: 'Employee terminated.', data: employee });
    } catch (err) {
      next(err);
    }
  },

  async updatePhoto(req, res, next) {
    try {
      const employee = await employeeService.updatePhoto(req.params.id, req.file);
      res.status(200).json({ success: true, message: 'Photo updated successfully.', data: employee });
    } catch (err) {
      next(err);
    }
  },

  async updateMyProfile(req, res, next) {
    try {
      const employee = await employeeService.updateMyProfile(req.user.employee_id, req.body);
      res.status(200).json({ success: true, message: 'Profile updated successfully.', data: employee });
    } catch (err) {
      next(err);
    }
  },

  async updateMyPhoto(req, res, next) {
    try {
      const employee = await employeeService.updateMyPhoto(req.user.employee_id, req.file);
      res.status(200).json({ success: true, message: 'Photo updated successfully.', data: employee });
    } catch (err) {
      next(err);
    }
  }
};
