import React, { useState } from 'react';
import {
  BookOpen,
  X,
  CheckCircle2,
  BrainCircuit,
  Database,
  TrendingUp,
  Cpu,
  Layers,
  HelpCircle,
  FileText,
  Sparkles
} from 'lucide-react';

export const VivaGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'math' | 'qa'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#101C17] border border-neutral-200 dark:border-[#1E3326] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-[#1E3326] flex items-center justify-between bg-neutral-50/70 dark:bg-[#0C1511]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14532D] text-white flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <span>VTU Engineering Mini Project & Viva Voce Guide</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Evaluation Ready
                </span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Retail Customer Segmentation and Purchase Prediction Using Machine Learning
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#15231C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 border-b border-neutral-200 dark:border-[#1E3326] flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#16A34A] text-[#14532D] dark:text-[#4ADE80]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Project Abstract & Objectives
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-[#16A34A] text-[#14532D] dark:text-[#4ADE80]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            ML Pipeline Architecture
          </button>
          <button
            onClick={() => setActiveTab('math')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'math'
                ? 'border-[#16A34A] text-[#14532D] dark:text-[#4ADE80]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Mathematical Formulations
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'qa'
                ? 'border-[#16A34A] text-[#14532D] dark:text-[#4ADE80]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Top Viva Q&A
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 dark:bg-[#102A1C]/60 border border-emerald-200 dark:border-[#1E4A30] rounded-xl space-y-2">
                <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#16A34A]" />
                  <span>Executive Abstract</span>
                </div>
                <p>
                  Retail businesses face intense competition and customer acquisition costs. This mini project delivers <strong>RetailIQ</strong>, an end-to-end AI-powered retail decision intelligence platform that integrates unsupervised <strong>K-Means Clustering</strong> on RFM matrices with supervised <strong>Random Forest Classification</strong> for 30-day forward purchase prediction. Powered by authentic transactional data from the <strong>UCI Online Retail II</strong> benchmark repository, the platform provides dual operational interfaces: an intuitive Business Owner mode and an advanced Expert Analyst telemetry console.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Key Academic Objectives:
                </h3>
                <ul className="list-disc list-inside space-y-1.5">
                  <li><strong>Data Preprocessing:</strong> Ingestion of raw retail receipts, automated isolation of cancellations (<code className="font-mono">Invoice.startsWith('C')</code>), removal of missing customer IDs, and calculation of line totals (<code className="font-mono">TotalAmount = Quantity * Price</code>).</li>
                  <li><strong>RFM Feature Engineering:</strong> Extraction of customer-level behavioral dimensions: Recency (days dormant), Frequency (orders placed), and Monetary (total spend), augmented with Average Order Value (AOV).</li>
                  <li><strong>Customer Segmentation:</strong> Unsupervised K-Means clustering with log-transformation to manage right-skewed data, standardized via StandardScaler, and validated through the Elbow Method (Inertia) and Silhouette Scores.</li>
                  <li><strong>Purchase Prediction:</strong> Supervised binary classification using an ensemble Random Forest model to predict customer repurchase in the subsequent 30-day window, preventing data leakage via chronological feature slicing.</li>
                  <li><strong>Explainable Business Prescriptions:</strong> Generating targeted marketing strategies (VIP retention, win-back discounts, bundle cross-sells) grounded strictly in empirical data.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                End-to-End Machine Learning Pipeline
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-xl">
                  <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center mb-1.5">
                    1
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">Data Ingestion</div>
                  <p className="text-[11px] text-neutral-500 mt-1">UCI Online Retail II, CSV/XLSX parser, schema mapper, deduplication.</p>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-xl">
                  <div className="w-7 h-7 mx-auto rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold flex items-center justify-center mb-1.5">
                    2
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">Feature Engineering</div>
                  <p className="text-[11px] text-neutral-500 mt-1">RFM aggregation, log1p transformation for skewness, StandardScaler (z-score).</p>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-xl">
                  <div className="w-7 h-7 mx-auto rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold flex items-center justify-center mb-1.5">
                    3
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">K-Means Clustering</div>
                  <p className="text-[11px] text-neutral-500 mt-1">Elbow plot (Inertia vs K), Silhouette coefficients, centroid profiling.</p>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-xl">
                  <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center mb-1.5">
                    4
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">Random Forest</div>
                  <p className="text-[11px] text-neutral-500 mt-1">70/15/15 chronological split, confusion matrix, ROC-AUC, Gini feature importance.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATHEMATICAL FORMULATIONS */}
          {activeTab === 'math' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-xl space-y-2">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">1. RFM Mathematical Definitions:</div>
                <div className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 space-y-1">
                  <div>Recency (R) = t_ref - t_lastPurchase (days)</div>
                  <div>Frequency (F) = |{'{'}Invoice_i : Customer = c{'}'}|</div>
                  <div>Monetary (M) = sum(Quantity_i * Price_i)</div>
                  <div>Average Order Value (AOV) = M / F</div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-xl space-y-2">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">2. K-Means Objective Function (Inertia):</div>
                <div className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                  J = sum_k=1..K sum_x_in_C_k ||x - mu_k||^2
                </div>
                <p className="text-neutral-500">
                  Where mu_k is the centroid of cluster C_k. Minimizing J produces compact, cohesive clusters.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-xl space-y-2">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">3. Silhouette Coefficient:</div>
                <div className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                  s(i) = (b(i) - a(i)) / max(a(i), b(i))
                </div>
                <p className="text-neutral-500">
                  a(i) is mean intra-cluster distance; b(i) is mean nearest-cluster distance. Ranges from -1 to +1.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-xl space-y-2">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">4. Decision Tree Gini Impurity:</div>
                <div className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                  Gini(D) = 1 - sum_k=1..C (p_k)^2
                </div>
                <p className="text-neutral-500">
                  Measures the probability of a randomly chosen element being incorrectly labeled.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TOP VIVA Q&A */}
          {activeTab === 'qa' && (
            <div className="space-y-3">
              <div className="p-3 bg-neutral-50 dark:bg-[#15201A] rounded-lg">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">
                  Q1: Why do we apply log-transformation to RFM features prior to clustering?
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px]">
                  <strong>Answer:</strong> Monetary and Frequency features in retail exhibit heavy positive skewness (Pareto distribution: 80% of sales from 20% of customers). Log-transformation (ln(1 + x)) stabilizes variance and compresses long tails so Euclidean distance calculations in K-Means are not dominated solely by extreme outliers.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-[#15201A] rounded-lg">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">
                  Q2: How do you prevent data leakage in 30-day forward purchase prediction?
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px]">
                  <strong>Answer:</strong> We establish a strict chronological cutoff date. Features (Recency, Frequency, Spend) are computed strictly from transactions occurring prior to the cutoff date. The binary target label (Y=1 if customer purchased) is derived exclusively from the subsequent 30-day observation window, ensuring zero lookahead bias.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-[#15201A] rounded-lg">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">
                  Q3: Why use Random Forest instead of a single Decision Tree?
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px]">
                  <strong>Answer:</strong> Individual decision trees suffer from high variance and are prone to overfitting. Random Forest employs bootstrap aggregation (bagging) with random feature subspace sampling, creating decorrelated trees whose ensemble majority vote dramatically reduces generalization error and yields reliable class probabilities.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-[#15201A] rounded-lg">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">
                  Q4: How do you choose the optimal number of clusters K?
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px]">
                  <strong>Answer:</strong> We compute the Elbow Method (tracking Inertia versus K to spot the bend where marginal inertia reduction diminishes) and validate it with the Silhouette Score (measuring cluster tightness versus separation). In our retail dataset, K=4 offers an optimal balance between mathematical separation and commercial interpretability.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-[#1E3326] bg-neutral-50/70 dark:bg-[#0C1511] flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 font-mono">
            RetailIQ · VTU Department of Computer Science & Engineering
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#14532D] text-white font-medium rounded-lg text-xs hover:bg-[#1b6b3b]"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
