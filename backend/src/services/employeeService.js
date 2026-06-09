import pool from '../config/db.js';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import bcrypt from 'bcryptjs';

// Supabase config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseKey);

export const employeeService = {
  async getAllEmployees({ search, department_id, status, contract_type, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    
    let whereClauses = [];
    let values = [];
    let paramIndex = 1;

    if (search) {
      whereClauses.push(`(e.first_name ILIKE $${paramIndex} OR e.last_name ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }
    
    if (department_id) {
      whereClauses.push(`e.department_id = $${paramIndex}`);
      values.push(department_id);
      paramIndex++;
    }

    if (status) {
      whereClauses.push(`e.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (contract_type) {
      whereClauses.push(`e.contract_type = $${paramIndex}`);
      values.push(contract_type);
      paramIndex++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT e.*, d.name as department_name, p.title as position_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      ${whereString}
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM employees e ${whereString}`;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [...values, limit, offset]),
      pool.query(countQuery, values)
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      employees: dataResult.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  async getEmployeeById(id) {
    const result = await pool.query(`
      SELECT e.*, d.name as department_name, p.title as position_title
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Employee not found.');
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  },

  async createEmployee(data, file) {
    let photo_url = null;
    
    if (file) {
      photo_url = `http://localhost:5000/public/photos/${file.filename}`;
    }

    const employeeCode = 'EM' + Date.now().toString().slice(-6);

    let position_id = data.position_id;
    if (data.position_title) {
      const posRes = await pool.query('SELECT id FROM positions WHERE title ILIKE $1', [data.position_title]);
      if (posRes.rows.length > 0) {
        position_id = posRes.rows[0].id;
      } else {
        const newPos = await pool.query('INSERT INTO positions (title, department_id) VALUES ($1, $2) RETURNING id', [data.position_title, data.department_id || null]);
        position_id = newPos.rows[0].id;
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(`
        INSERT INTO employees 
        (first_name, last_name, email, phone, date_of_birth, gender, address, department_id, position_id, hire_date, salary, contract_type, status, photo_url, employee_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        data.firstName, data.lastName, data.email, data.phone || null, data.dateOfBirth || null, 
        data.gender || null, data.address || null, data.department_id || null, position_id || null,
        data.hire_date || new Date(), data.salary || 0, data.contract_type || 'full-time', 
        data.status || 'active', photo_url, employeeCode
      ]);
      
      const employee = result.rows[0];

      // Auto-create user account with default password
      const hashedPassword = await bcrypt.hash('password123', 10);
      await client.query(
        `INSERT INTO users (email, password, role, employee_id) VALUES ($1, $2, 'employee', $3)`,
        [employee.email, hashedPassword, employee.id]
      );

      await client.query('COMMIT');
      return this.getEmployeeById(employee.id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateEmployee(id, data) {
    const check = await pool.query('SELECT id FROM employees WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const error = new Error('Employee not found.');
      error.status = 404;
      throw error;
    }

    let position_id = data.position_id;
    if (data.position_title) {
      const posRes = await pool.query('SELECT id FROM positions WHERE title ILIKE $1', [data.position_title]);
      if (posRes.rows.length > 0) {
        position_id = posRes.rows[0].id;
      } else {
        const newPos = await pool.query('INSERT INTO positions (title, department_id) VALUES ($1, $2) RETURNING id', [data.position_title, data.department_id || null]);
        position_id = newPos.rows[0].id;
      }
    }

    const result = await pool.query(`
      UPDATE employees 
      SET first_name = $1, last_name = $2, email = $3, phone = $4, date_of_birth = $5, 
          gender = $6, address = $7, department_id = $8, position_id = $9, 
          hire_date = $10, salary = $11, contract_type = $12, status = $13
      WHERE id = $14
      RETURNING *
    `, [
      data.firstName, data.lastName, data.email, data.phone, data.dateOfBirth, 
      data.gender, data.address, data.department_id, position_id,
      data.hire_date, data.salary, data.contract_type, data.status, id
    ]);

    return this.getEmployeeById(id);
  },
  
  async patchEmployee(id, data) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.getEmployeeById(id);

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(data);
    values.push(id);

    const result = await pool.query(`
      UPDATE employees SET ${setClause} WHERE id = $${values.length} RETURNING *
    `, values);

    if (result.rows.length === 0) {
      const error = new Error('Employee not found.');
      error.status = 404;
      throw error;
    }

    return this.getEmployeeById(id);
  },

  async deleteEmployee(id) {
    const result = await pool.query(`
      UPDATE employees SET status = 'terminated' WHERE id = $1 RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      const error = new Error('Employee not found.');
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  },

  async updatePhoto(id, file) {
    if (!file) {
      const error = new Error('No photo provided.');
      error.status = 400;
      throw error;
    }

    const photo_url = `http://localhost:5000/public/photos/${file.filename}`;

    const result = await pool.query(`
      UPDATE employees SET photo_url = $1 WHERE id = $2 RETURNING *
    `, [photo_url, id]);

    if (result.rows.length === 0) {
      const error = new Error('Employee not found.');
      error.status = 404;
      throw error;
    }
    
    return result.rows[0];
  },

  async updateMyProfile(employee_id, data) {
    const ALLOWED = ['phone', 'address', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation'];
    const filteredData = {};
    for (const key of ALLOWED) {
      if (data[key] !== undefined) {
        filteredData[key] = data[key];
      }
    }
    
    if (Object.keys(filteredData).length === 0) {
      return this.getEmployeeById(employee_id);
    }

    const setClause = Object.keys(filteredData).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(filteredData);
    values.push(employee_id);

    const result = await pool.query(`
      UPDATE employees SET ${setClause} WHERE id = $${values.length} RETURNING *
    `, values);

    if (result.rows.length === 0) {
      const error = new Error('Employee not found.');
      error.status = 404;
      throw error;
    }

    return this.getEmployeeById(employee_id);
  },

  async updateMyPhoto(employee_id, file) {
    return this.updatePhoto(employee_id, file);
  }
};
