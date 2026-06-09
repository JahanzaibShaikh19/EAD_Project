import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/mailer.js';

export const authService = {
  async registerUser({ email, password, role, firstName, lastName }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const employeeCode = 'EM' + Date.now().toString().slice(-6);

      // Insert employee
      const empResult = await client.query(
        `INSERT INTO employees 
         (first_name, last_name, email, employee_code, hire_date, status, contract_type, salary) 
         VALUES ($1, $2, $3, $4, CURRENT_DATE, 'active', 'full-time', 0) 
         RETURNING id, first_name, last_name, employee_code`,
        [firstName, lastName, email, employeeCode]
      );
      const employee = empResult.rows[0];

      // Insert user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userResult = await client.query(
        `INSERT INTO users (email, password, role, employee_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, role, employee_id`,
        [email, hashedPassword, role, employee.id]
      );
      const user = userResult.rows[0];

      await client.query('COMMIT');
      return { user, employee };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async loginUser({ email, password }) {
    const result = await pool.query(
      `SELECT u.*, e.first_name, e.last_name, e.photo_url 
       FROM users u 
       LEFT JOIN employees e ON u.employee_id = e.id 
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.status = 401;
      throw error;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const error = new Error('Invalid email or password.');
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, employee_id: user.employee_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        firstName: user.first_name,
        lastName: user.last_name,
        photo_url: user.photo_url
      }
    };
  },

  async getMe(userId) {
    const result = await pool.query(
      `SELECT u.id as user_id, u.email, u.role, e.* 
       FROM users u 
       JOIN employees e ON u.employee_id = e.id 
       WHERE u.id = $1`,
      [userId]
    );
    
    if (!result.rows[0]) {
      const error = new Error('User not found.');
      error.status = 404;
      throw error;
    }
    
    return result.rows[0];
  },

  async forgotPassword({ email }) {
    const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1 AND is_active = true', [email]);
    const user = userResult.rows[0];
    if (!user) return true;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    await sendPasswordResetEmail(user.email, token);
    return true;
  },

  async resetPassword({ token, newPassword }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const tokenResult = await client.query(
        'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND is_used = false AND expires_at > NOW()',
        [token]
      );
      const resetRecord = tokenResult.rows[0];
      if (!resetRecord) {
        const error = new Error('Invalid or expired token.');
        error.status = 400;
        throw error;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, resetRecord.user_id]);
      
      await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [resetRecord.user_id]);
      
      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
