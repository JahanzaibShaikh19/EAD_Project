import pool from '../config/db.js';
import { notificationService } from './notificationService.js';

export const performanceService = {
  async getAllReviews({ employee_id, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    
    let whereClauses = [];
    let values = [];
    let paramIndex = 1;

    if (employee_id) {
      whereClauses.push(`pr.employee_id = $${paramIndex}`);
      values.push(employee_id);
      paramIndex++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT pr.*, 
             e.first_name, e.last_name, e.photo_url, d.name as dept_name,
             r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
      FROM performance_reviews pr
      JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees r ON pr.reviewer_id = r.id
      ${whereString}
      ORDER BY pr.review_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM performance_reviews pr ${whereString}`;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      reviews: dataResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  async getMyReviews(employee_id) {
    const query = `
      SELECT pr.*, r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
      FROM performance_reviews pr
      LEFT JOIN employees r ON pr.reviewer_id = r.id
      WHERE pr.employee_id = $1
      ORDER BY pr.review_date DESC
    `;
    const result = await pool.query(query, [employee_id]);
    return result.rows;
  },

  async getReviewById(id) {
    const query = `
      SELECT pr.*, 
             e.first_name, e.last_name, e.photo_url, d.name as dept_name,
             r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
      FROM performance_reviews pr
      JOIN employees e ON pr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees r ON pr.reviewer_id = r.id
      WHERE pr.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Performance review not found.');
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  },

  async createReview(data, reviewer_id) {
    const result = await pool.query(`
      INSERT INTO performance_reviews 
      (employee_id, reviewer_id, review_date, review_period, rating, comments, goals, 
       quality_of_work, punctuality, communication, collaboration, initiative, problem_solving)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      data.employee_id, reviewer_id, data.review_date || new Date(), data.review_period, data.rating, 
      data.comments, data.goals, data.quality_of_work, data.punctuality, data.communication, 
      data.collaboration, data.initiative, data.problem_solving
    ]);

    const review = await this.getReviewById(result.rows[0].id);

    await notificationService.createNotification({
      employee_id: data.employee_id,
      title: 'New Performance Review',
      message: `A new performance review has been added for ${data.review_period}.`,
      type: 'performance',
      link: '/performance'
    });

    return review;
  },

  async updateReview(id, data) {
    const check = await pool.query('SELECT id FROM performance_reviews WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const error = new Error('Performance review not found.');
      error.status = 404;
      throw error;
    }

    const keys = Object.keys(data);
    if (keys.length === 0) return this.getReviewById(id);

    // Prevent updating reviewer_id or employee_id through this method
    delete data.employee_id;
    delete data.reviewer_id;

    const remainingKeys = Object.keys(data);
    if (remainingKeys.length === 0) return this.getReviewById(id);

    const setClause = remainingKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(data);
    values.push(id);

    await pool.query(`
      UPDATE performance_reviews SET ${setClause} WHERE id = $${values.length}
    `, values);

    return this.getReviewById(id);
  },

  async deleteReview(id) {
    const result = await pool.query(`
      DELETE FROM performance_reviews WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Performance review not found.');
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  }
};
