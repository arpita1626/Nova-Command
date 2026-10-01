import React from 'react';
import {
  Activity,
  AlertTriangle,
  Thermometer,
  Wrench,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';

export const MachinesTelemetry: React.FC = () => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    createWorkOrder,
    setActiveTab,
    workOrders,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const machine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const activeWO = workOrders.find((w) => w.machineId === machine.id && w.status !== 'completed');

  const isExceeded = machine.vibration > machine.vibrationThreshold;
  const deviation = (((machine.vibration - machine.vibrationThreshold) / machine.vibrationThreshold) * 100).toFixed(1);

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Machine Telemetry & Predictive Health
            </h2>
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--info-bg)',
                color: 'var(--info-text)',
                borderColor: 'var(--border)',
              }}
            >
              SIMULATED TELEMETRY
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            High-frequency sensor streams (accelerometers, thermocouples, current transducers). Prototype estimate algorithms.
          </p>
        </div>

        {/* Machine Selector Tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-lg border shadow-xs"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          {machines.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMachineId(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                m.id === machine.id
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              style={{
                color: m.id === machine.id ? '#FFFFFF' : 'var(--text-secondary)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    m.status === 'running'
                      ? 'bg-emerald-500'
                      : m.status === 'maintenance'
                      ? 'bg-slate-400'
                      : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span>{m.id}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DEMO SCENARIO HIGHLIGHT BANNER FOR M-004 */}
      {machine.id === 'M-004' && (
        <div
          className="rounded-xl p-4 border shadow-sm"
          style={{
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
            borderColor: isDark ? 'rgba(245, 158, 11, 0.4)' : '#FCD34D',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/40">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    ⚠ Machine M-004 needs attention
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-400 dark:border-amber-700">
                    CRITICAL ADVISORY
                  </span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-100/80 mt-1 max-w-2xl leading-relaxed">
                  Vibration is above the prototype threshold (<strong>4.85 mm/s</strong> vs <strong>3.20 mm/s</strong> baseline,{' '}
                  <span className="font-bold text-rose-600 dark:text-rose-400">+{deviation}% deviation</span>). Spectral analysis indicates defect frequencies at 1,840 Hz corresponding to spindle bearing inner ring fatigue.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {activeWO ? (
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Wrench className="h-4 w-4 text-amber-500" />
                  <span>Work Order {activeWO.id} Active</span>
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
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Create Work Order</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('what-if')}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <span>Run What-If</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Machine Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="border p-3 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Current Status</div>
          <div className="text-base font-bold uppercase mt-1 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                machine.status === 'running'
                  ? 'bg-emerald-500'
                  : machine.status === 'maintenance'
                  ? 'bg-slate-400'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            {machine.status}
          </div>
        </div>

        <div className="border p-3 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Predictive Health Score</div>
          <div className="text-base font-bold mt-1">
            <span className={machine.healthScore < 70 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
              {machine.healthScore}%
            </span>
            <span className="text-[10px] font-normal ml-1" style={{ color: 'var(--text-muted)' }}>Prototype est.</span>
          </div>
        </div>

        <div className="border p-3 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Spindle Vibration</div>
          <div className="text-base font-bold font-mono mt-1">
            <span className={isExceeded ? 'text-amber-600 dark:text-amber-400 font-bold' : ''} style={{ color: isExceeded ? undefined : 'var(--text-primary)' }}>
              {machine.vibration.toFixed(2)} mm/s
            </span>
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Limit: {machine.vibrationThreshold.toFixed(1)} mm/s</div>
        </div>

        <div className="border p-3 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Bearing Temperature</div>
          <div className="text-base font-bold font-mono mt-1" style={{ color: 'var(--text-primary)' }}>
            {machine.temperature.toFixed(1)}°C
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Threshold: 75.0°C</div>
        </div>

        <div className="border p-3 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Utilization Rate</div>
          <div className="text-base font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{machine.utilization}%</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Active Shift A</div>
        </div>

        <div className="border p-3 rounded-xl shadow-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Downtime (Month)</div>
          <div className="text-base font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{machine.downtimeHours} hrs</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Uptime: {machine.uptimeHours} hrs</div>
        </div>
      </div>

      {/* Telemetry Charts: Vibration & Temperature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vibration Chart */}
        <div className="border rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Spindle Vibration Telemetry Trend (mm/s RMS)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-3 h-0.5 bg-amber-500 border-dashed border-b inline-block" />
                <span>Threshold ({machine.vibrationThreshold} mm/s)</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                <span className="w-3 h-0.5 bg-cyan-500 inline-block" />
                <span>Sensor RMS</span>
              </div>
            </div>
          </div>

          {/* SVG Visual Chart */}
          <div className="h-48 w-full relative pt-4 pb-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              {/* Background grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke={isDark ? '#243044' : '#E2E8F0'} strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke={isDark ? '#243044' : '#E2E8F0'} strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke={isDark ? '#243044' : '#E2E8F0'} strokeDasharray="3 3" />

              {/* Threshold line */}
              <line
                x1="0"
                y1={150 - (machine.vibrationThreshold / 6) * 140}
                x2="500"
                y2={150 - (machine.vibrationThreshold / 6) * 140}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <text
                x="410"
                y={150 - (machine.vibrationThreshold / 6) * 140 - 6}
                fill={isDark ? '#d97706' : '#92400e'}
                fontSize="10"
                fontWeight="bold"
              >
                Safe Limit (3.2)
              </text>

              {/* Telemetry points & line */}
              {(() => {
                const points = machine.telemetryHistory;
                const coords = points.map((p, i) => {
                  const x = (i / Math.max(1, points.length - 1)) * 480 + 10;
                  const y = 150 - (p.vibration / 6) * 140;
                  return { x, y, val: p.vibration, time: p.timestamp };
                });
                const pathD = coords.reduce((acc, curr, idx) => {
                  return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                }, '');

                return (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isDark ? '#38bdf8' : '#0284c7'}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {coords.map((c, idx) => (
                      <g key={idx}>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={c.val > machine.vibrationThreshold ? 5 : 3.5}
                          fill={c.val > machine.vibrationThreshold ? '#ef4444' : isDark ? '#38bdf8' : '#0284c7'}
                          stroke={isDark ? '#0D131D' : '#FFFFFF'}
                          strokeWidth="2"
                        />
                        <text
                          x={c.x}
                          y={c.y - 10}
                          fill={c.val > machine.vibrationThreshold ? '#dc2626' : isDark ? '#94a3b8' : '#1E293B'}
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {c.val.toFixed(2)}
                        </text>
                        <text
                          x={c.x}
                          y="145"
                          fill={isDark ? '#64748b' : '#334155'}
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="semibold"
                        >
                          {c.time}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <span>Sampling: 10 kHz piezoelectric accelerometer</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Fast Fourier Transform (FFT) Filtered</span>
          </div>
        </div>

        {/* Temperature & Power Profile */}
        <div className="border rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Spindle Bearing Temperature (°C)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Nominal Operating Range: 20°C - 65°C</span>
            </div>
          </div>

          {/* Temperature Visual */}
          <div className="h-48 w-full relative pt-4 pb-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <line x1="0" y1="30" x2="500" y2="30" stroke={isDark ? '#243044' : '#E2E8F0'} strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke={isDark ? '#243044' : '#E2E8F0'} strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke={isDark ? '#243044' : '#E2E8F0'} strokeDasharray="3 3" />

              {/* Warning zone for temp (65°C) */}
              <line x1="0" y1="45" x2="500" y2="45" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="420" y="40" fill="#dc2626" fontSize="10" fontWeight="bold">
                Max 65°C
              </text>

              {(() => {
                const points = machine.telemetryHistory;
                const coords = points.map((p, i) => {
                  const x = (i / Math.max(1, points.length - 1)) * 480 + 10;
                  const y = 150 - (p.temperature / 80) * 140;
                  return { x, y, val: p.temperature, time: p.timestamp };
                });
                const pathD = coords.reduce((acc, curr, idx) => {
                  return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                }, '');

                return (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isDark ? '#fb923c' : '#ea580c'}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {coords.map((c, idx) => (
                      <g key={idx}>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r="4"
                          fill={c.val > 65 ? '#ef4444' : isDark ? '#fb923c' : '#ea580c'}
                          stroke={isDark ? '#0D131D' : '#FFFFFF'}
                          strokeWidth="2"
                        />
                        <text
                          x={c.x}
                          y={c.y - 10}
                          fill={c.val > 65 ? '#dc2626' : isDark ? '#fdba74' : '#7C2D12'}
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {c.val.toFixed(1)}°C
                        </text>
                        <text
                          x={c.x}
                          y="145"
                          fill={isDark ? '#64748b' : '#334155'}
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="semibold"
                        >
                          {c.time}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <span>PT100 RTD sensor embedded in front bearing pack</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Thermal drift compensated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
