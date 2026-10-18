import React, { useState } from 'react';
import { UserRole, RolePermissions, ApiSecretItem, AuditLogEntry, DlpRule } from '../types';
import { ROLE_PERMISSIONS, redactPii } from '../data/securityData';
import { Download, RefreshCw } from 'lucide-react';

interface EnterpriseSecurityTabProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  apiSecrets: ApiSecretItem[];
  auditLogs: AuditLogEntry[];
  dlpRules: DlpRule[];
  onToggleDlpRule: (id: string) => void;
  onAddAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hash'>) => void;
  autonomousCapUsd: number;
}

export const EnterpriseSecurityTab: React.FC<EnterpriseSecurityTabProps> = ({
  currentRole,
  onRoleChange,
  apiSecrets,
  auditLogs,
  dlpRules,
  onToggleDlpRule,
  onAddAuditLog,
  autonomousCapUsd
}) => {
  const [sandboxInput, setSandboxInput] = useState(
    'Customer John Doe (SSN: 942-01-4829, email: j.doe@megacorp.com, card: 4532-8192-3841-9201) requested full refund for damaged ORD-101. User phone: +1 (415) 555-0199.'
  );
  const [selectedAuditFilter, setSelectedAuditFilter] = useState<string>('ALL');

  const permissions: RolePermissions = ROLE_PERMISSIONS[currentRole];
  const redactionResult = redactPii(sandboxInput, dlpRules);

  const filteredLogs = auditLogs.filter(log => {
    if (selectedAuditFilter === 'ALL') return true;
    return log.category === selectedAuditFilter || log.severity === selectedAuditFilter;
  });

  const handleSimulateRotation = (secret: ApiSecretItem) => {
    onAddAuditLog({
      actor: currentRole,
      role: currentRole,
      action: 'API_KEY_ROTATED',
      category: 'AUTH',
      severity: 'INFO',
      details: `Rotated key for ${secret.name} (${secret.envVar}).`
    });
  };

  const handleExportComplianceReport = () => {
    const report = `# Prism AI Enterprise Security & SOC2 Compliance Audit Report
Generated: ${new Date().toISOString()}
Role: ${currentRole}
Autonomous Cap: $${autonomousCapUsd}.00 USD

## 1. Zero-Trust Access Control (RBAC)
- Active Role: ${currentRole}
- Financial Cap (> $100): ${permissions.canApproveFinancialCap ? 'ALLOWED' : 'RESTRICTED'}
- Customer PII View: ${permissions.canViewUnredactedPii ? 'ALLOWED' : 'RESTRICTED'}
- Guardrails Modify: ${permissions.canModifyGuardrails ? 'ALLOWED' : 'RESTRICTED'}
- API Key Rotate: ${permissions.canRotateApiKeys ? 'ALLOWED' : 'RESTRICTED'}

## 2. API Key Enclave
${apiSecrets.map(s => `- [${s.status.toUpperCase()}] ${s.name} (${s.envVar}) | ${s.fingerprint}`).join('\n')}

## 3. Immutable Audit Trail
${auditLogs.map(l => `[${l.timestamp}] [${l.severity}] [${l.action}] by ${l.actor}: ${l.details}`).join('\n')}`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prism-security-audit-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2328]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Enterprise Security, Governance &amp; RBAC Vault</h2>
          <p className="text-xs text-[#8c949f] mt-1">
            Zero-trust credential vaults, real-time prompt PII redaction, deterministic authorization gates, and immutable audit trails.
          </p>
        </div>

        <button
          onClick={handleExportComplianceReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16181d] hover:bg-[#1f2328] text-xs text-[#e6edf3] border border-[#2d3139] transition self-start md:self-auto"
        >
          <Download className="w-3 h-3 text-[#8c949f]" />
          <span>Export SOC2 Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: RBAC Role Matrix */}
        <div className="lg:col-span-5 surface-card rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">1. Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-[#7d8590]">Active role defines authorization gates</p>
            </div>
            <span className="text-xs font-mono text-white">{currentRole}</span>
          </div>

          <div className="space-y-1.5">
            {(Object.keys(ROLE_PERMISSIONS) as UserRole[]).map(role => {
              const isActive = currentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`w-full p-2.5 rounded-lg text-left transition flex items-center justify-between text-xs border ${
                    isActive
                      ? 'bg-[#1a1d23] border-[#363c48] text-white font-medium'
                      : 'bg-[#14161b] border-[#1f2328] text-[#8c949f] hover:bg-[#16181d]'
                  }`}
                >
                  <span>{role}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
          </div>

          <div className="surface-sub rounded-lg p-3.5 space-y-2 text-xs">
            <div className="text-[11px] font-mono text-[#7d8590] uppercase">Permissions for {currentRole}:</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${permissions.canApproveFinancialCap ? 'bg-emerald-400' : 'bg-[#484f58]'}`} />
                <span className={permissions.canApproveFinancialCap ? 'text-[#c9d1d9]' : 'text-[#656d76]'}>Financial Cap &gt;$100</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${permissions.canViewUnredactedPii ? 'bg-emerald-400' : 'bg-[#484f58]'}`} />
                <span className={permissions.canViewUnredactedPii ? 'text-[#c9d1d9]' : 'text-[#656d76]'}>Customer PII View</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${permissions.canModifyGuardrails ? 'bg-emerald-400' : 'bg-[#484f58]'}`} />
                <span className={permissions.canModifyGuardrails ? 'text-[#c9d1d9]' : 'text-[#656d76]'}>Modify Guardrails</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${permissions.canRotateApiKeys ? 'bg-emerald-400' : 'bg-[#484f58]'}`} />
                <span className={permissions.canRotateApiKeys ? 'text-[#c9d1d9]' : 'text-[#656d76]'}>Rotate API Keys</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: API Secrets Enclave */}
        <div className="lg:col-span-7 surface-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2328]">
            <div>
              <h3 className="text-sm font-semibold text-white">2. Enterprise API Key Vault</h3>
              <p className="text-xs text-[#7d8590]">Hardware enclave encryption (AES-256-GCM)</p>
            </div>
            <span className="text-xs font-mono text-[#34d399]">Enclave Active</span>
          </div>

          <div className="space-y-2.5">
            {apiSecrets.map(sec => (
              <div key={sec.id} className="p-3 rounded-lg bg-[#14161b] border border-[#1f2328] text-xs flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{sec.name}</div>
                  <div className="font-mono text-[11px] text-[#7d8590]">
                    {sec.envVar} · <span className="text-[#c9d1d9]">{sec.maskedKey}</span>
                  </div>
                </div>

                {permissions.canRotateApiKeys ? (
                  <button
                    onClick={() => handleSimulateRotation(sec)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#16181d] hover:bg-[#242830] text-[#c9d1d9] text-xs transition border border-[#242830]"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rotate</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-[#656d76]">Read-only</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time DLP Redaction Sandbox */}
      <div className="surface-card rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1f2328]">
          <div>
            <h3 className="text-sm font-semibold text-white">3. Real-Time DLP &amp; PII Prompt Redaction Sandbox</h3>
            <p className="text-xs text-[#7d8590]">Masks customer PII before sending prompts to external model endpoints</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {dlpRules.map(rule => (
              <button
                key={rule.id}
                onClick={() => onToggleDlpRule(rule.id)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  rule.enabled
                    ? 'bg-[#1e2229] text-white border border-[#363c48]'
                    : 'bg-[#14161b] text-[#656d76] border border-[#1f2328]'
                }`}
              >
                {rule.enabled ? '✓ ' : ''}{rule.name.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#7d8590] mb-1">Raw Customer Input Prompt</label>
            <textarea
              rows={3}
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
              className="w-full bg-[#14161b] border border-[#242830] rounded-lg p-3 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#7d8590] mb-1">
              Redacted Prompt Sent to Gateway ({redactionResult.detectionsCount} entity masked)
            </label>
            <textarea
              readOnly
              rows={3}
              value={redactionResult.redactedText}
              className="w-full bg-[#0b0c0e] border border-[#242830] rounded-lg p-3 text-xs font-mono text-[#7ee787] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tamper-Evident Audit Log */}
      <div className="surface-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#1f2328] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">4. Tamper-Evident SHA-256 Audit Trail</h3>
            <p className="text-xs text-[#7d8590]">Immutable log of authorization events and guardrail interventions</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'GUARDRAIL', 'AUTH', 'EXPERIMENT'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedAuditFilter(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  selectedAuditFilter === cat ? 'bg-[#242830] text-white' : 'text-[#7d8590] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#14161b] text-[#7d8590] font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Time &amp; ID</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2328] text-[#c9d1d9] text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#16181d]">
                  <td className="py-2.5 px-4 font-mono text-[#8c949f] whitespace-nowrap">
                    <div>{log.id}</div>
                    <div className="text-[10px] text-[#656d76]">{log.timestamp}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="text-white">{log.actor}</div>
                    <div className="text-[10px] text-[#7d8590]">{log.role}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-white whitespace-nowrap">{log.action}</td>
                  <td className="py-2.5 px-4 text-[#8c949f]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
