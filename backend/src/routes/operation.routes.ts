import { Router } from 'express';
import { operationController } from '../controllers/operation.controller';
import { checkSchedulePermission } from '../middleware/rbac';

const router = Router();

router.get('/', (req, res, next) => operationController.getAll(req, res, next));
router.get('/:id', (req, res, next) => operationController.getById(req, res, next));
router.patch('/:id/reroute', checkSchedulePermission, (req, res, next) => operationController.reroute(req, res, next));
router.patch('/:id/reschedule', checkSchedulePermission, (req, res, next) => operationController.reschedule(req, res, next));

export default router;
