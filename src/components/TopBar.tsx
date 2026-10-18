import React from 'react';
import { Save, Download, Play, HelpCircle } from 'lucide-react';

interface TopBarProps {
  activeTabTitle: string;
  projectName: string;
  onSaveProject: () => void;
  onExportSpec: () => void;
  onLoadPreset: (key: string) => void;
  globalActiveModel: string;
  globalCostPerSuccess: number;
  onStartTour?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTabTitle,
  projectName,
  onSaveProject,
  onExportSpec,
  onLoadPreset,
  globalActiveModel,
  globalCostPerSuccess,
  onStartTour
}) => {
  return (
    <header className="h-14 shrink-0 border-b border-[#1f2328] bg-[#0c0d0f]/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs text-[#7d8590] truncate">
        <span className="text-[#8c949f] font-medium">{projectName}</span>
        <span aria-hidden="true" className="text-[#484f58]">/</span>
        <span className="text-white font-semibold truncate">{activeTabTitle}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0 text-xs">
        {/* Subtle metrics summary */}
        <div className="hidden lg:flex items-center gap-2 text-[#7d8590] text-[11px] font-mono mr-2">
          <span>Model: <span className="text-[#e6edf3]">{globalActiveModel}</span></span>
          <span aria-hidden="true">·</span>
          <span>Cost/Task: <span className="text-[#e6edf3]">${globalCostPerSuccess.toFixed(4)}</span></span>
        </div>

        {/* Demo Preset Select */}
        <select
          onChange={(e) => {
            if (e.target.value) onLoadPreset(e.target.value);
          }}
          defaultValue=""
          className="bg-[#14161b] border border-[#242830] text-[#8c949f] hover:text-white rounded-md px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
        >
          <option value="" disabled>Load Preset...</option>
          <option value="support">Dispute Agent (50k/d)</option>
          <option value="rag">Legal Copilot (15k/d)</option>
          <option value="scale">Search Assistant (450k/d)</option>
        </select>

        {/* Start Product Tour Button */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16181d] hover:bg-[#1f2328] text-white border border-[#2d3139] text-xs font-medium transition cursor-pointer"
            title="Take Product Tour"
          >
            <Play className="w-3 h-3 text-[#34d399]" />
            <span className="hidden sm:inline">Tour</span>
          </button>
        )}

        {/* Save Workspace */}
        <button
          onClick={onSaveProject}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#16181d] hover:bg-[#1f2328] text-[#e6edf3] border border-[#2d3139] text-xs font-medium transition cursor-pointer"
        >
          <Save className="w-3 h-3 text-[#8c949f]" />
          <span>Save</span>
        </button>

        {/* Export Spec */}
        <button
          onClick={onExportSpec}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#f0f3f6] hover:bg-white text-[#0b0c0e] font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <Download className="w-3 h-3 text-[#0b0c0e]" />
          <span>Export Spec</span>
        </button>
      </div>
    </header>
  );
};
