import React, { useState, useEffect } from 'react';
import { Search, BarChart3, Calculator, Cpu, ShieldAlert, BookOpen, GitBranch, Bot, Shield, FileCheck, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
  onTriggerAction: (actionKey: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerAction
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { id: 'overview', title: 'Open Studio Overview & Module Guide', category: 'Navigation', icon: BookOpen },
    { id: 'docs', title: 'Open AI PM Playbooks & Documentation', category: 'Navigation', icon: BookOpen },
    { id: 'visualization', title: 'Open Recharts Model Evaluation & Trends Studio', category: 'Navigation', icon: BarChart3 },
    { id: 'economics', title: 'Open 8-Bucket Unit Economics & ROI Simulator', category: 'Navigation', icon: Calculator },
    { id: 'models', title: 'Open Model Benchmark Matrix & Weighted Scorer', category: 'Navigation', icon: Cpu },
    { id: 'evals', title: 'Open Golden Evaluation Dataset & Regression Studio', category: 'Navigation', icon: BookOpen },
    { id: 'agentic', title: 'Open Agentic Workflow & Deterministic HITL Gate', category: 'Navigation', icon: ShieldAlert },
    { id: 'architect', title: 'Open 13-Factor Architecture & Live PRD Builder', category: 'Navigation', icon: FileCheck },
    { id: 'experiments', title: 'Open A/B Experiment Lab & Sample Size Engine', category: 'Navigation', icon: GitBranch },
    { id: 'copilot', title: 'Open Guided AI PM Copilot & Contradiction Audit', category: 'Navigation', icon: Bot },
    { id: 'security', title: 'Open Enterprise Security Center & Audit Vault', category: 'Navigation', icon: Shield },
    { id: 'action:start_tour', title: 'Action: Start Interactive Product Tour', category: 'Action', icon: BookOpen },
    { id: 'action:run_evals', title: 'Action: Run Batch Golden Evaluation Suite', category: 'Action', icon: BookOpen },
    { id: 'action:export_prd', title: 'Action: Copy Auto-Generated PRD Markdown', category: 'Action', icon: FileCheck },
    { id: 'action:export_soc2', title: 'Action: Export SOC2 Compliance Report', category: 'Action', icon: Shield }
  ];

  const filtered = items.filter(i => 
    i.title.toLowerCase().includes(query.toLowerCase()) || 
    i.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="glass-card rounded-2xl max-w-xl w-full border border-slate-700 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Type a command or module name (e.g. Recharts, Evals, PRD, Security)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands found.
            </div>
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id.startsWith('action:')) {
                    onTriggerAction(item.id.replace('action:', ''));
                  } else {
                    onNavigate(item.id);
                  }
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-indigo-400 group-hover:bg-indigo-950/40 transition">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                      {item.title}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigation Quick-Jump</span>
          <span className="font-mono text-[10px]">Esc to close</span>
        </div>
      </div>
    </div>
  );
};
