import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';

export class OrderController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await orderService.getAllOrders();
      const parsed = orders.map((o: any) => ({
        ...o,
        riskReasons: typeof o.riskReasons === 'string' ? JSON.parse(o.riskReasons) : o.riskReasons,
      }));
      res.json({
        success: true,
        data: parsed,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.json({
        success: true,
        data: {
          ...order,
          riskReasons: JSON.parse(order.riskReasons),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getRisk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const risk = await orderService.calculateRisk(req.params.id);
      res.json({
        success: true,
        data: risk,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
