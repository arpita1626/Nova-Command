import { Router } from 'express';
import { qualityController } from '../controllers/quality.controller';
import { checkQualityPermission } from '../middleware/rbac';

const router = Router();

router.get('/inspections', (req, res, next) => qualityController.getAll(req, res, next));
router.get('/inspections/:id', (req, res, next) => qualityController.getById(req, res, next));
router.post('/inspections', checkQualityPermission, (req, res, next) => qualityController.create(req, res, next));

router.get('/corrective-actions', (req, res, next) => qualityController.getCorrectiveActions(req, res, next));
router.post('/corrective-actions', checkQualityPermission, (req, res, next) => qualityController.createCorrectiveAction(req, res, next));
router.patch('/corrective-actions/:id', checkQualityPermission, (req, res, next) => qualityController.updateCorrectiveAction(req, res, next));

export default router;
