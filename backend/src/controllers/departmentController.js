import { departmentService } from '../services/departmentService.js';

export const departmentController = {
  async getAll(req, res, next) {
    try {
      const { search } = req.query;
      const departments = await departmentService.getAllDepartments(search);
      res.status(200).json({ success: true, data: departments });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const dept = await departmentService.getDeptById(req.params.id);
      res.status(200).json({ success: true, data: dept });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Department name is required.' });
      }
      const dept = await departmentService.createDept(req.body);
      res.status(201).json({ success: true, message: 'Department created successfully.', data: dept });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const dept = await departmentService.updateDept(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Department updated successfully.', data: dept });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const dept = await departmentService.deleteDept(req.params.id);
      res.status(200).json({ success: true, message: 'Department deleted successfully.', data: dept });
    } catch (err) {
      next(err);
    }
  }
};
