import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Cpu,
  Layers,
  Users,
  Wrench,
  Boxes,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    machines,
    orders,
    employees,
    workOrders,
    inventory,
    purchaseOrders,
    setActiveTab,
    setSelectedMachineId,
    setSelectedOrderId,
  } = useManufacturingStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedMachines = q
    ? machines.filter((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
    : machines.slice(0, 3);

  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q)
      )
    : orders.slice(0, 3);

  const matchedEmployees = q
    ? employees.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q)
      )
    : employees.slice(0, 3);

  const matchedWOs = q
    ? workOrders.filter(
        (w) =>
          w.id.toLowerCase().includes(q) ||
          w.machineId.toLowerCase().includes(q) ||
          w.issue.toLowerCase().includes(q)
      )
    : workOrders.slice(0, 2);

  const matchedInventory = q
    ? inventory.filter((i) => i.id.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))
    : inventory.slice(0, 3);

  const matchedSuppliers = q
    ? purchaseOrders.filter(
        (p) =>
          p.supplier.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q)
      )
    : purchaseOrders.slice(0, 2);

  const totalResults =
    matchedMachines.length +
    matchedOrders.length +
    matchedEmployees.length +
    matchedWOs.length +
    matchedInventory.length +
    matchedSuppliers.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 pt-16 sm:pt-20 backdrop-blur-sm">
      <div
        className="border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
          <Search className="h-5 w-5 text-blue-600 dark:text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search machines, orders, employees, work orders, inventory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-500 dark:placeholder-slate-400 font-medium"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {totalResults === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-60 text-slate-500 dark:text-slate-400" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">No results found for "{query}"</p>
              <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-400">Try searching for M-004, ORDER-1042, Marcus, or SP-104</p>
            </div>
          ) : (
            <>
              {/* MACHINES */}
              {matchedMachines.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-blue-600 dark:text-cyan-400">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Machines ({matchedMachines.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedMachines.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMachineId(m.id);
                          setActiveTab('machines');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-blue-400"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{m.id}</span>
                          <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs font-medium">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              m.status === 'running'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            }`}
                          >
                            {m.status}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {matchedOrders.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Orders ({matchedOrders.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOrderId(o.id);
                          setActiveTab('orders');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-blue-400"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{o.id}</span>
                          <span className="text-slate-600 dark:text-slate-400 ml-2 font-medium">{o.customer}</span>
                          <span className="text-[10px] text-slate-700 dark:text-slate-400 block truncate">{o.product}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              o.deliveryRisk === 'high'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            }`}
                          >
                            {o.deliveryRisk} Risk
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EMPLOYEES */}
              {matchedEmployees.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Users className="h-3.5 w-3.5" />
                    <span>Employees & Technicians ({matchedEmployees.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedEmployees.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => {
                          setActiveTab('workforce');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-blue-400"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{e.name}</span>
                          <span className="text-slate-600 dark:text-slate-400 ml-2 font-medium">({e.role})</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {e.availability}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WORK ORDERS */}
              {matchedWOs.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Maintenance Work Orders ({matchedWOs.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedWOs.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setActiveTab('maintenance');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-blue-400"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{w.id}</span>
                          <span className="text-slate-600 dark:text-slate-400 ml-2 font-medium">{w.machineId}</span>
                          <span className="text-[10px] text-slate-700 dark:text-slate-400 block truncate">{w.issue}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                          {w.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* INVENTORY */}
              {matchedInventory.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                    <Boxes className="h-3.5 w-3.5" />
                    <span>Inventory & Spare Parts ({matchedInventory.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedInventory.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => {
                          setActiveTab('inventory');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between cursor-pointer hover:border-blue-400"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{i.id}</span>
                          <span className="text-slate-600 dark:text-slate-400 ml-2 font-medium">{i.name}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {i.available} available
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          className="px-4 py-2 border-t text-[11px] flex items-center justify-between"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Use <strong>ESC</strong> to close</span>
          <span>Tip: Press <strong>⌘K</strong> or <strong>Ctrl+K</strong> anywhere</span>
        </div>
      </div>
    </div>
  );
};
