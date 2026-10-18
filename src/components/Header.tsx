import React from 'react';
import { ProjectState, UserRole } from '../types';
import { Shield, Sparkles, Database, Plus, Copy, Edit3, Trash2, Save, Download, Terminal, BarChart2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  projects: ProjectState[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDuplicateProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
  onSaveProject: () => void;
  onExportSpec: () => void;
  onLoadPreset: (presetKey: string) => void;
  currentRole: UserRole;
  onOpenRoleModal: () => void;
  geminiConnected: boolean;
  onOpenGeminiConfig: () => void;
  globalActiveModel: string;
  globalArchPattern: string;
  globalCostPerSuccess: number;
  globalExpVerdict: string;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
  onSaveProject,
  onExportSpec,
  onLoadPreset,
  currentRole,
  onOpenRoleModal,
  geminiConnected,
  onOpenGeminiConfig,
  globalActiveModel,
  globalArchPattern,
  globalCostPerSuccess,
  globalExpVerdict,
  onOpenCommandPalette
}) => {
  const tabs = [
    { id: 'visualization', label: '1. Recharts Analytics', icon: BarChart2, badge: 'New' },
    { id: 'economics', label: '2. Unit Economics & ROI' },
    { id: 'models', label: '3. Model Matrix & Scorer' },
    { id: 'evals', label: '4. Evals & Golden Dataset' },
    { id: 'agentic', label: '5. Agentic & HITL' },
    { id: 'architect', label: '6. Architecture & PRD' },
    { id: 'experiments', label: '7. Experiment Lab' },
    { id: 'copilot', label: '8. AI PM Copilot' },
    { id: 'security', label: '9. Enterprise Security', badge: 'SOC2' },
    { id: 'portfolio', label: '10. Portfolio & Case Study' },
    { id: 'tests', label: '11. Verification Tests' }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-white text-lg">
            P
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Prism AI PM Studio</span>
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v4.5 Enterprise
              </span>
              <button
                onClick={onOpenGeminiConfig}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                  geminiConnected
                    ? 'badge-verified'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                }`}
                title="Configure Google Gemini API key or environment connection"
              >
                <Sparkles className="w-3 h-3" />
                <span>{geminiConnected ? 'Gemini 2.5 Flash: Active' : 'Gemini API: Env/Key ⚙'}</span>
              </button>
              <button
                onClick={onOpenRoleModal}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 transition flex items-center gap-1"
                title="Active Identity Role & Access Level"
              >
                <Shield className="w-3 h-3 text-purple-400" />
                <span>Role: {currentRole}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Connected AI PM Decision Suite: Recharts Analytics • Economics • Evals • HITL • PRD • Experiments • Security
            </p>
          </div>
        </div>

        {/* Project Manager & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick command palette shortcut button */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-white transition"
            title="Open Command Palette (Cmd+K)"
          >
            <Terminal className="w-3 h-3 text-indigo-400" />
            <span className="font-mono text-[11px]">Cmd+K</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1">
            <span className="text-[11px] text-slate-400 font-mono">Proj:</span>
            <select
              value={activeProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              aria-label="Active Project"
              className="bg-transparent text-xs text-white font-medium focus:outline-none max-w-[140px] truncate"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
            <button onClick={onNewProject} title="Create New Project" className="p-1 rounded hover:bg-slate-800 text-indigo-300">
              <Plus className="w-3 h-3" />
            </button>
            <button onClick={onDuplicateProject} title="Duplicate Project" className="p-1 rounded hover:bg-slate-800 text-slate-300">
              <Copy className="w-3 h-3" />
            </button>
            <button onClick={onRenameProject} title="Rename Project" className="p-1 rounded hover:bg-slate-800 text-slate-300">
              <Edit3 className="w-3 h-3" />
            </button>
            <button onClick={onDeleteProject} title="Delete Project" className="p-1 rounded hover:bg-rose-950/50 text-rose-300">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          <select
            onChange={(e) => {
              if (e.target.value) onLoadPreset(e.target.value);
            }}
            defaultValue=""
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="" disabled>Load Demo Preset...</option>
            <option value="support">E-Commerce Dispute Agent (50k/d)</option>
            <option value="rag">Enterprise GST/Legal Copilot (15k/d)</option>
            <option value="scale">Consumer Search Assistant (450k/d)</option>
          </select>

          <button
            onClick={onSaveProject}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 text-xs font-medium transition flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>

          <button
            onClick={onExportSpec}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <span>Export Spec</span>
          </button>
        </div>
      </div>

      {/* Provenance & Shared State Status Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 px-4 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span>Model: <strong className="font-mono text-indigo-300">{globalActiveModel}</strong></span>
            <span>•</span>
            <span>Pattern: <strong className="font-mono text-emerald-300">{globalArchPattern}</strong></span>
            <span>•</span>
            <span>Cost / Success: <strong className="font-mono text-cyan-300">${globalCostPerSuccess.toFixed(4)}</strong></span>
            <span>•</span>
            <span>A/B Verdict: <strong className="font-mono text-amber-300">{globalExpVerdict}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Provenance:</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono badge-verified">Verified Pricing</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono badge-provider">Provider Spec</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono badge-user">User Input</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono badge-simulated">Simulated Model</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar border-t border-slate-800/50">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 font-semibold bg-indigo-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                  tab.badge === 'New' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
