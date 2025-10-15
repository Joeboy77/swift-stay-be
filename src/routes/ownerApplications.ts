import { Router } from 'express';
import { OwnerApplicationController } from '../controllers/ownerApplicationController';
import { authenticateAdmin, requireAdminRole } from '../middleware/adminAuth';

const router = Router();

// Public submit endpoint
router.post('/submit', OwnerApplicationController.submit);

// Admin endpoints
router.get('/', authenticateAdmin, requireAdminRole(), OwnerApplicationController.list);
router.patch('/:id/status', authenticateAdmin, requireAdminRole(), OwnerApplicationController.updateStatus);

export default router;

