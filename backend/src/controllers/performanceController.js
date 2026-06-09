import { performanceService } from '../services/performanceService.js';

export const performanceController = {
  async getAll(req, res, next) {
    try {
      const { employee_id, page, limit } = req.query;
      const result = await performanceService.getAllReviews({
        employee_id,
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
      const reviews = await performanceService.getMyReviews(req.user.employee_id);
      res.status(200).json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const review = await performanceService.getReviewById(req.params.id);
      res.status(200).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { employee_id, rating, quality_of_work, punctuality, communication, collaboration, initiative, problem_solving } = req.body;
      
      if (!employee_id) {
        return res.status(400).json({ success: false, message: 'employee_id is required.' });
      }

      // Validate all scores are between 1 and 10
      const scores = [quality_of_work, collaboration, initiative, punctuality, communication, problem_solving];
      for (let score of scores) {
        if (score === undefined || score < 1 || score > 10) {
          return res.status(400).json({ success: false, message: 'All 6 metric scores must be provided and between 1 and 10.' });
        }
      }

      if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
      }

      const review = await performanceService.createReview(req.body, req.user.employee_id);
      res.status(201).json({ success: true, message: 'Performance review created.', data: review });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const review = await performanceService.updateReview(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Performance review updated.', data: review });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const review = await performanceService.deleteReview(req.params.id);
      res.status(200).json({ success: true, message: 'Performance review deleted.', data: review });
    } catch (err) {
      next(err);
    }
  }
};
