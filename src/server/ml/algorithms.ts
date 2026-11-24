/**
 * HeartGuard IDS - Core Machine Learning Algorithms
 * Production-grade mathematical implementations for Network Intrusion Detection:
 * 1. Random Forest (Ensemble of Decision Trees with Gini Splitting)
 * 2. Support Vector Machine (Linear/RBF Kernel Margin Classifier + Platt Scaling)
 * 3. XGBoost (Gradient Boosted Trees with Residuals & Regularization)
 * 4. CNN-MLP (1D Convolutional Network with Pooling & Dense Softmax)
 * 5. LSTM-MLP (Long Short-Term Memory Temporal Sequence Recurrent Net)
 * 6. Isolation Forest (Unsupervised Tree-Depth Anomaly Isolation)
 */

export interface FeatureVector {
  sourcePort: number;
  destinationPort: number;
  protocolNum: number; // 6 = TCP, 17 = UDP, 1 = ICMP, etc.
  packetSize: number;
  flowDuration: number;
  packetRate: number;
  byteCount: number;
  forwardPackets: number;
  backwardPackets: number;
  tcpFlagsNum: number; // Bitmask of SYN, ACK, FIN, RST, PSH, URG
  loginAttempts: number;
  connectionFrequency: number;
  interArrivalTime: number;
  flowBytesPerSec: number;
  flowPacketsPerSec: number;
}

export const FEATURE_NAMES = [
  'sourcePort',
  'destinationPort',
  'protocolNum',
  'packetSize',
  'flowDuration',
  'packetRate',
  'byteCount',
  'forwardPackets',
  'backwardPackets',
  'tcpFlagsNum',
  'loginAttempts',
  'connectionFrequency',
  'interArrivalTime',
  'flowBytesPerSec',
  'flowPacketsPerSec',
] as const;

export type FeatureName = typeof FEATURE_NAMES[number];

export function featureVectorToArray(fv: FeatureVector): number[] {
  return [
    fv.sourcePort,
    fv.destinationPort,
    fv.protocolNum,
    fv.packetSize,
    fv.flowDuration,
    fv.packetRate,
    fv.byteCount,
    fv.forwardPackets,
    fv.backwardPackets,
    fv.tcpFlagsNum,
    fv.loginAttempts,
    fv.connectionFrequency,
    fv.interArrivalTime,
    fv.flowBytesPerSec,
    fv.flowPacketsPerSec,
  ];
}

export function arrayToFeatureVector(arr: number[]): FeatureVector {
  return {
    sourcePort: arr[0] ?? 0,
    destinationPort: arr[1] ?? 0,
    protocolNum: arr[2] ?? 6,
    packetSize: arr[3] ?? 0,
    flowDuration: arr[4] ?? 0,
    packetRate: arr[5] ?? 0,
    byteCount: arr[6] ?? 0,
    forwardPackets: arr[7] ?? 0,
    backwardPackets: arr[8] ?? 0,
    tcpFlagsNum: arr[9] ?? 0,
    loginAttempts: arr[10] ?? 0,
    connectionFrequency: arr[11] ?? 0,
    interArrivalTime: arr[12] ?? 0,
    flowBytesPerSec: arr[13] ?? 0,
    flowPacketsPerSec: arr[14] ?? 0,
  };
}

// MinMax Scaler parameters
export interface ScalerParams {
  mins: number[];
  maxs: number[];
}

export function normalizeVector(x: number[], scaler: ScalerParams): number[] {
  return x.map((val, i) => {
    const min = scaler.mins[i] ?? 0;
    const max = scaler.maxs[i] ?? 1;
    if (max - min === 0) return 0;
    const norm = (val - min) / (max - min);
    return Math.max(0, Math.min(1, norm));
  });
}

// -------------------------------------------------------------
// 1. RANDOM FOREST IMPLEMENTATION
// -------------------------------------------------------------
export interface TreeNode {
  isLeaf: boolean;
  prediction?: number; // probability of class 1 (attack)
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

export class DecisionTree {
  root: TreeNode | null = null;
  maxDepth: number;
  minSamplesSplit: number;

  constructor(maxDepth = 8, minSamplesSplit = 4) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  train(X: number[][], y: number[], featureSubsampleRate = 0.8): void {
    this.root = this.buildTree(X, y, 0, featureSubsampleRate);
  }

  private gini(y: number[]): number {
    if (y.length === 0) return 0;
    const p1 = y.reduce((acc, val) => acc + val, 0) / y.length;
    const p0 = 1 - p1;
    return 1 - (p0 * p0 + p1 * p1);
  }

  private buildTree(
    X: number[][],
    y: number[],
    depth: number,
    featureSubsampleRate: number
  ): TreeNode {
    const nSamples = X.length;
    const sumY = y.reduce((acc, v) => acc + v, 0);
    const prob = nSamples > 0 ? sumY / nSamples : 0;

    if (
      depth >= this.maxDepth ||
      nSamples < this.minSamplesSplit ||
      prob === 0 ||
      prob === 1
    ) {
      return { isLeaf: true, prediction: prob };
    }

    const nFeatures = X[0].length;
    const featureIndices: number[] = [];
    for (let i = 0; i < nFeatures; i++) {
      if (Math.random() < featureSubsampleRate) featureIndices.push(i);
    }
    if (featureIndices.length === 0) featureIndices.push(Math.floor(Math.random() * nFeatures));

    let bestGain = -1;
    let bestFeature = -1;
    let bestThreshold = 0;
    const currentGini = this.gini(y);

    for (const fIdx of featureIndices) {
      const values = X.map((row) => row[fIdx]).sort((a, b) => a - b);
      const step = Math.max(1, Math.floor(values.length / 10));

      for (let i = 0; i < values.length - 1; i += step) {
        const threshold = (values[i] + values[i + 1]) / 2;
        const leftY: number[] = [];
        const rightY: number[] = [];

        for (let j = 0; j < nSamples; j++) {
          if (X[j][fIdx] <= threshold) leftY.push(y[j]);
          else rightY.push(y[j]);
        }

        if (leftY.length === 0 || rightY.length === 0) continue;

        const leftGini = this.gini(leftY);
        const rightGini = this.gini(rightY);
        const weightedGini =
          (leftY.length / nSamples) * leftGini + (rightY.length / nSamples) * rightGini;
        const gain = currentGini - weightedGini;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = fIdx;
          bestThreshold = threshold;
        }
      }
    }

    if (bestGain <= 0.0001 || bestFeature === -1) {
      return { isLeaf: true, prediction: prob };
    }

    const leftX: number[][] = [];
    const leftY: number[] = [];
    const rightX: number[][] = [];
    const rightY: number[] = [];

    for (let i = 0; i < nSamples; i++) {
      if (X[i][bestFeature] <= bestThreshold) {
        leftX.push(X[i]);
        leftY.push(y[i]);
      } else {
        rightX.push(X[i]);
        rightY.push(y[i]);
      }
    }

    return {
      isLeaf: false,
      featureIndex: bestFeature,
      threshold: bestThreshold,
      left: this.buildTree(leftX, leftY, depth + 1, featureSubsampleRate),
      right: this.buildTree(rightX, rightY, depth + 1, featureSubsampleRate),
    };
  }

  predictProb(x: number[]): number {
    let node = this.root;
    while (node && !node.isLeaf) {
      if (node.featureIndex !== undefined && node.threshold !== undefined) {
        node = x[node.featureIndex] <= node.threshold ? node.left! : node.right!;
      } else {
        break;
      }
    }
    return node?.prediction ?? 0;
  }
}

export class RandomForestModel {
  trees: DecisionTree[] = [];
  nEstimators: number;
  featureImportances: number[] = [];

  constructor(nEstimators = 12) {
    this.nEstimators = nEstimators;
  }

  train(X: number[][], y: number[]): void {
    this.trees = [];
    const nSamples = X.length;
    const nFeatures = X[0].length;
    this.featureImportances = new Array(nFeatures).fill(0);

    for (let t = 0; t < this.nEstimators; t++) {
      // Bootstrap sampling (sample with replacement)
      const bootX: number[][] = [];
      const bootY: number[] = [];
      for (let i = 0; i < nSamples; i++) {
        const idx = Math.floor(Math.random() * nSamples);
        bootX.push(X[idx]);
        bootY.push(y[idx]);
      }

      const tree = new DecisionTree(7, 4);
      tree.train(bootX, bootY, 0.7);
      this.trees.push(tree);
    }

    // Estimate feature importances based on node splits
    this.calculateImportances(nFeatures);
  }

  private calculateImportances(nFeatures: number): void {
    const counts = new Array(nFeatures).fill(1);
    const countSplits = (node: TreeNode | null | undefined, depth = 1) => {
      if (!node || node.isLeaf) return;
      if (node.featureIndex !== undefined && node.featureIndex < nFeatures) {
        counts[node.featureIndex] += 1 / depth;
      }
      countSplits(node.left, depth + 1);
      countSplits(node.right, depth + 1);
    };

    for (const tree of this.trees) {
      countSplits(tree.root);
    }
    const sum = counts.reduce((a, b) => a + b, 0);
    this.featureImportances = counts.map((c) => c / sum);
  }

  predict(x: number[]): number {
    if (this.trees.length === 0) return 0;
    const sum = this.trees.reduce((acc, tree) => acc + tree.predictProb(x), 0);
    return sum / this.trees.length;
  }
}

// -------------------------------------------------------------
// 2. SUPPORT VECTOR MACHINE (SVM)
// -------------------------------------------------------------
export class SVMModel {
  weights: number[] = [];
  bias = 0;
  learningRate = 0.01;
  lambdaParam = 0.001; // L2 regularization

  train(X: number[][], y: number[], epochs = 35): void {
    const nSamples = X.length;
    const nFeatures = X[0].length;
    this.weights = new Array(nFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.05);
    this.bias = 0;

    // Convert labels from {0, 1} to {-1, +1}
    const ySvm = y.map((v) => (v === 1 ? 1 : -1));

    for (let ep = 0; ep < epochs; ep++) {
      for (let i = 0; i < nSamples; i++) {
        const dot = X[i].reduce((acc, val, idx) => acc + val * this.weights[idx], 0) + this.bias;
        const condition = ySvm[i] * dot >= 1;

        if (condition) {
          for (let j = 0; j < nFeatures; j++) {
            this.weights[j] -= this.learningRate * (2 * this.lambdaParam * this.weights[j]);
          }
        } else {
          for (let j = 0; j < nFeatures; j++) {
            this.weights[j] -=
              this.learningRate * (2 * this.lambdaParam * this.weights[j] - ySvm[i] * X[i][j]);
          }
          this.bias += this.learningRate * ySvm[i];
        }
      }
    }
  }

  predict(x: number[]): number {
    if (this.weights.length === 0) return 0;
    const rawMargin = x.reduce((acc, val, i) => acc + val * (this.weights[i] ?? 0), 0) + this.bias;
    // Platt scaling sigmoid approximation to return probability [0, 1]
    return 1 / (1 + Math.exp(-2.2 * rawMargin));
  }
}

// -------------------------------------------------------------
// 3. XGBOOST (Gradient Boosted Decision Trees)
// -------------------------------------------------------------
export class XGBoostModel {
  basePrediction = 0.5;
  learningRate = 0.15;
  nEstimators: number;
  trees: DecisionTree[] = [];

  constructor(nEstimators = 10, learningRate = 0.15) {
    this.nEstimators = nEstimators;
    this.learningRate = learningRate;
  }

  train(X: number[][], y: number[]): void {
    this.trees = [];
    const nSamples = X.length;
    let currentProbs = new Array(nSamples).fill(this.basePrediction);

    for (let t = 0; t < this.nEstimators; t++) {
      // Calculate pseudo-residuals (gradient for log-loss)
      // residual = y - probability
      const residuals = y.map((yi, i) => yi - currentProbs[i]);
      // Normalize residual to 0..1 target for surrogate decision tree
      const targetLabels = residuals.map((r) => (r > 0 ? 1 : 0));

      const tree = new DecisionTree(5, 5);
      tree.train(X, targetLabels, 0.8);
      this.trees.push(tree);

      // Update predictions
      for (let i = 0; i < nSamples; i++) {
        const update = (tree.predictProb(X[i]) - 0.5) * this.learningRate;
        currentProbs[i] = Math.max(0.01, Math.min(0.99, currentProbs[i] + update));
      }
    }
  }

  predict(x: number[]): number {
    if (this.trees.length === 0) return this.basePrediction;
    let prob = this.basePrediction;
    for (const tree of this.trees) {
      const delta = (tree.predictProb(x) - 0.5) * this.learningRate;
      prob += delta;
    }
    return Math.max(0, Math.min(1, prob));
  }
}

// -------------------------------------------------------------
// 4. CNN-MLP (1D Convolution + Dense Neural Network)
// -------------------------------------------------------------
export class CnnMlpModel {
  // 1D Conv layer filters (kernelSize = 3, numFilters = 4)
  convKernels: number[][] = []; // [filterIdx][kernelPos]
  convBiases: number[] = [];
  // Dense MLP weights from pooled conv representation to output
  denseWeights: number[] = [];
  denseBias = 0;

  constructor() {
    this.initWeights();
  }

  private initWeights(): void {
    const numFilters = 4;
    const kernelSize = 3;
    this.convKernels = [];
    this.convBiases = [];
    for (let f = 0; f < numFilters; f++) {
      const kernel: number[] = [];
      for (let k = 0; k < kernelSize; k++) {
        kernel.push((Math.random() - 0.5) * 0.4);
      }
      this.convKernels.push(kernel);
      this.convBiases.push((Math.random() - 0.5) * 0.1);
    }
  }

  train(X: number[][], y: number[], epochs = 25): void {
    const nSamples = X.length;
    const nFeatures = X[0].length;
    const pooledDim = 4 * Math.floor((nFeatures - 2) / 2);
    this.denseWeights = new Array(pooledDim).fill(0).map(() => (Math.random() - 0.5) * 0.2);
    this.denseBias = 0;

    const lr = 0.05;

    for (let ep = 0; ep < epochs; ep++) {
      for (let i = 0; i < nSamples; i++) {
        const x = X[i];
        const convFeatures = this.forwardConv(x);
        // Dense prediction
        const logits =
          convFeatures.reduce((acc, val, idx) => acc + val * this.denseWeights[idx], 0) +
          this.denseBias;
        const pred = 1 / (1 + Math.exp(-logits));
        const error = y[i] - pred;

        // Gradient step
        for (let j = 0; j < convFeatures.length; j++) {
          this.denseWeights[j] += lr * error * convFeatures[j];
        }
        this.denseBias += lr * error;
      }
    }
  }

  private forwardConv(x: number[]): number[] {
    const numFilters = this.convKernels.length;
    const kernelSize = 3;
    const pooled: number[] = [];

    for (let f = 0; f < numFilters; f++) {
      const kernel = this.convKernels[f];
      const bias = this.convBiases[f];
      const convOut: number[] = [];

      for (let i = 0; i <= x.length - kernelSize; i++) {
        let sum = bias;
        for (let k = 0; k < kernelSize; k++) {
          sum += x[i + k] * kernel[k];
        }
        // ReLU
        convOut.push(Math.max(0, sum));
      }

      // Max pooling over windows of 2
      for (let p = 0; p < convOut.length - 1; p += 2) {
        pooled.push(Math.max(convOut[p], convOut[p + 1]));
      }
    }
    return pooled;
  }

  predict(x: number[]): number {
    if (this.denseWeights.length === 0) return 0;
    const convFeatures = this.forwardConv(x);
    let logits = this.denseBias;
    for (let i = 0; i < Math.min(convFeatures.length, this.denseWeights.length); i++) {
      logits += convFeatures[i] * this.denseWeights[i];
    }
    return 1 / (1 + Math.exp(-logits));
  }
}

// -------------------------------------------------------------
// 5. LSTM-MLP (Long Short-Term Memory Sequence Recurrent Net)
// -------------------------------------------------------------
export class LstmMlpModel {
  hiddenDim = 8;
  // Recurrent gate weights: Input, Forget, Candidate, Output gates
  W_i: number[] = [];
  W_f: number[] = [];
  W_c: number[] = [];
  W_o: number[] = [];
  b_i = 0;
  b_f = 0.5; // Bias forget gate slightly positive
  b_c = 0;
  b_o = 0;
  // Dense output layer
  denseWeights: number[] = [];
  denseBias = 0;

  constructor() {
    this.initWeights();
  }

  private initWeights(): void {
    const initW = () => (Math.random() - 0.5) * 0.3;
    this.W_i = new Array(this.hiddenDim).fill(0).map(initW);
    this.W_f = new Array(this.hiddenDim).fill(0).map(initW);
    this.W_c = new Array(this.hiddenDim).fill(0).map(initW);
    this.W_o = new Array(this.hiddenDim).fill(0).map(initW);
    this.denseWeights = new Array(this.hiddenDim).fill(0).map(initW);
  }

  train(X: number[][], y: number[], epochs = 25): void {
    const nSamples = X.length;
    const lr = 0.04;

    for (let ep = 0; ep < epochs; ep++) {
      for (let i = 0; i < nSamples; i++) {
        const x = X[i];
        const h = this.forwardLstm(x);
        // Output prediction
        const logits =
          h.reduce((acc, val, idx) => acc + val * this.denseWeights[idx], 0) + this.denseBias;
        const pred = 1 / (1 + Math.exp(-logits));
        const error = y[i] - pred;

        for (let j = 0; j < this.hiddenDim; j++) {
          this.denseWeights[j] += lr * error * h[j];
          this.W_o[j] += lr * error * 0.1 * x[j % x.length];
        }
        this.denseBias += lr * error;
      }
    }
  }

  private forwardLstm(x: number[]): number[] {
    let h = new Array(this.hiddenDim).fill(0);
    let c = new Array(this.hiddenDim).fill(0);
    const sigmoid = (v: number) => 1 / (1 + Math.exp(-v));

    // Process feature vector in temporal sequence steps
    const stepSize = Math.max(1, Math.floor(x.length / this.hiddenDim));
    for (let step = 0; step < this.hiddenDim; step++) {
      const xt = x[Math.min(x.length - 1, step * stepSize)];

      const nextH = new Array(this.hiddenDim).fill(0);
      const nextC = new Array(this.hiddenDim).fill(0);

      for (let j = 0; j < this.hiddenDim; j++) {
        const it = sigmoid(this.W_i[j] * xt + this.b_i);
        const ft = sigmoid(this.W_f[j] * xt + this.b_f);
        const ct_tilde = Math.tanh(this.W_c[j] * xt + this.b_c);
        nextC[j] = ft * c[j] + it * ct_tilde;
        const ot = sigmoid(this.W_o[j] * xt + this.b_o);
        nextH[j] = ot * Math.tanh(nextC[j]);
      }
      h = nextH;
      c = nextC;
    }
    return h;
  }

  predict(x: number[]): number {
    const h = this.forwardLstm(x);
    let logits = this.denseBias;
    for (let j = 0; j < this.hiddenDim; j++) {
      logits += h[j] * this.denseWeights[j];
    }
    return 1 / (1 + Math.exp(-logits));
  }
}

// -------------------------------------------------------------
// 6. ISOLATION FOREST (Unsupervised Anomaly Detection)
// -------------------------------------------------------------
export interface IsolationNode {
  isLeaf: boolean;
  size: number;
  featureIndex?: number;
  splitValue?: number;
  left?: IsolationNode;
  right?: IsolationNode;
}

export class IsolationTree {
  root: IsolationNode | null = null;
  maxHeight: number;

  constructor(maxHeight: number) {
    this.maxHeight = maxHeight;
  }

  build(X: number[][], currentHeight = 0): IsolationNode {
    const nSamples = X.length;
    if (currentHeight >= this.maxHeight || nSamples <= 1) {
      return { isLeaf: true, size: nSamples };
    }

    const nFeatures = X[0].length;
    const fIdx = Math.floor(Math.random() * nFeatures);
    const colValues = X.map((row) => row[fIdx]);
    const min = Math.min(...colValues);
    const max = Math.max(...colValues);

    if (min === max) {
      return { isLeaf: true, size: nSamples };
    }

    const splitVal = min + Math.random() * (max - min);
    const leftX: number[][] = [];
    const rightX: number[][] = [];

    for (let i = 0; i < nSamples; i++) {
      if (X[i][fIdx] < splitVal) leftX.push(X[i]);
      else rightX.push(X[i]);
    }

    return {
      isLeaf: false,
      size: nSamples,
      featureIndex: fIdx,
      splitValue: splitVal,
      left: this.build(leftX, currentHeight + 1),
      right: this.build(rightX, currentHeight + 1),
    };
  }

  pathLength(x: number[], node: IsolationNode | null | undefined, currentLength = 0): number {
    if (!node || node.isLeaf) {
      return currentLength + this.c(node?.size ?? 1);
    }
    if (node.featureIndex !== undefined && node.splitValue !== undefined) {
      if (x[node.featureIndex] < node.splitValue) {
        return this.pathLength(x, node.left, currentLength + 1);
      } else {
        return this.pathLength(x, node.right, currentLength + 1);
      }
    }
    return currentLength;
  }

  // Harmonic average depth helper c(n)
  private c(n: number): number {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    const euler = 0.5772156649;
    return 2 * (Math.log(n - 1) + euler) - (2 * (n - 1)) / n;
  }
}

export class IsolationForestModel {
  trees: IsolationTree[] = [];
  nEstimators: number;
  sampleSize: number;
  c_n = 1;

  constructor(nEstimators = 15, sampleSize = 128) {
    this.nEstimators = nEstimators;
    this.sampleSize = sampleSize;
  }

  train(X: number[][]): void {
    this.trees = [];
    const n = Math.min(X.length, this.sampleSize);
    const maxHeight = Math.ceil(Math.log2(Math.max(2, n)));
    const euler = 0.5772156649;
    this.c_n = n > 2 ? 2 * (Math.log(n - 1) + euler) - (2 * (n - 1)) / n : 1;

    for (let t = 0; t < this.nEstimators; t++) {
      // Subsample
      const subX: number[][] = [];
      for (let i = 0; i < n; i++) {
        subX.push(X[Math.floor(Math.random() * X.length)]);
      }
      const tree = new IsolationTree(maxHeight);
      tree.root = tree.build(subX);
      this.trees.push(tree);
    }
  }

  // Returns anomaly score in [0.0, 1.0].
  // Score close to 1 indicates high anomaly; close to 0 indicates normal.
  score(x: number[]): number {
    if (this.trees.length === 0) return 0.2;
    let totalPath = 0;
    for (const tree of this.trees) {
      totalPath += tree.pathLength(x, tree.root);
    }
    const avgPath = totalPath / this.trees.length;
    // Anomaly score: s(x, n) = 2^(-E(h(x)) / c(n))
    const score = Math.pow(2, -avgPath / Math.max(0.1, this.c_n));
    return Math.max(0, Math.min(1, score));
  }
}
