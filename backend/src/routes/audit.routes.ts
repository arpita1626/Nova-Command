import { Router, Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';
import { extractAuthContext } from '../middleware/rbac';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await auditService.getAll();
    res.json({
      success: true,
      data: logs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, module, affectedRecord, previousValue, newValue } = req.body;
    const auth = extractAuthContext(req);

    if (!action || !module || !affectedRecord) {
      res.status(400).json({
        success: false,
        error: 'action, module, and affectedRecord are required',
      });
      return;
    }

    const recorded = await auditService.record({
      user: req.body.user || auth.name,
      role: req.body.role || auth.role,
      action,
      module,
      affectedRecord,
      previousValue,
      newValue,
    });

    res.status(201).json({
      success: true,
      data: recorded,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
