import React, { useState } from 'react';
import {
  CalendarRange,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Wrench,
  GitFork,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';

export const ProductionPlannerDashboard: React.FC = () => {
  const {
    operations,
    orders,
    machines,
    inventory,
    workOrders,
    setActiveTab,
    setSelectedOrderId,
    setSelectedMachineId,
    rescheduleOperation,
    rerouteOperation,
    submitPlanForApproval,
    auditLogs,
    plantShift,
    committedPlanVersion,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  // Modals
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedOpId, setSelectedOpId] = useState('OP-27');
  const [newStart, setNewStart] = useState('14:30');
  const [newEnd, setNewEnd] = useState('18:00');
  const [targetMachineId, setTargetMachineId] = useState('M-006');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [planTitle, setPlanTitle] = useState(`Revised Shift Plan V${committedPlanVersion}.1 - M-006 Standby Integration`);
  const [planNotes, setPlanNotes] = useState('Reroutes OP-27 off vibration-compromised M-004 to Mazak M-006 standby to restore SLA on ORDER-1042 & 1048.');

  // KPI Calculations
  const totalOperations = operations.length;
  const completedOps = operations.filter((o) => o.status === 'completed').length;
  const inProgressOps = operations.filter((o) => o.status === 'in_progress').length;
  const delayedOps = operations.filter((o) => o.status === 'delayed' || o.delayHours > 0);
  const blockedOps = operations.filter((o) => o.status === 'blocked');
  
  const completionPct = totalOperations > 0 
    ? Math.round(((completedOps + (inProgressOps * 0.5)) / totalOperations) * 100) 
    : 0;

  const totalCapacityHours = machines.length * 8; // 8h shift
  const runningMachines = machines.filter((m) => m.status === 'running').length;
  const machineAvailabilityPct = Math.round((runningMachines / (machines.length || 1)) * 100);

  const atRiskOrders = orders.filter((o) => o.deliveryRisk === 'high' || o.deliveryRisk === 'medium');
  const delayedOrders = orders.filter((o) => o.deliveryRisk === 'high');

  // Material readiness breakdown
  const materialReadyCount = orders.filter((o) => o.materialReadiness === 'ready').length;
  const materialPartialCount = orders.filter((o) => o.materialReadiness === 'partial').length;
  const materialBlockedCount = orders.filter((o) => o.materialReadiness === 'blocked').length;

  // Maintenance impact
  const activeWorkOrders = workOrders.filter((w) => w.status !== 'completed');

  const handleExecuteReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (targetMachineId) {
        await rerouteOperation(selectedOpId, targetMachineId);
      }
      await rescheduleOperation(selectedOpId, {
        scheduledStart: newStart,
        scheduledEnd: newEnd,
      });
      setShowRescheduleModal(false);
    } catch {
      // toast handles notification
    }
  };

  const handleExecuteApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPlanForApproval(planTitle, planNotes);
    setShowApprovalModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Dashboard Top Banner */}
      <div
        className="p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              Role Dashboard
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {plantShift} · Plan V{committedPlanVersion}.0
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Production Planner Command
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Schedule optimization, line capacity balancing, material staging, and order priority orchestration
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowRescheduleModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Reschedule Jobs</span>
          </button>
          <button
            onClick={() => setActiveTab('what-if')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <GitFork className="h-3.5 w-3.5" />
            <span>What-If Simulator</span>
          </button>
          <button
            onClick={() => setShowApprovalModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-xs shadow-2xs transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <Send className="h-3.5 w-3.5 text-sky-500" />
            <span>Submit for Approval</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (10 Core Metrics requested) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* 1. Today's Production Completion % */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Completion Rate</span>
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            {completionPct}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* 2. Scheduled Orders */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Scheduled Orders</span>
            <Layers className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
            {orders.length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Active in Shop Floor
          </span>
        </div>

        {/* 3. Machine Availability */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Machine Availability</span>
            <Activity className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-sky-600 dark:text-sky-400 font-mono">
            {machineAvailabilityPct}%
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {runningMachines} of {machines.length} operational
          </span>
        </div>

        {/* 4. Delayed Orders */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Delayed Orders</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-rose-600 dark:text-rose-400 font-mono">
            {delayedOrders.length}
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
            {delayedOps.length} delayed operations
          </span>
        </div>

        {/* 5. At-Risk Orders */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>At-Risk Orders</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400 font-mono">
            {atRiskOrders.length}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            Penalty exposure active
          </span>
        </div>
      </div>

      {/* Row 2: Today's Production Plan & Planned vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Production Plan Table */}
        <div
          className="lg:col-span-2 p-5 rounded-2xl border space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Today's Production Plan & Operation Sequences
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('production')}
              className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Gantt Schedule</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-[10px] uppercase font-bold text-left" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <th className="py-2 px-2">Job ID</th>
                  <th className="py-2 px-2">Order</th>
                  <th className="py-2 px-2">Assigned Machine</th>
                  <th className="py-2 px-2">Timeline</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Delay</th>
                  <th className="py-2 px-2 text-right">Planner Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {operations.map((op) => {
                  const machine = machines.find((m) => m.id === op.machineId);
                  const isDelayed = op.delayHours > 0 || op.status === 'delayed' || op.status === 'blocked';
                  return (
                    <tr
                      key={op.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                        isDelayed ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2 font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                        {op.id}
                      </td>
                      <td className="py-2.5 px-2 font-medium">
                        <button
                          onClick={() => {
                            setSelectedOrderId(op.orderId);
                            setActiveTab('orders');
                          }}
                          className="hover:text-blue-600 dark:hover:text-sky-400 font-mono text-[11px] cursor-pointer"
                        >
                          {op.orderId}
                        </button>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              machine?.status === 'running'
                                ? 'bg-emerald-500'
                                : machine?.status === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-semibold">{machine?.name || op.machineId}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {op.scheduledStart} - {op.scheduledEnd}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            op.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : op.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-cyan-300'
                              : isDelayed
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {op.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono">
                        {op.delayHours > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            +{op.delayHours}h
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            0.0h
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => {
                            setSelectedOpId(op.id);
                            setTargetMachineId(op.alternativeMachineId || 'M-006');
                            setNewStart(op.scheduledStart);
                            setNewEnd(op.scheduledEnd);
                            setShowRescheduleModal(true);
                          }}
                          className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 cursor-pointer"
                        >
                          Reschedule
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Planned vs Actual & Machine Capacity Column */}
        <div className="space-y-5">
          {/* Planned vs Actual Production Progress */}
          <div
            className="p-5 rounded-2xl border space-y-3 shadow-sm"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Sliders className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
              Planned vs Actual Production
            </h3>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Shift Output Target</span>
                  <span className="font-bold">486 Units</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Actual Output Logged</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">392 Units (-19%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: '80.6%' }} title="Actual: 392 units" />
                  <div className="bg-rose-500/50 h-full" style={{ width: '19.4%' }} title="Gap: 94 units" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border text-xs space-y-1.5" style={{ borderColor: 'var(--border)' }}>
                <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase">
                  Root Cause of Planned Variance
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Machine M-004 vibration limit throttling caused a 60% feed-rate reduction on OP-27, creating a 5.5-hour cascade delay on Order ORDER-1042.
                </p>
                <button
                  onClick={() => setActiveTab('what-if')}
                  className="text-[11px] text-blue-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>Simulate Rerouting in What-If Engine</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Machine Capacity & Allocation */}
          <div
            className="p-5 rounded-2xl border space-y-3 shadow-sm"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Machine Capacity Allocation
              </h3>
              <button
                onClick={() => setActiveTab('machines')}
                className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
              >
                View Machines
              </button>
            </div>

            <div className="space-y-2.5">
              {machines.slice(0, 4).map((m) => (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{m.id} ({m.name.split(' ')[0]})</span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{m.utilization}% load</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.utilization > 90
                          ? 'bg-rose-500'
                          : m.utilization > 75
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${m.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Material Readiness & Upcoming Maintenance Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Material Readiness Section */}
        <div
          className="p-5 rounded-2xl border space-y-3 shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Material Readiness for Production Orders
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
            >
              Inventory Ledger
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-1">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold">100% Staged</span>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">{materialReadyCount} Orders</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-bold">Partial Staging</span>
              <div className="text-lg font-black text-amber-700 dark:text-amber-400">{materialPartialCount} Orders</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
              <span className="text-[10px] text-rose-700 dark:text-rose-300 uppercase font-bold">Stockout Risk</span>
              <div className="text-lg font-black text-rose-700 dark:text-rose-400">{materialBlockedCount} Orders</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                className="p-2.5 rounded-lg border text-xs flex items-center justify-between"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
              >
                <div>
                  <span className="font-bold">{ord.id}</span> · {ord.product}
                  <div className="text-[10px] text-slate-500">{ord.customer} · Due {ord.dueDate}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    ord.materialReadiness === 'ready'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : ord.materialReadiness === 'partial'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}
                >
                  {ord.materialReadiness}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Maintenance Impact */}
        <div
          className="p-5 rounded-2xl border space-y-3 shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Upcoming Maintenance Schedule Impact
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
            >
              Work Orders
            </button>
          </div>

          <div className="space-y-2.5">
            {activeWorkOrders.length > 0 ? (
              activeWorkOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="p-3 rounded-xl border text-xs space-y-1.5"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{wo.id}: {wo.machineName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                      {wo.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {wo.issue}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Est. Downtime: {wo.estimatedDurationHours}h</span>
                    <span>Assigned: {wo.technicianName || 'Unassigned'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No active maintenance downtime impacting schedules.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Role Actions & Audit Trail */}
      <div
        className="p-5 rounded-2xl border space-y-3 shadow-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <Activity className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            Recent Production Planning Audit Trail
          </h3>
          <button
            onClick={() => setActiveTab('decision-center')}
            className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
          >
            Decision Center
          </button>
        </div>

        <div className="space-y-2">
          {auditLogs
            .filter((l) => l.module.toLowerCase().includes('production') || l.role === 'PRODUCTION_PLANNER')
            .slice(0, 4)
            .map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{log.user}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {log.role}
                    </span>
                    <span className="text-[10px] text-slate-400">· {log.module}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{log.action}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className="border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Reschedule & Reroute Job
              </h3>
              <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleExecuteReschedule} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Select Operation / Job:</label>
                <select
                  value={selectedOpId}
                  onChange={(e) => setSelectedOpId(e.target.value)}
                  className="w-full p-2 rounded-lg border font-mono"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {operations.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.id} ({op.name}) - {op.orderId} (Current: {op.machineId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Assign Machine:</label>
                <select
                  value={targetMachineId}
                  onChange={(e) => setTargetMachineId(e.target.value)}
                  className="w-full p-2 rounded-lg border font-mono"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} - {m.name} ({m.status.toUpperCase()}, {m.utilization}% load)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">New Start Time:</label>
                  <input
                    type="text"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    placeholder="14:30"
                    className="w-full p-2 rounded-lg border font-mono"
                    style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">New End Time:</label>
                  <input
                    type="text"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    placeholder="18:00"
                    className="w-full p-2 rounded-lg border font-mono"
                    style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Confirm Schedule Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className="border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Send className="h-4 w-4 text-sky-500" />
                Submit Plan for Manager Approval
              </h3>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleExecuteApproval} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Plan Title:</label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Impact & Rationale Summary:</label>
                <textarea
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                  rows={4}
                  className="w-full p-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Submit to Plant Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
