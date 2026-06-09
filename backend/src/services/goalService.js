import pool from '../config/db.js';
import { notificationService } from './notificationService.js';

export const goalService = {
  // --- CYCLES ---
  async getCycles() {
    const result = await pool.query('SELECT * FROM okr_cycles ORDER BY start_date DESC');
    return result.rows;
  },

  async createCycle(data) {
    const result = await pool.query(`
      INSERT INTO okr_cycles (name, start_date, end_date, is_active)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [data.name, data.start_date, data.end_date, data.is_active !== false]);
    return result.rows[0];
  },

  // --- GOALS ---
  async getAllGoals({ employee_id, status, cycle_id }) {
    let query = `
      SELECT g.*, e.first_name, e.last_name, e.photo_url, c.name as cycle_name, d.name as dept_name
      FROM goals g
      JOIN employees e ON g.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      JOIN okr_cycles c ON g.cycle_id = c.id
    `;
    const values = [];
    let whereClauses = [];

    if (employee_id) {
      values.push(employee_id);
      whereClauses.push(`g.employee_id = $${values.length}`);
    }
    if (status) {
      values.push(status);
      whereClauses.push(`g.status = $${values.length}`);
    }
    if (cycle_id) {
      values.push(cycle_id);
      whereClauses.push(`g.cycle_id = $${values.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY g.created_at DESC`;

    const result = await pool.query(query, values);
    
    // Fetch key results for these goals
    if (result.rows.length > 0) {
      const goalIds = result.rows.map(r => r.id);
      const krResult = await pool.query(`SELECT * FROM key_results WHERE goal_id = ANY($1)`, [goalIds]);
      
      const krMap = {};
      krResult.rows.forEach(kr => {
        if (!krMap[kr.goal_id]) krMap[kr.goal_id] = [];
        krMap[kr.goal_id].push(kr);
      });

      result.rows.forEach(goal => {
        goal.key_results = krMap[goal.id] || [];
      });
    }

    return result.rows;
  },

  async getGoalById(id) {
    const result = await pool.query(`
      SELECT g.*, e.first_name, e.last_name, e.photo_url, c.name as cycle_name, d.name as dept_name
      FROM goals g
      JOIN employees e ON g.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      JOIN okr_cycles c ON g.cycle_id = c.id
      WHERE g.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      const error = new Error('Goal not found');
      error.status = 404;
      throw error;
    }
    const goal = result.rows[0];

    const krResult = await pool.query(`SELECT * FROM key_results WHERE goal_id = $1`, [id]);
    goal.key_results = krResult.rows;

    return goal;
  },

  async createGoal(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(`
        INSERT INTO goals (employee_id, cycle_id, title, description, target, progress, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        data.employee_id, 
        data.cycle_id,
        data.title, 
        data.description, 
        data.target,
        data.progress || 0,
        data.status || 'active', 
        data.created_by
      ]);

      const goal = result.rows[0];
      goal.key_results = [];

      if (data.key_results && data.key_results.length > 0) {
        for (const kr of data.key_results) {
          const krRes = await client.query(`
            INSERT INTO key_results (goal_id, title, progress)
            VALUES ($1, $2, $3) RETURNING *
          `, [goal.id, kr.title, kr.progress || 0]);
          goal.key_results.push(krRes.rows[0]);
        }
      }

      await client.query('COMMIT');

      // Notify employee
      await notificationService.createNotification({
        employee_id: goal.employee_id,
        title: 'New Goal Assigned',
        message: `A new goal "${goal.title}" has been assigned to you.`,
        type: 'performance',
        link: '/performance'
      });

      return goal;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateGoal(id, data) {
    const check = await pool.query('SELECT id FROM goals WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const error = new Error('Goal not found');
      error.status = 404;
      throw error;
    }

    const { key_results, ...goalData } = data;

    if (Object.keys(goalData).length > 0) {
      const keys = Object.keys(goalData);
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      const values = Object.values(goalData);
      values.push(id);

      await pool.query(`
        UPDATE goals 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
      `, values);
    }

    return this.getGoalById(id);
  },

  async updateGoalProgress(id, progress) {
    await pool.query('UPDATE goals SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [progress, id]);
    return this.getGoalById(id);
  },

  // --- KEY RESULTS ---
  async getKeyResultById(id) {
    const result = await pool.query('SELECT * FROM key_results WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      const error = new Error('Key result not found');
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  },

  async updateKeyResultProgress(id, progress) {
    const krRes = await pool.query(`UPDATE key_results SET progress = $1 WHERE id = $2 RETURNING *`, [progress, id]);
    if (krRes.rows.length === 0) {
      const error = new Error('Key result not found');
      error.status = 404;
      throw error;
    }
    const kr = krRes.rows[0];

    // Automatically update goal progress based on average of key results
    const allKrs = await pool.query('SELECT progress FROM key_results WHERE goal_id = $1', [kr.goal_id]);
    if (allKrs.rows.length > 0) {
      const total = allKrs.rows.reduce((sum, r) => sum + r.progress, 0);
      const avg = Math.round(total / allKrs.rows.length);
      await pool.query('UPDATE goals SET progress = $1 WHERE id = $2', [avg, kr.goal_id]);
    }

    return kr;
  },

  async deleteGoal(id) {
    const result = await pool.query(`DELETE FROM goals WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      const error = new Error('Goal not found');
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  },

  async getGoalSummary({ cycle_id }) {
    let query = `SELECT status, COUNT(*) as count FROM goals`;
    const values = [];
    if (cycle_id) {
      values.push(cycle_id);
      query += ` WHERE cycle_id = $1`;
    }
    query += ` GROUP BY status`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
};
