import { Router } from 'express';
import { OwnerApplicationController } from '../controllers/ownerApplicationController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Public submit endpoint
router.post('/submit', OwnerApplicationController.submit);

// Admin endpoints
router.get('/', adminAuth, OwnerApplicationController.list);
router.patch('/:id/status', adminAuth, OwnerApplicationController.updateStatus);

export default router;

