import pool from '../config/db.js';
import { notificationService } from './notificationService.js';

export const announcementService = {
  async getAllAnnouncements() {
    const query = `
      SELECT a.*, e.first_name as author_first_name, e.last_name as author_last_name
      FROM announcements a
      LEFT JOIN employees e ON a.created_by = e.id
      ORDER BY a.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async createAnnouncement(data, created_by) {
    const result = await pool.query(`
      INSERT INTO announcements (title, content, priority, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [data.title, data.content, data.priority || 'normal', created_by]);

    const announcement = result.rows[0];

    // Trigger broadcast notification
    await notificationService.createBroadcastNotification({
      title: 'New Announcement',
      message: announcement.title,
      type: 'announcement',
      link: '/'
    });

    return announcement;
  },

  async updateAnnouncement(id, data) {
    const check = await pool.query('SELECT id FROM announcements WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      const error = new Error('Announcement not found.');
      error.status = 404;
      throw error;
    }

    const keys = Object.keys(data);
    if (keys.length === 0) return check.rows[0];

    delete data.created_by;

    const remainingKeys = Object.keys(data);
    if (remainingKeys.length === 0) return check.rows[0];

    const setClause = remainingKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(data);
    values.push(id);

    const result = await pool.query(`
      UPDATE announcements SET ${setClause} WHERE id = $${values.length} RETURNING *
    `, values);

    return result.rows[0];
  },

  async deleteAnnouncement(id) {
    const result = await pool.query(`
      DELETE FROM announcements WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Announcement not found.');
      error.status = 404;
      throw error;
    }
    return result.rows[0];
  }
};
