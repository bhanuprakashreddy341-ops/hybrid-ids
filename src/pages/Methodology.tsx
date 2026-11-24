import React from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  Shield,
  Activity,
  Code,
  CheckCircle,
  HelpCircle,
  HardDrive,
} from 'lucide-react';

export const Methodology: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
          ACADEMIC & SYSTEM SPECIFICATION
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          HeartGuard IDS Methodology & Architectural Defense
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Comprehensive algorithmic breakdown for B.E. Major Project: Hybrid Machine Learning-Based Intrusion Detection for Connected Healthcare Networks
        </p>
      </div>

      {/* Network Topology Visualization Card */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/80 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <span>Connected Healthcare Architecture Topology</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            10 monitored clinical endpoints spanning ICU, Surgical Recovery, Radiology, and DMZ subnets
          </p>
        </div>

        <div className="relative aspect-16/9 bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src="/src/assets/images/medical_network_topology_1791296818444.jpg"
            alt="Medical Network Topology Diagram"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* 1. Multi-Tier Hybrid Pipeline Overview */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>1. System Architecture Flow</span>
        </h2>

        <div className="p-4 bg-slate-950 rounded border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
          <pre>{`[10 Healthcare Devices: ECG, Ventilator, Infusion Pump, MRI, CT, PACS...]
                             ↓
             [Real-Time Network Flow Collection]
                             ↓
             [Traffic Validation & Normalization]
                             ↓
       [Feature Extraction: 15 Core Flow Attributes]
                             ↓
  ┌─────────────────────────────────────────────────────────┐
  │ TIER 1: Classical Feature-Based Machine Learning        │
  │   - Random Forest (14 Trees, Gini Impurity Splitting)   │
  │   - Support Vector Machine (Margin Boundary + Platt)    │
  │   - XGBoost (Gradient Boosted Trees, Shrinkage η=0.15)  │
  └─────────────────────────────────────────────────────────┘
                             ↓
  ┌─────────────────────────────────────────────────────────┐
  │ TIER 2: Deep Learning Sequence & Representation Models  │
  │   - CNN-MLP (1D Convolutional Filter Bank + MaxPool)    │
  │   - LSTM-MLP (Recurrent Gating: Input, Forget, Output)  │
  └─────────────────────────────────────────────────────────┘
                             ↓
  ┌─────────────────────────────────────────────────────────┐
  │ TIER 3: Unsupervised Anomaly Isolation                   │
  │   - Isolation Forest (Recursive Random Splitting Depth) │
  └─────────────────────────────────────────────────────────┘
                             ↓
  ┌─────────────────────────────────────────────────────────┐
  │ HYBRID DECISION ENGINE                                  │
  │   Weighted Consensus Voting:                            │
  │   S_final = ∑(w_i * S_i) / ∑(w_i)                       │
  │   Attack Classification: Normal | Suspicious | Malicious│
  │   Explainable AI: Shapley-like Marginal Attributions    │
  └─────────────────────────────────────────────────────────┘
                             ↓
  ┌─────────────────────────────────────────────────────────┐
  │ ADAPTIVE DEVICE RISK SCORING & SAFE RESPONSE ENGINE     │
  │   Safe Sandbox Quarantine (Zero Clinical Disruption)   │
  └─────────────────────────────────────────────────────────┘`}</pre>
        </div>
      </div>

      {/* 2. Mathematical Formulations of the 6 ML Models */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>2. Mathematical Formulations of the 6 Detection Models</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
            <div className="font-bold text-sky-400 mb-1">Random Forest (Gini Bagging)</div>
            <p className="text-slate-300 font-sans text-[11px] mb-2">
              Ensemble of decision trees minimizing node impurity via Gini index:
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-200">
              Gini(D) = 1 - ∑(p_i)²
            </div>
            <div className="mt-2 text-slate-400 text-[10px] font-sans">
              Aggregates probabilistic leaves across bootstrap replicates to prevent overfitting on burst traffic.
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
            <div className="font-bold text-indigo-400 mb-1">Support Vector Machine (Platt)</div>
            <p className="text-slate-300 font-sans text-[11px] mb-2">
              Maximizes margin hyperplane with L2 regularization and Platt sigmoid scaling:
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-200">
              f(x) = wᵀx + b, P = 1 / (1 + e^(-2.2 f(x)))
            </div>
            <div className="mt-2 text-slate-400 text-[10px] font-sans">
              Provides robust geometric margins against high-dimensional port scanning.
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
            <div className="font-bold text-emerald-400 mb-1">XGBoost (Residual Gradient)</div>
            <p className="text-slate-300 font-sans text-[11px] mb-2">
              Sequential boosting trees fit to pseudo-residuals with learning rate shrinkage:
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-200">
              r_im = y_i - p_m(x_i), w_j = -∑g_i / (∑h_i + λ)
            </div>
            <div className="mt-2 text-slate-400 text-[10px] font-sans">
              Excels at capturing non-linear interactions in byte rates and flag permutations.
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
            <div className="font-bold text-amber-400 mb-1">1D CNN-MLP Representation</div>
            <p className="text-slate-300 font-sans text-[11px] mb-2">
              Applies 1D convolution filter kernels over normalized flow vectors followed by max-pooling:
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-200">
              y_f[i] = ReLU(∑(x[i+k] * W_f[k]) + b_f)
            </div>
            <div className="mt-2 text-slate-400 text-[10px] font-sans">
              Extracts spatial correlation among adjacent packet attributes.
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
            <div className="font-bold text-purple-400 mb-1">LSTM-MLP Recurrent Gating</div>
            <p className="text-slate-300 font-sans text-[11px] mb-2">
              Models temporal packet burst dynamics using input, forget, and output gating:
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-200">
              f_t = σ(W_f x_t + U_f h_{'{'}t-1{'}'} + b_f), C_t = f_t C_{'{'}t-1{'}'} + i_t C̃_t
            </div>
            <div className="mt-2 text-slate-400 text-[10px] font-sans">
              Identifies stealthy low-and-slow exfiltration and slowloris attacks.
            </div>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
            <div className="font-bold text-rose-400 mb-1">Isolation Forest (Anomaly Depth)</div>
            <p className="text-slate-300 font-sans text-[11px] mb-2">
              Isolates zero-day anomalies via recursive path lengths in random partition trees:
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-200">
              s(x, n) = 2^(-E(h(x)) / c(n))
            </div>
            <div className="mt-2 text-slate-400 text-[10px] font-sans">
              Anomalous vectors isolate at shallow tree depths without requiring labeled attack data.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Adaptive Device Risk Scoring Formula */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>3. Adaptive Medical Device Risk Scoring Formula</span>
        </h2>

        <p className="text-xs text-slate-300">
          Individual device risk score $R_{'{'}dev{'}'} \in [0, 100]$ dynamically adjusts following every flow observation using an exponential moving average weighted by asset criticality:
        </p>

        <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-200">
          R_t = (1 - α) · R_{'{'}t-1{'}'} + α · [S_{'{'}hybrid{'}'} · C_{'{'}device{'}'} · 70 + min(30, Alerts_{'{'}recent{'}'} · 10)]
        </div>

        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li><strong>α = 0.25:</strong> Smoothing memory factor preventing momentary spikes.</li>
          <li><strong>C_device:</strong> Criticality coefficient (Ventilator = 1.3, Infusion Pump = 1.3, Gateway = 1.25, Glucose Monitor = 1.0).</li>
          <li><strong>Alerts_recent:</strong> Cumulative penalty for unresolved active security alerts.</li>
        </ul>
      </div>

      {/* 4. Explainable AI (XAI) Attribution */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>4. Explainable AI & SHAP-Approximated Attributions</span>
        </h2>

        <p className="text-xs text-slate-300">
          To fulfill healthcare cybersecurity auditability standards, black-box decisions are prohibited. Every prediction computes marginal contribution values $\phi_i$ across all 15 flow features:
        </p>

        <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-200">
          φ_i ≈ f(x_1, ..., x_i + Δ, ..., x_n) - f(x_1, ..., x_i, ..., x_n)
        </div>

        <p className="text-xs text-slate-400">
          This delivers transparent insight to SOC clinicians demonstrating exactly why a packet burst or port scan triggered an alarm.
        </p>
      </div>
    </div>
  );
};
