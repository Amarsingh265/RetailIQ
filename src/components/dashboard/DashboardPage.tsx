import React, { useState, useMemo } from 'react';
import {
  Users,
  CreditCard,
  PoundSterling,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Globe,
  Filter,
  ArrowUpRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { getCustomerGradeDistribution } from '../../ml/customerGrading';

export const DashboardPage: React.FC<{ onNavigateTo: (page: any) => void }> = ({ onNavigateTo }) => {
  const { datasetSummary, customers, kMeansMetrics, transactions, salesForecast } = useData();
  const { isExpertMode } = useTheme();

  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  // Filter transactions based on country selection
  const filteredTransactions = useMemo(() => {
    if (selectedCountry === 'All') return transactions;
    return transactions.filter((t) => t.Country === selectedCountry);
  }, [transactions, selectedCountry]);

  // Real calculated values
  const validSales = useMemo(
    () => filteredTransactions.filter((t) => !t.IsCancelled && t.Quantity > 0 && t.Price > 0),
    [filteredTransactions]
  );

  const totalRev = useMemo(
    () => validSales.reduce((acc, t) => acc + (t.TotalAmount || t.Quantity * t.Price), 0),
    [validSales]
  );

  const totalOrders = useMemo(() => new Set(validSales.map((t) => t.Invoice)).size, [validSales]);
  const totalCustomers = useMemo(() => new Set(validSales.map((t) => t.CustomerID)).size, [validSales]);
  const totalProducts = useMemo(() => new Set(validSales.map((t) => t.StockCode)).size, [validSales]);
  const avgOrderVal = totalOrders > 0 ? +(totalRev / totalOrders).toFixed(2) : 0;

  // Repeat customer rate
  const repeatStats = useMemo(() => {
    const custOrders = new Map<string, Set<string>>();
    validSales.forEach((t) => {
      if (!custOrders.has(t.CustomerID)) custOrders.set(t.CustomerID, new Set());
      custOrders.get(t.CustomerID)!.add(t.Invoice);
    });
    let repeats = 0;
    custOrders.forEach((orders) => {
      if (orders.size > 1) repeats++;
    });
    const rate = totalCustomers > 0 ? +((repeats / totalCustomers) * 100).toFixed(1) : 0;
    return { repeats, rate };
  }, [validSales, totalCustomers]);

  // Active vs At-Risk
  const activeCustomersCount = customers.filter((c) => c.recency <= 45).length;
  const atRiskCustomersCount = customers.filter((c) => c.churnRisk === 'High' || c.recency > 75).length;

  // Segment distribution data for Donut Chart
  const segmentChartData = useMemo(() => {
    if (!kMeansMetrics?.clusters) return [];
    return kMeansMetrics.clusters.map((c) => ({
      name: c.name,
      value: c.customerCount,
      color: c.color,
      pct: c.percentage,
      revenue: c.totalSegmentRevenue
    }));
  }, [kMeansMetrics]);

  const customerGradeDistribution = useMemo(
    () => getCustomerGradeDistribution(customers),
    [customers]
  );

  // Geographic Breakdown (Top 6 Countries)
  const countryData = useMemo(() => {
    const map = new Map<string, number>();
    validSales.forEach((t) => {
      const c = t.Country || 'United Kingdom';
      const amt = t.TotalAmount || t.Quantity * t.Price;
      map.set(c, (map.get(c) || 0) + amt);
    });
    return Array.from(map.entries())
      .map(([country, revenue]) => ({ country, revenue: +revenue.toFixed(2) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [validSales]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const map = new Map<string, { desc: string; qty: number; revenue: number }>();
    validSales.forEach((t) => {
      const code = t.StockCode;
      if (!map.has(code)) {
        map.set(code, { desc: t.Description || code, qty: 0, revenue: 0 });
      }
      const item = map.get(code)!;
      item.qty += t.Quantity;
      item.revenue += t.TotalAmount || t.Quantity * t.Price;
    });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [validSales]);

  // Distinct countries for filter
  const distinctCountries = useMemo(() => {
    const set = new Set(transactions.map((t) => t.Country).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Top Header & Contextual Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {isExpertMode ? 'Retail Customer Intelligence & Revenue Telemetry' : 'Business Overview'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Sales data: {datasetSummary?.name || 'Sample sales data'} · Period:{' '}
            <span className="font-mono">{datasetSummary?.dateRange.start || '2009-12-01'}</span> to{' '}
            <span className="font-mono">{datasetSummary?.dateRange.end || '2010-12-09'}</span>
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg">
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-500 text-[11px]">Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
            >
              {distinctCountries.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-[#15201A] text-neutral-900 dark:text-neutral-100">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onNavigateTo('dataset')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#14532D] dark:text-[#4ADE80] bg-[#E8F5E9] dark:bg-[#102A1C] border border-[#C8E6C9] dark:border-[#1E4A30] rounded-lg hover:bg-[#C8E6C9] dark:hover:bg-[#1B3E29] transition-colors"
          >
            <span>Update data</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 8 Primary Calculated KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Customers */}
        <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Total Customers</span>
            <Users className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50 tabular-nums">
            {totalCustomers.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>Customers in this dataset</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Total Revenue</span>
            <PoundSterling className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50 tabular-nums">
            £{totalRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            After returns and cancellations
          </div>
        </div>

        {/* Total Orders / Invoices */}
        <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Orders</span>
            <CreditCard className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50 tabular-nums">
            {totalOrders.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            {validSales.length.toLocaleString()} products sold
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Average spend per order</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50 tabular-nums">
            £{avgOrderVal.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Average sales amount for each order
          </div>
        </div>

        {/* Repeat Customer Rate */}
        <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Repeat Purchase Rate</span>
            <UserCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50 tabular-nums">
            {repeatStats.rate}%
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            {repeatStats.repeats} repeat buyers
          </div>
        </div>

        {/* Active Customers */}
        <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Recently active customers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50 tabular-nums">
            {activeCustomersCount}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Purchased within the last 45 days
          </div>
        </div>

        {/* At-Risk Customers */}
        <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Customers to follow up</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {atRiskCustomersCount}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Have not purchased recently
          </div>
        </div>

        {/* Catalog SKUs */}
        <div className="p-4 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Products</span>
            <ShoppingBag className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50 tabular-nums">
            {totalProducts}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Different products sold
          </div>
        </div>
      </div>

      {/* RFM Customer Grade Summary */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              F1, F2, F3 Customer Grades
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              RFM grades use data-driven percentile thresholds from the active dataset.
            </p>
          </div>
          <button
            onClick={() => onNavigateTo('segmentation')}
            className="text-[11px] text-[#16A34A] hover:underline flex items-center gap-0.5"
          >
            View grading details
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {customerGradeDistribution.map((item) => (
            <button
              key={item.grade}
              type="button"
              onClick={() => onNavigateTo('segmentation')}
              className="p-4 text-left bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {item.grade} · {item.label}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">{item.percentage}%</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50">
                {item.count.toLocaleString()}
              </div>
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Main Visualizations: Revenue Trend & Segment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Revenue Trend & Forecast (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Monthly sales and 3-month forecast
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Past sales and estimated future sales
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <span className="w-3 h-3 rounded-full bg-[#16A34A]" />
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <span>Forecast</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesForecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="forecastRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `£${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`£${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actualRevenue"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#actualRevGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="forecastRevenue"
                  stroke="#38BDF8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#forecastRevGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segment Distribution Donut (1 col) */}
        <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Customer Segments
              </h2>
              <button
                onClick={() => onNavigateTo('segmentation')}
                className="text-[11px] text-[#16A34A] hover:underline flex items-center gap-0.5"
              >
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              Customers grouped by their shopping patterns
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentChartData}
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {segmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} customers`, name]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Segment Mini Legend with Counts & Revenue */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            {segmentChartData.slice(0, 4).map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="truncate text-neutral-700 dark:text-neutral-300">{s.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                  <span>{s.value} users</span>
                  <span className="text-neutral-900 dark:text-neutral-100 font-semibold">({s.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Revenue by Country & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Markets by Revenue */}
        <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Top Markets by Revenue
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            Sales by country
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <XAxis
                  type="number"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                />
                <YAxis dataKey="country" type="category" stroke="#94A3B8" fontSize={11} width={90} />
                <Tooltip
                  formatter={(val: any) => [`£${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="revenue" fill="#14532D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products List */}
        <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Top-selling products
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            Products that brought in the most sales
          </p>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {topProducts.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                  <span className="w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {p.desc}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {p.qty.toLocaleString()} units sold
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                  £{p.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Business Summary Banner */}
      <div className="p-4 bg-emerald-50/70 dark:bg-[#102A1C]/60 border border-emerald-200 dark:border-[#1E4A30] rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#14532D] text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Key Strategic Takeaways for Retailers
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
              Your top segment comprises <span className="font-semibold text-emerald-800 dark:text-emerald-300">{segmentChartData[0]?.name || 'Champions'}</span>, 
              accounting for <span className="font-mono font-semibold">{segmentChartData[0]?.pct || 22}%</span> of your client base. 
              However, <span className="font-semibold text-amber-700 dark:text-amber-400">{atRiskCustomersCount} customers</span> are exhibiting signs of dormancy with recency surpassing 75 days. 
              Running the automated win-back campaign in the <button onClick={() => onNavigateTo('recommendations')} className="underline font-semibold hover:text-[#16A34A]">Recommendations engine</button> could recover an estimated £{(atRiskCustomersCount * avgOrderVal * 0.4).toFixed(0)} in retained sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
