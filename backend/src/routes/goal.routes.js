import express from 'express';
import { goalController } from '../controllers/goalController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(verifyToken);

// Cycles
router.get('/cycles', goalController.getCycles);
router.post('/cycles', requireRole('hr'), goalController.createCycle);

// Goals Custom Routes
router.get('/my', goalController.getMyGoals);
router.get('/summary', requireRole('hr'), goalController.getGoalSummary);

// Key Results Progress Update
router.patch('/key-results/:id/progress', goalController.updateKeyResultProgress);

// Goal Progress Update
router.patch('/:id/progress', goalController.updateGoalProgress);

// Standard Goal CRUD
router.get('/', goalController.getAllGoals);
router.get('/:id', goalController.getGoalById);
router.post('/', requireRole('hr'), goalController.createGoal);
router.put('/:id', requireRole('hr'), goalController.updateGoal);
router.delete('/:id', requireRole('hr'), goalController.deleteGoal);

export default router;
