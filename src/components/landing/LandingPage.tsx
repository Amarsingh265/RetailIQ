import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  BrainCircuit,
  ShieldCheck,
  Zap,
  BarChart2,
  FileCheck,
  CheckCircle2,
  Lock,
  Database,
  BookOpen
} from 'lucide-react';

export const LandingPage: React.FC<{ onLaunchApp: () => void; onOpenViva: () => void }> = ({
  onLaunchApp,
  onOpenViva
}) => {
  return (
    <div className="min-h-screen bg-[#F5F7F5] dark:bg-[#0A120E] text-[#17211B] dark:text-[#E2E8F0]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0F1713]/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1E2922] px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#14532D] text-white flex items-center justify-center font-bold text-base">
            R
          </div>
          <span className="text-base font-bold tracking-tight text-[#17211B] dark:text-white">
            RetailIQ
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          <a href="#features" className="hover:text-neutral-900 dark:hover:text-white">Features</a>
          <a href="#how-it-works" className="hover:text-neutral-900 dark:hover:text-white">How It Works</a>
          <a href="#ml-architecture" className="hover:text-neutral-900 dark:hover:text-white">ML Architecture</a>
          <a href="#roles" className="hover:text-neutral-900 dark:hover:text-white">Roles</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenViva}
            className="px-3 py-1.5 text-xs font-semibold text-[#14532D] dark:text-[#4ADE80] bg-[#E8F5E9] dark:bg-[#102A1C] border border-[#C8E6C9] dark:border-[#1E4A30] rounded-lg hover:bg-[#C8E6C9] transition-colors"
          >
            VTU Viva Guide
          </button>
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#14532D] hover:bg-[#1b6b3b] dark:bg-[#16A34A] rounded-lg shadow-xs transition-colors"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 lg:px-12 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#14532D] dark:text-emerald-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VTU Engineering Mini Project · AI & Machine Learning Domain</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Turn Retail Data Into Smarter Business Decisions.
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Understand your customers, predict purchasing behaviour, and grow your retail business with intelligent analytics.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#14532D] hover:bg-[#1b6b3b] dark:bg-[#16A34A] rounded-xl shadow-md transition-all hover:scale-102"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#features"
            className="px-6 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#14201A] border border-neutral-300 dark:border-[#22332A] rounded-xl hover:bg-neutral-50 dark:hover:bg-[#1B2921] transition-colors"
          >
            Explore Features
          </a>
        </div>

        {/* Live Metrics Showcase Banner */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="p-6 bg-white dark:bg-[#121B16] border border-neutral-200/90 dark:border-[#1E2922] rounded-2xl shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <div className="text-xs text-neutral-400 font-medium">Dataset Source</div>
              <div className="text-lg font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">UCI Retail II</div>
              <div className="text-[10px] text-neutral-500">Official benchmark</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Predictive Model</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">Random Forest</div>
              <div className="text-[10px] text-neutral-500">85%+ Test accuracy</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Customer Clustering</div>
              <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 mt-0.5">K-Means (RFM)</div>
              <div className="text-[10px] text-neutral-500">Elbow & Silhouette verified</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Dual Interface</div>
              <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">Owner / Analyst</div>
              <div className="text-[10px] text-neutral-500">Simple & Expert modes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: What is RetailIQ? */}
      <section id="features" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">Product Overview</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            What is RetailIQ?
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
            An intelligent full-stack retail decision engine designed to bridge advanced machine learning science with daily commercial retail decisions.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#16A34A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              RFM Customer Segmentation
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Calculates Recency, Frequency, and Monetary scores with log-transformation. Groups shoppers into Champions, Loyalists, At-Risk, and New Customer personas.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              30-Day Purchase Prediction
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Supervised Random Forest Classifier predicts whether any customer will make a repeat purchase in the next 30 days with confidence probabilities.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Market Basket & Churn Retention
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Uncovers item co-purchase association rules (Lift & Confidence) and tags customers approaching dormancy for automated win-back campaigns.
            </p>
          </div>
        </div>
      </section>

      {/* Section: How It Works */}
      <section id="how-it-works" className="py-16 px-6 lg:px-12 bg-white dark:bg-[#0E1612] border-y border-neutral-200/80 dark:border-[#1E2922]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              How RetailIQ Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#F5F7F5] dark:bg-[#14201A] border border-neutral-200 dark:border-[#22332A] rounded-xl space-y-2">
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">Step 01</div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100">Data Upload & Cleaning</div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Ingest CSV or multi-sheet Excel sales files. Detect and isolate cancellations (<code className="font-mono">C...</code>) and compute line totals.
              </p>
            </div>

            <div className="p-4 bg-[#F5F7F5] dark:bg-[#14201A] border border-neutral-200 dark:border-[#22332A] rounded-xl space-y-2">
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">Step 02</div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100">RFM Feature Extraction</div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Compute Recency, Frequency, Monetary, and AOV for every customer. Standardize matrices via log-transforms and z-scores.
              </p>
            </div>

            <div className="p-4 bg-[#F5F7F5] dark:bg-[#14201A] border border-neutral-200 dark:border-[#22332A] rounded-xl space-y-2">
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">Step 03</div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100">Machine Learning Execution</div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Fit K-Means clustering and train Random Forest classifier on chronological test splits without lookahead leakage.
              </p>
            </div>

            <div className="p-4 bg-[#F5F7F5] dark:bg-[#14201A] border border-neutral-200 dark:border-[#22332A] rounded-xl space-y-2">
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">Step 04</div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100">Prescriptive Actions</div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Deliver plain-English recommendations for shop owners and exhaustive telemetry reports for data analysts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Roles (Retailers vs Analysts) */}
      <section id="roles" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">Role-Based Experience</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            Engineered for Retailers and Analysts Alike
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>For Retailers & Shop Owners</span>
            </div>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero mathematical jargon; clean customer groupings (Champions, At-Risk).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>One-click customer purchase probability search with plain explanations.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Download ready-to-use business reports in Excel and PDF format.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <BarChart2 className="w-5 h-5 text-sky-600" />
              <span>For Data Scientists & Academic Evaluators</span>
            </div>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Empirical Confusion Matrix, ROC-AUC curves, and Gini Feature Importance.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Live hyperparameter tuning (K clusters, number of trees, max depth).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Elbow plot and Silhouette scores across K=2..7 with centroids table.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-6 lg:px-12 bg-[#14532D] text-white text-center space-y-5">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
          Ready to Explore Retail Intelligence?
        </h2>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto">
          Pre-loaded with authentic UCI Online Retail II transactions. Test clustering, run 30-day predictions, or upload custom datasets immediately.
        </p>
        <button
          onClick={onLaunchApp}
          className="px-6 py-3 text-sm font-bold text-[#14532D] bg-white rounded-xl shadow-lg hover:bg-neutral-100 transition-all hover:scale-102"
        >
          Launch RetailIQ Dashboard Now
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-neutral-200 dark:border-[#1E2922] text-xs text-neutral-500 dark:text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          RetailIQ – Smart Customer Analytics · VTU Engineering Mini Project
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onOpenViva} className="hover:underline">Viva Documentation</button>
          <span>·</span>
          <button onClick={onLaunchApp} className="hover:underline">Live Application</button>
        </div>
      </footer>
    </div>
  );
};
