import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Alert, AlertSeverity, AlertStatus } from '../types.ts';

interface AlertLogProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string, note: string) => void;
}

export const AlertLog: React.FC<AlertLogProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
}) => {
  const { canManageAlerts } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [attackTypeFilter, setAttackTypeFilter] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState<number>(0);

  // Resolution modal state
  const [resolvingAlert, setResolvingAlert] = useState<Alert | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Extract unique attack types
  const uniqueAttackTypes = useMemo(() => {
    return Array.from(new Set(alerts.map((a) => a.attackType)));
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alt) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          alt.attackType.toLowerCase().includes(query) ||
          alt.device.toLowerCase().includes(query) ||
          alt.source.toLowerCase().includes(query) ||
          alt.destination.toLowerCase().includes(query) ||
          alt.description.toLowerCase().includes(query) ||
          alt.id.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (severityFilter !== 'all' && alt.severity !== severityFilter) {
        return false;
      }

      if (statusFilter !== 'all' && alt.status !== statusFilter) {
        return false;
      }

      if (attackTypeFilter !== 'all' && alt.attackType !== attackTypeFilter) {
        return false;
      }

      if (alt.confidence < minConfidence) {
        return false;
      }

      return true;
    });
  }, [alerts, searchTerm, severityFilter, statusFilter, attackTypeFilter, minConfidence]);

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvingAlert) {
      onResolve(resolvingAlert.id, resolutionNote);
      setResolvingAlert(null);
      setResolutionNote('');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setAttackTypeFilter('all');
    setMinConfidence(0);
  };

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
            SECURITY OPERATIONS CENTER
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Intrusion Alert Management Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time IoMT intrusion events classified by the 6-model Hybrid Decision Engine
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Active Alerts: <strong className="text-slate-100">{alerts.length}</strong></span>
          <span>·</span>
          <span>Filtered: <strong className="text-sky-400">{filteredAlerts.length}</strong></span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by device, IP, alert ID, attack type..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Severity filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60 items-center">
          {/* Attack type filter */}
          <div>
            <select
              value={attackTypeFilter}
              onChange={(e) => setAttackTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Attack Signatures</option>
              {uniqueAttackTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence range slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap font-mono">
              Min Confidence: {minConfidence}%
            </span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Reset Filters button */}
          <div className="flex justify-end">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Data Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-mono">
                <th className="py-3 px-3">Alert ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Attack Classification</th>
                <th className="py-3 px-3">Target Device</th>
                <th className="py-3 px-3">Traffic Path</th>
                <th className="py-3 px-3">Threat Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No intrusion alerts matching active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-3 text-sky-400 font-bold whitespace-nowrap">
                      {alt.id}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap tabular-nums">
                      {alt.timestamp.substring(11, 19)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <RiskBadge severity={alt.severity} />
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-200">{alt.attackType}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {alt.detectionModel}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-200 truncate max-w-[160px]">
                      {alt.device}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap tabular-nums">
                      <span>{alt.source}</span> &rarr; <span>{alt.destination}</span>
                      <span className="text-slate-600 ml-1">({alt.protocol})</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <RiskBadge score={alt.threatScore} />
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Conf: {alt.confidence}%
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          alt.status === 'Resolved'
                            ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
                            : alt.status === 'Investigating'
                            ? 'text-yellow-400 bg-yellow-950/30 border-yellow-800/40'
                            : alt.status === 'Acknowledged'
                            ? 'text-sky-400 bg-sky-950/30 border-sky-800/40'
                            : 'text-rose-400 bg-rose-950/30 border-rose-800/40 animate-pulse'
                        }`}
                      >
                        {alt.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        {alt.status === 'New' && canManageAlerts && (
                          <button
                            onClick={() => onAcknowledge(alt.id)}
                            className="px-2 py-1 text-[11px] font-medium text-sky-400 hover:bg-sky-500/10 rounded border border-sky-500/30 transition-colors flex items-center gap-1"
                            title="Acknowledge alert"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Ack
                          </button>
                        )}
                        {alt.status !== 'Resolved' && canManageAlerts && (
                          <button
                            onClick={() => setResolvingAlert(alt)}
                            className="px-2 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 rounded border border-emerald-500/30 transition-colors flex items-center gap-1"
                            title="Resolve alert with remediation notes"
                          >
                            <FileCheck className="w-3 h-3" />
                            Resolve
                          </button>
                        )}
                        {alt.status === 'Resolved' && (
                          <span className="text-[10px] text-slate-500 italic">Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Note Modal */}
      <Modal
        isOpen={!!resolvingAlert}
        onClose={() => setResolvingAlert(null)}
        title="Resolve Security Intrusion Alert"
        subtitle={`Alert ${resolvingAlert?.id} – ${resolvingAlert?.attackType}`}
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <div className="font-semibold text-slate-200">Incident Details:</div>
            <div className="mt-1 text-slate-400 font-mono">
              Device: {resolvingAlert?.device} | Source: {resolvingAlert?.source} | Severity: {resolvingAlert?.severity}
            </div>
            <div className="mt-1 text-slate-400">
              {resolvingAlert?.description}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Remediation Note / Resolution Summary:
            </label>
            <textarea
              required
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Quarantined malicious IP at hospital edge firewall, updated IoMT device rule, confirmed benign biomedical scan..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setResolvingAlert(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded border border-emerald-400/30 transition-colors"
            >
              Confirm Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
