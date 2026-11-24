import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Cpu,
  Layers,
  Activity,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ModelVersion, ModelPerformanceMetric } from '../types.ts';

interface ModelAnalyticsProps {
  onNavigateTraining: () => void;
}

export const ModelAnalytics: React.FC<ModelAnalyticsProps> = ({ onNavigateTraining }) => {
  const [activeVersion, setActiveVersion] = useState<ModelVersion | null>(null);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'precision' | 'recall' | 'f1Score'>('f1Score');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((data) => {
        if (data.activeVersion) {
          setActiveVersion(data.activeVersion);
        }
        if (data.versions) {
          setVersions(data.versions);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !activeVersion) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 font-mono">
        Loading Model Analytics benchmarks...
      </div>
    );
  }

  const m = activeVersion.metrics;

  const modelList = [
    { name: 'Random Forest', metric: m.randomForest, color: 'bg-sky-500', text: 'text-sky-400' },
    { name: 'Support Vector Machine', metric: m.svm, color: 'bg-indigo-500', text: 'text-indigo-400' },
    { name: 'XGBoost', metric: m.xgboost, color: 'bg-emerald-500', text: 'text-emerald-400' },
    { name: 'CNN-MLP (1D Conv)', metric: m.cnnMlp, color: 'bg-amber-500', text: 'text-amber-400' },
    { name: 'LSTM-MLP (Recurrent)', metric: m.lstmMlp, color: 'bg-purple-500', text: 'text-purple-400' },
    { name: 'Isolation Forest', metric: m.isolationForest, color: 'bg-rose-500', text: 'text-rose-400' },
    { name: 'Hybrid Ensemble', metric: m.hybridEnsemble, color: 'bg-teal-400', text: 'text-teal-300' },
  ];

  const getMetricValue = (metric: ModelPerformanceMetric | 'N/A – Not Evaluated', key: string): number | string => {
    if (metric === 'N/A – Not Evaluated' || !metric) return 'N/A – Not Evaluated';
    const val = (metric as any)[key];
    if (val === 'N/A – Not Evaluated' || val === undefined) return 'N/A – Not Evaluated';
    return Number((val * 100).toFixed(2));
  };

  const cm = activeVersion.confusionMatrix;
  const totalCM = cm.tp + cm.fp + cm.tn + cm.fn || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
            MACHINE LEARNING PIPELINE
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Model Performance & Comparative Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Version: <span className="text-slate-200 font-mono font-semibold">{activeVersion.version}</span> · Dataset: <span className="text-slate-200">{activeVersion.datasetName}</span> ({activeVersion.datasetSize} records)
          </p>
        </div>

        <button
          onClick={onNavigateTraining}
          className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded border border-sky-400/30 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Train New Version
        </button>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit text-xs">
        <button
          onClick={() => setSelectedMetric('accuracy')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            selectedMetric === 'accuracy'
              ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Accuracy
        </button>
        <button
          onClick={() => setSelectedMetric('precision')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            selectedMetric === 'precision'
              ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Precision
        </button>
        <button
          onClick={() => setSelectedMetric('recall')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            selectedMetric === 'recall'
              ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Recall
        </button>
        <button
          onClick={() => setSelectedMetric('f1Score')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            selectedMetric === 'f1Score'
              ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          F1-Score
        </button>
      </div>

      {/* Comparative Bar Chart Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 capitalize">
              {selectedMetric.replace('Score', '-Score')} Benchmark Comparison
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluated on held-out CICIDS2017 & IoMT test partition
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Scale: 0% – 100%</span>
        </div>

        <div className="mt-5 space-y-3.5">
          {modelList.map((mItem) => {
            const rawVal = getMetricValue(mItem.metric, selectedMetric);
            const isNA = rawVal === 'N/A – Not Evaluated';
            const numVal = isNA ? 0 : (rawVal as number);

            return (
              <div key={mItem.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-300">{mItem.name}</span>
                  <span className={`font-mono font-bold tabular-nums ${mItem.text}`}>
                    {isNA ? 'N/A – Not Evaluated' : `${rawVal}%`}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded border border-slate-800 overflow-hidden">
                  <div
                    className={`${mItem.color} h-full rounded transition-all duration-500`}
                    style={{ width: `${Math.max(2, numVal)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Confusion Matrix & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-100">
              Ensemble Confusion Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              True vs. predicted classifications on validation split
            </p>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <div className="grid grid-cols-2 gap-3 max-w-sm w-full text-center font-mono">
              {/* TP */}
              <div className="p-4 rounded border border-emerald-500/40 bg-emerald-950/20">
                <div className="text-[10px] text-slate-400 uppercase">True Positive (TP)</div>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">
                  {cm.tp}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {((cm.tp / totalCM) * 100).toFixed(1)}% attacks caught
                </div>
              </div>

              {/* FP */}
              <div className="p-4 rounded border border-rose-500/40 bg-rose-950/20">
                <div className="text-[10px] text-slate-400 uppercase">False Positive (FP)</div>
                <div className="text-2xl font-bold text-rose-400 tabular-nums mt-1">
                  {cm.fp}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {((cm.fp / totalCM) * 100).toFixed(1)}% false alarms
                </div>
              </div>

              {/* FN */}
              <div className="p-4 rounded border border-amber-500/40 bg-amber-950/20">
                <div className="text-[10px] text-slate-400 uppercase">False Negative (FN)</div>
                <div className="text-2xl font-bold text-amber-400 tabular-nums mt-1">
                  {cm.fn}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {((cm.fn / totalCM) * 100).toFixed(1)}% missed threats
                </div>
              </div>

              {/* TN */}
              <div className="p-4 rounded border border-sky-500/40 bg-sky-950/20">
                <div className="text-[10px] text-slate-400 uppercase">True Negative (TN)</div>
                <div className="text-2xl font-bold text-sky-400 tabular-nums mt-1">
                  {cm.tn}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {((cm.tn / totalCM) * 100).toFixed(1)}% normal confirmed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Importance Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
          <div className="pb-3 border-b border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-100">
              Gini Impurity Feature Importance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Top flow characteristics separating malicious intrusions from benign IoMT traffic
            </p>
          </div>

          <div className="mt-4 space-y-2.5 font-mono text-xs">
            {activeVersion.featureImportances.slice(0, 7).map((fi) => (
              <div key={fi.feature}>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{fi.feature}</span>
                  <span className="text-sky-400 font-bold tabular-nums">
                    {(fi.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, fi.importance * 350)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Versioning History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">
            Model Version Registry & Training Lineage
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Dataset</th>
                <th className="py-2.5 px-3">Trained On</th>
                <th className="py-2.5 px-3">Algorithms</th>
                <th className="py-2.5 px-3">Hybrid F1</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {versions.map((ver) => {
                const f1 =
                  ver.metrics.hybridEnsemble !== 'N/A – Not Evaluated'
                    ? `${(Number(ver.metrics.hybridEnsemble.f1Score) * 100).toFixed(2)}%`
                    : 'N/A – Not Evaluated';

                return (
                  <tr key={ver.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-2.5 px-3 text-sky-400 font-bold">{ver.version}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{ver.datasetName}</td>
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums">
                      {ver.trainingDate.substring(0, 10)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {ver.algorithms.length} models
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">
                      {f1}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          ver.status === 'active'
                            ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
                            : 'text-slate-400 bg-slate-900 border-slate-800'
                        }`}
                      >
                        {ver.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
