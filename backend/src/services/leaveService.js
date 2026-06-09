import pool from '../config/db.js';
import { notificationService } from './notificationService.js';

export const leaveService = {
  async getAllLeave({ status, employee_id, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    
    let whereClauses = [];
    let values = [];
    let paramIndex = 1;

    if (employee_id) {
      whereClauses.push(`l.employee_id = $${paramIndex}`);
      values.push(employee_id);
      paramIndex++;
    }
    
    if (status) {
      whereClauses.push(`l.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT l.*, e.first_name, e.last_name, e.photo_url, d.name as dept_name,
             a.first_name as approver_first_name, a.last_name as approver_last_name
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees a ON l.approved_by = a.id
      ${whereString}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM leave_requests l ${whereString}`;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      requests: dataResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  async getMyLeave(employee_id) {
    const query = `
      SELECT l.*, a.first_name as approver_first_name, a.last_name as approver_last_name
      FROM leave_requests l
      LEFT JOIN employees a ON l.approved_by = a.id
      WHERE l.employee_id = $1
      ORDER BY l.created_at DESC
    `;
    const result = await pool.query(query, [employee_id]);
    return result.rows;
  },

  async getLeaveCalendar({ month, year, employee_id }) {
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString();
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString();

    let query = `
      SELECT l.id, l.employee_id, e.first_name, e.last_name, e.photo_url, 
             l.start_date, l.end_date, l.leave_type, l.status
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.status = 'approved'
        AND l.start_date <= $2 AND l.end_date >= $1
    `;
    const params = [startDate, endDate];

    if (employee_id) {
      query += ` AND l.employee_id = $3`;
      params.push(employee_id);
    }

    query += ` ORDER BY l.start_date ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async createLeave(employee_id, data) {
    if (new Date(data.end_date) < new Date(data.start_date)) {
      const error = new Error('End date must be greater than or equal to start date.');
      error.status = 400;
      throw error;
    }

    const result = await pool.query(`
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `, [employee_id, data.leave_type, data.start_date, data.end_date, data.reason]);

    const request = result.rows[0];

    // Notify all HRs
    const hrs = await pool.query(`SELECT id FROM users WHERE role = 'hr'`);
    const emp = await pool.query(`SELECT first_name, last_name FROM employees WHERE id = $1`, [employee_id]);
    const empName = emp.rows[0] ? `${emp.rows[0].first_name} ${emp.rows[0].last_name}` : 'An employee';

    for (const hr of hrs.rows) {
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES ($1, $2, $3, $4, $5)
      `, [hr.id, 'Pending Leave Request', `${empName} has submitted a ${data.leave_type} leave request.`, 'leave', '/leave']);
    }

    return request;
  },

  async approveLeave(id, approver_id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const check = await client.query('SELECT * FROM leave_requests WHERE id = $1 AND status = $2', [id, 'pending']);
      if (check.rows.length === 0) {
        const error = new Error('Leave request not found or not in pending state.');
        error.status = 404;
        throw error;
      }
      
      const leave = check.rows[0];

      const result = await client.query(`
        UPDATE leave_requests 
        SET status = 'approved', approved_by = $2, approved_at = NOW() 
        WHERE id = $1 AND status = 'pending'
        RETURNING *
      `, [id, approver_id]);

      // Insert attendance records for each day in range (skipping weekends)
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
          const dateString = d.toISOString().split('T')[0];
          await client.query(`
            INSERT INTO attendance (employee_id, work_date, status)
            VALUES ($1, $2, 'on-leave')
            ON CONFLICT (employee_id, work_date) 
            DO UPDATE SET status = 'on-leave', check_in = NULL, check_out = NULL
          `, [leave.employee_id, dateString]);
        }
      }

      await client.query('COMMIT');

      // Send notification
      await notificationService.createNotification({
        employee_id: leave.employee_id,
        title: 'Leave Approved',
        message: `Your ${leave.leave_type} leave from ${startDate.toISOString().split('T')[0]} has been approved.`,
        type: 'leave',
        link: '/leave'
      });

      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async rejectLeave(id, approver_id) {
    const result = await pool.query(`
      UPDATE leave_requests 
      SET status = 'rejected', approved_by = $2, approved_at = NOW() 
      WHERE id = $1 AND status = 'pending'
      RETURNING *
    `, [id, approver_id]);

    if (result.rows.length === 0) {
      const error = new Error('Leave request not found or not in pending state.');
      error.status = 404;
      throw error;
    }

    const leave = result.rows[0];
    await notificationService.createNotification({
      employee_id: leave.employee_id,
      title: 'Leave Rejected',
      message: `Your ${leave.leave_type} leave from ${new Date(leave.start_date).toISOString().split('T')[0]} has been rejected.`,
      type: 'leave',
      link: '/leave'
    });

    return leave;
  },

  async deleteLeave(id, employee_id) {
    const result = await pool.query(`
      DELETE FROM leave_requests WHERE id = $1 AND employee_id = $2 AND status = 'pending' RETURNING *
    `, [id, employee_id]);

    if (result.rows.length === 0) {
      const error = new Error('Leave request not found, already processed, or unauthorized.');
      error.status = 400;
      throw error;
    }

    return result.rows[0];
  }
};
