import pool from '../config/db.js';

export const attendanceService = {
  async getAllAttendance({ employee_id, month, year, search, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    
    let whereClauses = [];
    let values = [];
    let paramIndex = 1;

    if (employee_id) {
      whereClauses.push(`a.employee_id = $${paramIndex}`);
      values.push(employee_id);
      paramIndex++;
    }
    
    if (month && year) {
      whereClauses.push(`EXTRACT(MONTH FROM a.work_date) = $${paramIndex}`);
      values.push(month);
      paramIndex++;
      
      whereClauses.push(`EXTRACT(YEAR FROM a.work_date) = $${paramIndex}`);
      values.push(year);
      paramIndex++;
    }

    if (search) {
      whereClauses.push(`(e.first_name ILIKE $${paramIndex} OR e.last_name ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT a.*, e.first_name, e.last_name, e.photo_url, d.name as dept_name 
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereString}
      ORDER BY a.work_date DESC, a.check_in DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM attendance a 
      JOIN employees e ON a.employee_id = e.id 
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereString}
    `;

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

  async getMyAttendance(employee_id, month, year) {
    let whereString = `WHERE a.employee_id = $1`;
    let values = [employee_id];

    if (month && year) {
      whereString += ` AND EXTRACT(MONTH FROM a.work_date) = $2 AND EXTRACT(YEAR FROM a.work_date) = $3`;
      values.push(month, year);
    }

    const query = `
      SELECT a.* 
      FROM attendance a
      ${whereString}
      ORDER BY a.work_date DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  },

  async checkIn(employee_id) {
    // Check if already checked in today
    const check = await pool.query(
      `SELECT id FROM attendance WHERE employee_id = $1 AND work_date = CURRENT_DATE`,
      [employee_id]
    );

    if (check.rows.length > 0) {
      const error = new Error('Already checked in for today.');
      error.status = 400;
      throw error;
    }

    const result = await pool.query(`
      INSERT INTO attendance (employee_id, work_date, check_in, status)
      VALUES ($1, CURRENT_DATE, CURRENT_TIME, 'present')
      RETURNING *
    `, [employee_id]);

    return result.rows[0];
  },

  async checkOut(employee_id) {
    const result = await pool.query(`
      UPDATE attendance 
      SET check_out = CURRENT_TIME 
      WHERE employee_id = $1 AND work_date = CURRENT_DATE AND check_out IS NULL
      RETURNING *
    `, [employee_id]);

    if (result.rows.length === 0) {
      const error = new Error('No open attendance record found for today. Did you check in?');
      error.status = 400;
      throw error;
    }

    return result.rows[0];
  },

  async manualEntry(data) {
    const result = await pool.query(`
      INSERT INTO attendance (employee_id, work_date, check_in, check_out, status, note)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [data.employee_id, data.work_date, data.check_in, data.check_out, data.status, data.note]);

    return result.rows[0];
  }
};
