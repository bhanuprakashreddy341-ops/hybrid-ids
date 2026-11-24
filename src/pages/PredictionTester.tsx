import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Info,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { FlowPredictionResult } from '../types.ts';

const PRESETS = [
  {
    name: 'Normal ECG Telemetry (HL7 Port 2575)',
    values: {
      sourcePort: 49152,
      destinationPort: 2575,
      protocolNum: 6, // TCP
      packetSize: 240,
      flowDuration: 3500,
      packetRate: 15,
      byteCount: 3600,
      forwardPackets: 8,
      backwardPackets: 6,
      tcpFlagsNum: 16, // ACK
      loginAttempts: 0,
      connectionFrequency: 2,
      interArrivalTime: 65,
      flowBytesPerSec: 1028,
      flowPacketsPerSec: 15,
    },
  },
  {
    name: 'DDoS SYN Flood Attack',
    values: {
      sourcePort: 58210,
      destinationPort: 80,
      protocolNum: 6,
      packetSize: 1420,
      flowDuration: 420,
      packetRate: 1850,
      byteCount: 780000,
      forwardPackets: 140,
      backwardPackets: 1,
      tcpFlagsNum: 2, // SYN
      loginAttempts: 0,
      connectionFrequency: 95,
      interArrivalTime: 1,
      flowBytesPerSec: 1850000,
      flowPacketsPerSec: 1850,
    },
  },
  {
    name: 'DICOM Imaging Protocol Injection',
    values: {
      sourcePort: 51200,
      destinationPort: 104, // DICOM
      protocolNum: 6,
      packetSize: 1480,
      flowDuration: 1200,
      packetRate: 85,
      byteCount: 650000,
      forwardPackets: 55,
      backwardPackets: 4,
      tcpFlagsNum: 18, // SYN+ACK
      loginAttempts: 0,
      connectionFrequency: 18,
      interArrivalTime: 8,
      flowBytesPerSec: 541000,
      flowPacketsPerSec: 85,
    },
  },
  {
    name: 'Medical Gateway SSH Brute Force',
    values: {
      sourcePort: 42180,
      destinationPort: 22,
      protocolNum: 6,
      packetSize: 450,
      flowDuration: 8500,
      packetRate: 24,
      byteCount: 14500,
      forwardPackets: 32,
      backwardPackets: 28,
      tcpFlagsNum: 24, // ACK+PSH
      loginAttempts: 6,
      connectionFrequency: 45,
      interArrivalTime: 12,
      flowBytesPerSec: 1705,
      flowPacketsPerSec: 24,
    },
  },
  {
    name: 'PACS Database Exfiltration Burst',
    values: {
      sourcePort: 104,
      destinationPort: 443,
      protocolNum: 6,
      packetSize: 1460,
      flowDuration: 18000,
      packetRate: 380,
      byteCount: 4200000,
      forwardPackets: 240,
      backwardPackets: 12,
      tcpFlagsNum: 24,
      loginAttempts: 0,
      connectionFrequency: 22,
      interArrivalTime: 4,
      flowBytesPerSec: 850000,
      flowPacketsPerSec: 380,
    },
  },
];

export const PredictionTester: React.FC = () => {
  const [inputs, setInputs] = useState(PRESETS[0].values);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FlowPredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (field: string, val: number) => {
    setInputs((prev) => ({ ...prev, [field]: val }));
  };

  const handleApplyPreset = (presetValues: any) => {
    setInputs(presetValues);
    setResult(null);
    setErrorMsg(null);
  };

  const handleRunPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Model not trained – please train or load a model.');
      }

      const data = await res.json();
      setResult(data.prediction);
    } catch (err: any) {
      setErrorMsg(err.message || 'Model not trained – please train or load a model.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
          INTERACTIVE ML INFERENCE BENCH
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Flow Feature Prediction Tester
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Execute multi-algorithm classification and Explainable AI (SHAP-like attribution) on custom network flow vectors
        </p>
      </div>

      {/* Preset Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
        <div className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Quick Benchmark Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p.values)}
              className="px-3 py-1.5 rounded text-xs font-medium bg-slate-950 border border-slate-800 hover:border-sky-500 hover:text-sky-300 text-slate-300 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: 12+ Feature Inputs */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-5">
          <form onSubmit={handleRunPrediction} className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800">
              Network Flow Vector Parameters
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Source Port</label>
                <input
                  type="number"
                  value={inputs.sourcePort}
                  onChange={(e) => handleInputChange('sourcePort', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination Port</label>
                <input
                  type="number"
                  value={inputs.destinationPort}
                  onChange={(e) => handleInputChange('destinationPort', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Protocol Num (6=TCP, 17=UDP)</label>
                <input
                  type="number"
                  value={inputs.protocolNum}
                  onChange={(e) => handleInputChange('protocolNum', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Packet Size (Bytes)</label>
                <input
                  type="number"
                  value={inputs.packetSize}
                  onChange={(e) => handleInputChange('packetSize', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Flow Duration (ms)</label>
                <input
                  type="number"
                  value={inputs.flowDuration}
                  onChange={(e) => handleInputChange('flowDuration', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Packet Rate (pkts/s)</label>
                <input
                  type="number"
                  value={inputs.packetRate}
                  onChange={(e) => handleInputChange('packetRate', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Byte Count</label>
                <input
                  type="number"
                  value={inputs.byteCount}
                  onChange={(e) => handleInputChange('byteCount', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Forward Packets</label>
                <input
                  type="number"
                  value={inputs.forwardPackets}
                  onChange={(e) => handleInputChange('forwardPackets', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Backward Packets</label>
                <input
                  type="number"
                  value={inputs.backwardPackets}
                  onChange={(e) => handleInputChange('backwardPackets', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">TCP Flags Num (2=SYN, 16=ACK)</label>
                <input
                  type="number"
                  value={inputs.tcpFlagsNum}
                  onChange={(e) => handleInputChange('tcpFlagsNum', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Login Attempts</label>
                <input
                  type="number"
                  value={inputs.loginAttempts}
                  onChange={(e) => handleInputChange('loginAttempts', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Connection Frequency</label>
                <input
                  type="number"
                  value={inputs.connectionFrequency}
                  onChange={(e) => handleInputChange('connectionFrequency', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded border border-sky-400/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {loading ? 'Evaluating Model Ensemble...' : 'Run Hybrid ML Prediction'}
            </button>
          </form>
        </div>

        {/* Right Col: Prediction Output & Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {errorMsg ? (
            <div className="p-6 bg-rose-950/20 border border-rose-800/40 rounded-lg text-center">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-rose-300">{errorMsg}</div>
              <p className="text-xs text-slate-400 mt-1">
                Ensure models are initialized and active before running predictions.
              </p>
            </div>
          ) : !result ? (
            <div className="p-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-lg text-center text-slate-500 text-xs">
              Configure feature vector parameters on the left or select a preset, then click &quot;Run
              Hybrid ML Prediction&quot;.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall Consensus Result Card */}
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-slate-400">HYBRID DECISION ENGINE</span>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                      <span>{result.attackType || 'Benign Clinical Traffic'}</span>
                      <RiskBadge classification={result.attackClassification} />
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <RiskBadge score={Math.round(result.finalHybridScore * 100)} />
                    <RiskBadge severity={result.severity} />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                    <span className="text-slate-200 font-bold">{result.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ML TIER</span>
                    <span className="text-sky-400 font-bold">
                      {(result.mlThreatScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DEEP LEARNING</span>
                    <span className="text-indigo-400 font-bold">
                      {(result.dlThreatScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ANOMALY SCORE</span>
                    <span className="text-rose-400 font-bold">
                      {(result.anomalyScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Recommended Response */}
                <div className="mt-3 p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300">Recommended Safe Action: </span>
                  <span className="text-sky-300">{result.recommendedResponse}</span>
                </div>
              </div>

              {/* Individual Model Breakdown Grid */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-slate-200 mb-3">
                  Individual Algorithm Predictions
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">RANDOM FOREST</span>
                      <span className="text-slate-200 font-bold">
                        {(result.rf.score * 100).toFixed(1)}% Threat
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{result.rf.latencyMs}ms</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">SUPPORT VECTOR MACHINE</span>
                      <span className="text-slate-200 font-bold">
                        {(result.svm.score * 100).toFixed(1)}% Threat
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{result.svm.latencyMs}ms</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">XGBOOST</span>
                      <span className="text-slate-200 font-bold">
                        {(result.xgboost.score * 100).toFixed(1)}% Threat
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{result.xgboost.latencyMs}ms</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">CNN-MLP (1D CONV)</span>
                      <span className="text-slate-200 font-bold">
                        {(result.cnn.score * 100).toFixed(1)}% Threat
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{result.cnn.latencyMs}ms</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">LSTM-MLP (RECURRENT)</span>
                      <span className="text-slate-200 font-bold">
                        {(result.lstm.score * 100).toFixed(1)}% Threat
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{result.lstm.latencyMs}ms</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ISOLATION FOREST</span>
                      <span className="text-slate-200 font-bold">
                        {(result.isolationForest.anomalyScore * 100).toFixed(1)}% Anomaly
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {result.isolationForest.latencyMs}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Explainable AI: Feature Attributions */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span>Explainable AI (XAI) – Top Contributing Features</span>
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  Approximated Shapley marginal contributions driving this classification
                </p>

                <div className="space-y-2 font-mono text-xs">
                  {result.featureAttributions.map((fa) => (
                    <div
                      key={fa.feature}
                      className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-slate-200 font-semibold">{fa.feature} = {fa.value}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {fa.description}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold tabular-nums whitespace-nowrap ${
                          fa.contribution > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {fa.contribution > 0 ? `+${fa.contribution}` : fa.contribution}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
