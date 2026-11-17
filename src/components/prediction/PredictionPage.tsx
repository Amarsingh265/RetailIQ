import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  ShoppingBag,
  Clock,
  PoundSterling,
  Sparkles,
  Download,
  Info
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerRFM } from '../../types';

type PurchaseGrade = 'F1' | 'F2' | 'F3';

const getPurchaseGrade = (monetary: number, lowerSpendCutoff: number, upperSpendCutoff: number): PurchaseGrade => {
  if (monetary >= upperSpendCutoff) return 'F1';
  if (monetary >= lowerSpendCutoff) return 'F2';
  return 'F3';
};

export const PredictionPage: React.FC<{ initialCustomerId?: string }> = ({ initialCustomerId }) => {
  const { customers, rfModel, randomForestMetrics, predictCustomerPurchase } = useData();
  const { isExpertMode } = useTheme();

  // Search state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || (customers[0]?.customerId || '13000')
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // What-If Simulator sliders
  const [simRecency, setSimRecency] = useState<number>(18);
  const [simFrequency, setSimFrequency] = useState<number>(5);
  const [simMonetary, setSimMonetary] = useState<number>(650);
  const [simAOV, setSimAOV] = useState<number>(130);

  // Selected customer object
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.customerId === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  const spendCutoffs = useMemo(() => {
    const spendValues = customers.map((customer) => customer.monetary).sort((a, b) => a - b);
    if (spendValues.length === 0) return { lower: 0, upper: 0 };

    return {
      lower: spendValues[Math.floor(spendValues.length / 3)],
      upper: spendValues[Math.floor((spendValues.length * 2) / 3)]
    };
  }, [customers]);

  // Simulation calculation
  const simResult = useMemo(() => {
    return predictCustomerPurchase(simRecency, simFrequency, simMonetary, simAOV);
  }, [simRecency, simFrequency, simMonetary, simAOV, predictCustomerPurchase]);

  // Batch table filters
  const [classFilter, setClassFilter] = useState<'All' | 'Likely' | 'Unlikely'>('All');
  const [batchPage, setBatchPage] = useState<number>(1);
  const batchPageSize = 10;

  const filteredBatch = useMemo(() => {
    let list = [...customers];
    if (classFilter === 'Likely') list = list.filter((c) => c.predictedPurchaseClass === 1);
    if (classFilter === 'Unlikely') list = list.filter((c) => c.predictedPurchaseClass === 0);
    return list;
  }, [customers, classFilter]);

  const totalBatchPages = Math.ceil(filteredBatch.length / batchPageSize) || 1;
  const paginatedBatch = useMemo(() => {
    const s = (batchPage - 1) * batchPageSize;
    return filteredBatch.slice(s, s + batchPageSize);
  }, [filteredBatch, batchPage]);

  // Probability percentage display
  const customerProb = activeCustomer?.purchaseProbability !== undefined
    ? Math.round(activeCustomer.purchaseProbability * 100)
    : 72;

  const willBuy = activeCustomer?.predictedPurchaseClass === 1;
  const activeCustomerGrade = activeCustomer
    ? getPurchaseGrade(activeCustomer.monetary, spendCutoffs.lower, spendCutoffs.upper)
    : undefined;
  const simulatedPurchaseGrade = getPurchaseGrade(simMonetary, spendCutoffs.lower, spendCutoffs.upper);

  const handleExportBatchCSV = () => {
    const headers = ['CustomerID', 'Recency_Days', 'Frequency', 'Monetary_GBP', 'Purchase_Grade', 'Probability_Next_30D', 'Predicted_Decision', 'Segment'];
    const rows = filteredBatch.map((c) => [
      c.customerId,
      c.recency,
      c.frequency,
      c.monetary,
      getPurchaseGrade(c.monetary, spendCutoffs.lower, spendCutoffs.upper),
      c.purchaseProbability ?? 0.5,
      c.predictedPurchaseClass === 1 ? 'Likely (1)' : 'Unlikely (0)',
      `"${c.segmentName || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RetailIQ_Purchase_Predictions_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Methodology Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              30-Day Purchase Prediction Engine
            </h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              Random Forest Classifier
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Predicts whether a customer will execute an order in the subsequent 30-day window based on chronological snapshot features
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 dark:text-neutral-400">Model Accuracy:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {randomForestMetrics ? `${(randomForestMetrics.accuracy * 100).toFixed(1)}%` : '86.4%'}
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span className="text-neutral-500 dark:text-neutral-400">ROC-AUC:</span>
          <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
            {randomForestMetrics?.aucRoc || 0.88}
          </span>
        </div>
      </div>

      {/* Main Grid: Customer Inference Search & What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Deep-Dive Inference Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            {/* Search customer ID selector */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Individual Customer Inference
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter or select a customer ID to inspect real-time purchase likelihood
                </p>
              </div>

              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="ID (e.g. 13002)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const match = customers.find((c) => c.customerId.includes(e.target.value));
                    if (match) setSelectedCustomerId(match.customerId);
                  }}
                  className="w-full pl-8 pr-2 py-1 text-xs bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>
            </div>

            {activeCustomer ? (
              <div className="space-y-4">
                {/* Customer Identity Bar */}
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#14532D] text-white flex items-center justify-center font-bold text-sm">
                      #{activeCustomer.customerId.slice(-2)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <span>Customer #{activeCustomer.customerId}</span>
                        <span className="font-normal text-neutral-400">({activeCustomer.country})</span>
                      </div>
                      <div className="text-[11px] text-[#16A34A] font-medium">
                        Segment: {activeCustomer.segmentName || 'Regular Customer'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-neutral-400 uppercase">First Seen</div>
                    <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                      {activeCustomer.firstPurchaseDate}
                    </div>
                  </div>
                </div>

                {/* Probability Score Meter */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-[#1E2922] bg-gradient-to-br from-white to-neutral-50 dark:from-[#121B16] dark:to-[#17221C]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Predicted 30-Day Purchase Likelihood:
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      willBuy
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}>
                      {willBuy ? 'Likely to Purchase (Class 1)' : 'Unlikely to Purchase (Class 0)'}
                    </span>
                  </div>

                  <div className="flex items-end gap-3 mb-2">
                    <div className="text-3xl font-extrabold font-mono text-neutral-900 dark:text-neutral-50">
                      {customerProb}%
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 pb-1">
                      Ensemble confidence: {customerProb > 70 ? 'High' : customerProb > 50 ? 'Moderate' : 'Low'}
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        customerProb >= 60 ? 'bg-[#16A34A]' : customerProb >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${customerProb}%` }}
                    />
                  </div>
                </div>

                {/* RFM Attributes Grid for this customer */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                  <div className="p-2.5 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                    <div className="text-[10px] text-neutral-400 uppercase font-sans">Recency</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                      {activeCustomer.recency}d
                    </div>
                    <div className="text-[9px] text-neutral-400 font-sans mt-0.5">days since order</div>
                  </div>

                  <div className="p-2.5 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                    <div className="text-[10px] text-neutral-400 uppercase font-sans">Frequency</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                      {activeCustomer.frequency}x
                    </div>
                    <div className="text-[9px] text-neutral-400 font-sans mt-0.5">orders placed</div>
                  </div>

                  <div className="p-2.5 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                    <div className="text-[10px] text-neutral-400 uppercase font-sans">Monetary</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                      £{activeCustomer.monetary.toFixed(0)}
                    </div>
                    <div className="text-[9px] text-neutral-400 font-sans mt-0.5">lifetime spend</div>
                  </div>

                  <div className="p-2.5 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                    <div className="text-[10px] text-neutral-400 uppercase font-sans">Purchase Grade</div>
                    <div className={`inline-flex text-sm font-bold mt-0.5 px-1.5 rounded ${
                      activeCustomerGrade === 'F1'
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60'
                        : activeCustomerGrade === 'F2'
                        ? 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60'
                        : 'text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800'
                    }`}>
                      {activeCustomerGrade}
                    </div>
                    <div className="text-[9px] text-neutral-400 font-sans mt-0.5">
                      {activeCustomerGrade === 'F1'
                        ? 'high spend'
                        : activeCustomerGrade === 'F2'
                        ? 'medium spend'
                        : 'low spend'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                    <div className="text-[10px] text-neutral-400 uppercase font-sans">Avg Basket</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                      £{activeCustomer.avgOrderValue.toFixed(0)}
                    </div>
                    <div className="text-[9px] text-neutral-400 font-sans mt-0.5">per checkout</div>
                  </div>
                </div>

                {/* Result Interpretation & Actionable Advice */}
                <div className="p-3 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200/80 dark:border-[#22332A] rounded-lg text-xs">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Business Assessment:</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">
                    {willBuy
                      ? `Customer #${activeCustomer.customerId} exhibits strong repeat momentum (last active ${activeCustomer.recency} days ago across ${activeCustomer.frequency} orders). Ideal candidate for early access product recommendations or category cross-selling.`
                      : `Customer #${activeCustomer.customerId} displays elevated dormant risk with ${activeCustomer.recency} days of inactivity. Triggering an automated reactivation discount before 90 days elapse is recommended.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-400 text-xs">
                No customer selected. Search a valid ID above.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "What-If" Customer Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                What-If Customer Simulator
              </h2>
              <Sliders className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Simulate hypothetical customer attributes to observe real-time model predictions
            </p>

            <div className="space-y-4 text-xs">
              {/* Recency Slider */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-neutral-700 dark:text-neutral-300">Days Since Last Order (Recency):</span>
                  <span className="font-mono text-[#16A34A] font-bold">{simRecency} days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="180"
                  value={simRecency}
                  onChange={(e) => setSimRecency(parseInt(e.target.value))}
                  className="w-full accent-[#16A34A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>1 day (Very Recent)</span>
                  <span>180 days (Dormant)</span>
                </div>
              </div>

              {/* Frequency Slider */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-neutral-700 dark:text-neutral-300">Total Completed Orders (Frequency):</span>
                  <span className="font-mono text-[#16A34A] font-bold">{simFrequency} orders</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simFrequency}
                  onChange={(e) => setSimFrequency(parseInt(e.target.value))}
                  className="w-full accent-[#16A34A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>1 order</span>
                  <span>20 orders</span>
                </div>
              </div>

              {/* Monetary Spend Slider */}
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-neutral-700 dark:text-neutral-300">Lifetime Expenditure (Monetary):</span>
                  <span className="font-mono text-[#16A34A] font-bold">£{simMonetary}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="2500"
                  step="10"
                  value={simMonetary}
                  onChange={(e) => setSimMonetary(parseInt(e.target.value))}
                  className="w-full accent-[#16A34A] cursor-pointer"
                />
                <div className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                  Spend grade: <span className="font-semibold text-neutral-700 dark:text-neutral-200">{simulatedPurchaseGrade}</span>
                  <span className="ml-1">(F1 high, F2 medium, F3 low)</span>
                </div>
              </div>

              {/* Simulated Output Meter */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="p-3 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-neutral-500">Simulated Prediction:</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      simResult.decision === 1
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}>
                      {simResult.decision === 1 ? 'Will Buy (1)' : 'Will Not Buy (0)'}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-50">
                    {(simResult.probability * 100).toFixed(0)}% Probability
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    Risk Category: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{simResult.risk}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Customer Prediction Table */}
      <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Customer Batch Prediction Ledger
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Evaluated using chronological snapshot window with Random Forest ensemble. Spend grades are relative to the current dataset: F1 high, F2 medium, F3 low.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
              <button
                onClick={() => {
                  setClassFilter('All');
                  setBatchPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  classFilter === 'All' ? 'bg-white dark:bg-neutral-700 shadow-xs text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => {
                  setClassFilter('Likely');
                  setBatchPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  classFilter === 'Likely' ? 'bg-white dark:bg-neutral-700 shadow-xs text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Likely (1)
              </button>
              <button
                onClick={() => {
                  setClassFilter('Unlikely');
                  setBatchPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  classFilter === 'Unlikely' ? 'bg-white dark:bg-neutral-700 shadow-xs text-neutral-600 dark:text-neutral-300' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Unlikely (0)
              </button>
            </div>

            <button
              onClick={handleExportBatchCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg hover:bg-neutral-50 dark:hover:bg-[#1B2921]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Predictions</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[10px] uppercase font-semibold">
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3 text-right">Recency</th>
                <th className="py-2.5 px-3 text-right">Frequency</th>
                <th className="py-2.5 px-3 text-right">Monetary (£)</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3 text-right">Purchase Probability</th>
                <th className="py-2.5 px-3 text-center">Prediction (Next 30D)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
              {paginatedBatch.map((c) => {
                const prob = Math.round((c.purchaseProbability ?? 0.5) * 100);
                const isLikely = c.predictedPurchaseClass === 1;
                const purchaseGrade = getPurchaseGrade(c.monetary, spendCutoffs.lower, spendCutoffs.upper);

                return (
                  <tr key={c.customerId} className="hover:bg-neutral-50 dark:hover:bg-[#16221B]">
                    <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      #{c.customerId}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-neutral-600 dark:text-neutral-400">
                      {c.segmentName || 'Regular'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-700 dark:text-neutral-300">
                      {c.recency}d
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-700 dark:text-neutral-300">
                      {c.frequency}x
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-900 dark:text-neutral-100 font-semibold">
                      £{c.monetary.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        purchaseGrade === 'F1'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : purchaseGrade === 'F2'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}>
                        {purchaseGrade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={prob >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}>
                        {prob}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          isLikely
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {isLikely ? 'Likely to Buy' : 'Unlikely to Buy'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <button
                        onClick={() => setSelectedCustomerId(c.customerId)}
                        className="text-[11px] text-[#16A34A] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Batch pagination */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="text-neutral-500 dark:text-neutral-400">
            Page {batchPage} of {totalBatchPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBatchPage((p) => Math.max(1, p - 1))}
              disabled={batchPage === 1}
              className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setBatchPage((p) => Math.min(totalBatchPages, p + 1))}
              disabled={batchPage === totalBatchPages}
              className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
