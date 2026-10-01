import React from 'react';
import {
  Sparkles,
  Activity,
  Layers,
  GitFork,
  ArrowRight,
  X,
  ShieldCheck,
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onStartTour }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="border rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to NOVA COMMAND</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AI-Powered Manufacturing Operations
          </h2>
          <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Monitor your factory, understand connected consequences across machines and orders, and test decisions in simulation before committing them.
          </p>
        </div>

        {/* 3 Simple Concepts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div
            className="p-3.5 rounded-xl border space-y-1.5 text-center shadow-xs"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="h-8 w-8 mx-auto rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-cyan-400">
              <Activity className="h-4 w-4" />
            </div>
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>1. MONITOR</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              See what is happening in real time across machines, inventory, and lines.
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border space-y-1.5 text-center shadow-xs"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="h-8 w-8 mx-auto rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Layers className="h-4 w-4" />
            </div>
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>2. UNDERSTAND</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              See why it matters. One machine vibration ripples directly into customer order delivery risk.
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border space-y-1.5 text-center shadow-xs"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="h-8 w-8 mx-auto rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <GitFork className="h-4 w-4" />
            </div>
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>3. DECIDE</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Test What-If scenarios in a safe sandbox, compare alternatives, and commit with confidence.
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => {
              onClose();
              onStartTour();
            }}
            className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            Take the 15-Step Guided Demo Tour →
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Explore Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
