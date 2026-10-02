/**
 * NOVA COMMAND Unified Manufacturing Operations API Service
 * Encapsulates all backend REST calls, data aggregation, and telemetry contracts.
 */
import {
  Machine,
  MachineStatus,
  Operation,
  Order,
  Employee,
  InventoryItem,
  InventoryTransaction,
  PurchaseOrder,
  MaintenanceWorkOrder,
  QualityInspection,
  Alert,
  DecisionRecommendation,
  WhatIfScenario,
} from '../types';
import { AppUser, UserRole } from '../types/auth';
import { AuditLog, CorrectiveAction } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || '';

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  timestamp: string;
}

let currentAuthContext = {
  role: 'ADMIN',
  id: 'user-admin',
  name: 'Admin User',
};

export function setApiAuthContext(user: { role: string; id: string; name: string }) {
  currentAuthContext = {
    role: user.role,
    id: user.id,
    name: user.name,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-user-role': currentAuthContext.role,
    'x-user-id': currentAuthContext.id,
    'x-user-name': currentAuthContext.name,
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const json: ApiEnvelope<T> = await response.json();
  if (json.success === false && json.error) {
    throw new Error(json.error);
  }
  return json.data;
}

export const ApiService = {
  baseUrl: API_BASE_URL,

  // System & Health
  getSystemStatus: () =>
    request<{
      plantStatus: string;
      activeShift: string;
      plantTime: string;
      lastUpdated: string;
      dataSource: string;
      environment: string;
      committedPlanVersion: number;
      demoStep: number;
      selectedMachineId: string;
      selectedOrderId: string;
    }>('/api/system/status'),

  getSystemHealth: () =>
    request<{
      status: string;
      uptime: number;
      database: string;
      stats: Record<string, number>;
    }>('/api/system/health'),

  resetSystemData: () =>
    request<{ systemState: unknown; stats: unknown }>('/api/system/reset', {
      method: 'POST',
    }),

  // Machines
  getMachines: () => request<Machine[]>('/api/machines'),
  getMachineById: (id: string) => request<Machine>(`/api/machines/${id}`),
  updateMachineStatus: (id: string, status: MachineStatus) =>
    request<Machine>(`/api/machines/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  addMachineTelemetry: (
    id: string,
    point: { temperature: number; vibration: number; energy?: number; rpm?: number }
  ) =>
    request<unknown>(`/api/machines/${id}/telemetry`, {
      method: 'POST',
      body: JSON.stringify(point),
    }),
  getMachineAnomaly: (id: string) =>
    request<{
      currentVal: number;
      baseline: number;
      deviationPct: number;
      isExceeded: boolean;
      status: string;
      severity: string;
    }>(`/api/machines/${id}/anomaly`),

  // Operations
  getOperations: () => request<Operation[]>('/api/operations'),
  getOperationById: (id: string) => request<Operation>(`/api/operations/${id}`),
  rerouteOperation: (id: string, targetMachineId: string) =>
    request<Operation>(`/api/operations/${id}/reroute`, {
      method: 'PATCH',
      body: JSON.stringify({ targetMachineId }),
    }),

  // Orders
  getOrders: () => request<Order[]>('/api/orders'),
  getOrderById: (id: string) => request<Order>(`/api/orders/${id}`),
  getOrderRisk: (id: string) =>
    request<{ score: number; level: 'low' | 'medium' | 'high'; factors: string[] }>(
      `/api/orders/${id}/risk`
    ),

  // Maintenance Work Orders
  getWorkOrders: () => request<MaintenanceWorkOrder[]>('/api/maintenance/work-orders'),
  getWorkOrderById: (id: string) =>
    request<MaintenanceWorkOrder>(`/api/maintenance/work-orders/${id}`),
  createWorkOrder: (wo: Partial<MaintenanceWorkOrder>) =>
    request<MaintenanceWorkOrder>('/api/maintenance/work-orders', {
      method: 'POST',
      body: JSON.stringify(wo),
    }),
  assignTechnician: (workOrderId: string, employeeId: string) =>
    request<MaintenanceWorkOrder>(`/api/maintenance/work-orders/${workOrderId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    }),
  startWorkOrder: (workOrderId: string) =>
    request<MaintenanceWorkOrder>(`/api/maintenance/work-orders/${workOrderId}/start`, {
      method: 'POST',
    }),
  completeWorkOrder: (workOrderId: string) =>
    request<MaintenanceWorkOrder>(`/api/maintenance/work-orders/${workOrderId}/complete`, {
      method: 'POST',
    }),

  // Inventory & Transactions
  getInventory: () => request<InventoryItem[]>('/api/inventory'),
  getInventoryItemById: (id: string) => request<InventoryItem>(`/api/inventory/${id}`),
  getInventoryTransactions: () =>
    request<InventoryTransaction[]>('/api/inventory/transactions'),
  createInventoryTransaction: (tx: Partial<InventoryTransaction>) =>
    request<{ item: InventoryItem; transaction: InventoryTransaction }>(
      '/api/inventory/transactions',
      {
        method: 'POST',
        body: JSON.stringify(tx),
      }
    ),

  // Procurement
  getPurchaseOrders: () => request<PurchaseOrder[]>('/api/procurement/orders'),
  getPurchaseOrderById: (id: string) => request<PurchaseOrder>(`/api/procurement/orders/${id}`),
  createPurchaseOrder: (data: {
    supplier: string;
    itemId: string;
    quantity: number;
    unitPriceUsd: number;
    expectedDelivery: string;
    notes?: string;
  }) =>
    request<PurchaseOrder>('/api/procurement/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder['status']) =>
    request<PurchaseOrder>(`/api/procurement/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Quality Inspections
  getQualityInspections: () => request<QualityInspection[]>('/api/quality/inspections'),
  getQualityInspectionById: (id: string) =>
    request<QualityInspection>(`/api/quality/inspections/${id}`),
  createQualityInspection: (qi: Partial<QualityInspection>) =>
    request<QualityInspection>('/api/quality/inspections', {
      method: 'POST',
      body: JSON.stringify(qi),
    }),

  // Alerts
  getAlerts: () => request<Alert[]>('/api/alerts'),
  getAlertById: (id: string) => request<Alert>(`/api/alerts/${id}`),
  updateAlertStatus: (id: string, status: Alert['status']) =>
    request<Alert>(`/api/alerts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Decision Recommendations
  getRecommendations: () => request<DecisionRecommendation[]>('/api/decisions/recommendations'),
  getRecommendationById: (id: string) =>
    request<DecisionRecommendation>(`/api/decisions/recommendations/${id}`),
  updateRecommendationStatus: (id: string, status: DecisionRecommendation['status']) =>
    request<DecisionRecommendation>(`/api/decisions/recommendations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // What-If Simulator
  getWhatIfScenario: () => request<WhatIfScenario>('/api/what-if/scenarios'),
  simulateWhatIf: (params: Partial<WhatIfScenario['parameters']>) =>
    request<WhatIfScenario>('/api/what-if/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  commitWhatIfPlan: () =>
    request<{ committedPlanVersion: number; status: string; message: string }>(
      '/api/what-if/commit',
      {
        method: 'POST',
      }
    ),

  rescheduleOperation: (id: string, updates: Partial<Operation>) =>
    request<Operation>(`/api/operations/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Quality Corrective Actions
  getCorrectiveActions: () => request<CorrectiveAction[]>('/api/quality/corrective-actions'),
  createCorrectiveAction: (ca: Partial<CorrectiveAction>) =>
    request<CorrectiveAction>('/api/quality/corrective-actions', {
      method: 'POST',
      body: JSON.stringify(ca),
    }),
  updateCorrectiveActionStatus: (id: string, status: string) =>
    request<CorrectiveAction>(`/api/quality/corrective-actions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Audit Logs
  getAuditLogs: () => request<AuditLog[]>('/api/audit-logs'),
  createAuditLog: (entry: Partial<AuditLog>) =>
    request<AuditLog>('/api/audit-logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  // Workforce & Users
  getEmployees: () => request<Employee[]>('/api/workforce/employees'),
  getEmployeeById: (id: string) => request<Employee>(`/api/workforce/employees/${id}`),
  getUsers: () => request<AppUser[]>('/api/workforce/users'),
  createUser: (user: AppUser) =>
    request<AppUser>('/api/workforce/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  updateUserRole: (userId: string, role: UserRole) =>
    request<AppUser>(`/api/workforce/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  // Bulk Fetch all operational entities in parallel
  fetchAllOperationalState: async () => {
    const [
      systemStatus,
      machines,
      operations,
      orders,
      employees,
      inventory,
      transactions,
      purchaseOrders,
      workOrders,
      qualityInspections,
      alerts,
      recommendations,
      whatIfScenario,
      users,
      auditLogs,
      correctiveActions,
    ] = await Promise.all([
      ApiService.getSystemStatus(),
      ApiService.getMachines(),
      ApiService.getOperations(),
      ApiService.getOrders(),
      ApiService.getEmployees(),
      ApiService.getInventory(),
      ApiService.getInventoryTransactions(),
      ApiService.getPurchaseOrders(),
      ApiService.getWorkOrders(),
      ApiService.getQualityInspections(),
      ApiService.getAlerts(),
      ApiService.getRecommendations(),
      ApiService.getWhatIfScenario(),
      ApiService.getUsers(),
      ApiService.getAuditLogs().catch(() => []),
      ApiService.getCorrectiveActions().catch(() => []),
    ]);

    return {
      systemStatus,
      machines,
      operations,
      orders,
      employees,
      inventory,
      inventoryTransactions: transactions,
      purchaseOrders,
      workOrders,
      qualityInspections,
      alerts,
      recommendations,
      whatIfScenario,
      users,
      auditLogs: auditLogs || [],
      correctiveActions: correctiveActions || [],
    };
  },

  // Client-side helper computations
  calculateVibrationAnomaly: (currentVal: number, baseline: number) => {
    const deviationPct = ((currentVal - baseline) / baseline) * 100;
    const isExceeded = currentVal > baseline;
    return {
      deviationPct: Number(deviationPct.toFixed(1)),
      isExceeded,
      status: isExceeded ? 'Abnormal Exceedance' : 'Nominal Toleranced Range',
      severity: currentVal > baseline * 1.4 ? 'critical' : currentVal > baseline ? 'warning' : 'nominal',
    };
  },

  calculateOrderRiskScore: (order: Order, machine?: Machine, operation?: Operation) => {
    let score = 0;
    const factors: string[] = [];

    if (machine && (machine.status === 'warning' || machine.status === 'critical' || machine.status === 'maintenance')) {
      score += 45;
      factors.push(`Machine ${machine.id} status is ${machine.status.toUpperCase()}`);
    }

    if (operation && operation.delayHours > 0) {
      score += Math.min(40, operation.delayHours * 7);
      factors.push(`Operation ${operation.id} delayed by ${operation.delayHours}h`);
    }

    if (order.materialReadiness === 'partial') {
      score += 20;
      factors.push('Raw material safety buffer below threshold');
    } else if (order.materialReadiness === 'blocked') {
      score += 45;
      factors.push('Raw material stockout blocked');
    }

    return {
      score: Math.min(100, score),
      level: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low',
      factors,
    };
  },
};
