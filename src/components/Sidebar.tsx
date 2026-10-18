import React from 'react';
import { ProjectState, UserRole } from '../types';
import {
  BarChart2, Calculator, Cpu, BookOpen, ShieldAlert, FileText,
  GitBranch, Bot, Shield, CheckCircle, Plus, Copy, Edit2, Trash2,
  Terminal, Sparkles, FolderKanban, Layers, Play, HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  projects: ProjectState[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDuplicateProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
  currentRole: UserRole;
  onOpenRoleModal: () => void;
  geminiConnected: boolean;
  onOpenGeminiConfig: () => void;
  onOpenCommandPalette: () => void;
  onStartTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
  currentRole,
  onOpenRoleModal,
  geminiConnected,
  onOpenGeminiConfig,
  onOpenCommandPalette,
  onStartTour
}) => {
  const navSections = [
    {
      title: 'OVERVIEW & GUIDES',
      items: [
        { id: 'overview', label: 'Studio Overview & Guide', icon: Layers },
        { id: 'docs', label: 'PM Playbooks & Docs', icon: BookOpen }
      ]
    },
    {
      title: 'EVALUATIONS & BENCHMARKS',
      items: [
        { id: 'visualization', label: 'Evaluation Metrics & Trends', icon: BarChart2 },
        { id: 'models', label: 'Model Benchmark Matrix', icon: Cpu },
        { id: 'evals', label: 'Golden Dataset & Regression', icon: BookOpen }
      ]
    },
    {
      title: 'ECONOMICS & ARCHITECTURE',
      items: [
        { id: 'economics', label: 'Unit Economics & ROI', icon: Calculator },
        { id: 'agentic', label: 'Agentic Workflow & HITL', icon: ShieldAlert },
        { id: 'architect', label: 'Architecture & PRD Builder', icon: FileText }
      ]
    },
    {
      title: 'EXPERIMENTATION & SAFETY',
      items: [
        { id: 'experiments', label: 'A/B Experiment Lab', icon: GitBranch },
        { id: 'copilot', label: 'AI PM Copilot', icon: Bot },
        { id: 'security', label: 'Enterprise Security & RBAC', icon: Shield },
        { id: 'portfolio', label: 'Portfolio Case Study', icon: FolderKanban },
        { id: 'tests', label: 'Verification Math Tests', icon: CheckCircle }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0e1013] border-r border-[#1f2328] flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand & Project Selector */}
      <div className="p-4 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange('overview')}>
            <div className="w-7 h-7 rounded-lg bg-[#242830] border border-[#363c48] flex items-center justify-center font-semibold text-white text-sm">
              P
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-white">Prism AI PM</div>
              <div className="text-[11px] text-[#7d8590]">Decision Studio</div>
            </div>
          </div>

          <button
            onClick={onOpenCommandPalette}
            className="p-1.5 rounded-md hover:bg-[#1a1d23] text-[#7d8590] hover:text-white transition cursor-pointer"
            title="Open Command Palette (Cmd+K)"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project Switcher */}
        <div className="bg-[#14161b] border border-[#242830] rounded-lg p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#7d8590] uppercase font-mono px-1">
            <span>Active Project</span>
            <div className="flex items-center gap-1">
              <button onClick={onNewProject} title="New Project" className="hover:text-white p-0.5 cursor-pointer">
                <Plus className="w-3 h-3" />
              </button>
              <button onClick={onDuplicateProject} title="Copy" className="hover:text-white p-0.5 cursor-pointer">
                <Copy className="w-2.5 h-2.5" />
              </button>
              <button onClick={onRenameProject} title="Rename" className="hover:text-white p-0.5 cursor-pointer">
                <Edit2 className="w-2.5 h-2.5" />
              </button>
              {projects.length > 1 && (
                <button onClick={onDeleteProject} title="Delete" className="hover:text-rose-400 p-0.5 cursor-pointer">
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          <select
            value={activeProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="w-full bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer truncate"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-[#14161b] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-5 text-xs">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2 text-[10px] font-semibold text-[#656d76] tracking-wider font-mono">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-[#1e2229] text-white font-medium shadow-sm'
                        : 'text-[#8c949f] hover:text-[#e6edf3] hover:bg-[#16181d]'
                    }`}
                  >
                    <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#656d76]'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Identity & API Footer */}
      <div className="p-3 border-t border-[#1f2328] space-y-2 bg-[#0c0d0f] text-xs">
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#16181d] hover:bg-[#1e2229] text-white border border-[#2d3139] transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-[#34d399]" />
              <span className="text-[11px] font-medium">Take Product Tour</span>
            </div>
            <span className="text-[10px] font-mono text-[#7d8590]">6 Steps</span>
          </button>
        )}

        <button
          onClick={onOpenRoleModal}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#14161b] hover:bg-[#1a1d23] text-[#8c949f] hover:text-white transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#656d76]" />
            <span className="truncate text-[11px]">{currentRole}</span>
          </div>
          <span className="text-[10px] text-[#656d76]">Role</span>
        </button>

        <button
          onClick={onOpenGeminiConfig}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#14161b] hover:bg-[#1a1d23] text-[#8c949f] hover:text-white transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-3.5 h-3.5 ${geminiConnected ? 'text-emerald-400' : 'text-[#656d76]'}`} />
            <span className="text-[11px]">{geminiConnected ? 'Gemini 2.5 Active' : 'Gemini: Config'}</span>
          </div>
          <span className={`w-1.5 h-1.5 rounded-full ${geminiConnected ? 'bg-emerald-400' : 'bg-[#656d76]'}`} />
        </button>
      </div>
    </aside>
  );
};
