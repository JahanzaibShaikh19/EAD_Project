import { goalService } from '../services/goalService.js';

export const goalController = {
  async getCycles(req, res, next) {
    try {
      const cycles = await goalService.getCycles();
      res.status(200).json({ success: true, data: cycles });
    } catch (err) {
      next(err);
    }
  },

  async createCycle(req, res, next) {
    try {
      const cycle = await goalService.createCycle(req.body);
      res.status(201).json({ success: true, data: cycle });
    } catch (err) {
      next(err);
    }
  },

  async getMyGoals(req, res, next) {
    try {
      const { cycle_id } = req.query;
      const goals = await goalService.getAllGoals({ employee_id: req.user.employee_id, cycle_id });
      res.status(200).json({ success: true, data: goals });
    } catch (err) {
      next(err);
    }
  },

  async getGoalSummary(req, res, next) {
    try {
      const { cycle_id } = req.query;
      const summary = await goalService.getGoalSummary({ cycle_id });
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  },

  async getAllGoals(req, res, next) {
    try {
      const employee_id = req.user.role === 'employee' ? req.user.employee_id : req.query.employee_id;
      const { status, cycle_id } = req.query;

      const goals = await goalService.getAllGoals({ employee_id, status, cycle_id });
      res.status(200).json({ success: true, data: goals });
    } catch (err) {
      next(err);
    }
  },

  async getGoalById(req, res, next) {
    try {
      const goal = await goalService.getGoalById(req.params.id);
      if (req.user.role === 'employee' && goal.employee_id !== req.user.employee_id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      res.status(200).json({ success: true, data: goal });
    } catch (err) {
      next(err);
    }
  },

  async createGoal(req, res, next) {
    try {
      const newGoal = await goalService.createGoal({
        ...req.body,
        created_by: req.user.employee_id
      });
      res.status(201).json({ success: true, data: newGoal });
    } catch (err) {
      next(err);
    }
  },

  async updateGoal(req, res, next) {
    try {
      const updatedGoal = await goalService.updateGoal(req.params.id, req.body);
      res.status(200).json({ success: true, data: updatedGoal });
    } catch (err) {
      next(err);
    }
  },

  async updateGoalProgress(req, res, next) {
    try {
      const goal = await goalService.getGoalById(req.params.id);
      if (req.user.role === 'employee' && goal.employee_id !== req.user.employee_id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const updatedGoal = await goalService.updateGoalProgress(req.params.id, req.body.progress);
      res.status(200).json({ success: true, data: updatedGoal });
    } catch (err) {
      next(err);
    }
  },

  async updateKeyResultProgress(req, res, next) {
    try {
      // Need to verify employee owns the goal
      const kr = await goalService.getKeyResultById(req.params.id);
      const goal = await goalService.getGoalById(kr.goal_id);
      if (req.user.role === 'employee' && goal.employee_id !== req.user.employee_id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const updatedKr = await goalService.updateKeyResultProgress(req.params.id, req.body.progress);
      res.status(200).json({ success: true, data: updatedKr });
    } catch (err) {
      next(err);
    }
  },

  async deleteGoal(req, res, next) {
    try {
      await goalService.deleteGoal(req.params.id);
      res.status(200).json({ success: true, message: 'Goal deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
