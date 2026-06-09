import pool from '../config/db.js';

export const departmentService = {
  async getAllDepartments(search) {
    let query = `
      SELECT d.*, e.first_name||' '||e.last_name as manager_name, COUNT(emp.id) as employee_count 
      FROM departments d 
      LEFT JOIN employees e ON d.manager_id = e.id 
      LEFT JOIN employees emp ON emp.department_id = d.id 
    `;
    const params = [];
    if (search) {
      query += ` WHERE d.name ILIKE $1 `;
      params.push(`%${search}%`);
    }
    query += `
      GROUP BY d.id, e.first_name, e.last_name
      ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getDeptById(id) {
    const result = await pool.query(`
      SELECT d.*, e.first_name||' '||e.last_name as manager_name, COUNT(emp.id) as employee_count 
      FROM departments d 
      LEFT JOIN employees e ON d.manager_id = e.id 
      LEFT JOIN employees emp ON emp.department_id = d.id 
      WHERE d.id = $1
      GROUP BY d.id, e.first_name, e.last_name
    `, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Department not found.');
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  },

  async createDept(data) {
    const result = await pool.query(`
      INSERT INTO departments (name, description, manager_id, location, budget)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [data.name, data.description, data.manager_id, data.location, data.budget]);
    
    return this.getDeptById(result.rows[0].id);
  },

  async updateDept(id, data) {
    const check = await pool.query('SELECT id FROM departments WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const error = new Error('Department not found.');
      error.status = 404;
      throw error;
    }

    const keys = Object.keys(data);
    if (keys.length === 0) return this.getDeptById(id);

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(data);
    values.push(id);

    await pool.query(`
      UPDATE departments SET ${setClause} WHERE id = $${values.length}
    `, values);

    return this.getDeptById(id);
  },

  async deleteDept(id) {
    const checkEmp = await pool.query('SELECT id FROM employees WHERE department_id = $1 LIMIT 1', [id]);
    if (checkEmp.rows.length > 0) {
      const error = new Error('Cannot delete department with active employees.');
      error.status = 400;
      throw error;
    }

    const result = await pool.query(`
      DELETE FROM departments WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Department not found.');
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  }
};
