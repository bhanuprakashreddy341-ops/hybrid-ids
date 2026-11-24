import React, { useState, useEffect } from 'react';
import {
  Upload,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  Database,
  Sliders,
  Check,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { DatasetMeta, ModelVersion, TrainingRun } from '../types.ts';

const ALL_MODELS = [
  'Random Forest',
  'SVM',
  'XGBoost',
  'CNN-MLP',
  'LSTM-MLP',
  'Isolation Forest',
  'Hybrid Ensemble',
];

export const Training: React.FC = () => {
  const { canTrainModels } = useAuth();

  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [runs, setRuns] = useState<TrainingRun[]>([]);

  // CSV Upload state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadCsvText, setUploadCsvText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Training configuration
  const [selectedModels, setSelectedModels] = useState<string[]>([...ALL_MODELS]);
  const [splitRatio, setSplitRatio] = useState<number>(0.8);
  const [normalizeMethod, setNormalizeMethod] = useState<'MinMax' | 'ZScore'>('MinMax');
  const [epochs, setEpochs] = useState<number>(10);

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);
  const [trainStepMsg, setTrainStepMsg] = useState('');
  const [trainingError, setTrainingError] = useState<string | null>(null);

  const loadData = () => {
    fetch('/api/datasets')
      .then((r) => r.json())
      .then((d) => {
        if (d.datasets && d.datasets.length > 0) {
          setDatasets(d.datasets);
          if (!selectedDatasetId) setSelectedDatasetId(d.datasets[0].id);
        }
      });

    fetch('/api/models')
      .then((r) => r.json())
      .then((d) => {
        if (d.versions) setVersions(d.versions);
      });

    fetch('/api/training/runs')
      .then((r) => r.json())
      .then((d) => {
        if (d.runs) setRuns(d.runs);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleProcessUpload = async () => {
    if (!uploadFileName || !uploadCsvText) return;
    setUploading(true);
    setUploadMsg(null);

    try {
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: uploadFileName,
          csvContent: uploadCsvText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadMsg({
        type: 'success',
        text: `Dataset "${data.dataset.filename}" validated: ${data.dataset.rowCount} rows, ${data.dataset.columnCount} columns.`,
      });
      setDatasets((prev) => [data.dataset, ...prev]);
      setSelectedDatasetId(data.dataset.id);
      setUploadCsvText('');
      setUploadFileName('');
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleModel = (m: string) => {
    setSelectedModels((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const handleStartTraining = async () => {
    if (!activeDataset) return;
    setIsTraining(true);
    setTrainProgress(5);
    setTrainStepMsg('Preprocessing dataset, encoding and scaling...');
    setTrainingError(null);

    // Simulate progress updates for smooth feedback
    const interval = setInterval(() => {
      setTrainProgress((p) => (p < 90 ? p + Math.floor(Math.random() * 12) + 5 : p));
    }, 450);

    try {
      const res = await fetch('/api/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId: activeDataset.id,
          targetColumn: activeDataset.targetColumn,
          features: activeDataset.columns,
          selectedModels,
          splitRatio,
          normalizeMethod,
          epochs,
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Training failed');
      }

      setTrainProgress(100);
      setTrainStepMsg('Training complete! New model version registered and deployed as active.');
      loadData();
    } catch (err: any) {
      clearInterval(interval);
      setTrainingError(err.message || 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const handleActivateVersion = async (verId: string) => {
    try {
      const res = await fetch(`/api/models/${verId}/activate`, { method: 'POST' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to activate version:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
          ML PIPELINE TRAINING & BENCHMARKING
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Dataset Ingestion & Ensemble Model Training
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload network intrusion CSV datasets, inspect validation integrity, configure hyperparameters, and train the 6-model hybrid engine
        </p>
      </div>

      {/* Dataset Upload & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Upload CSV Dataset</span>
          </h2>

          <div className="p-4 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-lg text-center bg-slate-950/60">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload-input"
            />
            <label htmlFor="csv-upload-input" className="cursor-pointer block">
              <Database className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <div className="text-xs text-slate-300 font-medium">
                {uploadFileName ? uploadFileName : 'Choose CSV file (e.g. CICIDS2017 subset)'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Supports network intrusion flow attributes (ports, flags, rates, bytes)
              </div>
            </label>
          </div>

          {uploadFileName && (
            <button
              onClick={handleProcessUpload}
              disabled={uploading}
              className="w-full py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded border border-sky-400/30 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Validating & Parsing CSV...' : 'Validate & Index Dataset'}
            </button>
          )}

          {uploadMsg && (
            <div
              className={`p-3 rounded text-xs border ${
                uploadMsg.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
              }`}
            >
              {uploadMsg.text}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Default Benchmark: </span>
            A pre-loaded CICIDS2017 & IoMT healthcare telemetry dataset (8,420 rows) is indexed and available.
          </div>
        </div>

        {/* Dataset Preview & Validation Card */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Dataset Validation & Stats</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Integrity analysis across rows, missing fields, and class balance
              </p>
            </div>

            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>

          {activeDataset && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">TOTAL ROWS</span>
                  <span className="text-slate-100 font-bold tabular-nums">
                    {activeDataset.rowCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">COLUMNS</span>
                  <span className="text-slate-100 font-bold tabular-nums">
                    {activeDataset.columnCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">MISSING VALUES</span>
                  <span
                    className={`font-bold tabular-nums ${
                      activeDataset.missingValuesCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {activeDataset.missingValuesCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">DUPLICATES</span>
                  <span className="text-slate-300 font-bold tabular-nums">
                    {activeDataset.duplicateRecordsCount}
                  </span>
                </div>
              </div>

              {/* Class Distribution */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1.5">
                  Class Distribution:
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {Object.entries(activeDataset.classDistribution || {}).map(([clsName, count]) => (
                    <div
                      key={clsName}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      <span className="text-slate-400">{clsName}:</span>{' '}
                      <strong className="text-sky-400 tabular-nums">{count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Rows Preview */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1.5">
                  Sample Data Records:
                </div>
                <div className="overflow-x-auto border border-slate-800 rounded bg-slate-950">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead>
                      <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                        {activeDataset.columns.slice(0, 6).map((c) => (
                          <th key={c} className="py-1.5 px-2">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {activeDataset.sampleRows.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          {activeDataset.columns.slice(0, 6).map((c) => (
                            <td key={c} className="py-1.5 px-2 text-slate-300 truncate max-w-[120px]">
                              {String(row[c] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Training Configuration & Execution Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>Training Configuration & Hyperparameters</span>
        </h2>

        {/* Algorithm Selection */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-2">
            Select Machine Learning Models to Train:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {ALL_MODELS.map((model) => {
              const isSelected = selectedModels.includes(model);
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => handleToggleModel(model)}
                  className={`p-2.5 rounded text-xs font-medium border text-center transition-all ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">{model}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hyperparameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-mono">
              Train / Test Split Ratio: {(splitRatio * 100).toFixed(0)}% / {((1 - splitRatio) * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.6"
              max="0.9"
              step="0.05"
              value={splitRatio}
              onChange={(e) => setSplitRatio(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-mono">
              Normalization Strategy
            </label>
            <select
              value={normalizeMethod}
              onChange={(e) => setNormalizeMethod(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="MinMax">Min-Max Scaling [0, 1]</option>
              <option value="ZScore">Z-Score Standardization</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-mono">
              Epochs / Boosting Rounds: {epochs}
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={epochs}
              onChange={(e) => setEpochs(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {/* Action Button & Live Progress */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={handleStartTraining}
            disabled={isTraining || !canTrainModels}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded border border-sky-400/30 transition-colors flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isTraining ? 'Training in Progress...' : 'Start Model Training'}
          </button>

          {isTraining && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>{trainStepMsg}</span>
                <span className="text-sky-400 font-bold">{trainProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${trainProgress}%` }}
                />
              </div>
            </div>
          )}

          {trainingError && (
            <div className="mt-3 p-3 rounded bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{trainingError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Model Versions Registry & Activation */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            Registered Model Versions & Active Deployment
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Total Versions: {versions.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3">Version ID</th>
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3">Training Date</th>
                <th className="py-2.5 px-3">Algorithms</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {versions.map((ver) => {
                const isActive = ver.status === 'active';
                const acc =
                  ver.metrics.hybridEnsemble !== 'N/A – Not Evaluated'
                    ? `${(Number(ver.metrics.hybridEnsemble.accuracy) * 100).toFixed(2)}%`
                    : 'N/A – Not Evaluated';

                return (
                  <tr key={ver.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-sky-400">{ver.version}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{ver.datasetName}</td>
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums">
                      {ver.trainingDate.substring(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {ver.algorithms.length} models
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">
                      {acc}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isActive
                            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                            : 'text-slate-400 bg-slate-900 border-slate-800'
                        }`}
                      >
                        {isActive ? 'ACTIVE PRODUCTION' : 'ARCHIVED'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      {!isActive && (
                        <button
                          onClick={() => handleActivateVersion(ver.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-sky-400 hover:bg-sky-500/10 rounded border border-sky-500/30 transition-colors"
                        >
                          Activate Version
                        </button>
                      )}
                      {isActive && (
                        <span className="text-[11px] text-emerald-400 flex items-center justify-end gap-1">
                          <Check className="w-3 h-3" /> Live
                        </span>
                      )}
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
