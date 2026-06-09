import { announcementService } from '../services/announcementService.js';

export const announcementController = {
  async getAll(req, res, next) {
    try {
      const announcements = await announcementService.getAllAnnouncements();
      res.status(200).json({ success: true, data: announcements });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required.' });
      }

      const announcement = await announcementService.createAnnouncement(req.body, req.user.employee_id);
      res.status(201).json({ success: true, message: 'Announcement created.', data: announcement });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Announcement updated.', data: announcement });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const announcement = await announcementService.deleteAnnouncement(req.params.id);
      res.status(200).json({ success: true, message: 'Announcement deleted.', data: announcement });
    } catch (err) {
      next(err);
    }
  }
};
