import React, { useState, useMemo } from 'react';
import {
  Zap,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useData } from '../../context/DataContext';

export const AnalyticsPage: React.FC = () => {
  const { customers, associationRules, salesForecast, kMeansMetrics } = useData();

  const [activeTab, setActiveTab] = useState<'churn' | 'clv' | 'forecast' | 'marketBasket'>('churn');

  // Churn Statistics
  const churnStats = useMemo(() => {
    const high = customers.filter((c) => c.churnRisk === 'High');
    const med = customers.filter((c) => c.churnRisk === 'Medium');
    const low = customers.filter((c) => c.churnRisk === 'Low');
    const total = customers.length || 1;

    const highRevenueAtStake = high.reduce((s, c) => s + c.monetary, 0);

    return {
      highCount: high.length,
      highPct: +((high.length / total) * 100).toFixed(1),
      medCount: med.length,
      medPct: +((med.length / total) * 100).toFixed(1),
      lowCount: low.length,
      lowPct: +((low.length / total) * 100).toFixed(1),
      highRevenueAtStake: +highRevenueAtStake.toFixed(2),
      highCustomers: high.slice(0, 8)
    };
  }, [customers]);

  // CLV Statistics
  const clvStats = useMemo(() => {
    let tierHigh = 0;
    let tierMid = 0;
    let tierLow = 0;
    let totalPredCLV = 0;
    let totalHistCLV = 0;

    customers.forEach((c) => {
      const pred = c.clvPredictive || 0;
      const hist = c.clvHistorical || 0;
      totalPredCLV += pred;
      totalHistCLV += hist;

      if (pred >= 800) tierHigh++;
      else if (pred >= 250) tierMid++;
      else tierLow++;
    });

    const avgPred = customers.length > 0 ? totalPredCLV / customers.length : 0;
    const avgHist = customers.length > 0 ? totalHistCLV / customers.length : 0;

    const tierData = [
      { name: 'Tier 1 (CLV > £800)', count: tierHigh, color: '#16A34A' },
      { name: 'Tier 2 (£250 - £800)', count: tierMid, color: '#0284C7' },
      { name: 'Tier 3 (CLV < £250)', count: tierLow, color: '#64748B' }
    ];

    return {
      avgPred: +avgPred.toFixed(2),
      avgHist: +avgHist.toFixed(2),
      tierData,
      topCLVCustomers: [...customers].sort((a, b) => (b.clvPredictive || 0) - (a.clvPredictive || 0)).slice(0, 8)
    };
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Advanced Customer Analytics & Forecasting
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Multi-Model Insights
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Predictive Lifetime Value, Operational Churn Risk, Association Basket Mining, and Sales Trends
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#121B16] border border-neutral-200 dark:border-[#22332A] rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('churn')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'churn' ? 'bg-[#14532D] text-white dark:bg-[#16A34A]' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Churn Risk
          </button>
          <button
            onClick={() => setActiveTab('clv')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'clv' ? 'bg-[#14532D] text-white dark:bg-[#16A34A]' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Lifetime Value
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'forecast' ? 'bg-[#14532D] text-white dark:bg-[#16A34A]' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Sales Forecast
          </button>
          <button
            onClick={() => setActiveTab('marketBasket')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'marketBasket' ? 'bg-[#14532D] text-white dark:bg-[#16A34A]' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Market Basket (Rules)
          </button>
        </div>
      </div>

      {/* TAB 1: CHURN RISK */}
      {activeTab === 'churn' && (
        <div className="space-y-5">
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Operational Churn Definition: </span>
              In retail transactional contexts, churn is defined operationally as inactivity exceeding 90 days following multiple historical transactions. This reflects empirical customer disengagement rather than an irrevocable cancellation.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl text-center">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">High Churn Risk (&gt;90d Dormant)</div>
              <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">
                {churnStats.highCount} ({churnStats.highPct}%)
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                £{churnStats.highRevenueAtStake.toLocaleString()} historical revenue
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl text-center">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Medium Risk (45d - 90d Inactive)</div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {churnStats.medCount} ({churnStats.medPct}%)
              </div>
              <div className="text-xs text-neutral-500 mt-1">Prime window for re-engagement</div>
            </div>

            <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl text-center">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Low Risk (&lt;45d Active)</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {churnStats.lowCount} ({churnStats.lowPct}%)
              </div>
              <div className="text-xs text-neutral-500 mt-1">Active recurring shopper base</div>
            </div>
          </div>

          {/* Table of High Risk Accounts */}
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              High Churn Risk Accounts Requiring Intervention
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Identified accounts with historical spend but high inactivity days
            </p>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Customer ID</th>
                  <th className="py-2 px-3">Segment</th>
                  <th className="py-2 px-3 text-right">Inactivity (Days)</th>
                  <th className="py-2 px-3 text-right">Total Lifetime Orders</th>
                  <th className="py-2 px-3 text-right">Historical Spend</th>
                  <th className="py-2 px-3 text-right">Suggested Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                {churnStats.highCustomers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-neutral-50 dark:hover:bg-[#16221B]">
                    <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      #{c.customerId}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-neutral-600 dark:text-neutral-400">
                      {c.segmentName}
                    </td>
                    <td className="py-2.5 px-3 text-right text-red-600 dark:text-red-400 font-bold">
                      {c.recency} days ago
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-700 dark:text-neutral-300">
                      {c.frequency}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-neutral-900 dark:text-neutral-100">
                      £{c.monetary.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans text-emerald-600 dark:text-emerald-400 font-medium">
                      15% Win-back email
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER LIFETIME VALUE */}
      {activeTab === 'clv' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Average Historical Spend</div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                £{clvStats.avgHist.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">Cumulative verified revenue to date</div>
            </div>

            <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Average Predictive CLV</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                £{clvStats.avgPred.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">Estimated 2-year forward value based on AOV & retention</div>
            </div>
          </div>

          {/* CLV Tier Distribution Bar Chart */}
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Customer Lifetime Value Tier Distribution
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Categorizes customers by estimated 24-month gross contribution margin
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clvStats.tierData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    formatter={(val: any) => [`${val} customers`, 'Cohort Count']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" fill="#14532D" radius={[4, 4, 0, 0]}>
                    {clvStats.tierData.map((t, idx) => (
                      <Cell key={idx} fill={t.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALES FORECAST */}
      {activeTab === 'forecast' && (
        <div className="space-y-5">
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Monthly Sales Velocity & Statistical Forecast
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Historical monthly transaction totals combined with forward 95% linear confidence intervals
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesForecast}>
                  <defs>
                    <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: any, name: any) => [`£${Number(v).toLocaleString()}`, name === 'actualRevenue' ? 'Actual Sales' : 'Forecast Projection']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Area type="monotone" dataKey="actualRevenue" stroke="#16A34A" strokeWidth={2.5} fill="#16A34A" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="forecastRevenue" stroke="#0284C7" strokeDasharray="3 3" strokeWidth={2.5} fill="url(#forecastFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MARKET BASKET ANALYSIS (ASSOCIATION RULES) */}
      {activeTab === 'marketBasket' && (
        <div className="space-y-5">
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Market Basket Association Rules (Co-Purchased Items)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Discovers products frequently checked out in the exact same receipt to support bundle discounts
            </p>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Primary Item (Antecedent)</th>
                  <th className="py-2.5 px-3">Associated Item (Consequent)</th>
                  <th className="py-2.5 px-3 text-right">Support</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                  <th className="py-2.5 px-3 text-right">Lift Ratio</th>
                  <th className="py-2.5 px-3 text-right">Receipts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {associationRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-[#16221B]">
                    <td className="py-2.5 px-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {rule.itemA}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300">
                      {rule.itemB}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-500">
                      {(rule.support * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-sky-600 dark:text-sky-400">
                      {(rule.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {rule.lift}x
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-neutral-400">
                      {rule.occurrences}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
