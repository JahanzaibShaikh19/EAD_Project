import pool from '../config/db.js';
import { notificationService } from './notificationService.js';

export const payrollService = {
  async getAllPayroll({ employee_id, month, year, status, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    
    let whereClauses = [];
    let values = [];
    let paramIndex = 1;

    if (employee_id) {
      whereClauses.push(`p.employee_id = $${paramIndex}`);
      values.push(employee_id);
      paramIndex++;
    }
    
    if (month) {
      whereClauses.push(`p.month = $${paramIndex}`);
      values.push(month);
      paramIndex++;
    }
    
    if (year) {
      whereClauses.push(`p.year = $${paramIndex}`);
      values.push(year);
      paramIndex++;
    }

    if (status) {
      whereClauses.push(`p.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT p.*, e.first_name, e.last_name, e.photo_url, e.employee_code, d.name as department_name 
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereString}
      ORDER BY p.year DESC, p.month DESC, p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM payroll p ${whereString}`;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      records: dataResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  async getMyPayroll(employee_id) {
    const query = `
      SELECT p.* 
      FROM payroll p
      WHERE p.employee_id = $1 AND p.status IN ('processed', 'paid')
      ORDER BY p.year DESC, p.month DESC
    `;
    const result = await pool.query(query, [employee_id]);
    return result.rows;
  },

  async createPayroll(data) {
    const check = await pool.query(
      `SELECT id FROM payroll WHERE employee_id = $1 AND month = $2 AND year = $3`,
      [data.employee_id, data.month, data.year]
    );

    if (check.rows.length > 0) {
      const error = new Error('Payroll record for this month and year already exists.');
      error.status = 409;
      throw error;
    }

    const result = await pool.query(`
      INSERT INTO payroll (employee_id, month, year, base_salary, allowances, deductions, tax, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `, [
      data.employee_id, data.month, data.year,
      data.base_salary, data.allowances || 0, data.deductions || 0, data.tax || 0
    ]);

    return result.rows[0];
  },

  async processPayroll(id) {
    const result = await pool.query(`
      UPDATE payroll 
      SET status = 'processed', processed_at = NOW() 
      WHERE id = $1 AND status = 'pending'
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Payroll record not found or already processed.');
      error.status = 404;
      throw error;
    }

    const payroll = result.rows[0];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    await notificationService.createNotification({
      employee_id: payroll.employee_id,
      title: 'Payroll Processed',
      message: `Your payroll for ${monthNames[payroll.month - 1]} ${payroll.year} has been processed.`,
      type: 'payroll',
      link: '/payroll'
    });

    return payroll;
  },

  async updatePayroll(id, data) {
    const check = await pool.query('SELECT status FROM payroll WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const error = new Error('Payroll record not found.');
      error.status = 404;
      throw error;
    }

    if (check.rows[0].status === 'processed' || check.rows[0].status === 'paid') {
      const error = new Error('Cannot update processed or paid payroll record.');
      error.status = 400;
      throw error;
    }

    // Do NOT include net_salary in SET clause (it's GENERATED)
    const result = await pool.query(`
      UPDATE payroll 
      SET base_salary = $1, allowances = $2, deductions = $3, tax = $4
      WHERE id = $5
      RETURNING *
    `, [data.base_salary, data.allowances || 0, data.deductions || 0, data.tax || 0, id]);

    return result.rows[0];
  }
};
