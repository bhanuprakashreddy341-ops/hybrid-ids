import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Radio,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { SystemSettings } from '../types.ts';

export const Settings: React.FC = () => {
  const { canChangeSettings } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load settings:', e);
        setLoading(false);
      });
  }, []);

  if (loading || !settings) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 font-mono">
        Loading system configuration parameters...
      </div>
    );
  }

  const handleWeightChange = (key: keyof SystemSettings['weights'], val: number) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        weights: { ...prev.weights, [key]: val },
      };
    });
  };

  const handleThresholdChange = (key: keyof SystemSettings['thresholds'], val: number) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        thresholds: { ...prev.thresholds, [key]: val },
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChangeSettings) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      weights: {
        randomForest: 0.25,
        svm: 0.15,
        xgboost: 0.25,
        cnn: 0.15,
        lstm: 0.1,
        isolationForest: 0.1,
      },
      thresholds: {
        suspicious: 0.4,
        malicious: 0.75,
        criticalSeverity: 0.85,
      },
      telemetrySimulation: {
        enabled: true,
        frequencySeconds: 3,
        attackSimulationRatio: 0.25,
      },
      disclaimerAccepted: true,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
          SYSTEM PREFERENCES
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Ensemble Weights & Threshold Calibration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune algorithmic sensitivity, decision boundaries, and IoMT telemetry simulation
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Decision Boundary Thresholds */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Classification Decision Boundaries</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Suspicious Classification Threshold:</span>
                <span className="text-amber-400 font-bold">
                  {settings.thresholds.suspicious.toFixed(2)} ({(settings.thresholds.suspicious * 100).toFixed(0)}%)
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.6"
                step="0.05"
                value={settings.thresholds.suspicious}
                onChange={(e) => handleThresholdChange('suspicious', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Malicious Classification Threshold:</span>
                <span className="text-rose-400 font-bold">
                  {settings.thresholds.malicious.toFixed(2)} ({(settings.thresholds.malicious * 100).toFixed(0)}%)
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="0.9"
                step="0.05"
                value={settings.thresholds.malicious}
                onChange={(e) => handleThresholdChange('malicious', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Critical Severity Escalation Cutoff:</span>
                <span className="text-rose-500 font-bold">
                  {settings.thresholds.criticalSeverity.toFixed(2)} ({(settings.thresholds.criticalSeverity * 100).toFixed(0)}%)
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="0.95"
                step="0.02"
                value={settings.thresholds.criticalSeverity}
                onChange={(e) => handleThresholdChange('criticalSeverity', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
          </div>
        </div>

        {/* 2. Hybrid Ensemble Contribution Weights */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Hybrid Ensemble Voting Weights</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Random Forest Weight:</span>
                <span className="text-sky-400 font-bold">{settings.weights.randomForest.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={settings.weights.randomForest}
                onChange={(e) => handleWeightChange('randomForest', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>SVM Margin Weight:</span>
                <span className="text-indigo-400 font-bold">{settings.weights.svm.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={settings.weights.svm}
                onChange={(e) => handleWeightChange('svm', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>XGBoost Gradient Weight:</span>
                <span className="text-emerald-400 font-bold">{settings.weights.xgboost.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={settings.weights.xgboost}
                onChange={(e) => handleWeightChange('xgboost', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>1D CNN Filter Weight:</span>
                <span className="text-amber-400 font-bold">{settings.weights.cnn.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={settings.weights.cnn}
                onChange={(e) => handleWeightChange('cnn', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>LSTM Recurrent Weight:</span>
                <span className="text-purple-400 font-bold">{settings.weights.lstm.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={settings.weights.lstm}
                onChange={(e) => handleWeightChange('lstm', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Isolation Forest Anomaly Weight:</span>
                <span className="text-rose-400 font-bold">{settings.weights.isolationForest.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={settings.weights.isolationForest}
                onChange={(e) => handleWeightChange('isolationForest', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Telemetry Stream Controls */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <span>Live Healthcare Device Telemetry Generator</span>
          </h2>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={settings.telemetrySimulation.enabled}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          telemetrySimulation: {
                            ...prev.telemetrySimulation,
                            enabled: e.target.checked,
                          },
                        }
                      : prev
                  )
                }
                className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
              />
              <span>Enable Continuous Live Simulated Traffic Stream</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">
                Transmission Frequency: {settings.telemetrySimulation.frequencySeconds}s
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={settings.telemetrySimulation.frequencySeconds}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          telemetrySimulation: {
                            ...prev.telemetrySimulation,
                            frequencySeconds: Number(e.target.value),
                          },
                        }
                      : prev
                  )
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">
                Attack Flow Simulation Ratio: {(settings.telemetrySimulation.attackSimulationRatio * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={settings.telemetrySimulation.attackSimulationRatio}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          telemetrySimulation: {
                            ...prev.telemetrySimulation,
                            attackSimulationRatio: Number(e.target.value),
                          },
                        }
                      : prev
                  )
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Medical Research Disclaimer */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">
            Cybersecurity & Medical Research Disclaimer:
          </div>
          <p>
            HeartGuard IDS decision thresholds and risk calculations are algorithmic heuristics
            developed for connected healthcare cybersecurity research and B.E. major-project
            demonstration. They do not constitute medically validated or FDA/CE certified clinical
            diagnostic instruments.
          </p>
        </div>

        {/* Submit & Reset Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Standard Defaults
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Configuration Saved
              </span>
            )}
            <button
              type="submit"
              disabled={!canChangeSettings}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded border border-sky-400/30 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
