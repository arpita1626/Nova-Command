import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

import systemRoutes from './routes/system.routes';
import machineRoutes from './routes/machine.routes';
import operationRoutes from './routes/operation.routes';
import orderRoutes from './routes/order.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import inventoryRoutes from './routes/inventory.routes';
import procurementRoutes from './routes/procurement.routes';
import qualityRoutes from './routes/quality.routes';
import alertRoutes from './routes/alert.routes';
import decisionRoutes from './routes/decision.routes';
import whatIfRoutes from './routes/whatif.routes';
import workforceRoutes from './routes/workforce.routes';
import auditRoutes from './routes/audit.routes';

export const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

// Service Root
app.get('/api', (req, res) => {
  res.json({
    service: 'NOVA COMMAND Backend API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      system: '/api/system (status, health, reset)',
      machines: '/api/machines (telemetry, status, anomaly)',
      operations: '/api/operations (rescheduling, rerouting)',
      orders: '/api/orders (delivery risk, SLA impact)',
      maintenance: '/api/maintenance/work-orders (lifecycle, technician, spare parts)',
      inventory: '/api/inventory (stock ledger, transactions)',
      procurement: '/api/procurement/orders (POs, goods receipts)',
      quality: '/api/quality/inspections (metrology, SPC signals)',
      alerts: '/api/alerts (prioritized operational tasks)',
      decisions: '/api/decisions/recommendations (explainable recommendations)',
      whatIf: '/api/what-if (simulator, scenarios, commit)',
      workforce: '/api/workforce (employees, users, role management)',
    },
    timestamp: new Date().toISOString(),
  });
});

// Domain Routes
app.use('/api/system', systemRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/what-if', whatIfRoutes);
app.use('/api/workforce', workforceRoutes);
app.use('/api/audit-logs', auditRoutes);

// 404 Handler for /api routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handler
app.use(errorHandler);
