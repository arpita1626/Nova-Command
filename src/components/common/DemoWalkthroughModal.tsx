import React from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({ isOpen, onClose }) => {
  const { demoStep, runDemoStep, resetAllData } = useManufacturingStore();
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Step 1: Open Command Center',
      tagline: 'Global Executive Observability',
      description: 'Manager inspects plant operations: Production output, OEE, active orders, machine availability, inventory health, and the Connected Consequences impact bar.',
      targetTab: 'command-center',
    },
    {
      step: 2,
      title: 'Step 2: M-004 Abnormal Vibration Detected',
      tagline: 'Simulated Sensor Anomaly',
      description: 'Piezoelectric sensor on Makino M-004 spindle spikes to 4.85 mm/s, breaching the 3.20 mm/s prototype threshold by +51.6%. Line 2 advisory triggered.',
      targetTab: 'machines',
    },
    {
      step: 3,
      title: 'Step 3: Inspect M-004 Telemetry Evidence',
      tagline: 'Deep Diagnostic Evidence',
      description: 'Manager reviews FFT vibration and temperature charts. Evidence proves accelerating bearing cage fatigue.',
      targetTab: 'machines',
    },
    {
      step: 4,
      title: 'Step 4: Review Decision Center Recommendation',
      tagline: 'Transparent Explainable AI',
      description: 'System automatically formulates REC-01 detailing WHAT happened, WHY it matters, EVIDENCE from sensors, METHOD used, and RECOMMENDED ACTION.',
      targetTab: 'decision-center',
    },
    {
      step: 5,
      title: 'Step 5: Create Maintenance Work Order',
      tagline: 'Maintenance Dispatch',
      description: 'Manager creates work order WO-204 for M-004 spindle overhaul requiring 6.5 hours.',
      targetTab: 'maintenance',
    },
    {
      step: 6,
      title: 'Step 6: Technician & Spare-Part Verification',
      tagline: 'Resource Readiness Check',
      description: 'System checks Marcus Vance (Level 3 Vibration Certified) and reserves SP-104 ceramic bearing set from inventory. Logs transaction TX-1094.',
      targetTab: 'inventory',
    },
    {
      step: 7,
      title: 'Step 7: M-004 Taken Offline in Maintenance',
      tagline: 'Cell Status State Transition',
      description: 'Machine M-004 transitions to "In Maintenance / Offline". Factory floor digital twin turns gray/amber.',
      targetTab: 'factory-floor',
    },
    {
      step: 8,
      title: 'Step 8: Production Schedule Recalculation',
      tagline: 'Automated Schedule Propagation',
      description: 'Manufacturing OS recalculates the schedule: OP-27 (Impeller Milling) and OP-28 are blocked/delayed by +5.5 hours.',
      targetTab: 'production',
    },
    {
      step: 9,
      title: 'Step 9: Customer Orders Identified at Risk',
      tagline: 'Commercial Impact Detection',
      description: 'Customer orders ORDER-1042 (₹2,45,000 SkyVector Aerospace) and ORDER-1048 (₹1,85,000 Nordic Defense) are mapped to delayed operations.',
      targetTab: 'orders',
    },
    {
      step: 10,
      title: 'Step 10: Delivery Risk Escalation',
      tagline: 'SLA Contractual Threat',
      description: 'Delivery risk updates to HIGH. Root cause explicitly details: M-004 unavailable, OP-27 delayed, ₹18,500/day contractual penalty.',
      targetTab: 'orders',
    },
    {
      step: 11,
      title: 'Step 11: Launch What-If Simulator',
      tagline: 'Predictive Consequence Sandbox',
      description: 'Manager opens the What-If Simulator to test operational strategies in an isolated sandbox before committing any changes.',
      targetTab: 'what-if',
    },
    {
      step: 12,
      title: 'Step 12: Evaluate Alternative Schedule Plan',
      tagline: 'Alternative Routing Candidate',
      description: 'Simulator tests rerouting operation OP-27 to standby 5-axis cell M-006 while M-004 undergoes bearing replacement.',
      targetTab: 'what-if',
    },
    {
      step: 13,
      title: 'Step 13: Side-by-Side Impact Comparison',
      tagline: 'Quantified Plan Comparison',
      description: 'Current vs Proposed comparison displays: 0 orders at risk (down from 2), +9.8% OEE gain, and ₹32,200 net financial savings.',
      targetTab: 'what-if',
    },
    {
      step: 14,
      title: 'Step 14: Review AI Decision Logic',
      tagline: 'Comprehensive Governance',
      description: 'Decision Center confirms the operational logic, mathematical risk reduction, and ensures human supervisor accountability.',
      targetTab: 'decision-center',
    },
    {
      step: 15,
      title: 'Step 15: Explicit Plan Commitment',
      tagline: 'Consequences Cascaded to Live Plant',
      description: 'Manager explicitly clicks "Commit Plan". Live production moves to Plan V2.0, OP-27 is active on M-006, and all plant KPIs return to nominal green!',
      targetTab: 'command-center',
    },
  ];

  const currentStepObj = steps[demoStep - 1] || steps[0];

  const handleNext = () => {
    if (demoStep < 15) {
      runDemoStep(demoStep + 1);
    }
  };

  const handlePrev = () => {
    if (demoStep > 1) {
      runDemoStep(demoStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="border rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Live Hackathon Guided Demonstration Flow
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                15-Step End-to-End Connected Consequences Tour
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-75 cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => runDemoStep(s.step)}
              className="h-7 w-7 rounded-lg text-xs font-bold shrink-0 flex items-center justify-center transition-all cursor-pointer border"
              style={{
                backgroundColor: s.step === demoStep
                  ? 'var(--accent)'
                  : s.step < demoStep
                  ? 'var(--success-bg)'
                  : 'var(--surface-secondary)',
                borderColor: s.step === demoStep
                  ? 'var(--accent)'
                  : s.step < demoStep
                  ? 'var(--border)'
                  : 'var(--border)',
                color: s.step === demoStep
                  ? '#FFFFFF'
                  : s.step < demoStep
                  ? 'var(--success-text)'
                  : 'var(--text-secondary)',
              }}
              title={s.title}
            >
              {s.step}
            </button>
          ))}
        </div>

        {/* Active Step Card */}
        <div
          className="p-5 rounded-xl border space-y-3 shadow-xs"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              {currentStepObj.title}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              Target Module: {currentStepObj.targetTab}
            </span>
          </div>

          <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {currentStepObj.tagline}
          </h4>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {currentStepObj.description}
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => {
              resetAllData();
              runDemoStep(1);
            }}
            className="flex items-center gap-1.5 text-xs hover:underline cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={demoStep === 1}
              className="px-3 py-1.5 rounded-lg border disabled:opacity-40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {demoStep < 15 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Trigger Next Step ({demoStep + 1}/15)</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Demo Completed · Close Tour</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
