import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  BarChart2,
  ShieldAlert,
  FileCheck,
  Check,
  XCircle,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';

export interface QualityProps {
  initialSection?: string;
}

export const Quality: React.FC<QualityProps> = ({ initialSection }) => {
  const {
    qualityInspections,
    machines,
    addQualityInspection,
    setActiveTab,
    setSelectedMachineId,
    currentUser,
    correctiveActions,
    updateCorrectiveActionStatus,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [showLogModal, setShowLogModal] = useState(false);
  const [targetMachineId, setTargetMachineId] = useState('M-004');
  const [batchId, setBatchId] = useState('BATCH-B204');
  const [inspectedCount, setInspectedCount] = useState(50);
  const [defectCount, setDefectCount] = useState(3);
  const [defectType, setDefectType] = useState('Spindle chatter wave marks (Ra > 0.8µm)');
  const [verdict, setVerdict] = useState<'passed' | 'warning' | 'rejected'>('rejected');
  const [notes, setNotes] = useState('');
  const [evidence, setEvidence] = useState('');

  const isPlanner = currentUser.role === 'PRODUCTION_PLANNER';

  const totalInspected = qualityInspections.reduce((sum, q) => sum + q.inspectedUnits, 0);
  const totalDefects = qualityInspections.reduce((sum, q) => sum + q.defectUnits, 0);
  const averagePpm = totalInspected > 0 ? Math.round((totalDefects / totalInspected) * 1000000) : 0;
  const passRate = totalInspected > 0 ? (((totalInspected - totalDefects) / totalInspected) * 100).toFixed(1) : '100';

  return (
    <div className="space-y-5 pb-8">
      {/* RBAC Notification Banner */}
      {isPlanner && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Read-Only Mode:</strong> Logged in as <strong>Production Planner ({currentUser.name})</strong>. Quality inspection recording and defect logging are restricted to Quality Inspectors and QA Managers.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
            RBAC Enforced
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Quality Control & Statistical Process Control (SPC)
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Automated CMM dimensional checks, PPM tracking, surface profilometry, and machine-level defect correlation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={isPlanner}
            onClick={() => {
              if (isPlanner) return;
              setShowLogModal(true);
            }}
            title={isPlanner ? 'Quality inspection recording restricted to Quality Inspector' : 'Record quality inspection'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-sm transition-colors ${
              isPlanner
                ? 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Log Inspection Run</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border p-3.5 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>First Pass Yield</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{passRate}%</div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target: &gt;99.0%</span>
        </div>

        <div className="border p-3.5 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Defect Rate (PPM)</span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">{averagePpm.toLocaleString()} PPM</div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Industry Class 2</span>
        </div>

        <div className="border p-3.5 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Inspected</span>
          <div className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{totalInspected} units</div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Active Shift A batches</span>
        </div>

        <div className="border p-3.5 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>SPC Alerts Triggered</span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">1 Out-of-Control</div>
          <span className="text-[10px] text-rose-500 font-semibold">Batch #B-8821 (M-004)</span>
        </div>
      </div>

      {/* SPC CONTROL CHART VISUALIZATION */}
      <div
        className="rounded-xl p-4 space-y-3 border shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Statistical Process Control (SPC) Chart - Surface Roughness Ra (µm)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-rose-600 dark:text-rose-400 font-bold">Upper Control Limit (UCL = 0.80 µm)</span>
            <span style={{ color: 'var(--text-secondary)' }}>Target Mean (0.45 µm)</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="h-44 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130">
            {/* UCL Line */}
            <line x1="0" y1="25" x2="500" y2="25" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="420" y="20" fill="#dc2626" fontSize="10" fontWeight="bold">
              UCL: 0.80 µm
            </text>

            {/* Mean Line */}
            <line x1="0" y1="65" x2="500" y2="65" stroke={isDark ? '#64748b' : '#64748B'} strokeWidth="1" strokeDasharray="2 2" />
            <text x="430" y="60" fill={isDark ? '#64748b' : '#334155'} fontSize="9" fontWeight="bold">
              Mean: 0.45
            </text>

            {/* Sample points for recent batches */}
            <path
              d="M 40 70 L 120 68 L 200 65 L 280 62 L 360 38 L 440 18"
              fill="none"
              stroke={isDark ? '#38bdf8' : '#0284c7'}
              strokeWidth="2.5"
            />
            {[
              { x: 40, y: 70, val: '0.38', batch: 'B-8815' },
              { x: 120, y: 68, val: '0.42', batch: 'B-8817' },
              { x: 200, y: 65, val: '0.45', batch: 'B-8818' },
              { x: 280, y: 62, val: '0.48', batch: 'B-8819' },
              { x: 360, y: 38, val: '0.72', batch: 'B-8820' },
              { x: 440, y: 18, val: '0.86', batch: 'B-8821 (M-004)', exceed: true },
            ].map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.exceed ? 5.5 : 3.5}
                  fill={p.exceed ? '#ef4444' : isDark ? '#38bdf8' : '#0284c7'}
                  stroke={isDark ? '#0D131D' : '#FFFFFF'}
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill={p.exceed ? '#dc2626' : isDark ? '#94a3b8' : '#1E293B'}
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {p.val}
                </text>
                <text x={p.x} y="115" fill={isDark ? '#64748b' : '#334155'} fontSize="8" textAnchor="middle" fontWeight="bold">
                  {p.batch}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div
          className="p-2.5 rounded-lg border text-[11px] flex items-center justify-between"
          style={{
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#FECACA',
            color: isDark ? '#FCA5A5' : '#991B1B',
          }}
        >
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span>
              <strong>Out-of-Control SPC Signal:</strong> Batch B-8821 surface roughness breached 0.80 µm UCL. Traced directly to Machine M-004 spindle bearing harmonics.
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedMachineId('M-004');
              setActiveTab('machines');
            }}
            className="text-blue-600 dark:text-cyan-400 underline font-bold shrink-0 cursor-pointer"
          >
            Check M-004 Telemetry →
          </button>
        </div>
      </div>

      {/* Inspection Results Table */}
      <div
        className="border rounded-xl overflow-hidden shadow-xs"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Inspection History & Machine Traceability
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className="border-b uppercase text-[10px] tracking-wider font-bold"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <tr>
                <th className="py-2.5 px-4">Inspection ID / Time</th>
                <th className="py-2.5 px-4">Machine & Line</th>
                <th className="py-2.5 px-4">Batch ID / Product</th>
                <th className="py-2.5 px-4 text-right">Units Checked</th>
                <th className="py-2.5 px-4 text-right">Defect Rate (PPM)</th>
                <th className="py-2.5 px-4">SPC Status</th>
                <th className="py-2.5 px-4">Associated Defects</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {qualityInspections.map((qi) => {
                const isWarning = qi.status === 'warning' || qi.spcSignal === 'out_of_control';
                return (
                  <tr
                    key={qi.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{qi.id}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(qi.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{qi.machineId}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{qi.line.split('-')[0]}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-600 dark:text-cyan-400">{qi.batchId}</div>
                      <div className="text-[11px] truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{qi.productName}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                      {qi.inspectedUnits} units
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={qi.defectUnits > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {qi.defectRatePpm.toLocaleString()} PPM
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          isWarning
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {qi.spcSignal.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {qi.defects.length > 0 ? (
                        qi.defects.map((d, i) => (
                          <div key={i} className="text-amber-700 dark:text-amber-300 font-medium">
                            • {d.count}x {d.type}
                          </div>
                        ))
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Zero non-conformances</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Inspection Run Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="border rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Log Metrology Inspection
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="hover:opacity-75 cursor-pointer text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Target Machine</label>
                  <select
                    value={targetMachineId}
                    onChange={(e) => setTargetMachineId(e.target.value)}
                    className="w-full p-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Batch / Lot ID</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full p-2 rounded-lg border font-medium font-mono"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Pass / Fail / Warning Verdict Buttons */}
              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Inspection Verdict</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVerdict('passed');
                      setDefectCount(0);
                    }}
                    className={`py-1.5 px-2 rounded-lg border font-bold text-center cursor-pointer text-xs ${
                      verdict === 'passed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    ✓ PASS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerdict('warning');
                      if (defectCount === 0) setDefectCount(1);
                    }}
                    className={`py-1.5 px-2 rounded-lg border font-bold text-center cursor-pointer text-xs ${
                      verdict === 'warning'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    ⚠ WARNING
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerdict('rejected');
                      if (defectCount === 0) setDefectCount(4);
                    }}
                    className={`py-1.5 px-2 rounded-lg border font-bold text-center cursor-pointer text-xs ${
                      verdict === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    ✕ FAIL
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Inspected Count</label>
                  <input
                    type="number"
                    min="1"
                    value={inspectedCount}
                    onChange={(e) => setInspectedCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Defect Count</label>
                  <input
                    type="number"
                    min="0"
                    value={defectCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setDefectCount(count);
                      if (count === 0) setVerdict('passed');
                      else if (count <= 2) setVerdict('warning');
                      else setVerdict('rejected');
                    }}
                    className="w-full p-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {defectCount > 0 && (
                <div>
                  <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Defect Classification</label>
                  <input
                    type="text"
                    value={defectType}
                    onChange={(e) => setDefectType(e.target.value)}
                    className="w-full p-2 rounded-lg border font-medium"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Inspection Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dimensional drift, surface wave height, tool wear observation..."
                  className="w-full p-2 rounded-lg border font-medium"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="block mb-1" style={{ color: 'var(--text-secondary)' }}>Evidence / Trace Attachment</label>
                <input
                  type="text"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="e.g. CMM-Scan-Trace-B204.png"
                  className="w-full p-2 rounded-lg border font-mono text-[11px]"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setShowLogModal(false)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const m = machines.find((mach) => mach.id === targetMachineId);
                  const ratePpm = inspectedCount > 0 ? Math.round((defectCount / inspectedCount) * 1000000) : 0;
                  addQualityInspection({
                    machineId: targetMachineId,
                    machineName: m?.name || 'Machine',
                    line: m?.line || 'Line 2',
                    batchId,
                    inspectedUnits: inspectedCount,
                    defectUnits: defectCount,
                    defectRatePpm: ratePpm,
                    spcSignal: verdict === 'rejected' ? 'out_of_control' : verdict === 'warning' ? 'warning' : 'in_control',
                    status: verdict,
                    defects: defectCount > 0 ? [{ type: defectType, count: defectCount }] : [],
                    notes: notes || undefined,
                    evidence: evidence || undefined,
                    inspector: currentUser.name,
                  });
                  setShowLogModal(false);
                }}
                className={`px-4 py-1.5 rounded-lg text-white font-semibold text-xs cursor-pointer shadow-sm ${
                  verdict === 'rejected' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                Commit Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corrective Actions Section (CAPA) */}
      <div
        className="p-5 rounded-2xl border space-y-4 shadow-sm mt-6"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Corrective Actions (CAPA) & Resolution Tracking
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Follow up on critical non-conformances, assign technicians, and verify resolution
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300">
            {correctiveActions.filter((c) => c.status !== 'verified').length} Open Tasks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {correctiveActions.map((ca) => (
            <div
              key={ca.id}
              className="p-4 rounded-xl border text-xs space-y-2.5"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{ca.id}: {ca.title}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    ca.status === 'implemented' || ca.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {ca.status}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{ca.description}</p>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div><strong>Root Cause:</strong> {ca.rootCause}</div>
                <div><strong>Machine:</strong> {ca.machineId} · <strong>Batch:</strong> {ca.batchId}</div>
                <div><strong>Assigned To:</strong> {ca.assignedTo} · <strong>Due:</strong> {ca.dueDate}</div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">Target SLA: 24h</span>
                {ca.status !== 'implemented' && ca.status !== 'verified' ? (
                  <button
                    disabled={isPlanner}
                    onClick={() => updateCorrectiveActionStatus(ca.id, 'implemented')}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${
                      isPlanner
                        ? 'opacity-50 cursor-not-allowed bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    }`}
                  >
                    Mark Implemented
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
