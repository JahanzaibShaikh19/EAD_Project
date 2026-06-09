import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, role, firstName, lastName } = req.body;

      if (!email || !password || !role || !firstName || !lastName) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      if (!['hr', 'employee'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role.' });
      }

      const { user, employee } = await authService.registerUser({ email, password, role, firstName, lastName });

      // Auto login after register
      const { token, user: loginUser } = await authService.loginUser({ email, password });

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: { token, user: loginUser }
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const { token, user } = await authService.loginUser({ email, password });
      res.status(200).json({ success: true, data: { token, user } });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }
      await authService.forgotPassword({ email });
      res.status(200).json({ success: true, message: 'If the email exists, a password reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token and new password are required.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      await authService.resetPassword({ token, newPassword });
      res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (err) {
      next(err);
    }
  }
};
