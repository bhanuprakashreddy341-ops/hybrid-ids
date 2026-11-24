import React, { useState, useEffect } from 'react';
import { Search, FileText, Shield, Download } from 'lucide-react';
import { AuditLog } from '../types.ts';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((r) => r.json())
      .then((d) => {
        if (d.logs) setLogs(d.logs);
      })
      .catch((e) => console.error('Failed to load audit logs:', e));
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (moduleFilter !== 'all' && log.module.toLowerCase() !== moduleFilter.toLowerCase()) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `heartguard_audit_trail_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
            COMPLIANCE & GOVERNANCE
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Cryptographic SOC Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all user interventions, model activations, alert resolutions, and device state transitions
          </p>
        </div>

        <button
          onClick={exportLogsAsJson}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit Trail JSON
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, action code, details..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="all">All Modules</option>
          <option value="Auth">Auth</option>
          <option value="Alerts">Alerts</option>
          <option value="Devices">Devices</option>
          <option value="Training">Training</option>
          <option value="Models">Models</option>
          <option value="Settings">Settings</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Operator / Persona</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-sky-400 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-400 whitespace-nowrap">
                      {log.module}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans truncate max-w-[150px]">
                      {log.user}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {log.role}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
