import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart2,
  ShieldAlert,
  FileCheck,
  Plus,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Activity,
  Check,
  Send,
  Eye,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';

export const QualityInspectorDashboard: React.FC = () => {
  const {
    qualityInspections,
    machines,
    alerts,
    correctiveActions,
    addQualityInspection,
    addCorrectiveAction,
    updateCorrectiveActionStatus,
    setActiveTab,
    setSelectedMachineId,
    auditLogs,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  // Modals
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [targetMachineId, setTargetMachineId] = useState('M-004');
  const [batchId, setBatchId] = useState('BATCH-B204');
  const [inspectedUnits, setInspectedUnits] = useState(60);
  const [defectUnits, setDefectUnits] = useState(4);
  const [defectType, setDefectType] = useState('Spindle chatter wave marks (Ra > 0.8µm)');
  const [inspectionNotes, setInspectionNotes] = useState('Surface profilometer detected excessive wave height along Z-axis feed path.');
  const [inspectionEvidence, setInspectionEvidence] = useState('CMM-Scan-Trace-B204.png (Attached)');
  const [resultStatus, setResultStatus] = useState<'passed' | 'warning' | 'rejected'>('rejected');

  const [showCAModal, setShowCAModal] = useState(false);
  const [caTitle, setCaTitle] = useState('Bearing vibration damper inspection');
  const [caDescription, setCaDescription] = useState('Inspect spindle harmonics and replace vibration dampening pads on M-004.');
  const [caAssignedTo, setCaAssignedTo] = useState('Marcus Vance (Senior Mechatronics)');

  // KPI calculations
  const inspectionsToday = qualityInspections.length;
  const passedInspections = qualityInspections.filter((q) => q.status === 'passed').length;
  const failedInspections = qualityInspections.filter((q) => q.status === 'rejected').length;
  const warningInspections = qualityInspections.filter((q) => q.status === 'warning').length;
  const pendingInspections = 2; // Scheduled upcoming batch inspections

  const totalInspected = qualityInspections.reduce((sum, q) => sum + q.inspectedUnits, 0);
  const totalDefects = qualityInspections.reduce((sum, q) => sum + q.defectUnits, 0);
  const defectRatePpm = totalInspected > 0 ? Math.round((totalDefects / totalInspected) * 1_000_000) : 0;
  const defectRatePct = totalInspected > 0 ? ((totalDefects / totalInspected) * 100).toFixed(2) : '0.00';

  const criticalDefects = qualityInspections.filter((q) => q.spcSignal === 'out_of_control' || q.defectUnits > 2);
  const openCorrectiveActions = correctiveActions.filter((c) => c.status === 'open' || c.status === 'investigating');
  const qualityAlerts = alerts.filter((a) => a.relatedModule === 'quality' && a.status === 'active');

  const handleExecuteInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMachine = machines.find((m) => m.id === targetMachineId);
      await addQualityInspection({
        machineId: targetMachineId,
        machineName: selectedMachine?.name || targetMachineId,
        line: selectedMachine?.line || 'Line 2',
        batchId,
        productId: 'AERO-SPINDLE-40',
        productName: 'Aerospace High-Speed Spindle Shaft',
        inspectedUnits: Number(inspectedUnits),
        defectUnits: Number(defectUnits),
        defects: Number(defectUnits) > 0 ? [{ type: defectType, count: Number(defectUnits) }] : [],
        status: resultStatus,
        spcSignal: resultStatus === 'rejected' ? 'out_of_control' : resultStatus === 'warning' ? 'warning' : 'in_control',
        notes: inspectionNotes,
        evidence: inspectionEvidence,
        inspector: 'Priya Das',
      });
      setShowInspectionModal(false);
    } catch {
      // Toast notification handles display
    }
  };

  const handleExecuteCA = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCorrectiveAction({
      machineId: targetMachineId,
      batchId,
      title: caTitle,
      description: caDescription,
      assignedTo: caAssignedTo,
      status: 'open',
      priority: 'high',
    });
    setShowCAModal(false);
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
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              Role Dashboard
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Assurance & Statistical Process Control (SPC)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Quality Inspector Command
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Precision metrology checks, automated CMM logs, non-conformance tracking, and corrective action workflows
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setResultStatus('rejected');
              setDefectUnits(4);
              setShowInspectionModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Inspection</span>
          </button>
          <button
            onClick={() => setShowCAModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>New Corrective Action</span>
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-xs shadow-2xs transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <BarChart2 className="h-3.5 w-3.5 text-cyan-500" />
            <span>Full SPC Charts</span>
          </button>
        </div>
      </div>

      {/* 10 Core Metrics for Quality Inspector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {/* 1. Inspections Today */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Inspections Today</span>
            <FileCheck className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
            {inspectionsToday}
          </div>
          <span className="text-[10px] text-slate-400">Shift A & B logs</span>
        </div>

        {/* 2. Pending Inspections */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Pending Inspections</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400 font-mono">
            {pendingInspections}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Batch staging in queue</span>
        </div>

        {/* 3. Passed Inspections */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Passed</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
            {passedInspections}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">100% within tolerance</span>
        </div>

        {/* 4. Failed Inspections */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Failed Inspections</span>
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-rose-600 dark:text-rose-400 font-mono">
            {failedInspections}
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Non-conformance flagged</span>
        </div>

        {/* 5. Defect Rate */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Defect Rate</span>
            <TrendingDown className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-purple-600 dark:text-purple-400 font-mono">
            {defectRatePct}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{defectRatePpm} PPM</span>
        </div>

        {/* 6. Critical Defects */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Critical Defects</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-rose-600 dark:text-rose-400 font-mono">
            {criticalDefects.length}
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Requires containment</span>
        </div>

        {/* 7. Open Corrective Actions */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Open Corrective Actions</span>
            <ShieldAlert className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400 font-mono">
            {openCorrectiveActions.length}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">CAPA tickets active</span>
        </div>

        {/* 8. Quality Alerts */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Quality Alerts</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400 font-mono">
            {qualityAlerts.length}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Planner notified</span>
        </div>

        {/* 9. Inspected Volume */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Inspected Units</span>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
            {totalInspected}
          </div>
          <span className="text-[10px] text-slate-400">Total batch sampled</span>
        </div>

        {/* 10. Defect Total */}
        <div className="p-3.5 rounded-xl border shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Defects Found</span>
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-rose-600 dark:text-rose-400 font-mono">
            {totalDefects}
          </div>
          <span className="text-[10px] text-slate-400">Scrap / rework total</span>
        </div>
      </div>

      {/* Row 2: Recent Inspection Results & Defect Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Inspection Results */}
        <div
          className="lg:col-span-2 p-5 rounded-2xl border space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Recent Inspection Results & Metrology Logs
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('quality')}
              className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Module</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {qualityInspections.map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl border text-xs space-y-2 transition-all hover:border-slate-400 dark:hover:border-slate-600"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{q.id}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">· Batch {q.batchId}</span>
                    <span className="text-slate-400">({q.machineName})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        q.status === 'passed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : q.status === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                      }`}
                    >
                      {q.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q.spcSignal === 'in_control'
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-rose-600 text-white animate-pulse'
                      }`}
                    >
                      SPC: {q.spcSignal.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400">Product:</span>
                    <div className="font-semibold truncate">{q.productName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Sampling:</span>
                    <div className="font-semibold">{q.defectUnits} defects / {q.inspectedUnits} units</div>
                  </div>
                  <div>
                    <span className="text-slate-400">PPM Rate:</span>
                    <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{q.defectRatePpm.toLocaleString()} PPM</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Inspector:</span>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">{q.inspector || 'Priya Das'}</div>
                  </div>
                </div>

                {q.defects && q.defects.length > 0 && (
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300">
                    <span className="font-bold">Detected Non-Conformance:</span> {q.defects.map((d) => `${d.type} (${d.count} pcs)`).join(', ')}
                  </div>
                )}

                {q.notes && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Note: "{q.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Defect Trends & SPC breakdown */}
        <div className="space-y-5">
          {/* Defect Trends Card */}
          <div
            className="p-5 rounded-2xl border space-y-3 shadow-sm"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <BarChart2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Defect Distribution & Pareto Breakdown
            </h3>

            <div className="space-y-2.5 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">Surface Roughness Wave Marks</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">58% (M-004 Spindle)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">Dimensional Bore Runout</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">24% (M-002 Thermal)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">Edge Micro-Burrs</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-400">18% (Tool Wear)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed" style={{ borderColor: 'var(--border)' }}>
              Connected Alert: High defect concentration on Machine M-004 correlates with harmonic vibration spike (4.85 mm/s). Production Planner has been notified to re-evaluate batch scheduling.
            </div>
          </div>

          {/* Open Corrective Actions List */}
          <div
            className="p-5 rounded-2xl border space-y-3 shadow-sm"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <ShieldAlert className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Corrective Actions (CAPA)
              </h3>
              <button
                onClick={() => setShowCAModal(true)}
                className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
              >
                + New
              </button>
            </div>

            <div className="space-y-2">
              {correctiveActions.map((ca) => (
                <div
                  key={ca.id}
                  className="p-3 rounded-xl border text-xs space-y-1.5"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{ca.id}: {ca.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        ca.status === 'implemented'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {ca.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {ca.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Machine: {ca.machineId}</span>
                    <span>Assigned: {ca.assignedTo.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Connected Flow Banner & Audit Trail */}
      <div
        className="p-5 rounded-2xl border space-y-3 shadow-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Quality Assurance & Non-Conformance Audit Trail
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Real-time Chain of Custody</span>
        </div>

        <div className="space-y-2">
          {auditLogs
            .filter((l) => l.module.toLowerCase().includes('quality') || l.role === 'QUALITY_INSPECTOR')
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
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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

      {/* Log Inspection Run Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className="border rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Record Quality Inspection Run (Priya Das)
              </h3>
              <button onClick={() => setShowInspectionModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleExecuteInspection} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Target Machine:</label>
                  <select
                    value={targetMachineId}
                    onChange={(e) => setTargetMachineId(e.target.value)}
                    className="w-full p-2 rounded-lg border font-mono"
                    style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Batch ID:</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="BATCH-B204"
                    className="w-full p-2 rounded-lg border font-mono"
                    style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
              </div>

              {/* Pass / Fail Toggle */}
              <div>
                <label className="block text-[11px] font-semibold mb-1">Inspection Verdict:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResultStatus('passed');
                      setDefectUnits(0);
                    }}
                    className={`py-2 px-3 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                      resultStatus === 'passed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    ✓ PASS (0 Defects)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResultStatus('warning');
                      setDefectUnits(1);
                    }}
                    className={`py-2 px-3 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                      resultStatus === 'warning'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    ⚠ WARNING (Marginal)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResultStatus('rejected');
                      setDefectUnits(4);
                    }}
                    className={`py-2 px-3 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                      resultStatus === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    ✕ FAIL (Reject Batch)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Sample Size (Units):</label>
                  <input
                    type="number"
                    value={inspectedUnits}
                    onChange={(e) => setInspectedUnits(Number(e.target.value))}
                    min={1}
                    className="w-full p-2 rounded-lg border font-mono"
                    style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Defect Count (Units):</label>
                  <input
                    type="number"
                    value={defectUnits}
                    onChange={(e) => setDefectUnits(Number(e.target.value))}
                    min={0}
                    className="w-full p-2 rounded-lg border font-mono"
                    style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
              </div>

              {resultStatus !== 'passed' && (
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Non-Conformance / Defect Type:</label>
                  <select
                    value={defectType}
                    onChange={(e) => setDefectType(e.target.value)}
                    className="w-full p-2 rounded-lg border"
                    style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="Spindle chatter wave marks (Ra > 0.8µm)">Spindle chatter wave marks (Ra &gt; 0.8µm)</option>
                    <option value="Diameter bore tolerance drift (+0.015mm)">Diameter bore tolerance drift (+0.015mm)</option>
                    <option value="Surface micro-cracks & thermal discoloration">Surface micro-cracks & thermal discoloration</option>
                    <option value="Perpendicularity runout exceedance">Perpendicularity runout exceedance</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold mb-1">Inspection Notes & Metrology Observation:</label>
                <textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Evidence / CMM Trace Attachment:</label>
                <input
                  type="text"
                  value={inspectionEvidence}
                  onChange={(e) => setInspectionEvidence(e.target.value)}
                  className="w-full p-2 rounded-lg border font-mono text-[11px]"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInspectionModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg text-white font-bold text-xs shadow-sm cursor-pointer ${
                    resultStatus === 'rejected' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  Confirm & Commit Verdict
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Corrective Action Modal */}
      {showCAModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className="border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-blue-500" />
                Create Corrective Action Task
              </h3>
              <button onClick={() => setShowCAModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleExecuteCA} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Title:</label>
                <input
                  type="text"
                  value={caTitle}
                  onChange={(e) => setCaTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Assigned Mechatronics / Technician:</label>
                <input
                  type="text"
                  value={caAssignedTo}
                  onChange={(e) => setCaAssignedTo(e.target.value)}
                  className="w-full p-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Corrective Action Plan Details:</label>
                <textarea
                  value={caDescription}
                  onChange={(e) => setCaDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCAModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Create & Dispatch CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
