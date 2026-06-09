import pool from '../config/db.js';

export const notificationService = {
  async getMyNotifications(user_id) {
    const result = await pool.query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [user_id]);
    return result.rows;
  },

  async getUnreadCount(user_id) {
    const result = await pool.query(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = $1 AND is_read = FALSE
    `, [user_id]);
    return parseInt(result.rows[0].count, 10);
  },

  async markAsRead(id, user_id) {
    const result = await pool.query(`
      UPDATE notifications SET is_read = TRUE 
      WHERE id = $1 AND user_id = $2 RETURNING *
    `, [id, user_id]);
    return result.rows[0];
  },

  async markAllAsRead(user_id) {
    await pool.query(`
      UPDATE notifications SET is_read = TRUE 
      WHERE user_id = $1
    `, [user_id]);
    return { success: true };
  },

  async createNotification({ employee_id, title, message, type, link }) {
    if (!employee_id) return null;
    const userRes = await pool.query('SELECT id FROM users WHERE employee_id = $1', [employee_id]);
    if (userRes.rows.length === 0) return null;
    const user_id = userRes.rows[0].id;
    
    const result = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, title, message, type || 'system', link]);
    return result.rows[0];
  },

  async createBroadcastNotification({ title, message, type, link }) {
    // Notify all active employees' users
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, link)
      SELECT u.id, $1, $2, $3, $4 
      FROM users u
      JOIN employees e ON u.employee_id = e.id
      WHERE e.status = 'active'
    `, [title, message, type || 'system', link]);
    return true;
  }
};
