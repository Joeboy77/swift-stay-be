import { Router } from 'express';
import { commissionController } from '../controllers/commissionController';
import { authenticateAdmin } from '../middleware/adminAuth';
import { requireAdminRole } from '../middleware/adminAuth';

const router = Router();

// Get commission settings (admin only)
router.get('/settings', authenticateAdmin, requireAdminRole(), commissionController.getCommissionSettings);

// Update commission settings (admin only)
router.put('/settings', authenticateAdmin, requireAdminRole(), commissionController.updateCommissionSettings);

// Calculate commission breakdown (admin only)
router.post('/calculate', authenticateAdmin, requireAdminRole(), commissionController.calculateCommission);

export default router;
