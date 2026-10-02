export type MachineStatus = 'running' | 'warning' | 'critical' | 'maintenance' | 'offline';

export interface TelemetryPoint {
  timestamp: string;
  temperature: number; // °C
  vibration: number; // mm/s
  energy: number; // kW
  rpm: number;
}

export interface Machine {
  id: string; // e.g. 'M-001'
  name: string;
  line: string;
  type: string;
  status: MachineStatus;
  utilization: number; // %
  healthScore: number; // 0-100
  temperature: number;
  vibration: number;
  vibrationThreshold: number; // baseline threshold e.g. 3.2 mm/s
  energy: number;
  currentOperationId?: string;
  currentOrderId?: string;
  activeWorkOrderId?: string;
  uptimeHours: number;
  downtimeHours: number;
  telemetryHistory: TelemetryPoint[];
  lastMaintenance: string;
  nextScheduledMaintenance: string;
  criticalIssue?: string;
}

export interface Operation {
  id: string; // e.g. 'OP-27'
  name: string;
  orderId: string;
  machineId: string;
  alternativeMachineId?: string;
  line: string;
  durationHours: number;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  status: 'scheduled' | 'in_progress' | 'delayed' | 'completed' | 'blocked';
  progressPct: number;
  delayHours: number;
  delayReason?: string;
  requiredSkill: string;
}

export type DeliveryRisk = 'low' | 'medium' | 'high';

export interface Order {
  id: string; // e.g. 'ORDER-1042'
  customer: string;
  product: string;
  quantity: number;
  valueUsd: number;
  orderDate: string;
  dueDate: string;
  status: 'planned' | 'in_production' | 'quality_check' | 'ready_to_ship' | 'delivered';
  materialReadiness: 'ready' | 'partial' | 'blocked';
  machineReadiness: 'ready' | 'at_risk' | 'blocked';
  deliveryRisk: DeliveryRisk;
  riskReasons: string[];
  currentOperationId?: string;
  penaltyPerDayUsd: number;
}

export interface Employee {
  id: string; // e.g. 'EMP-01'
  name: string;
  role: string;
  skills: string[];
  shift: 'Shift A (06:00 - 14:00)' | 'Shift B (14:00 - 22:00)' | 'Shift C (22:00 - 06:00)';
  availability: 'available' | 'assigned' | 'on_break' | 'offline';
  workloadPct: number;
  assignedLine: string;
  hoursWorkedThisWeek: number;
  currentTaskId?: string;
  avatarInitials: string;
}

export interface InventoryItem {
  id: string; // e.g. 'SP-104', 'MAT-021'
  name: string;
  category: 'raw_material' | 'component' | 'spare_part';
  unit: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  leadTimeDays: number;
  unitCostUsd: number;
  daysOfCover: number;
  stockoutRisk: 'low' | 'medium' | 'high';
  storageLocation: string;
  relatedMachineId?: string;
  description: string;
}

export interface InventoryTransaction {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  type: 'receipt' | 'issue' | 'reservation' | 'adjustment';
  quantity: number;
  referenceType: 'work_order' | 'purchase_order' | 'production_order' | 'manual';
  referenceId: string;
  performedBy: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string; // e.g. 'PO-901'
  supplier: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPriceUsd: number;
  totalPriceUsd: number;
  orderDate: string;
  expectedDelivery: string;
  status: 'requisition' | 'approved' | 'order_placed' | 'in_transit' | 'delivered';
  risk: 'low' | 'medium' | 'high';
  riskNotes?: string;
}

export interface MaintenanceWorkOrder {
  id: string; // e.g. 'WO-204'
  machineId: string;
  machineName: string;
  issue: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'corrective' | 'preventive';
  technicianId?: string;
  technicianName?: string;
  requiredSkill: string;
  sparePartIds: string[];
  sparePartsChecked: boolean;
  status: 'open' | 'assigned' | 'in_progress' | 'completed';
  created: string;
  dueDate: string;
  estimatedDurationHours: number;
  actualDurationHours?: number;
  notes: string;
}

export interface QualityInspection {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  line: string;
  batchId: string;
  productId: string;
  productName: string;
  inspectedUnits: number;
  defectUnits: number;
  defectRatePpm: number;
  spcSignal: 'in_control' | 'warning' | 'out_of_control';
  status: 'passed' | 'warning' | 'rejected';
  defects: { type: string; count: number }[];
  correctiveActionId?: string;
  notes?: string;
  evidence?: string;
  inspector?: string;
}

export interface CorrectiveAction {
  id: string;
  inspectionId: string;
  machineId: string;
  batchId: string;
  title: string;
  description: string;
  rootCause: string;
  status: 'open' | 'investigating' | 'implemented' | 'verified';
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  priority: 'critical' | 'high' | 'medium';
}

export interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
  affectedRecord: string;
  previousValue?: string;
  newValue?: string;
}

export interface Alert {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  impact: string;
  owner: string;
  recommendedAction: string;
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  relatedModule: 'machines' | 'maintenance' | 'production' | 'orders' | 'inventory' | 'quality' | 'workforce';
  targetId?: string;
}

export interface DecisionRecommendation {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium';
  targetEntity: string;
  category: 'machine_health' | 'schedule_conflict' | 'delivery_risk' | 'material_shortage';
  what: string;
  why: string;
  evidence: string;
  method: string;
  recommendedAction: string;
  estimatedImpact: string;
  status: 'pending' | 'reviewed' | 'applied' | 'dismissed';
  actionType: 'create_work_order' | 'reroute_operation' | 'expedite_procurement' | 'reassign_workforce';
  actionPayload?: Record<string, unknown>;
}

export interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  type: 'machine_offline' | 'urgent_order' | 'supplier_delay' | 'workforce_shortage' | 'custom';
  parameters: {
    machineId?: string;
    downtimeHours?: number;
    rerouteToMachineId?: string;
    expediteSparePart?: boolean;
    urgentOrderId?: string;
    delayedSupplierItemId?: string;
    supplierDelayDays?: number;
  };
  currentMetrics: ScenarioMetrics;
  simulatedMetrics: ScenarioMetrics;
  impactChain: {
    stage: string;
    description: string;
    severity: 'nominal' | 'warning' | 'critical';
  }[];
  consequences: {
    affectedOperations: string[];
    affectedOrders: string[];
    costDeltaUsd: number;
    delayDeltaHours: number;
    oeeDeltaPct: number;
  };
}

export interface ScenarioMetrics {
  productionOutputUnits: number;
  oeePct: number;
  activeOrders: number;
  ordersAtRisk: number;
  machineAvailabilityPct: number;
  estimatedDowntimeHours: number;
  laborOvertimeCostUsd: number;
  totalCostUsd: number;
  onTimeDeliveryPct: number;
}
