import { Router } from 'express';
import { procurementController } from '../controllers/procurement.controller';
import { checkInventoryPermission } from '../middleware/rbac';

const router = Router();

router.get('/orders', (req, res, next) => procurementController.getAll(req, res, next));
router.get('/orders/:id', (req, res, next) => procurementController.getById(req, res, next));
router.post('/orders', checkInventoryPermission, (req, res, next) => procurementController.create(req, res, next));
router.patch('/orders/:id/status', checkInventoryPermission, (req, res, next) => procurementController.updateStatus(req, res, next));

export default router;
