import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  Package,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Boxes,
  Bell,
  ArrowRight,
  Sparkles,
  GitFork,
  BarChart2,
  Layers,
  ChevronDown,
  ChevronUp,
  Eye,
  Sliders,
  Users,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { ConnectedImpactBanner } from '../layout/ConnectedImpactBanner';
import { formatCurrency } from '../../services/currency';

export const CommandCenter: React.FC = () => {
  const {
    machines,
    orders,
    inventory,
    workOrders,
    employees,
    alerts,
    operations,
    setActiveTab,
    setSelectedMachineId,
    setSelectedOrderId,
    createWorkOrder,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  // Level 3 technical disclosure toggle
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Core calculations
  const m4 = machines.find((m) => m.id === 'M-004');
  const runningMachines = machines.filter((m) => m.status === 'running').length;
  const criticalMachines = machines.filter((m) => m.status === 'warning' || m.status === 'critical').length;

  const ordersAtRisk = orders.filter((o) => o.deliveryRisk === 'high');

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.priority === 'critical');

  const lowStockItems = inventory.filter((i) => i.stockoutRisk === 'high');
  const activeM4WO = workOrders.find((w) => w.machineId === 'M-004' && w.status !== 'completed');
  const op27 = operations.find((o) => o.id === 'OP-27');
  const isRerouted = op27?.machineId === 'M-006';

  const hasIssues = criticalMachines > 0 || ordersAtRisk.length > 0;

  // The 6 Most Important KPIs required by UX Constitution
  const primaryKpis = [
    {
      id: 'production',
      name: 'Production',
      number: '432 units',
      status: 'Near Target (96%)',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      trend: '↓ 4% vs daily target',
      trendType: 'down' as const,
      explanation: '432 of 450 units produced today; Line 2 throttled by M-004',
      icon: Cpu,
      accentColor: 'text-blue-600 dark:text-blue-400',
      action: () => setActiveTab('production'),
    },
    {
      id: 'machines',
      name: 'Machines',
      number: `${runningMachines} / ${machines.length} Online`,
      status: criticalMachines > 0 ? '1 Needs Attention' : 'All Nominal',
      statusColor: criticalMachines > 0
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      trend: criticalMachines > 0 ? '↓ 1 machine warning' : '↑ Stable',
      trendType: criticalMachines > 0 ? ('down' as const) : ('up' as const),
      explanation: criticalMachines > 0
        ? 'Lathe M-004 vibration is 4.85 mm/s, exceeding prototype threshold'
        : 'All 6 machine cells operating within nominal parameters',
      icon: Activity,
      accentColor: criticalMachines > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      action: () => {
        setSelectedMachineId('M-004');
        setActiveTab('machines');
      },
    },
    {
      id: 'orders',
      name: 'Orders',
      number: `${ordersAtRisk.length} At Risk`,
      status: ordersAtRisk.length > 0 ? 'Delivery Attention Needed' : 'On Schedule',
      statusColor: ordersAtRisk.length > 0
        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      trend: ordersAtRisk.length > 0 ? '↑ 1 from yesterday' : '↓ 0 delayed',
      trendType: ordersAtRisk.length > 0 ? ('down' as const) : ('up' as const),
      explanation: ordersAtRisk.length > 0
        ? '2 orders affected by machine downtime and OP-27 bottleneck'
        : 'All active customer orders on track for delivery SLA',
      icon: Package,
      accentColor: ordersAtRisk.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
      action: () => setActiveTab('orders'),
    },
    {
      id: 'quality',
      name: 'Quality',
      number: '98.2%',
      status: 'Spec Target (99%)',
      statusColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
      trend: '↓ 0.8% PPM deviation',
      trendType: 'down' as const,
      explanation: 'Batch B-8821 on M-004 exhibits minor surface roughness chatter',
      icon: CheckCircle,
      accentColor: 'text-cyan-600 dark:text-cyan-400',
      action: () => setActiveTab('quality'),
    },
    {
      id: 'inventory',
      name: 'Inventory',
      number: `${inventory.length - lowStockItems.length} / ${inventory.length} Stocked`,
      status: lowStockItems.length > 0 ? '1 Buffer Low' : 'Optimal Buffers',
      statusColor: lowStockItems.length > 0
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      trend: lowStockItems.length > 0 ? '1 Reorder Pending' : '↑ 100% Ready',
      trendType: lowStockItems.length > 0 ? ('down' as const) : ('up' as const),
      explanation: 'SP-104 bearing on hand (2 units); Titanium billet PO-902 in transit',
      icon: Boxes,
      accentColor: lowStockItems.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      action: () => setActiveTab('inventory'),
    },
    {
      id: 'alerts',
      name: 'Alerts',
      number: `${activeAlerts.length} Active`,
      status: criticalAlerts.length > 0 ? `${criticalAlerts.length} Critical Action` : 'Nominal Feed',
      statusColor: criticalAlerts.length > 0
        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      trend: criticalAlerts.length > 0 ? '↑ Action required now' : 'All Acknowledged',
      trendType: criticalAlerts.length > 0 ? ('down' as const) : ('up' as const),
      explanation: criticalAlerts.length > 0
        ? 'Spindle bearing wear on M-004 requires technician dispatch'
        : 'No unhandled critical alarms across plant sensors',
      icon: Bell,
      accentColor: criticalAlerts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500',
      action: () => setActiveTab('alerts'),
    },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* ============================================================== */}
      {/* LEVEL 1: CRITICAL FACTORY STATUS & ACTION-FIRST DESIGN          */}
      {/* ============================================================== */}

      {/* Beginner-Friendly Greeting & Factory Status */}
      <div
        className="p-5 rounded-2xl border shadow-sm transition-all"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
              <span>Shift A · Plant Operations</span>
              <span>•</span>
              <span>Prototype Estimate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Good morning. Here's what's happening.
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Overall Factory Status:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                  hasIssues
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                    : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    hasIssues ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                {hasIssues ? 'Attention Required' : 'Operational'}
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">
                — {hasIssues
                  ? 'Line 2 Lathe M-004 has abnormal vibration; 2 customer orders have delivery risk.'
                  : 'All machines nominal and orders on track.'}
              </span>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('what-if')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <GitFork className="h-4 w-4" />
              <span>Launch What-If Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('decision-center')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border font-semibold text-xs transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>AI Recommendations</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACTION-FIRST PROBLEM CARD: When M-004 needs attention */}
      {m4 && (m4.status === 'warning' || m4.status === 'critical' || !isRerouted) && (
        <div
          className="rounded-2xl p-5 border-2 shadow-sm transition-all"
          style={{
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.10)' : '#FFFBEB',
            borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FCD34D',
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">
                    ⚠ Machine M-004 needs attention
                  </h3>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-400 dark:border-amber-700">
                    Priority Action
                  </span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-100/90 leading-relaxed max-w-3xl">
                  Vibration is above the prototype threshold (<strong>4.85 mm/s</strong> vs <strong>4.0 mm/s</strong> limit). If unaddressed, bearing wear risks spindle seizure and will delay <strong>2 customer orders (₹2,45,000 value)</strong> by 5.5 hours.
                </p>
                <div className="text-[11px] text-amber-800 dark:text-amber-300/80 font-medium pt-0.5">
                  Core Principle: <em>Show what matters → Explain why → Suggest what to do</em>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons - Never force users to search */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSelectedMachineId('M-004');
                  setActiveTab('machines');
                }}
                className="px-3.5 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <Eye className="h-4 w-4 text-blue-500" />
                <span>View Machine</span>
              </button>

              {activeM4WO ? (
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="px-3.5 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Wrench className="h-4 w-4 text-amber-500" />
                  <span>View Work Order ({activeM4WO.id})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    createWorkOrder({
                      machineId: 'M-004',
                      issue: 'Spindle bearing vibration exceeded prototype threshold (4.85 mm/s)',
                      priority: 'critical',
                      technicianId: 'EMP-01',
                      technicianName: 'Marcus Vance',
                      sparePartIds: ['SP-104'],
                    });
                    setActiveTab('maintenance');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Create Work Order</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('what-if')}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <GitFork className="h-4 w-4" />
                <span>Run What-If</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED CONSEQUENCES PIPELINE */}
      <ConnectedImpactBanner />

      {/* ============================================================== */}
      {/* 6 MOST IMPORTANT KPIS: Number, Status, Trend, Short Explanation */}
      {/* ============================================================== */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
            Factory Vital Signs
          </h2>
          <span className="text-[11px] text-slate-700 dark:text-slate-400 font-medium">Click any card to inspect module</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {primaryKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <button
                key={kpi.id}
                onClick={kpi.action}
                className="text-left p-4 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.01] flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                        <Icon className={`h-4 w-4 ${kpi.accentColor}`} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        {kpi.name}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${kpi.statusColor}`}>
                      {kpi.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {kpi.number}
                    </span>

                    <span
                      className={`text-xs font-bold flex items-center gap-0.5 ${
                        kpi.trendType === 'up'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {kpi.trendType === 'up' ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      <span>{kpi.trend}</span>
                    </span>
                  </div>
                </div>

                <div
                  className="mt-3 pt-2.5 border-t text-xs leading-relaxed"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {kpi.explanation}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LEVEL 2: SUPPORTING FACTORY FLOW & CONTEXT                     */}
      {/* ============================================================== */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
            Level 2: Active Production & Resource Flow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Production Overview */}
          <div
            className="rounded-xl p-4 border shadow-xs"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Production Overview
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('production')}
                className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
              >
                Gantt <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>Daily Target Progress</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>432 / 450 units (96%)</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: '96%' }} />
                </div>
              </div>

              <div className="pt-1 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Line 1 Milling:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">94% capacity · On Time</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Line 2 Heavy:</span>
                  <span className={isRerouted ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
                    {isRerouted ? 'OP-27 on M-006 · Recovered' : 'OP-27 throttled (+5.5h)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-secondary)' }}>Line 3 QA CMM:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">91% capacity · Nominal</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Customer Orders at Risk */}
          <div
            className="rounded-xl p-4 border shadow-xs"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Orders at Risk
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
              >
                All Orders <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {orders.slice(0, 3).map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    setSelectedOrderId(o.id);
                    setActiveTab('orders');
                  }}
                  className="p-2.5 rounded-lg border transition-all cursor-pointer text-xs"
                  style={{
                    backgroundColor: o.deliveryRisk === 'high'
                      ? isDark
                        ? 'rgba(239, 68, 68, 0.12)'
                        : '#FEF2F2'
                      : 'var(--surface-secondary)',
                    borderColor: o.deliveryRisk === 'high'
                      ? isDark
                        ? 'rgba(239, 68, 68, 0.4)'
                        : '#FECACA'
                      : 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{o.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        o.deliveryRisk === 'high'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {o.deliveryRisk} Risk
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    <span className="truncate max-w-[130px]">{o.customer}</span>
                    <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(o.valueUsd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Maintenance & Inventory Readiness */}
          <div
            className="rounded-xl p-4 border shadow-xs"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Maintenance & Parts
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
              >
                Work Orders <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div
                className="p-2.5 rounded-lg border flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>SP-104 Ceramic Bearing</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Critical spare for M-004</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">2 on hand</span>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>1 Reserved</div>
                </div>
              </div>

              <div
                className="p-2.5 rounded-lg border flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Marcus Vance</div>
                  <div className="text-[10px] text-blue-600 dark:text-cyan-400">Senior Tech (Shift A)</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-bold">
                  Assigned to M-004
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LEVEL 3: DETAILED TECHNICAL INFORMATION (COLLAPSIBLE)          */}
      {/* ============================================================== */}
      <div
        className="rounded-2xl border transition-all shadow-xs overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Level 3: Detailed Technical Diagnostics & Telemetry
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Sensor spectra, CMM inspection SPC charts, and workforce hours
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-cyan-400">
            <span>{showTechnicalDetails ? 'Hide Technical Details' : 'Show Technical Details'}</span>
            {showTechnicalDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Telemetry Stream */}
              <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <div className="font-bold text-xs mb-2 flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
                  <span>Machine Telemetry Breakdown</span>
                  <Activity className="h-3.5 w-3.5 text-cyan-500" />
                </div>
                <div className="space-y-1.5 font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex justify-between">
                    <span>M-001 5-Axis Mill:</span>
                    <span className="text-emerald-500 font-bold">1.20 mm/s · 42.5°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>M-002 Lathe:</span>
                    <span className="text-emerald-500 font-bold">1.80 mm/s · 44.0°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>M-004 CNC Lathe:</span>
                    <span className="text-amber-500 font-bold">4.85 mm/s · 68.2°C (Warning)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>M-006 Standby Mill:</span>
                    <span className="text-emerald-500 font-bold">0.95 mm/s · 38.0°C</span>
                  </div>
                </div>
              </div>

              {/* Quality SPC Summary */}
              <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <div className="font-bold text-xs mb-2 flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
                  <span>Statistical Process Control (SPC)</span>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div className="space-y-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex justify-between">
                    <span>Target Cpk:</span>
                    <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>1.67</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Line Cpk:</span>
                    <span className="font-bold font-mono text-amber-500">1.34 (M-004 chatter)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scrap Loss Rate:</span>
                    <span className="font-bold font-mono text-emerald-500">0.42% (Nominal)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface Finish Ra:</span>
                    <span className="font-bold font-mono text-amber-500">0.82 µm (Spec &lt; 0.8)</span>
                  </div>
                </div>
              </div>

              {/* Workforce Roster */}
              <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                <div className="font-bold text-xs mb-2 flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
                  <span>Shift A Workforce Headcount</span>
                  <Users className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                <div className="space-y-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex justify-between">
                    <span>Total Shift Roster:</span>
                    <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{employees.length} personnel</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certified Machinists:</span>
                    <span className="font-bold font-mono text-emerald-500">6 on duty</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Senior Maintenance:</span>
                    <span className="font-bold font-mono text-blue-500">Marcus Vance (Assigned)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Engineers:</span>
                    <span className="font-bold font-mono text-emerald-500">2 on duty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
